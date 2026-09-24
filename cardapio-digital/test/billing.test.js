process.env.DB_PATH = ':memory:';
process.env.ALLOW_DEMO_PAYMENTS = 'true';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.STRIPE_PRICE_ID = 'price_mensal';

const test = require('node:test');
const assert = require('node:assert/strict');
const Stripe = require('stripe');
const app = require('../server/index');
const billing = require('../server/billing');

// Cliente Stripe falso: guarda as assinaturas em memória. A validação de
// assinatura do webhook usa o SDK real.
const realWebhooks = new Stripe('sk_test_fake').webhooks;
const subs = {};
const calls = [];
billing.setClient({
  webhooks: realWebhooks,
  prices: {
    retrieve: async (id) => ({ id, unit_amount: 4990, currency: 'brl', recurring: { interval: 'month' } }),
  },
  customers: { create: async (p) => { calls.push(['customer', p]); return { id: 'cus_1' }; } },
  checkout: { sessions: { create: async (p) => { calls.push(['checkout', p]); return { url: 'https://checkout.stripe.test/s1' }; } } },
  billingPortal: { sessions: { create: async () => ({ url: 'https://billing.stripe.test/p1' }) } },
  subscriptions: { retrieve: async (id) => subs[id] },
});

let server;
let base;
test.before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

function client() {
  let cookie = '';
  return async (path, { method = 'GET', body } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, body: await res.json().catch(() => null) };
  };
}

async function sendWebhook(type, object, { secret = 'whsec_test' } = {}) {
  const payload = JSON.stringify({ id: `evt_${Math.random()}`, object: 'event', type, data: { object } });
  const header = realWebhooks.generateTestHeaderString({ payload, secret });
  const res = await fetch(`${base}/api/webhooks/stripe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Stripe-Signature': header },
    body: payload,
  });
  return res.status;
}

function subscription(id, { status = 'active', restaurantId }) {
  return {
    id, object: 'subscription', status, customer: 'cus_1',
    metadata: { restaurant_id: String(restaurantId) },
    items: { data: [{ price: { id: 'price_mensal' }, current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400 }] },
  };
}

test('assinatura: checkout, ativação por webhook, cancelamento e bloqueio', async () => {
  const c = client();
  await c('/api/auth/signup', { method: 'POST', body: { name: 'Dono', email: 'bill@test.com', password: 'senha-segura', restaurantName: 'Loja Stripe' } });
  const me = (await c('/api/auth/me')).body.restaurant;

  const info = await c('/api/admin/billing');
  assert.equal(info.body.enabled, true);
  assert.equal(info.body.price.amount_cents, 4990);

  const checkout = await c('/api/admin/billing/checkout', { method: 'POST' });
  assert.equal(checkout.status, 200);
  assert.equal(checkout.body.url, 'https://checkout.stripe.test/s1');
  const session = calls.find(([k]) => k === 'checkout')[1];
  assert.equal(session.mode, 'subscription');
  assert.equal(session.line_items[0].price, 'price_mensal');
  assert.equal(session.client_reference_id, String(me.id));

  // Webhook com assinatura inválida é recusado.
  assert.equal(await sendWebhook('checkout.session.completed', {}, { secret: 'whsec_errado' }), 400);

  subs.sub_1 = subscription('sub_1', { restaurantId: me.id });
  assert.equal(await sendWebhook('checkout.session.completed', {
    object: 'checkout.session', mode: 'subscription', subscription: 'sub_1', client_reference_id: String(me.id),
  }), 200);

  let r = (await c('/api/auth/me')).body.restaurant;
  assert.equal(r.plan, 'paid');
  assert.equal(r.subscription_status, 'active');
  assert.equal(r.subscription_active, true);
  assert.equal(r.payment_options.pix, true);
  assert.equal((await c('/api/admin/stats')).status, 200);
  assert.equal(r.stripe_customer_id, undefined, 'IDs do Stripe não vão para o navegador');

  // Com assinatura ativa, não abre outro checkout; o portal funciona.
  assert.equal((await c('/api/admin/billing/checkout', { method: 'POST' })).status, 409);
  assert.equal((await c('/api/admin/billing/portal', { method: 'POST' })).body.url, 'https://billing.stripe.test/p1');

  // Cancelamento: o cardápio para de aceitar pedidos.
  subs.sub_1 = subscription('sub_1', { restaurantId: me.id, status: 'canceled' });
  await sendWebhook('customer.subscription.deleted', subs.sub_1);
  r = (await c('/api/auth/me')).body.restaurant;
  assert.equal(r.subscription_active, false);
  const menu = await client()(`/api/public/r/${r.slug}`);
  assert.equal(menu.body.restaurant.accepting_orders, false);

  // Assina de novo com outra assinatura; um evento atrasado da antiga não sobrescreve.
  subs.sub_2 = subscription('sub_2', { restaurantId: me.id });
  await sendWebhook('customer.subscription.created', subs.sub_2);
  await sendWebhook('customer.subscription.deleted', subs.sub_1);
  r = (await c('/api/auth/me')).body.restaurant;
  assert.equal(r.plan, 'paid');
  assert.equal(r.subscription_status, 'active');
  assert.equal(r.subscription_active, true);
});

test('pagamento atrasado mantém o acesso; não pago bloqueia', async () => {
  const c = client();
  await c('/api/auth/signup', { method: 'POST', body: { name: 'Dono', email: 'late@test.com', password: 'senha-segura', restaurantName: 'Loja Atrasada' } });
  const me = (await c('/api/auth/me')).body.restaurant;

  subs.sub_late = subscription('sub_late', { restaurantId: me.id, status: 'past_due' });
  await sendWebhook('customer.subscription.updated', subs.sub_late);
  assert.equal((await c('/api/auth/me')).body.restaurant.subscription_active, true);

  subs.sub_late = subscription('sub_late', { restaurantId: me.id, status: 'unpaid' });
  await sendWebhook('invoice.payment_failed', { object: 'invoice', parent: { subscription_details: { subscription: 'sub_late' } } });
  assert.equal((await c('/api/auth/me')).body.restaurant.subscription_active, false);
});

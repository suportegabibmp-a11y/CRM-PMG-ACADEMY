// Testa o caminho completo da assinatura: servidor (como no Supabase) ⇄
// função do Stripe (como na Netlify) ⇄ Stripe (cliente falso). A validação
// de assinatura do webhook usa o SDK real do Stripe.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import process from 'node:process';
import Stripe from 'stripe';

// Servidor que imita a Netlify chamando a função do Stripe.
let stripeHandler;
const netlify = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const out = await stripeHandler({
    httpMethod: req.method,
    path: new URL(req.url, 'http://x').pathname,
    headers: req.headers,
    body: Buffer.concat(chunks).toString('utf8'),
    isBase64Encoded: false,
  });
  res.writeHead(out.statusCode, out.headers).end(out.body);
});
await new Promise((r) => netlify.listen(0, r));
const netlifyUrl = `http://127.0.0.1:${netlify.address().port}`;

Object.assign(process.env, {
  DB_PATH: ':memory:',
  STRIPE_SERVICE_URL: `${netlifyUrl}/.netlify/functions/stripe`,
  STRIPE_SECRET_KEY: 'sk_test_fake',
  STRIPE_WEBHOOK_SECRET: 'whsec_test',
  STRIPE_PRICE_ID: 'price_mensal',
});
const { default: app } = await import('../server/index.js');
const { db } = await import('../server/db.js');

const server = app.listen(0);
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;
process.env.EDGE_API_URL = `${base}/api`;
const stripeFn = await import('../netlify/functions/stripe.js');
stripeHandler = stripeFn.handler;

// Stripe falso: guarda clientes, sessões e assinaturas em memória.
const realWebhooks = new Stripe('sk_test_fake').webhooks;
const subsByCustomer = {};
const sessions = [];
let customerSeq = 0;
stripeFn.setClient({
  webhooks: realWebhooks,
  prices: { retrieve: async (id) => ({ id, unit_amount: 4990, currency: 'brl', recurring: { interval: 'month' } }) },
  customers: {
    create: async (p) => ({ id: `cus_${++customerSeq}`, metadata: p.metadata }),
    retrieve: async (id) => ({ id, metadata: {} }),
  },
  checkout: { sessions: { create: async (p) => { sessions.push(p); return { url: `https://checkout.stripe.test/${sessions.length}` }; } } },
  billingPortal: { sessions: { create: async (p) => ({ url: `https://billing.stripe.test/${p.customer}` }) } },
  subscriptions: {
    list: async ({ customer }) => ({ data: subsByCustomer[customer] || [] }),
    retrieve: async (id) => Object.values(subsByCustomer).flat().find((s) => s.id === id),
  },
});

test.after(() => { server.close(); netlify.close(); });

function client() {
  let token = '';
  return async (path, { method = 'GET', body } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (data?.token) token = data.token;
    return { status: res.status, body: data };
  };
}

async function sendWebhook(type, object, { secret = 'whsec_test' } = {}) {
  const payload = JSON.stringify({ id: `evt_${Math.random()}`, object: 'event', type, data: { object } });
  const header = realWebhooks.generateTestHeaderString({ payload, secret });
  const res = await fetch(`${netlifyUrl}/api/webhooks/stripe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Stripe-Signature': header },
    body: payload,
  });
  return res.status;
}

function setSubscription(customer, restaurantId, status, id = 'sub_1') {
  const sub = {
    id, object: 'subscription', status, customer,
    metadata: { restaurant_id: String(restaurantId) },
    items: { data: [{ price: { id: 'price_mensal' }, current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400 }] },
  };
  subsByCustomer[customer] = [sub, ...(subsByCustomer[customer] || []).filter((s) => s.id !== id)];
  return sub;
}

test('assinatura: link do Stripe, ativação, portal, cancelamento e bloqueio', async () => {
  const c = client();
  await c('/api/auth/signup', { method: 'POST', body: { name: 'Dono', email: 'bill@test.com', password: 'senha-segura', restaurantName: 'Loja Stripe' } });
  const me = (await c('/api/auth/me')).body.restaurant;

  const info = await c('/api/admin/billing');
  assert.equal(info.body.enabled, true);
  assert.equal(info.body.price.amount_cents, 4990);

  const checkout = await c('/api/admin/billing/checkout', { method: 'POST' });
  assert.equal(checkout.status, 200, JSON.stringify(checkout.body));
  assert.match(checkout.body.url, /^https:\/\/checkout\.stripe\.test\//);
  const session = sessions.at(-1);
  assert.equal(session.mode, 'subscription');
  assert.equal(session.customer, 'cus_1');
  assert.equal(session.line_items[0].price, 'price_mensal');
  assert.equal(session.client_reference_id, String(me.id));

  // Pagou no Stripe: o webhook avisa e o servidor busca o estado real.
  const sub = setSubscription('cus_1', me.id, 'active');
  assert.equal(await sendWebhook('customer.subscription.created', sub), 200);
  let r = (await c('/api/auth/me')).body.restaurant;
  assert.equal(r.plan, 'paid');
  assert.equal(r.subscription_status, 'active');
  assert.equal(r.subscription_active, true);
  assert.equal(r.stripe_customer_id, undefined, 'IDs do Stripe não vão para o navegador');

  assert.equal((await c('/api/admin/billing/checkout', { method: 'POST' })).status, 409);
  assert.equal((await c('/api/admin/billing/portal', { method: 'POST' })).body.url, 'https://billing.stripe.test/cus_1');

  // Webhook com assinatura inválida é recusado.
  assert.equal(await sendWebhook('customer.subscription.updated', sub, { secret: 'whsec_errado' }), 400);

  // Cancelou: o cardápio para de aceitar pedidos.
  setSubscription('cus_1', me.id, 'canceled');
  await sendWebhook('customer.subscription.deleted', subsByCustomer.cus_1[0]);
  r = (await c('/api/auth/me')).body.restaurant;
  assert.equal(r.subscription_active, false);
  assert.equal((await client()(`/api/public/r/${r.slug}`)).body.restaurant.accepting_orders, false);

  // Voltou a assinar (nova assinatura): tela de assinatura sincroniza sozinha.
  setSubscription('cus_1', me.id, 'active', 'sub_2');
  const billing = await c('/api/admin/billing');
  assert.equal(billing.body.has_subscription, true);
  assert.equal((await c('/api/auth/me')).body.restaurant.subscription_active, true);
});

test('pagamento atrasado mantém o acesso; não pago bloqueia', async () => {
  const c = client();
  await c('/api/auth/signup', { method: 'POST', body: { name: 'Dono', email: 'late@test.com', password: 'senha-segura', restaurantName: 'Loja Atrasada' } });
  const me = (await c('/api/auth/me')).body.restaurant;
  await c('/api/admin/billing/checkout', { method: 'POST' });
  const customer = sessions.at(-1).customer;

  await sendWebhook('customer.subscription.updated', setSubscription(customer, me.id, 'past_due', 'sub_late'));
  assert.equal((await c('/api/auth/me')).body.restaurant.subscription_active, true);

  setSubscription(customer, me.id, 'unpaid', 'sub_late');
  await sendWebhook('invoice.payment_failed', { object: 'invoice', customer, parent: { subscription_details: { subscription: 'sub_late' } } });
  assert.equal((await c('/api/auth/me')).body.restaurant.subscription_active, false);
});

test('a função do Stripe só age com código válido, de uso único', async () => {
  const call = (route, body) => fetch(`${netlifyUrl}/.netlify/functions/stripe/${route}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  assert.equal((await call('portal', { token: 'a'.repeat(64), return_url: 'https://x' })).status, 401);
  assert.equal((await call('status', { token: 'nao-e-um-codigo' })).status, 401);

  const { id } = await db.one(`SELECT id FROM cardapio.restaurants ORDER BY id LIMIT 1`);
  const token = 'b'.repeat(64);
  await db.query(`INSERT INTO cardapio.stripe_tokens (token, restaurant_id, purpose, expires_at) VALUES ($1, $2, 'status', now() + interval '1 minute')`, [token, id]);
  assert.equal((await call('status', { token })).status, 200);
  assert.equal((await call('status', { token })).status, 401, 'o mesmo código não vale duas vezes');
});

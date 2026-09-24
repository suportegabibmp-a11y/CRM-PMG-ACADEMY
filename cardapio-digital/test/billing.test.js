// Assinatura pelo checkout do Stripe (sem link de pagamento configurado).
import test from 'node:test';
import assert from 'node:assert/strict';
import { startHarness } from './stripe-harness.js';

// Sem link de pagamento: o sistema cria a sessão de checkout pelo preço.
const h = await startHarness({ STRIPE_PAYMENT_LINK: '' });
const { db, netlifyUrl, client, sendWebhook, setSubscription } = h;
const { sessions, subsByCustomer } = h.stripeState;
test.after(() => h.close());

test('assinatura por checkout: ativação, portal, cancelamento e bloqueio', async () => {
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

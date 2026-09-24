// Assinatura pelo link de pagamento do Stripe (Payment Link).
import test from 'node:test';
import assert from 'node:assert/strict';
import { startHarness } from './stripe-harness.js';

const h = await startHarness({ STRIPE_PAYMENT_LINK: 'https://buy.stripe.com/test_link' });
const { client, sendWebhook, setSubscription, stripeState } = h;
test.after(() => h.close());

async function newRestaurant(email, name) {
  const c = client();
  await c('/api/auth/signup', { method: 'POST', body: { name: 'Dono', email, password: 'senha-segura', restaurantName: name } });
  return { c, me: (await c('/api/auth/me')).body.restaurant };
}

test('botão Assinar abre o link do Stripe e o pagamento ativa a conta', async () => {
  const { c, me } = await newRestaurant('link@test.com', 'Loja Link');

  const billing = await c('/api/admin/billing');
  assert.equal(billing.body.enabled, true);
  assert.equal(billing.body.price.amount_cents, 4990, 'preço lido do próprio link');

  const checkout = await c('/api/admin/billing/checkout', { method: 'POST' });
  assert.equal(checkout.status, 200);
  const url = new URL(checkout.body.url);
  assert.equal(`${url.origin}${url.pathname}`, 'https://buy.stripe.com/test_link');
  assert.equal(url.searchParams.get('client_reference_id'), String(me.id));
  assert.equal(url.searchParams.get('prefilled_email'), 'link@test.com');
  assert.equal(stripeState.sessions.length, 0, 'não cria sessão própria quando há link');

  // A pessoa paga no link: o Stripe cria cliente, assinatura e manda o webhook.
  setSubscription('cus_link', null, 'active', 'sub_link');
  stripeState.checkoutSessions.cs_test_link1 = {
    id: 'cs_test_link1', object: 'checkout.session', mode: 'subscription', status: 'complete',
    client_reference_id: String(me.id), customer: 'cus_link', subscription: 'sub_link',
  };
  assert.equal(await sendWebhook('checkout.session.completed', stripeState.checkoutSessions.cs_test_link1), 200);

  let r = (await c('/api/auth/me')).body.restaurant;
  assert.equal(r.plan, 'paid');
  assert.equal(r.subscription_status, 'active');
  assert.equal(r.subscription_active, true);
  assert.deepEqual(stripeState.metadataUpdates.map(([kind, id]) => [kind, id]),
    [['customer', 'cus_link'], ['subscription', 'sub_link']], 'marca o restaurante no Stripe para os próximos eventos');

  // Portal funciona com o cliente criado pelo link.
  assert.equal((await c('/api/admin/billing/portal', { method: 'POST' })).body.url, 'https://billing.stripe.test/cus_link');

  // Cancelamento depois (evento de assinatura, já com o restaurante marcado).
  const canceled = setSubscription('cus_link', me.id, 'canceled', 'sub_link');
  await sendWebhook('customer.subscription.deleted', canceled);
  r = (await c('/api/auth/me')).body.restaurant;
  assert.equal(r.subscription_active, false);
});

test('pagamento de outra loja não ativa esta', async () => {
  const { c, me } = await newRestaurant('outra@test.com', 'Loja Outra');
  const { me: victim } = await newRestaurant('vitima@test.com', 'Loja Vitima');

  // Sessão paga pela "Loja Outra", mas o aviso chega dizendo que é da vítima.
  setSubscription('cus_outra', null, 'active', 'sub_outra');
  stripeState.checkoutSessions.cs_test_outra = {
    id: 'cs_test_outra', object: 'checkout.session', mode: 'subscription', status: 'complete',
    client_reference_id: String(me.id), customer: 'cus_outra', subscription: 'sub_outra',
  };
  await fetch(`${h.base}/api/internal/stripe-sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restaurant_id: victim.id, checkout_session_id: 'cs_test_outra' }),
  });

  const victimClient = client();
  await victimClient('/api/auth/login', { method: 'POST', body: { email: 'vitima@test.com', password: 'senha-segura' } });
  const v = (await victimClient('/api/auth/me')).body.restaurant;
  assert.equal(v.plan, 'trial');
  assert.equal(v.subscription_status, '');
  assert.equal((await c('/api/auth/me')).body.restaurant.plan, 'trial', 'a loja que pagou ainda depende do próprio webhook');
});

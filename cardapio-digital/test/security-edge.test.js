// SEC-01: no servidor publicado (Edge Function), o pagamento simulado não
// pode existir. Simula o ambiente do Supabase (globalThis.Deno) sem
// ALLOW_DEMO_PAYMENTS.
import test from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';

globalThis.Deno = globalThis.Deno || {};
process.env.DB_PATH = ':memory:';
process.env.STRIPE_SERVICE_URL = '';
delete process.env.ALLOW_DEMO_PAYMENTS;
delete process.env.NODE_ENV;
const { default: app } = await import('../server/index.js');

const server = app.listen(0);
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;
test.after(() => server.close());

async function call(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

test('SEC-01 sem Mercado Pago, o site publicado não oferece nem aceita pagamento simulado', async () => {
  const s = await call('/api/auth/signup', { method: 'POST', body: { name: 'Dono', email: 'edge@test.com', password: 'senha-segura-1', restaurantName: 'Loja Edge' } });
  const token = s.body.token;
  const cat = await call('/api/admin/categories', { method: 'POST', token, body: { name: 'A' } });
  const prod = await call('/api/admin/products', { method: 'POST', token, body: { name: 'X', price_cents: 1000, category_id: cat.body.id } });

  const menu = await call('/api/public/r/loja-edge');
  assert.deepEqual(menu.body.restaurant.payment_options, { pix: false, card_online: false, on_delivery: true, demo: false });

  const order = { customer_name: 'A', customer_phone: '11999990000', fulfillment: 'pickup', items: [{ product_id: prod.body.id, quantity: 1 }] };
  assert.equal((await call('/api/public/r/loja-edge/orders', { method: 'POST', body: { ...order, payment_method: 'pix' } })).status, 400);
  assert.equal((await call('/api/public/r/loja-edge/orders', { method: 'POST', body: { ...order, payment_method: 'card_online' } })).status, 400);

  const cash = await call('/api/public/r/loja-edge/orders', { method: 'POST', body: { ...order, payment_method: 'cash' } });
  assert.equal(cash.status, 201);
  assert.equal((await call(`/api/public/orders/${cash.body.order_id}/demo-pay`, { method: 'POST' })).status, 404);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';

process.env.DB_PATH = ':memory:';
process.env.ALLOW_DEMO_PAYMENTS = 'true';
process.env.SUPERADMIN_EMAILS = 'admin@test.com';
const { default: app } = await import('../server/index.js');

let server;
let base;

test.before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

// Autentica pelo token devolvido no login (cabeçalho Authorization), como o
// navegador faz quando a API passa pelo proxy da Netlify.
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

async function setupRestaurant(name, email) {
  const c = client();
  const s = await c('/api/auth/signup', { method: 'POST', body: { name: 'Dono', email, password: 'senha-segura', restaurantName: name } });
  assert.equal(s.status, 201);
  const cat = await c('/api/admin/categories', { method: 'POST', body: { name: 'Lanches' } });
  const prod = await c('/api/admin/products', {
    method: 'POST',
    body: { name: 'X-Burger', price_cents: 2500, category_id: cat.body.id, addons: [{ name: 'Bacon', price_cents: 500 }] },
  });
  assert.equal(prod.status, 201);
  const me = await c('/api/auth/me');
  return { c, slug: me.body.restaurant.slug, productId: prod.body.id };
}

test('fluxo completo: cardápio, pedido com PIX, pagamento e painel', async () => {
  const { c, slug, productId } = await setupRestaurant('Burger Teste', 'a@test.com');
  assert.equal(slug, 'burger-teste');

  const pub = client();
  const menu = await pub(`/api/public/r/${slug}`);
  assert.equal(menu.status, 200);
  assert.equal(menu.body.products.length, 1);
  assert.equal(menu.body.restaurant.mp_access_token, undefined);
  const addonId = menu.body.products[0].addons[0].id;

  const order = await pub(`/api/public/r/${slug}/orders`, {
    method: 'POST',
    body: {
      customer_name: 'Cliente', customer_phone: '11988887777', customer_email: 'c@x.com',
      fulfillment: 'delivery', address: 'Rua A, 10', payment_method: 'pix',
      // preço enviado pelo cliente deve ser ignorado
      items: [{ product_id: productId, quantity: 2, addon_ids: [addonId], unit_price_cents: 1 }],
    },
  });
  assert.equal(order.status, 201, JSON.stringify(order.body));

  let tracked = await pub(`/api/public/orders/${order.body.order_id}`);
  assert.equal(tracked.body.total_cents, 2 * 3000);
  assert.equal(tracked.body.status, 'awaiting_payment');
  assert.ok(tracked.body.pix_code);

  // Pedido ainda não pago não aparece como "novo" para a cozinha.
  let active = await c('/api/admin/orders');
  assert.equal(active.body[0].status, 'awaiting_payment');

  tracked = await pub(`/api/public/orders/${order.body.order_id}/demo-pay`, { method: 'POST' });
  assert.equal(tracked.body.payment_status, 'approved');
  assert.equal(tracked.body.status, 'received');

  const upd = await c(`/api/admin/orders/${order.body.order_id}`, { method: 'PATCH', body: { status: 'preparing' } });
  assert.equal(upd.body.status, 'preparing');

  const stats = await c('/api/admin/stats');
  assert.equal(stats.body.month.revenue_cents, 6000);
});

test('pagamento na entrega entra direto como recebido, com número sequencial', async () => {
  const { slug, productId } = await setupRestaurant('Pizzaria', 'b@test.com');
  const pub = client();
  const mk = () => pub(`/api/public/r/${slug}/orders`, {
    method: 'POST',
    body: { customer_name: 'Ana', customer_phone: '11999990000', fulfillment: 'table', table_number: '5', payment_method: 'cash', items: [{ product_id: productId, quantity: 1 }] },
  });
  const o1 = await mk();
  const o2 = await mk();
  const t1 = await pub(`/api/public/orders/${o1.body.order_id}`);
  const t2 = await pub(`/api/public/orders/${o2.body.order_id}`);
  assert.equal(t1.body.status, 'received');
  assert.equal(t1.body.number, 1);
  assert.equal(t2.body.number, 2);
  assert.equal(t1.body.delivery_fee_cents, 0);
});

test('validações do pedido', async () => {
  const { c, slug, productId } = await setupRestaurant('Validacoes', 'c@test.com');
  const pub = client();
  const base = { customer_name: 'X', customer_phone: '11999990000', fulfillment: 'pickup', payment_method: 'cash' };

  let r = await pub(`/api/public/r/${slug}/orders`, { method: 'POST', body: { ...base, items: [] } });
  assert.equal(r.status, 400);

  r = await pub(`/api/public/r/${slug}/orders`, { method: 'POST', body: { ...base, items: [{ product_id: 99999, quantity: 1 }] } });
  assert.equal(r.status, 409);

  r = await pub(`/api/public/r/${slug}/orders`, { method: 'POST', body: { ...base, fulfillment: 'delivery', items: [{ product_id: productId, quantity: 1 }] } });
  assert.equal(r.status, 400, 'entrega sem endereço');

  await c(`/api/admin/products/${productId}/availability`, { method: 'PATCH', body: { available: false } });
  r = await pub(`/api/public/r/${slug}/orders`, { method: 'POST', body: { ...base, items: [{ product_id: productId, quantity: 1 }] } });
  assert.equal(r.status, 409, 'produto indisponível');

  const me = (await c('/api/auth/me')).body.restaurant;
  await c('/api/admin/restaurant', { method: 'PUT', body: { ...me, is_open: false } });
  r = await pub(`/api/public/r/${slug}/orders`, { method: 'POST', body: { ...base, items: [{ product_id: productId, quantity: 1 }] } });
  assert.equal(r.status, 409, 'loja fechada');
});

test('um restaurante não acessa dados de outro', async () => {
  const a = await setupRestaurant('Loja A', 'da@test.com');
  const b = await setupRestaurant('Loja B', 'db@test.com');

  const pub = client();
  const cross = await pub(`/api/public/r/${a.slug}/orders`, {
    method: 'POST',
    body: { customer_name: 'X', customer_phone: '11999990000', fulfillment: 'pickup', payment_method: 'cash', items: [{ product_id: b.productId, quantity: 1 }] },
  });
  assert.equal(cross.status, 409, 'produto de outra loja');

  const o = await pub(`/api/public/r/${a.slug}/orders`, {
    method: 'POST',
    body: { customer_name: 'X', customer_phone: '11999990000', fulfillment: 'pickup', payment_method: 'cash', items: [{ product_id: a.productId, quantity: 1 }] },
  });
  const hijack = await b.c(`/api/admin/orders/${o.body.order_id}`, { method: 'PATCH', body: { status: 'canceled' } });
  assert.equal(hijack.status, 404);

  await b.c(`/api/admin/products/${a.productId}`, { method: 'DELETE' });
  const menu = await pub(`/api/public/r/${a.slug}`);
  assert.equal(menu.body.products.length, 1);

  const anon = await pub('/api/admin/menu');
  assert.equal(anon.status, 401);
});

test('login e e-mail duplicado', async () => {
  await setupRestaurant('Login', 'e@test.com');
  const c = client();
  assert.equal((await c('/api/auth/login', { method: 'POST', body: { email: 'e@test.com', password: 'errada123' } })).status, 401);
  assert.equal((await c('/api/auth/login', { method: 'POST', body: { email: 'e@test.com', password: 'senha-segura' } })).status, 200);
  assert.equal((await c('/api/auth/me')).status, 200);
  const dup = await client()('/api/auth/signup', { method: 'POST', body: { name: 'X', email: 'e@test.com', password: 'senha-segura', restaurantName: 'Y' } });
  assert.equal(dup.status, 409);
});

test('upload de foto e diagnóstico', async () => {
  const health = await client()('/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.database, 'ok');

  const { c } = await setupRestaurant('Fotos', 'f@test.com');
  // PNG 1x1
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const up = await c('/api/admin/images', { method: 'POST', body: { data_url: `data:image/png;base64,${png}` } });
  assert.equal(up.status, 201);
  const res = await fetch(base + up.body.url);
  assert.equal(res.headers.get('content-type'), 'image/png');
  assert.deepEqual(Buffer.from(await res.arrayBuffer()), Buffer.from(png, 'base64'));

  assert.equal((await c('/api/admin/images', { method: 'POST', body: { data_url: 'data:text/html;base64,PGgxPg==' } })).status, 400);
  assert.equal((await client()('/api/admin/images', { method: 'POST', body: { data_url: `data:image/png;base64,${png}` } })).status, 401);
});

test('senha: trocar, esqueci (admin gera temporária) e sessões antigas encerradas', async () => {
  const { c } = await setupRestaurant('Senhas', 'dono-senha@test.com');
  const outroAparelho = client();
  await outroAparelho('/api/auth/login', { method: 'POST', body: { email: 'dono-senha@test.com', password: 'senha-segura' } });

  // Trocar a senha logado.
  assert.equal((await c('/api/auth/change-password', { method: 'POST', body: { current_password: 'errada', new_password: 'nova-senha-1' } })).status, 400);
  assert.equal((await c('/api/auth/change-password', { method: 'POST', body: { current_password: 'senha-segura', new_password: 'curta' } })).status, 400);
  assert.equal((await c('/api/auth/change-password', { method: 'POST', body: { current_password: 'senha-segura', new_password: 'nova-senha-1' } })).status, 200);
  assert.equal((await c('/api/auth/me')).status, 200, 'continua logado neste aparelho');
  assert.equal((await outroAparelho('/api/auth/me')).status, 401, 'os outros aparelhos saem');
  assert.equal((await client()('/api/auth/login', { method: 'POST', body: { email: 'dono-senha@test.com', password: 'nova-senha-1' } })).status, 200);

  // Esqueci a senha: só o admin gera a temporária.
  const rid = (await c('/api/auth/me')).body.restaurant.id;
  assert.equal((await c(`/api/superadmin/restaurants/${rid}/reset-password`, { method: 'POST' })).status, 403);

  const admin = client();
  await admin('/api/auth/signup', { method: 'POST', body: { name: 'Admin', email: 'admin@test.com', password: 'senha-admin-1', restaurantName: 'Admin Loja' } });
  const reset = await admin(`/api/superadmin/restaurants/${rid}/reset-password`, { method: 'POST' });
  assert.equal(reset.status, 200);
  assert.equal(reset.body.email, 'dono-senha@test.com');
  assert.match(reset.body.password, /^[a-z2-9]{10}$/);

  assert.equal((await c('/api/auth/me')).status, 401, 'a sessão antiga cai');
  assert.equal((await client()('/api/auth/login', { method: 'POST', body: { email: 'dono-senha@test.com', password: 'nova-senha-1' } })).status, 401);
  const volta = client();
  assert.equal((await volta('/api/auth/login', { method: 'POST', body: { email: 'dono-senha@test.com', password: reset.body.password } })).status, 200);
  assert.equal((await volta('/api/auth/change-password', { method: 'POST', body: { current_password: reset.body.password, new_password: 'minha-senha-nova' } })).status, 200);

  // "Esqueci minha senha" pelo site: o pedido aparece para o admin e some ao gerar a senha.
  assert.equal((await client()('/api/public/password-request', { method: 'POST', body: { email: 'nao-existe@test.com' } })).status, 200);
  assert.equal((await client()('/api/public/password-request', { method: 'POST', body: { email: 'DONO-SENHA@test.com' } })).status, 200);
  let row = (await admin('/api/superadmin/restaurants')).body.find((r) => r.owner_email === 'dono-senha@test.com');
  assert.ok(row.password_reset_requested_at, 'pedido registrado');
  assert.equal((await admin('/api/superadmin/restaurants')).body[0].owner_email, 'dono-senha@test.com', 'pedidos aparecem primeiro');
  await admin(`/api/superadmin/restaurants/${rid}/reset-password`, { method: 'POST' });
  row = (await admin('/api/superadmin/restaurants')).body.find((r) => r.owner_email === 'dono-senha@test.com');
  assert.equal(row.password_reset_requested_at, null, 'pedido atendido');

  const support = await client()('/api/public/support');
  assert.equal(support.status, 200);
  assert.deepEqual(Object.keys(support.body).sort(), ['email', 'whatsapp']);
});

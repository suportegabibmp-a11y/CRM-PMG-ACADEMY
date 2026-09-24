// Testes de segurança da auditoria: cada teste reproduz uma tentativa de
// ataque e confirma que ela é bloqueada, sem quebrar o uso normal.
import test from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';
import crypto from 'node:crypto';

process.env.DB_PATH = ':memory:';
process.env.DATA_ENCRYPTION_KEY = 'chave-de-teste-para-cifrar-segredos';
process.env.SUPERADMIN_EMAILS = 'root@test.com';
const { default: app } = await import('../server/index.js');
const { db } = await import('../server/db.js');
const { sha256 } = await import('../server/security.js');

const server = app.listen(0);
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;
test.after(() => server.close());

function client({ ip } = {}) {
  let token = '';
  const addr = ip || `10.1.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  const call = async (path, { method = 'GET', body, headers = {} } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-nf-client-connection-ip': addr, ...(token && { Authorization: `Bearer ${token}` }), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (data?.token) token = data.token;
    return { status: res.status, body: data, headers: res.headers };
  };
  call.token = () => token;
  return call;
}

async function account(email, name = 'Loja') {
  const c = client();
  const r = await c('/api/auth/signup', { method: 'POST', body: { name: 'Dono', email, password: 'senha-segura-1', restaurantName: name } });
  assert.equal(r.status, 201);
  return c;
}

test('SEC-02 login: força bruta bloqueada por e-mail, mesma resposta para e-mail inexistente', async () => {
  await account('alvo@test.com');
  const attacker = client();
  const wrong = await attacker('/api/auth/login', { method: 'POST', body: { email: 'alvo@test.com', password: 'errada' } });
  const ghost = await attacker('/api/auth/login', { method: 'POST', body: { email: 'nao-existe@test.com', password: 'errada' } });
  assert.equal(wrong.status, 401);
  assert.equal(ghost.status, 401);
  assert.equal(wrong.body.error, ghost.body.error, 'não revela se o e-mail existe');

  for (let i = 0; i < 4; i++) await client()('/api/auth/login', { method: 'POST', body: { email: 'alvo@test.com', password: `errada${i}` } });
  // 5 erros (de IPs diferentes): até a senha certa é recusada por 15 minutos.
  const blocked = await client()('/api/auth/login', { method: 'POST', body: { email: 'alvo@test.com', password: 'senha-segura-1' } });
  assert.equal(blocked.status, 429);
  const other = await client()('/api/auth/login', { method: 'POST', body: { email: 'nao-existe@test.com', password: 'x' } });
  assert.equal(other.status, 401, 'o bloqueio é só daquele e-mail');

  const logs = await db.query(`SELECT action FROM cardapio.audit_log WHERE target = 'alvo@test.com'`);
  assert.ok(logs.some((l) => l.action === 'login_failed') && logs.some((l) => l.action === 'login_blocked'));
});

test('SEC-02 cadastro limitado por IP', async () => {
  const c = client({ ip: '10.9.9.9' });
  let last;
  for (let i = 0; i < 11; i++) {
    last = await c('/api/auth/signup', { method: 'POST', body: { name: 'X', email: `spam${i}@test.com`, password: 'senha-segura-1', restaurantName: `Spam ${i}` } });
  }
  assert.equal(last.status, 429);
});

test('SEC-09 sessão: token só como hash no banco, cookie não autentica, logout invalida', async () => {
  const c = await account('sessao@test.com');
  const token = c.token();
  const rows = await db.query(`SELECT s.token FROM cardapio.sessions s JOIN cardapio.users u ON u.id = s.user_id WHERE u.email = 'sessao@test.com'`);
  assert.equal(rows[0].token, sha256(token));
  assert.notEqual(rows[0].token, token);

  const res = await fetch(`${base}/api/auth/me`, { headers: { Cookie: `sid=${token}` } });
  assert.equal(res.status, 401, 'cookie não é mais aceito (sem CSRF)');

  await c('/api/auth/logout', { method: 'POST' });
  const after = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(after.status, 401);
});

test('SEC-12 senha: hash forte, antigo é atualizado no login, limite de tamanho', async () => {
  const c = await account('hash@test.com');
  const { password_hash: hash } = await db.one(`SELECT password_hash FROM cardapio.users WHERE email = 'hash@test.com'`);
  assert.match(hash, /^scrypt\$16384\$8\$5\$/);

  // Hash no formato antigo (N=2^14) continua funcionando e é atualizado.
  const salt = crypto.randomBytes(16);
  const legacy = `${salt.toString('hex')}:${crypto.scryptSync('senha-antiga-1', salt, 64).toString('hex')}`;
  await db.query(`UPDATE cardapio.users SET password_hash = $1 WHERE email = 'hash@test.com'`, [legacy]);
  assert.equal((await client()('/api/auth/login', { method: 'POST', body: { email: 'hash@test.com', password: 'senha-antiga-1' } })).status, 200);
  const upgraded = await db.one(`SELECT password_hash FROM cardapio.users WHERE email = 'hash@test.com'`);
  assert.match(upgraded.password_hash, /^scrypt\$16384\$8\$5\$/);

  const long = await c('/api/auth/change-password', { method: 'POST', body: { current_password: 'x', new_password: 'a'.repeat(200) } });
  assert.equal(long.status, 400);
});

test('SEC-05 imagens: só https ou foto enviada; bloqueia javascript: e quebra de CSS', async () => {
  const c = await account('img@test.com');
  const me = (await c('/api/auth/me')).body.restaurant;
  const put = (patch) => c('/api/admin/restaurant', { method: 'PUT', body: { ...me, ...patch } });

  for (const bad of ['javascript:alert(1)', "https://x.com/a.jpg'); background:url(https://evil", 'http://x.com/a.jpg', 'data:image/svg+xml,<svg onload=alert(1)>']) {
    assert.equal((await put({ cover_url: bad })).status, 400, bad);
  }
  assert.equal((await put({ cover_url: 'https://images.example.com/capa.jpg' })).status, 200);
  assert.equal((await put({ logo_url: `/api/img/${crypto.randomUUID()}` })).status, 200);

  const cat = await c('/api/admin/categories', { method: 'POST', body: { name: 'A' } });
  const prod = await c('/api/admin/products', { method: 'POST', body: { name: 'P', price_cents: 1000, category_id: cat.body.id, image_url: 'javascript:alert(1)' } });
  assert.equal(prod.status, 400);
});

test('SEC-06 upload: tipo real conferido pelos bytes, resposta com sandbox', async () => {
  const c = await account('upload@test.com');
  const html = Buffer.from('<html><script>alert(1)</script></html>').toString('base64');
  assert.equal((await c('/api/admin/images', { method: 'POST', body: { data_url: `data:image/png;base64,${html}` } })).status, 400);

  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const ok = await c('/api/admin/images', { method: 'POST', body: { data_url: `data:image/jpeg;base64,${png}` } });
  assert.equal(ok.status, 201);
  const img = await fetch(base + ok.body.url);
  assert.equal(img.headers.get('content-type'), 'image/png', 'usa o tipo real, não o declarado');
  assert.match(img.headers.get('content-security-policy'), /sandbox/);
  assert.equal(img.headers.get('x-content-type-options'), 'nosniff');
});

test('SEC-07 token do Mercado Pago cifrado no banco e com formato conferido', async () => {
  const c = await account('mp@test.com');
  const me = (await c('/api/auth/me')).body.restaurant;
  assert.equal((await c('/api/admin/restaurant', { method: 'PUT', body: { ...me, mp_access_token: 'qualquer-coisa' } })).status, 400);

  const token = 'APP_USR-1234567890123456-092412-abcdef0123456789abcdef0123456789-123456789';
  const saved = await c('/api/admin/restaurant', { method: 'PUT', body: { ...me, mp_access_token: token } });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.has_mp_token, true);
  assert.equal(saved.body.mp_access_token, undefined, 'token nunca volta para o navegador');
  const row = await db.one(`SELECT r.mp_access_token FROM cardapio.restaurants r JOIN cardapio.users u ON u.id = r.owner_id WHERE u.email = 'mp@test.com'`);
  assert.match(row.mp_access_token, /^enc:v1:/);
  assert.ok(!row.mp_access_token.includes('APP_USR'));
  assert.equal(saved.body.payment_options.demo, false, 'com token, usa Mercado Pago de verdade');
});

test('SEC-04 conta de demonstração: só leitura', async () => {
  const c = await account('demo-ro@test.com');
  await db.query(`UPDATE cardapio.users SET read_only = true WHERE email = 'demo-ro@test.com'`);
  const me = await c('/api/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.body.user.read_only, true);
  assert.equal((await c('/api/admin/menu')).status, 200);
  assert.equal((await c('/api/admin/restaurant', { method: 'PUT', body: me.body.restaurant })).status, 403);
  assert.equal((await c('/api/admin/categories', { method: 'POST', body: { name: 'X' } })).status, 403);
  assert.equal((await c('/api/admin/images', { method: 'POST', body: { data_url: 'data:image/png;base64,AAAA' } })).status, 403);
  assert.equal((await c('/api/auth/change-password', { method: 'POST', body: { current_password: 'senha-segura-1', new_password: 'outra-senha-1' } })).status, 403);
});

test('SEC-11 valores: preço absurdo recusado, sem estourar o banco', async () => {
  const c = await account('valores@test.com');
  const cat = await c('/api/admin/categories', { method: 'POST', body: { name: 'A' } });
  const huge = await c('/api/admin/products', { method: 'POST', body: { name: 'P', price_cents: 99999999999, category_id: cat.body.id } });
  assert.equal(huge.status, 400);
  const me = (await c('/api/auth/me')).body.restaurant;
  const fee = await c('/api/admin/restaurant', { method: 'PUT', body: { ...me, delivery_fee_cents: 1e15 } });
  assert.equal(fee.status, 200);
  assert.ok(fee.body.delivery_fee_cents <= 10_000_000);
});

test('SEC-10 cabeçalhos e erros sem detalhes internos', async () => {
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.headers.get('x-powered-by'), null);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.deepEqual(Object.keys(await res.json()).sort(), ['ok', 'versao']);
  const bad = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{quebrado' });
  assert.equal(bad.status, 400);
  assert.deepEqual(await bad.json(), { error: 'JSON inválido' });
});

test('SEC-08 ações administrativas registradas e bloqueadas para quem não é admin', async () => {
  const user = await account('comum@test.com');
  assert.equal((await user('/api/superadmin/restaurants')).status, 403);
  const root = await account('root@test.com', 'Root');
  const target = (await user('/api/auth/me')).body.restaurant.id;
  assert.equal((await root(`/api/superadmin/restaurants/${target}/reset-password`, { method: 'POST' })).status, 200);
  const actions = (await db.query('SELECT action FROM cardapio.audit_log')).map((r) => r.action);
  assert.ok(actions.includes('admin_access_denied'));
  assert.ok(actions.includes('password_reset_by_admin'));
  const meta = await db.query(`SELECT meta FROM cardapio.audit_log WHERE action = 'password_reset_by_admin'`);
  assert.ok(!/senha|password":/i.test(meta[0].meta), 'o log não guarda a senha');
});

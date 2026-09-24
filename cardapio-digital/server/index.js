const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const { db, tx } = require('./db');
const auth = require('./auth');
const payments = require('./payments');

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '200kb' }));

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SUPERADMINS = (process.env.SUPERADMIN_EMAILS || '')
  .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

const ORDER_STATUSES = ['awaiting_payment', 'received', 'preparing', 'ready', 'out_for_delivery', 'completed', 'canceled'];
const PAYMENT_METHODS = ['pix', 'card_online', 'cash', 'card_on_delivery'];
const FULFILLMENTS = ['delivery', 'pickup', 'table'];

// ---------- utilitários ----------

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function str(v, max = 500) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function cents(v) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function bool(v) { return v ? 1 : 0; }

function slugify(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'restaurante';
}

function uniqueSlug(base, ignoreId = 0) {
  let slug = base;
  for (let i = 2; db.prepare('SELECT 1 FROM restaurants WHERE slug = ? AND id != ?').get(slug, ignoreId); i++) {
    slug = `${base}-${i}`;
  }
  return slug;
}

function baseUrl(req) {
  return (process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

// Limitador simples em memória (por IP + chave).
const hits = new Map();
function rateLimit(key, max, windowMs) {
  return (req, res, next) => {
    const id = `${key}:${req.ip}`;
    const now = Date.now();
    const entry = hits.get(id);
    if (!entry || entry.reset < now) {
      hits.set(id, { count: 1, reset: now + windowMs });
      return next();
    }
    if (++entry.count > max) return res.status(429).json({ error: 'Muitas tentativas. Aguarde um pouco.' });
    next();
  };
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
}, 60e3).unref();

function subscriptionActive(r) {
  return r.plan !== 'trial' || new Date(r.trial_ends_at.replace(' ', 'T') + 'Z') > new Date();
}

function paymentOptions(r) {
  const online = payments.providerFor(r);
  return {
    pix: Boolean(r.accept_pix && online),
    card_online: Boolean(r.accept_card_online && online),
    on_delivery: Boolean(r.accept_on_delivery),
    demo: online === 'demo',
  };
}

function adminRestaurant(r) {
  const { mp_access_token, order_seq, ...rest } = r;
  return {
    ...rest,
    has_mp_token: Boolean(mp_access_token),
    subscription_active: subscriptionActive(r),
    payment_options: paymentOptions(r),
  };
}

function loadMenu(restaurantId, { onlyAvailable }) {
  const categories = db.prepare('SELECT id, name, position FROM categories WHERE restaurant_id = ? ORDER BY position, id').all(restaurantId);
  const products = db.prepare(
    `SELECT id, category_id, name, description, price_cents, image_url, available, position
     FROM products WHERE restaurant_id = ? ${onlyAvailable ? 'AND available = 1' : ''} ORDER BY position, id`
  ).all(restaurantId);
  const addons = db.prepare(
    `SELECT a.id, a.product_id, a.name, a.price_cents FROM product_addons a
     JOIN products p ON p.id = a.product_id WHERE p.restaurant_id = ? ORDER BY a.id`
  ).all(restaurantId);
  const byProduct = {};
  for (const a of addons) (byProduct[a.product_id] ||= []).push({ id: a.id, name: a.name, price_cents: a.price_cents });
  for (const p of products) p.addons = byProduct[p.id] || [];
  return { categories, products };
}

function loadOrder(id) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return null;
  order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id').all(id)
    .map((it) => ({ ...it, addons: JSON.parse(it.addons_json) }));
  return order;
}

function applyPaymentResult(orderId, status, paymentId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order || order.payment_status === 'approved') return;
  if (status === 'approved') {
    db.prepare(
      `UPDATE orders SET payment_status = 'approved', payment_ref = ?,
       status = CASE WHEN status = 'awaiting_payment' THEN 'received' ELSE status END,
       updated_at = datetime('now') WHERE id = ?`
    ).run(paymentId || order.payment_ref, orderId);
  } else if (status === 'rejected') {
    db.prepare(`UPDATE orders SET payment_status = 'rejected', updated_at = datetime('now') WHERE id = ?`).run(orderId);
  }
}

// ---------- autenticação ----------

app.post('/api/auth/signup', rateLimit('signup', 10, 60 * 60e3), wrap(async (req, res) => {
  const name = str(req.body.name, 100);
  const email = str(req.body.email, 200).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const restaurantName = str(req.body.restaurantName, 100);
  if (!name || !restaurantName) throw new HttpError(400, 'Informe seu nome e o nome do estabelecimento.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new HttpError(400, 'E-mail inválido.');
  if (password.length < 8) throw new HttpError(400, 'A senha precisa ter pelo menos 8 caracteres.');
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) throw new HttpError(409, 'Este e-mail já está cadastrado.');

  const userId = tx(() => {
    const u = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(name, email, auth.hashPassword(password));
    const uid = Number(u.lastInsertRowid);
    db.prepare('INSERT INTO restaurants (owner_id, slug, name) VALUES (?, ?, ?)')
      .run(uid, uniqueSlug(slugify(restaurantName)), restaurantName);
    return uid;
  });
  auth.createSession(res, userId);
  res.status(201).json({ ok: true });
}));

app.post('/api/auth/login', rateLimit('login', 20, 15 * 60e3), wrap(async (req, res) => {
  const email = str(req.body.email, 200).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !auth.verifyPassword(password, user.password_hash)) {
    throw new HttpError(401, 'E-mail ou senha incorretos.');
  }
  auth.createSession(res, user.id);
  res.json({ ok: true });
}));

app.post('/api/auth/logout', (req, res) => {
  auth.destroySession(req, res);
  res.json({ ok: true });
});

app.get('/api/auth/me', auth.requireAuth, (req, res) => {
  res.json({
    user: { ...req.user, is_superadmin: SUPERADMINS.includes(req.user.email) },
    restaurant: adminRestaurant(req.restaurant),
  });
});

// ---------- painel do restaurante ----------

const admin = express.Router();
admin.use(auth.requireAuth);

admin.put('/restaurant', (req, res) => {
  const b = req.body;
  const r = req.restaurant;
  const slug = b.slug !== undefined ? slugify(str(b.slug, 40)) : r.slug;
  if (slug !== r.slug && db.prepare('SELECT 1 FROM restaurants WHERE slug = ? AND id != ?').get(slug, r.id)) {
    throw new HttpError(409, 'Esse endereço de cardápio já está em uso.');
  }
  const color = /^#[0-9a-fA-F]{6}$/.test(b.primary_color) ? b.primary_color : r.primary_color;
  const mpToken = b.mp_access_token === undefined ? r.mp_access_token : str(b.mp_access_token, 200);
  db.prepare(
    `UPDATE restaurants SET slug=?, name=?, description=?, logo_url=?, cover_url=?, primary_color=?,
     whatsapp=?, address=?, opening_hours=?, is_open=?, delivery_enabled=?, pickup_enabled=?, table_enabled=?,
     delivery_fee_cents=?, min_order_cents=?, accept_pix=?, accept_card_online=?, accept_on_delivery=?,
     mp_access_token=? WHERE id=?`
  ).run(
    slug, str(b.name, 100) || r.name, str(b.description, 300), str(b.logo_url, 500), str(b.cover_url, 500), color,
    str(b.whatsapp, 20).replace(/\D/g, ''), str(b.address, 200), str(b.opening_hours, 200),
    bool(b.is_open), bool(b.delivery_enabled), bool(b.pickup_enabled), bool(b.table_enabled),
    cents(b.delivery_fee_cents), cents(b.min_order_cents),
    bool(b.accept_pix), bool(b.accept_card_online), bool(b.accept_on_delivery),
    mpToken, r.id
  );
  res.json(adminRestaurant(db.prepare('SELECT * FROM restaurants WHERE id = ?').get(r.id)));
});

admin.get('/menu', (req, res) => {
  res.json(loadMenu(req.restaurant.id, { onlyAvailable: false }));
});

admin.post('/categories', (req, res) => {
  const name = str(req.body.name, 60);
  if (!name) throw new HttpError(400, 'Informe o nome da categoria.');
  const pos = db.prepare('SELECT COALESCE(MAX(position), 0) + 1 AS p FROM categories WHERE restaurant_id = ?').get(req.restaurant.id).p;
  const r = db.prepare('INSERT INTO categories (restaurant_id, name, position) VALUES (?, ?, ?)').run(req.restaurant.id, name, pos);
  res.status(201).json({ id: Number(r.lastInsertRowid), name, position: pos });
});

admin.put('/categories/:id', (req, res) => {
  const name = str(req.body.name, 60);
  const position = Number.isInteger(req.body.position) ? req.body.position : null;
  const r = db.prepare(
    'UPDATE categories SET name = COALESCE(NULLIF(?, \'\'), name), position = COALESCE(?, position) WHERE id = ? AND restaurant_id = ?'
  ).run(name, position, req.params.id, req.restaurant.id);
  if (!r.changes) throw new HttpError(404, 'Categoria não encontrada.');
  res.json({ ok: true });
});

admin.delete('/categories/:id', (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ? AND restaurant_id = ?').run(req.params.id, req.restaurant.id);
  res.json({ ok: true });
});

function saveProduct(req, productId) {
  const b = req.body;
  const name = str(b.name, 100);
  if (!name) throw new HttpError(400, 'Informe o nome do produto.');
  const price = cents(b.price_cents);
  if (price <= 0) throw new HttpError(400, 'Informe um preço válido.');
  let categoryId = b.category_id ? Number(b.category_id) : null;
  if (categoryId && !db.prepare('SELECT 1 FROM categories WHERE id = ? AND restaurant_id = ?').get(categoryId, req.restaurant.id)) {
    categoryId = null;
  }
  const addons = Array.isArray(b.addons) ? b.addons.slice(0, 30)
    .map((a) => ({ name: str(a?.name, 60), price_cents: cents(a?.price_cents) }))
    .filter((a) => a.name) : [];

  return tx(() => {
    let id = productId;
    if (id) {
      const r = db.prepare(
        `UPDATE products SET category_id=?, name=?, description=?, price_cents=?, image_url=?, available=?
         WHERE id=? AND restaurant_id=?`
      ).run(categoryId, name, str(b.description, 500), price, str(b.image_url, 500), bool(b.available), id, req.restaurant.id);
      if (!r.changes) throw new HttpError(404, 'Produto não encontrado.');
      db.prepare('DELETE FROM product_addons WHERE product_id = ?').run(id);
    } else {
      const pos = db.prepare('SELECT COALESCE(MAX(position), 0) + 1 AS p FROM products WHERE restaurant_id = ?').get(req.restaurant.id).p;
      id = Number(db.prepare(
        `INSERT INTO products (restaurant_id, category_id, name, description, price_cents, image_url, available, position)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(req.restaurant.id, categoryId, name, str(b.description, 500), price, str(b.image_url, 500), bool(b.available ?? true), pos).lastInsertRowid);
    }
    const ins = db.prepare('INSERT INTO product_addons (product_id, name, price_cents) VALUES (?, ?, ?)');
    for (const a of addons) ins.run(id, a.name, a.price_cents);
    return id;
  });
}

admin.post('/products', (req, res) => {
  res.status(201).json({ id: saveProduct(req, null) });
});

admin.put('/products/:id', (req, res) => {
  res.json({ id: saveProduct(req, Number(req.params.id)) });
});

admin.patch('/products/:id/availability', (req, res) => {
  db.prepare('UPDATE products SET available = ? WHERE id = ? AND restaurant_id = ?')
    .run(bool(req.body.available), req.params.id, req.restaurant.id);
  res.json({ ok: true });
});

admin.delete('/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ? AND restaurant_id = ?').run(req.params.id, req.restaurant.id);
  res.json({ ok: true });
});

admin.get('/orders', (req, res) => {
  const scope = req.query.scope === 'history' ? 'history' : 'active';
  const where = scope === 'active'
    ? `status NOT IN ('completed', 'canceled') AND created_at >= datetime('now', '-2 days')
       AND NOT (status = 'awaiting_payment' AND created_at < datetime('now', '-2 hours'))`
    : `created_at >= datetime('now', '-60 days')`;
  const orders = db.prepare(
    `SELECT id FROM orders WHERE restaurant_id = ? AND ${where} ORDER BY created_at DESC LIMIT 300`
  ).all(req.restaurant.id).map((o) => loadOrder(o.id));
  res.json(orders);
});

admin.patch('/orders/:id', (req, res) => {
  const status = req.body.status;
  if (!ORDER_STATUSES.includes(status) || status === 'awaiting_payment') throw new HttpError(400, 'Status inválido.');
  const r = db.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ? AND restaurant_id = ?`)
    .run(status, req.params.id, req.restaurant.id);
  if (!r.changes) throw new HttpError(404, 'Pedido não encontrado.');
  if (req.body.mark_paid === true) {
    db.prepare(`UPDATE orders SET payment_status = 'approved' WHERE id = ?`).run(req.params.id);
  }
  res.json(loadOrder(req.params.id));
});

admin.get('/stats', (req, res) => {
  const rid = req.restaurant.id;
  const period = (days) => db.prepare(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(total_cents), 0) AS revenue_cents
     FROM orders WHERE restaurant_id = ? AND status NOT IN ('canceled', 'awaiting_payment')
     AND created_at >= datetime('now', ?)`
  ).get(rid, `-${days} days`);
  const today = db.prepare(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(total_cents), 0) AS revenue_cents
     FROM orders WHERE restaurant_id = ? AND status NOT IN ('canceled', 'awaiting_payment')
     AND date(created_at, 'localtime') = date('now', 'localtime')`
  ).get(rid);
  const top = db.prepare(
    `SELECT i.name, SUM(i.quantity) AS qty FROM order_items i JOIN orders o ON o.id = i.order_id
     WHERE o.restaurant_id = ? AND o.status NOT IN ('canceled', 'awaiting_payment')
     AND o.created_at >= datetime('now', '-30 days') GROUP BY i.name ORDER BY qty DESC LIMIT 5`
  ).all(rid);
  const daily = db.prepare(
    `SELECT date(created_at, 'localtime') AS day, COUNT(*) AS orders, SUM(total_cents) AS revenue_cents
     FROM orders WHERE restaurant_id = ? AND status NOT IN ('canceled', 'awaiting_payment')
     AND created_at >= datetime('now', '-14 days') GROUP BY day ORDER BY day`
  ).all(rid);
  res.json({ today, week: period(7), month: period(30), top, daily });
});

app.use('/api/admin', admin);

// ---------- superadmin (dono do SaaS) ----------

const superadmin = express.Router();
superadmin.use(auth.requireAuth, (req, res, next) => {
  if (!SUPERADMINS.includes(req.user.email)) return res.status(403).json({ error: 'Acesso negado' });
  next();
});

superadmin.get('/restaurants', (req, res) => {
  res.json(db.prepare(
    `SELECT r.id, r.name, r.slug, r.plan, r.trial_ends_at, r.created_at, u.email AS owner_email,
     (SELECT COUNT(*) FROM orders o WHERE o.restaurant_id = r.id) AS total_orders
     FROM restaurants r JOIN users u ON u.id = r.owner_id ORDER BY r.created_at DESC`
  ).all());
});

superadmin.patch('/restaurants/:id', (req, res) => {
  const plan = ['trial', 'basic', 'pro', 'suspended'].includes(req.body.plan) ? req.body.plan : null;
  if (!plan) throw new HttpError(400, 'Plano inválido.');
  const extraDays = Number.isInteger(req.body.extend_trial_days) ? req.body.extend_trial_days : 0;
  db.prepare(
    `UPDATE restaurants SET plan = ?, trial_ends_at = CASE WHEN ? > 0
       THEN datetime(MAX(trial_ends_at, datetime('now')), '+' || ? || ' days') ELSE trial_ends_at END WHERE id = ?`
  ).run(plan, extraDays, extraDays, req.params.id);
  res.json({ ok: true });
});

app.use('/api/superadmin', superadmin);

// ---------- cardápio público ----------

function publicRestaurant(slug) {
  const r = db.prepare('SELECT * FROM restaurants WHERE slug = ?').get(slug);
  if (!r) throw new HttpError(404, 'Cardápio não encontrado.');
  return r;
}

app.get('/api/public/r/:slug', (req, res) => {
  const r = publicRestaurant(req.params.slug);
  const accepting = r.plan !== 'suspended' && subscriptionActive(r);
  res.json({
    restaurant: {
      slug: r.slug, name: r.name, description: r.description, logo_url: r.logo_url, cover_url: r.cover_url,
      primary_color: r.primary_color, whatsapp: r.whatsapp, address: r.address, opening_hours: r.opening_hours,
      is_open: Boolean(r.is_open) && accepting, accepting_orders: accepting,
      delivery_enabled: Boolean(r.delivery_enabled), pickup_enabled: Boolean(r.pickup_enabled),
      table_enabled: Boolean(r.table_enabled), delivery_fee_cents: r.delivery_fee_cents,
      min_order_cents: r.min_order_cents, payment_options: paymentOptions(r),
    },
    ...loadMenu(r.id, { onlyAvailable: true }),
  });
});

app.post('/api/public/r/:slug/orders', rateLimit('order', 30, 15 * 60e3), wrap(async (req, res) => {
  const r = publicRestaurant(req.params.slug);
  const b = req.body;
  if (!r.is_open || r.plan === 'suspended' || !subscriptionActive(r)) {
    throw new HttpError(409, 'O estabelecimento não está recebendo pedidos no momento.');
  }

  const customerName = str(b.customer_name, 100);
  const customerPhone = str(b.customer_phone, 20).replace(/\D/g, '');
  const customerEmail = str(b.customer_email, 200).toLowerCase();
  if (!customerName) throw new HttpError(400, 'Informe seu nome.');
  if (customerPhone.length < 10) throw new HttpError(400, 'Informe um telefone válido com DDD.');
  if (customerEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) throw new HttpError(400, 'E-mail inválido.');

  const fulfillment = b.fulfillment;
  if (!FULFILLMENTS.includes(fulfillment) || !r[`${fulfillment}_enabled`]) {
    throw new HttpError(400, 'Forma de entrega indisponível.');
  }
  const address = str(b.address, 300);
  const tableNumber = str(b.table_number, 10);
  if (fulfillment === 'delivery' && address.length < 5) throw new HttpError(400, 'Informe o endereço de entrega.');
  if (fulfillment === 'table' && !tableNumber) throw new HttpError(400, 'Informe o número da mesa.');

  const method = b.payment_method;
  const opts = paymentOptions(r);
  const methodOk = { pix: opts.pix, card_online: opts.card_online, cash: opts.on_delivery, card_on_delivery: opts.on_delivery };
  if (!PAYMENT_METHODS.includes(method) || !methodOk[method]) throw new HttpError(400, 'Forma de pagamento indisponível.');
  if (method === 'pix' && !customerEmail && payments.providerFor(r) === 'mercadopago') {
    throw new HttpError(400, 'Informe seu e-mail para pagar com PIX.');
  }

  // Recalcula tudo no servidor: nunca confiamos em preços enviados pelo cliente.
  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 50) throw new HttpError(400, 'Seu carrinho está vazio.');
  const getProduct = db.prepare('SELECT * FROM products WHERE id = ? AND restaurant_id = ? AND available = 1');
  const getAddon = db.prepare('SELECT * FROM product_addons WHERE id = ? AND product_id = ?');
  const items = b.items.map((raw) => {
    const p = getProduct.get(Number(raw?.product_id), r.id);
    if (!p) throw new HttpError(409, 'Um dos produtos do carrinho não está mais disponível.');
    const qty = Number(raw.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) throw new HttpError(400, 'Quantidade inválida.');
    const addonIds = [...new Set(Array.isArray(raw.addon_ids) ? raw.addon_ids.map(Number) : [])];
    const addons = addonIds.map((aid) => {
      const a = getAddon.get(aid, p.id);
      if (!a) throw new HttpError(409, 'Um adicional selecionado não está mais disponível.');
      return { id: a.id, name: a.name, price_cents: a.price_cents };
    });
    const unit = p.price_cents + addons.reduce((s, a) => s + a.price_cents, 0);
    return { product_id: p.id, name: p.name, unit_price_cents: unit, quantity: qty, addons, notes: str(raw.notes, 200) };
  });

  const subtotal = items.reduce((s, it) => s + it.unit_price_cents * it.quantity, 0);
  if (subtotal < r.min_order_cents) throw new HttpError(400, 'O pedido não atingiu o valor mínimo.');
  const deliveryFee = fulfillment === 'delivery' ? r.delivery_fee_cents : 0;
  const total = subtotal + deliveryFee;
  const changeFor = method === 'cash' ? cents(b.change_for_cents) : 0;
  const online = method === 'pix' || method === 'card_online';

  const orderId = crypto.randomUUID();
  const order = tx(() => {
    const number = db.prepare('UPDATE restaurants SET order_seq = order_seq + 1 WHERE id = ? RETURNING order_seq').get(r.id).order_seq;
    db.prepare(
      `INSERT INTO orders (id, restaurant_id, number, customer_name, customer_phone, customer_email, fulfillment,
       address, table_number, notes, subtotal_cents, delivery_fee_cents, total_cents, change_for_cents,
       payment_method, payment_provider, payment_status, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      orderId, r.id, number, customerName, customerPhone, customerEmail, fulfillment,
      fulfillment === 'delivery' ? address : '', fulfillment === 'table' ? tableNumber : '',
      str(b.notes, 300), subtotal, deliveryFee, total, changeFor, method,
      online ? payments.providerFor(r) : 'none', 'pending', online ? 'awaiting_payment' : 'received'
    );
    const ins = db.prepare(
      `INSERT INTO order_items (order_id, product_id, name, unit_price_cents, quantity, addons_json, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (const it of items) ins.run(orderId, it.product_id, it.name, it.unit_price_cents, it.quantity, JSON.stringify(it.addons), it.notes);
    return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  });

  if (!online) return res.status(201).json({ order_id: orderId });

  try {
    if (method === 'pix') {
      const pix = await payments.createPix({ restaurant: r, order, baseUrl: baseUrl(req) });
      db.prepare('UPDATE orders SET payment_ref = ?, pix_code = ?, pix_qr_base64 = ? WHERE id = ?')
        .run(pix.ref, pix.pixCode, pix.pixQrBase64, orderId);
      return res.status(201).json({ order_id: orderId });
    }
    const checkout = await payments.createCardCheckout({ restaurant: r, order, items, baseUrl: baseUrl(req) });
    db.prepare('UPDATE orders SET payment_ref = ?, checkout_url = ? WHERE id = ?').run(checkout.ref, checkout.checkoutUrl, orderId);
    return res.status(201).json({ order_id: orderId, redirect_url: checkout.checkoutUrl });
  } catch (err) {
    console.error('Falha ao criar pagamento:', err.message, err.details || '');
    db.prepare(`UPDATE orders SET status = 'canceled', payment_status = 'rejected' WHERE id = ?`).run(orderId);
    throw new HttpError(502, 'Não foi possível iniciar o pagamento. Tente outra forma de pagamento.');
  }
}));

function publicOrder(order) {
  const r = db.prepare('SELECT slug, name, whatsapp, primary_color, logo_url FROM restaurants WHERE id = ?').get(order.restaurant_id);
  const { restaurant_id, payment_ref, ...rest } = order;
  return { ...rest, restaurant: r };
}

app.get('/api/public/orders/:id', (req, res) => {
  const order = loadOrder(req.params.id);
  if (!order) throw new HttpError(404, 'Pedido não encontrado.');
  res.json(publicOrder(order));
});

// Consulta o status do pagamento diretamente no provedor (útil quando o
// webhook ainda não chegou, ou em ambientes sem URL pública).
app.post('/api/public/orders/:id/refresh-payment', rateLimit('refresh', 400, 15 * 60e3), wrap(async (req, res) => {
  const order = loadOrder(req.params.id);
  if (!order) throw new HttpError(404, 'Pedido não encontrado.');
  if (order.payment_status !== 'approved' && order.payment_provider === 'mercadopago') {
    const r = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(order.restaurant_id);
    try {
      const result = await payments.fetchPaymentStatus({ restaurant: r, order });
      if (result) applyPaymentResult(order.id, result.status, result.paymentId);
    } catch (err) {
      console.error('Falha ao consultar pagamento:', err.message);
    }
  }
  res.json(publicOrder(loadOrder(req.params.id)));
}));

app.post('/api/public/orders/:id/demo-pay', (req, res) => {
  const order = loadOrder(req.params.id);
  if (!order || order.payment_provider !== 'demo' || !payments.demoPaymentsAllowed()) {
    throw new HttpError(404, 'Pedido não encontrado.');
  }
  applyPaymentResult(order.id, 'approved', `demo-${order.id}`);
  res.json(publicOrder(loadOrder(order.id)));
});

// ---------- webhooks ----------

app.post('/api/webhooks/mercadopago/:restaurantId', wrap(async (req, res) => {
  const type = req.body?.type || req.query.type || req.query.topic;
  const dataId = req.body?.data?.id || req.query['data.id'] || req.query.id;
  if (type !== 'payment' || !dataId) return res.sendStatus(200);
  if (!payments.verifyWebhookSignature(req, req.query['data.id'] || dataId)) return res.sendStatus(401);

  const r = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(req.params.restaurantId);
  if (!r || !r.mp_access_token) return res.sendStatus(200);

  // Nunca confiamos no corpo do webhook: buscamos o pagamento na API com o token do restaurante.
  const p = await payments.fetchPaymentById({ restaurant: r, paymentId: dataId });
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND restaurant_id = ?').get(p.orderId, r.id);
  if (order) {
    const status = p.status === 'approved' && p.amountCents < order.total_cents ? 'rejected' : p.status;
    applyPaymentResult(order.id, status, p.paymentId);
  }
  res.sendStatus(200);
}));

// ---------- páginas ----------

app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));
app.get('/vendor/qrcode.js', (req, res) => res.sendFile(require.resolve('qrcode-generator/qrcode.js')));
app.get('/m/:slug', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'menu.html')));
app.get('/pedido/:id', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'order.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin.html')));

app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

app.use((err, req, res, next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Cardápio Digital rodando em http://localhost:${port}`));
}

module.exports = app;

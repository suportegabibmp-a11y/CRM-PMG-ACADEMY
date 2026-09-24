import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { db, databaseUrl, describeDatabaseUrl } from './db.js';
import * as auth from './auth.js';
import * as payments from './payments.js';
import * as billing from './billing.js';
import { ON_EDGE, siteUrl } from './config.js';

const app = express();
app.set('trust proxy', true);

// Muda a cada atualização, para conferir se o deploy novo está no ar.
const APP_VERSION = '2026-09-24.7';

// Diagnóstico da instalação: mostra o que falta configurar, sem expor segredos.
app.get('/api/health', async (req, res) => {
  const checks = {
    versao: APP_VERSION,
    servidor: ON_EDGE ? 'supabase-edge' : 'node',
    stripe_configured: billing.enabled(),
  };
  try {
    await db.query('SELECT 1 FROM cardapio.restaurants LIMIT 1');
    res.json({ ok: true, ...checks, database: 'ok' });
  } catch (err) {
    console.error('Health check:', err);
    const shown = databaseUrl() ? describeDatabaseUrl(databaseUrl()) : null;
    res.status(503).json({
      ok: false,
      ...checks,
      database: `erro ao conectar: ${String(err.message).slice(0, 240)}`,
      database_url_lida: shown || 'formato inválido',
      dica: databaseHint(err, shown),
    });
  }
});

// Upload de fotos: o navegador já envia a imagem reduzida (JPEG/PNG/WebP em
// base64). Registrado antes do express.json() geral por causa do tamanho.
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
app.post('/api/admin/images', express.json({ limit: '4mb' }), auth.requireAuth, async (req, res) => {
  const match = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body?.data_url || ''));
  if (!match || !IMAGE_TYPES.includes(match[1])) throw new HttpError(400, 'Envie uma imagem JPG, PNG ou WebP.');
  const data = Buffer.from(match[2], 'base64');
  if (data.length > 2 * 1024 * 1024) throw new HttpError(413, 'Imagem muito grande (máximo 2 MB).');
  const id = crypto.randomUUID();
  await db.query('INSERT INTO cardapio.images (id, restaurant_id, content_type, data) VALUES ($1, $2, $3, $4)',
    [id, req.restaurant.id, match[1], data]);
  res.status(201).json({ url: `/api/img/${id}` });
});

app.get('/api/img/:id', async (req, res) => {
  if (!/^[0-9a-f-]{36}$/.test(req.params.id)) throw new HttpError(404, 'Imagem não encontrada.');
  const img = await db.one('SELECT content_type, data FROM cardapio.images WHERE id = $1', [req.params.id]);
  if (!img) throw new HttpError(404, 'Imagem não encontrada.');
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.type(img.content_type).send(Buffer.from(img.data));
});

app.use(express.json({ limit: '200kb' }));

// Páginas locais (só quando roda a partir dos arquivos; no Supabase quem serve é a Netlify).
const PUBLIC_DIR = import.meta.url.startsWith('file:') ? fileURLToPath(new URL('../public', import.meta.url)) : null;

// Superadmins: variável SUPERADMIN_EMAILS e/ou a configuração
// "superadmin_emails" na tabela cardapio.settings.
let superadminCache = { at: 0, list: [] };
async function isSuperadmin(email) {
  if (Date.now() - superadminCache.at > 60e3) {
    const row = await db.one(`SELECT value FROM cardapio.settings WHERE key = 'superadmin_emails'`).catch(() => null);
    superadminCache = {
      at: Date.now(),
      list: `${process.env.SUPERADMIN_EMAILS || ''},${row?.value || ''}`
        .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean),
    };
  }
  return superadminCache.list.includes(String(email).toLowerCase());
}
const TZ = process.env.APP_TIMEZONE || 'America/Sao_Paulo';

const ORDER_STATUSES = ['awaiting_payment', 'received', 'preparing', 'ready', 'out_for_delivery', 'completed', 'canceled'];
const PAYMENT_METHODS = ['pix', 'card_online', 'cash', 'card_on_delivery'];
const FULFILLMENTS = ['delivery', 'pickup', 'table'];

// ---------- utilitários ----------

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function str(v, max = 500) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function cents(v) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function bool(v) { return v ? 1 : 0; }

// IDs numéricos vindos da URL; qualquer coisa inválida vira 404.
function intId(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0 || n > 2147483647) throw new HttpError(404, 'Não encontrado.');
  return n;
}

function slugify(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'restaurante';
}

async function uniqueSlug(q, base) {
  let slug = base;
  for (let i = 2; await q.one('SELECT 1 FROM cardapio.restaurants WHERE slug = $1', [slug]); i++) {
    slug = `${base}-${i}`;
  }
  return slug;
}

const baseUrl = siteUrl;

// Limitador simples em memória (por IP + chave). Em ambiente serverless vale
// por instância, o que ainda segura abusos mais grosseiros.
const hits = new Map();
function rateLimit(key, max, windowMs) {
  return (req, res, next) => {
    const id = `${key}:${req.ip}`;
    const now = Date.now();
    const entry = hits.get(id);
    if (!entry || entry.reset < now) {
      if (hits.size > 10000) hits.clear();
      hits.set(id, { count: 1, reset: now + windowMs });
      return next();
    }
    if (++entry.count > max) return res.status(429).json({ error: 'Muitas tentativas. Aguarde um pouco.' });
    next();
  };
}

function subscriptionActive(r) {
  if (r.plan === 'suspended') return false;
  if (r.plan === 'trial') return new Date(r.trial_ends_at) > new Date();
  // Plano liberado manualmente pelo superadmin, sem assinatura no Stripe.
  if (!r.stripe_subscription_id) return true;
  return billing.ACTIVE_STATUSES.includes(r.subscription_status);
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
  const { mp_access_token, order_seq, stripe_customer_id, stripe_subscription_id, ...rest } = r;
  return {
    ...rest,
    has_mp_token: Boolean(mp_access_token),
    has_subscription: Boolean(stripe_subscription_id),
    subscription_active: subscriptionActive(r),
    payment_options: paymentOptions(r),
  };
}

async function loadMenu(restaurantId, { onlyAvailable }) {
  const [categories, products, addons] = await Promise.all([
    db.query('SELECT id, name, position FROM cardapio.categories WHERE restaurant_id = $1 ORDER BY position, id', [restaurantId]),
    db.query(
      `SELECT id, category_id, name, description, price_cents, image_url, available, position
       FROM cardapio.products WHERE restaurant_id = $1 ${onlyAvailable ? 'AND available = 1' : ''} ORDER BY position, id`,
      [restaurantId]
    ),
    db.query(
      `SELECT a.id, a.product_id, a.name, a.price_cents FROM cardapio.product_addons a
       JOIN cardapio.products p ON p.id = a.product_id WHERE p.restaurant_id = $1 ORDER BY a.id`,
      [restaurantId]
    ),
  ]);
  const byProduct = {};
  for (const a of addons) (byProduct[a.product_id] ||= []).push({ id: a.id, name: a.name, price_cents: a.price_cents });
  return {
    categories: [...categories],
    products: products.map((p) => ({ ...p, addons: byProduct[p.id] || [] })),
  };
}

async function loadOrders(where, params) {
  const orders = await db.query(`SELECT * FROM cardapio.orders WHERE ${where}`, params);
  if (!orders.length) return [];
  const items = await db.query(
    'SELECT * FROM cardapio.order_items WHERE order_id = ANY($1::text[]) ORDER BY id',
    [orders.map((o) => o.id)]
  );
  const byOrder = {};
  for (const it of items) (byOrder[it.order_id] ||= []).push({ ...it, addons: JSON.parse(it.addons_json) });
  return orders.map((o) => ({ ...o, items: byOrder[o.id] || [] }));
}

async function loadOrder(id) {
  if (typeof id !== 'string' || id.length > 64) return null;
  return (await loadOrders('id = $1', [id]))[0] || null;
}

async function applyPaymentResult(orderId, status, paymentId) {
  if (status === 'approved') {
    await db.query(
      `UPDATE cardapio.orders SET payment_status = 'approved', payment_ref = COALESCE(NULLIF($2, ''), payment_ref),
       status = CASE WHEN status = 'awaiting_payment' THEN 'received' ELSE status END, updated_at = now()
       WHERE id = $1 AND payment_status <> 'approved'`,
      [orderId, paymentId || '']
    );
  } else if (status === 'rejected') {
    await db.query(
      `UPDATE cardapio.orders SET payment_status = 'rejected', updated_at = now()
       WHERE id = $1 AND payment_status <> 'approved'`,
      [orderId]
    );
  }
}

// ---------- autenticação ----------

app.post('/api/auth/signup', rateLimit('signup', 10, 60 * 60e3), async (req, res) => {
  const name = str(req.body.name, 100);
  const email = str(req.body.email, 200).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const restaurantName = str(req.body.restaurantName, 100);
  if (!name || !restaurantName) throw new HttpError(400, 'Informe seu nome e o nome do estabelecimento.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new HttpError(400, 'E-mail inválido.');
  if (password.length < 8) throw new HttpError(400, 'A senha precisa ter pelo menos 8 caracteres.');
  if (await db.one('SELECT 1 FROM cardapio.users WHERE email = $1', [email])) throw new HttpError(409, 'Este e-mail já está cadastrado.');

  const userId = await db.tx(async (q) => {
    const u = await q.one('INSERT INTO cardapio.users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [name, email, auth.hashPassword(password)]);
    await q.query('INSERT INTO cardapio.restaurants (owner_id, slug, name) VALUES ($1, $2, $3)',
      [u.id, await uniqueSlug(q, slugify(restaurantName)), restaurantName]);
    return u.id;
  });
  const token = await auth.createSession(req, res, userId);
  res.status(201).json({ ok: true, token });
});

app.post('/api/auth/login', rateLimit('login', 20, 15 * 60e3), async (req, res) => {
  const email = str(req.body.email, 200).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const user = await db.one('SELECT * FROM cardapio.users WHERE email = $1', [email]);
  if (!user || !auth.verifyPassword(password, user.password_hash)) {
    throw new HttpError(401, 'E-mail ou senha incorretos.');
  }
  const token = await auth.createSession(req, res, user.id);
  res.json({ ok: true, token });
});

app.post('/api/auth/logout', async (req, res) => {
  await auth.destroySession(req, res);
  res.json({ ok: true });
});

app.get('/api/auth/me', auth.requireAuth, async (req, res) => {
  // Confere a assinatura no Stripe de vez em quando (no máximo 1x por hora).
  if (await billing.maybeSync(req.restaurant, 3600e3)) {
    req.restaurant = await db.one('SELECT * FROM cardapio.restaurants WHERE id = $1', [req.restaurant.id]);
  }
  res.json({
    user: { ...req.user, is_superadmin: await isSuperadmin(req.user.email) },
    restaurant: adminRestaurant(req.restaurant),
  });
});

// ---------- painel do restaurante ----------

const admin = express.Router();
admin.use(auth.requireAuth);

admin.put('/restaurant', async (req, res) => {
  const b = req.body;
  const r = req.restaurant;
  const slug = b.slug !== undefined ? slugify(str(b.slug, 40)) : r.slug;
  if (slug !== r.slug && await db.one('SELECT 1 FROM cardapio.restaurants WHERE slug = $1 AND id <> $2', [slug, r.id])) {
    throw new HttpError(409, 'Esse endereço de cardápio já está em uso.');
  }
  const color = /^#[0-9a-fA-F]{6}$/.test(b.primary_color) ? b.primary_color : r.primary_color;
  const mpToken = b.mp_access_token === undefined ? r.mp_access_token : str(b.mp_access_token, 200);
  const updated = await db.one(
    `UPDATE cardapio.restaurants SET slug=$1, name=$2, description=$3, logo_url=$4, cover_url=$5, primary_color=$6,
     whatsapp=$7, address=$8, opening_hours=$9, is_open=$10, delivery_enabled=$11, pickup_enabled=$12, table_enabled=$13,
     delivery_fee_cents=$14, min_order_cents=$15, accept_pix=$16, accept_card_online=$17, accept_on_delivery=$18,
     mp_access_token=$19 WHERE id=$20 RETURNING *`,
    [
      slug, str(b.name, 100) || r.name, str(b.description, 300), str(b.logo_url, 500), str(b.cover_url, 500), color,
      str(b.whatsapp, 20).replace(/\D/g, ''), str(b.address, 200), str(b.opening_hours, 200),
      bool(b.is_open), bool(b.delivery_enabled), bool(b.pickup_enabled), bool(b.table_enabled),
      cents(b.delivery_fee_cents), cents(b.min_order_cents),
      bool(b.accept_pix), bool(b.accept_card_online), bool(b.accept_on_delivery),
      mpToken, r.id,
    ]
  );
  res.json(adminRestaurant(updated));
});

admin.get('/menu', async (req, res) => {
  res.json(await loadMenu(req.restaurant.id, { onlyAvailable: false }));
});

admin.post('/categories', async (req, res) => {
  const name = str(req.body.name, 60);
  if (!name) throw new HttpError(400, 'Informe o nome da categoria.');
  const cat = await db.one(
    `INSERT INTO cardapio.categories (restaurant_id, name, position)
     VALUES ($1, $2, (SELECT COALESCE(MAX(position), 0) + 1 FROM cardapio.categories WHERE restaurant_id = $1))
     RETURNING id, name, position`,
    [req.restaurant.id, name]
  );
  res.status(201).json(cat);
});

admin.put('/categories/:id', async (req, res) => {
  const name = str(req.body.name, 60);
  const position = Number.isInteger(req.body.position) ? req.body.position : null;
  const updated = await db.one(
    `UPDATE cardapio.categories SET name = COALESCE(NULLIF($1, ''), name), position = COALESCE($2::int, position)
     WHERE id = $3 AND restaurant_id = $4 RETURNING id`,
    [name, position, intId(req.params.id), req.restaurant.id]
  );
  if (!updated) throw new HttpError(404, 'Categoria não encontrada.');
  res.json({ ok: true });
});

admin.delete('/categories/:id', async (req, res) => {
  await db.query('DELETE FROM cardapio.categories WHERE id = $1 AND restaurant_id = $2', [intId(req.params.id), req.restaurant.id]);
  res.json({ ok: true });
});

async function saveProduct(req, productId) {
  const b = req.body;
  const rid = req.restaurant.id;
  const name = str(b.name, 100);
  if (!name) throw new HttpError(400, 'Informe o nome do produto.');
  const price = cents(b.price_cents);
  if (price <= 0) throw new HttpError(400, 'Informe um preço válido.');
  let categoryId = Number(b.category_id) || null;
  if (categoryId && !Number.isInteger(categoryId)) categoryId = null;
  if (categoryId && !await db.one('SELECT 1 FROM cardapio.categories WHERE id = $1 AND restaurant_id = $2', [categoryId, rid])) {
    categoryId = null;
  }
  const addons = Array.isArray(b.addons) ? b.addons.slice(0, 30)
    .map((a) => ({ name: str(a?.name, 60), price_cents: cents(a?.price_cents) }))
    .filter((a) => a.name) : [];

  return db.tx(async (q) => {
    let id = productId;
    if (id) {
      const updated = await q.one(
        `UPDATE cardapio.products SET category_id=$1, name=$2, description=$3, price_cents=$4, image_url=$5, available=$6
         WHERE id=$7 AND restaurant_id=$8 RETURNING id`,
        [categoryId, name, str(b.description, 500), price, str(b.image_url, 500), bool(b.available), id, rid]
      );
      if (!updated) throw new HttpError(404, 'Produto não encontrado.');
      await q.query('DELETE FROM cardapio.product_addons WHERE product_id = $1', [id]);
    } else {
      id = (await q.one(
        `INSERT INTO cardapio.products (restaurant_id, category_id, name, description, price_cents, image_url, available, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT COALESCE(MAX(position), 0) + 1 FROM cardapio.products WHERE restaurant_id = $1))
         RETURNING id`,
        [rid, categoryId, name, str(b.description, 500), price, str(b.image_url, 500), bool(b.available ?? true)]
      )).id;
    }
    for (const a of addons) {
      await q.query('INSERT INTO cardapio.product_addons (product_id, name, price_cents) VALUES ($1, $2, $3)', [id, a.name, a.price_cents]);
    }
    return id;
  });
}

admin.post('/products', async (req, res) => {
  res.status(201).json({ id: await saveProduct(req, null) });
});

admin.put('/products/:id', async (req, res) => {
  res.json({ id: await saveProduct(req, intId(req.params.id)) });
});

admin.patch('/products/:id/availability', async (req, res) => {
  await db.query('UPDATE cardapio.products SET available = $1 WHERE id = $2 AND restaurant_id = $3',
    [bool(req.body.available), intId(req.params.id), req.restaurant.id]);
  res.json({ ok: true });
});

admin.delete('/products/:id', async (req, res) => {
  await db.query('DELETE FROM cardapio.products WHERE id = $1 AND restaurant_id = $2', [intId(req.params.id), req.restaurant.id]);
  res.json({ ok: true });
});

admin.get('/orders', async (req, res) => {
  const where = req.query.scope === 'history'
    ? `restaurant_id = $1 AND created_at >= now() - interval '60 days'`
    : `restaurant_id = $1 AND status NOT IN ('completed', 'canceled') AND created_at >= now() - interval '2 days'
       AND NOT (status = 'awaiting_payment' AND created_at < now() - interval '2 hours')`;
  res.json(await loadOrders(`${where} ORDER BY created_at DESC LIMIT 300`, [req.restaurant.id]));
});

admin.patch('/orders/:id', async (req, res) => {
  const status = req.body.status;
  if (!ORDER_STATUSES.includes(status) || status === 'awaiting_payment') throw new HttpError(400, 'Status inválido.');
  const updated = await db.one(
    `UPDATE cardapio.orders SET status = $1, updated_at = now(),
     payment_status = CASE WHEN $2::boolean THEN 'approved' ELSE payment_status END
     WHERE id = $3 AND restaurant_id = $4 RETURNING id`,
    [status, req.body.mark_paid === true, String(req.params.id), req.restaurant.id]
  );
  if (!updated) throw new HttpError(404, 'Pedido não encontrado.');
  res.json(await loadOrder(updated.id));
});

admin.get('/stats', async (req, res) => {
  const rid = req.restaurant.id;
  const valid = `restaurant_id = $1 AND status NOT IN ('canceled', 'awaiting_payment')`;
  const totals = `COUNT(*)::int AS orders, COALESCE(SUM(total_cents), 0)::int AS revenue_cents`;
  const localDay = `(created_at AT TIME ZONE '${TZ.replace(/'/g, '')}')::date`;
  const nowDay = `(now() AT TIME ZONE '${TZ.replace(/'/g, '')}')::date`;
  const [today, week, month, top, daily] = await Promise.all([
    db.one(`SELECT ${totals} FROM cardapio.orders WHERE ${valid} AND ${localDay} = ${nowDay}`, [rid]),
    db.one(`SELECT ${totals} FROM cardapio.orders WHERE ${valid} AND created_at >= now() - interval '7 days'`, [rid]),
    db.one(`SELECT ${totals} FROM cardapio.orders WHERE ${valid} AND created_at >= now() - interval '30 days'`, [rid]),
    db.query(
      `SELECT i.name, SUM(i.quantity)::int AS qty FROM cardapio.order_items i
       JOIN cardapio.orders o ON o.id = i.order_id
       WHERE o.restaurant_id = $1 AND o.status NOT IN ('canceled', 'awaiting_payment')
       AND o.created_at >= now() - interval '30 days' GROUP BY i.name ORDER BY qty DESC LIMIT 5`,
      [rid]
    ),
    db.query(
      `SELECT to_char(${localDay}, 'YYYY-MM-DD') AS day, ${totals}
       FROM cardapio.orders WHERE ${valid} AND created_at >= now() - interval '14 days' GROUP BY day ORDER BY day`,
      [rid]
    ),
  ]);
  res.json({ today, week, month, top: [...top], daily: [...daily] });
});

// ---------- assinatura do SaaS (Stripe) ----------

admin.get('/billing', async (req, res) => {
  // Sem assinatura ativa, o dono provavelmente está esperando o pagamento
  // aparecer: consulta o Stripe sempre. Com assinatura, no máximo a cada 10s.
  const maxAge = billing.hasLiveSubscription(req.restaurant) ? 10e3 : 0;
  if (await billing.maybeSync(req.restaurant, maxAge)) {
    req.restaurant = await db.one('SELECT * FROM cardapio.restaurants WHERE id = $1', [req.restaurant.id]);
  }
  const r = req.restaurant;
  let price = null;
  try {
    price = await billing.getPrice();
  } catch (err) {
    console.error('Stripe (preço):', err.message);
  }
  res.json({
    enabled: Boolean(price),
    price,
    plan: r.plan,
    trial_ends_at: r.trial_ends_at,
    subscription_status: r.subscription_status,
    current_period_end: r.current_period_end,
    has_subscription: billing.hasLiveSubscription(r),
    can_manage: Boolean(r.stripe_customer_id),
    active: subscriptionActive(r),
  });
});

admin.post('/billing/checkout', async (req, res) => {
  if (!billing.enabled()) throw new HttpError(503, 'Assinaturas ainda não estão configuradas.');
  if (req.restaurant.plan === 'suspended') throw new HttpError(403, 'Conta suspensa. Fale com o suporte.');
  try {
    res.json({ url: await billing.createCheckout({ restaurant: req.restaurant, baseUrl: baseUrl(req) }) });
  } catch (err) {
    if (err.status) throw new HttpError(err.status, err.message);
    console.error('Stripe (checkout):', err.message);
    throw new HttpError(502, 'Não foi possível abrir o pagamento. Tente novamente.');
  }
});

admin.post('/billing/portal', async (req, res) => {
  if (!billing.enabled()) throw new HttpError(503, 'Assinaturas ainda não estão configuradas.');
  try {
    res.json({ url: await billing.createPortal({ restaurant: req.restaurant, baseUrl: baseUrl(req) }) });
  } catch (err) {
    if (err.status) throw new HttpError(err.status, err.message);
    console.error('Stripe (portal):', err.message);
    throw new HttpError(502, 'Não foi possível abrir o portal. Tente novamente.');
  }
});

app.use('/api/admin', admin);

// ---------- superadmin (dono do SaaS) ----------

const superadmin = express.Router();
superadmin.use(auth.requireAuth, async (req, res, next) => {
  if (!await isSuperadmin(req.user.email)) return res.status(403).json({ error: 'Acesso negado' });
  next();
});

superadmin.get('/restaurants', async (req, res) => {
  res.json([...await db.query(
    `SELECT r.id, r.name, r.slug, r.plan, r.trial_ends_at, r.created_at, u.email AS owner_email,
     r.subscription_status, r.current_period_end,
     (SELECT COUNT(*)::int FROM cardapio.orders o WHERE o.restaurant_id = r.id) AS total_orders
     FROM cardapio.restaurants r JOIN cardapio.users u ON u.id = r.owner_id ORDER BY r.created_at DESC`
  )]);
});

superadmin.patch('/restaurants/:id', async (req, res) => {
  const plan = ['trial', 'paid', 'suspended'].includes(req.body.plan) ? req.body.plan : null;
  if (!plan) throw new HttpError(400, 'Plano inválido.');
  const extraDays = Number.isInteger(req.body.extend_trial_days) ? Math.max(0, Math.min(365, req.body.extend_trial_days)) : 0;
  await db.query(
    `UPDATE cardapio.restaurants SET plan = $1,
     trial_ends_at = CASE WHEN $2::int > 0 THEN GREATEST(trial_ends_at, now()) + make_interval(days => $2::int) ELSE trial_ends_at END
     WHERE id = $3`,
    [plan, extraDays, intId(req.params.id)]
  );
  res.json({ ok: true });
});

app.use('/api/superadmin', superadmin);

// ---------- cardápio público ----------

async function publicRestaurant(slug) {
  const r = await db.one('SELECT * FROM cardapio.restaurants WHERE slug = $1', [String(slug)]);
  if (!r) throw new HttpError(404, 'Cardápio não encontrado.');
  return r;
}

app.get('/api/public/r/:slug', async (req, res) => {
  const r = await publicRestaurant(req.params.slug);
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
    ...await loadMenu(r.id, { onlyAvailable: true }),
  });
});

app.post('/api/public/r/:slug/orders', rateLimit('order', 30, 15 * 60e3), async (req, res) => {
  const r = await publicRestaurant(req.params.slug);
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
  const productIds = [...new Set(b.items.map((raw) => Number(raw?.product_id)).filter(Number.isInteger))];
  const products = await db.query(
    'SELECT * FROM cardapio.products WHERE restaurant_id = $1 AND available = 1 AND id = ANY($2::int[])',
    [r.id, productIds]
  );
  const addonRows = products.length ? await db.query(
    'SELECT * FROM cardapio.product_addons WHERE product_id = ANY($1::int[])',
    [products.map((p) => p.id)]
  ) : [];
  const items = b.items.map((raw) => {
    const p = products.find((x) => x.id === Number(raw?.product_id));
    if (!p) throw new HttpError(409, 'Um dos produtos do carrinho não está mais disponível.');
    const qty = Number(raw.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) throw new HttpError(400, 'Quantidade inválida.');
    const addonIds = [...new Set(Array.isArray(raw.addon_ids) ? raw.addon_ids.map(Number) : [])];
    const addons = addonIds.map((aid) => {
      const a = addonRows.find((x) => x.id === aid && x.product_id === p.id);
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
  const order = await db.tx(async (q) => {
    const { order_seq: number } = await q.one(
      'UPDATE cardapio.restaurants SET order_seq = order_seq + 1 WHERE id = $1 RETURNING order_seq', [r.id]
    );
    const created = await q.one(
      `INSERT INTO cardapio.orders (id, restaurant_id, number, customer_name, customer_phone, customer_email, fulfillment,
       address, table_number, notes, subtotal_cents, delivery_fee_cents, total_cents, change_for_cents,
       payment_method, payment_provider, payment_status, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'pending', $17) RETURNING *`,
      [
        orderId, r.id, number, customerName, customerPhone, customerEmail, fulfillment,
        fulfillment === 'delivery' ? address : '', fulfillment === 'table' ? tableNumber : '',
        str(b.notes, 300), subtotal, deliveryFee, total, changeFor, method,
        online ? payments.providerFor(r) : 'none', online ? 'awaiting_payment' : 'received',
      ]
    );
    for (const it of items) {
      await q.query(
        `INSERT INTO cardapio.order_items (order_id, product_id, name, unit_price_cents, quantity, addons_json, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, it.product_id, it.name, it.unit_price_cents, it.quantity, JSON.stringify(it.addons), it.notes]
      );
    }
    return created;
  });

  if (!online) return res.status(201).json({ order_id: orderId });

  try {
    if (method === 'pix') {
      const pix = await payments.createPix({ restaurant: r, order, baseUrl: baseUrl(req) });
      await db.query('UPDATE cardapio.orders SET payment_ref = $1, pix_code = $2, pix_qr_base64 = $3 WHERE id = $4',
        [pix.ref, pix.pixCode, pix.pixQrBase64, orderId]);
      return res.status(201).json({ order_id: orderId });
    }
    const checkout = await payments.createCardCheckout({ restaurant: r, order, items, baseUrl: baseUrl(req) });
    await db.query('UPDATE cardapio.orders SET payment_ref = $1, checkout_url = $2 WHERE id = $3',
      [checkout.ref, checkout.checkoutUrl, orderId]);
    return res.status(201).json({ order_id: orderId, redirect_url: checkout.checkoutUrl });
  } catch (err) {
    console.error('Falha ao criar pagamento:', err.message, err.details || '');
    await db.query(`UPDATE cardapio.orders SET status = 'canceled', payment_status = 'rejected' WHERE id = $1`, [orderId]);
    throw new HttpError(502, 'Não foi possível iniciar o pagamento. Tente outra forma de pagamento.');
  }
});

async function publicOrder(order) {
  const r = await db.one('SELECT slug, name, whatsapp, primary_color, logo_url FROM cardapio.restaurants WHERE id = $1', [order.restaurant_id]);
  const { restaurant_id, payment_ref, ...rest } = order;
  return { ...rest, restaurant: r };
}

app.get('/api/public/orders/:id', async (req, res) => {
  const order = await loadOrder(req.params.id);
  if (!order) throw new HttpError(404, 'Pedido não encontrado.');
  res.json(await publicOrder(order));
});

// Consulta o status do pagamento diretamente no provedor (útil quando o
// webhook ainda não chegou, ou em ambientes sem URL pública).
app.post('/api/public/orders/:id/refresh-payment', rateLimit('refresh', 400, 15 * 60e3), async (req, res) => {
  const order = await loadOrder(req.params.id);
  if (!order) throw new HttpError(404, 'Pedido não encontrado.');
  if (order.payment_status !== 'approved' && order.payment_provider === 'mercadopago') {
    const r = await db.one('SELECT * FROM cardapio.restaurants WHERE id = $1', [order.restaurant_id]);
    try {
      const result = await payments.fetchPaymentStatus({ restaurant: r, order });
      if (result) await applyPaymentResult(order.id, result.status, result.paymentId);
    } catch (err) {
      console.error('Falha ao consultar pagamento:', err.message);
    }
  }
  res.json(await publicOrder(await loadOrder(req.params.id)));
});

app.post('/api/public/orders/:id/demo-pay', async (req, res) => {
  const order = await loadOrder(req.params.id);
  if (!order || order.payment_provider !== 'demo' || !payments.demoPaymentsAllowed()) {
    throw new HttpError(404, 'Pedido não encontrado.');
  }
  await applyPaymentResult(order.id, 'approved', `demo-${order.id}`);
  res.json(await publicOrder(await loadOrder(order.id)));
});

// ---------- ponte com a função do Stripe (Netlify) ----------

// A função do Stripe confirma aqui o código de uso único que recebeu.
app.post('/api/internal/stripe-token', rateLimit('stripe-token', 300, 15 * 60e3), async (req, res) => {
  const info = await billing.redeemToken(req.body?.token);
  if (!info) throw new HttpError(404, 'Código inválido ou expirado.');
  res.json(info);
});

// O webhook do Stripe (na Netlify) avisa que algo mudou; buscamos o estado
// atual no Stripe nós mesmos, sem confiar no aviso.
app.post('/api/internal/stripe-sync', rateLimit('stripe-sync', 120, 15 * 60e3), async (req, res) => {
  const id = Number(req.body?.restaurant_id);
  const r = Number.isInteger(id) && id > 0 && await db.one('SELECT * FROM cardapio.restaurants WHERE id = $1', [id]);
  if (r) await billing.maybeSync(r, 0);
  res.json({ ok: true });
});

// ---------- webhooks ----------

app.post('/api/webhooks/mercadopago/:restaurantId', async (req, res) => {
  const type = req.body?.type || req.query.type || req.query.topic;
  const dataId = req.body?.data?.id || req.query['data.id'] || req.query.id;
  if (type !== 'payment' || !dataId) return res.sendStatus(200);
  if (!payments.verifyWebhookSignature(req, req.query['data.id'] || dataId)) return res.sendStatus(401);

  const r = await db.one('SELECT * FROM cardapio.restaurants WHERE id = $1', [intId(req.params.restaurantId)]);
  if (!r || !r.mp_access_token) return res.sendStatus(200);

  // Nunca confiamos no corpo do webhook: buscamos o pagamento na API com o token do restaurante.
  const p = await payments.fetchPaymentById({ restaurant: r, paymentId: dataId });
  const order = p.orderId && await db.one('SELECT * FROM cardapio.orders WHERE id = $1 AND restaurant_id = $2', [String(p.orderId), r.id]);
  if (order) {
    const status = p.status === 'approved' && p.amountCents < order.total_cents ? 'rejected' : p.status;
    await applyPaymentResult(order.id, status, p.paymentId);
  }
  res.sendStatus(200);
});

// ---------- páginas (em produção na Netlify, servidas como arquivos estáticos) ----------

if (PUBLIC_DIR) {
  app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));
  app.get('/m/:slug', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'menu.html')));
  app.get('/pedido/:id', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'order.html')));
  app.get('/admin', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin.html')));
}

app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

app.use((err, req, res, next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

export default app;

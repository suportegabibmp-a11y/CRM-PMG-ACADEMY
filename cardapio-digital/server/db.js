// Camada de banco: Postgres do Supabase em produção, ou PGlite (Postgres
// embutido) localmente e nos testes. As tabelas ficam no schema "cardapio"
// para não colidir com outras tabelas do mesmo projeto Supabase.
// Na Edge Function do Supabase, a conexão vem pronta em SUPABASE_DB_URL.
import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const SCHEMA_SQL = `
CREATE SCHEMA IF NOT EXISTS cardapio;

CREATE TABLE IF NOT EXISTS cardapio.users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cardapio.sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES cardapio.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS cardapio.restaurants (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL UNIQUE REFERENCES cardapio.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL DEFAULT '',
  primary_color TEXT NOT NULL DEFAULT '#e4572e',
  whatsapp TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  opening_hours TEXT NOT NULL DEFAULT '',
  is_open INTEGER NOT NULL DEFAULT 1,
  delivery_enabled INTEGER NOT NULL DEFAULT 1,
  pickup_enabled INTEGER NOT NULL DEFAULT 1,
  table_enabled INTEGER NOT NULL DEFAULT 1,
  delivery_fee_cents INTEGER NOT NULL DEFAULT 0,
  min_order_cents INTEGER NOT NULL DEFAULT 0,
  accept_pix INTEGER NOT NULL DEFAULT 1,
  accept_card_online INTEGER NOT NULL DEFAULT 1,
  accept_on_delivery INTEGER NOT NULL DEFAULT 1,
  mp_access_token TEXT NOT NULL DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '14 days',
  order_seq INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cardapio.categories (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES cardapio.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cardapio.products (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES cardapio.restaurants(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES cardapio.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  available INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cardapio.product_addons (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES cardapio.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cardapio.orders (
  id TEXT PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES cardapio.restaurants(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL DEFAULT '',
  fulfillment TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  table_number TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  subtotal_cents INTEGER NOT NULL,
  delivery_fee_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  change_for_cents INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  payment_provider TEXT NOT NULL DEFAULT 'none',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_ref TEXT NOT NULL DEFAULT '',
  checkout_url TEXT NOT NULL DEFAULT '',
  pix_code TEXT NOT NULL DEFAULT '',
  pix_qr_base64 TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON cardapio.orders(restaurant_id, created_at);

CREATE TABLE IF NOT EXISTS cardapio.order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES cardapio.orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  name TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  addons_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT ''
);

-- Assinatura do SaaS (Stripe)
ALTER TABLE cardapio.restaurants ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT NOT NULL DEFAULT '';
ALTER TABLE cardapio.restaurants ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT NOT NULL DEFAULT '';
ALTER TABLE cardapio.restaurants ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT '';
ALTER TABLE cardapio.restaurants ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Fotos enviadas pelo painel (produtos, logo e capa)
CREATE TABLE IF NOT EXISTS cardapio.images (
  id TEXT PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES cardapio.restaurants(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE cardapio.images ENABLE ROW LEVEL SECURITY;

-- Códigos de uso único para a função do Stripe (na Netlify) confirmar pedidos do servidor
CREATE TABLE IF NOT EXISTS cardapio.stripe_tokens (
  token TEXT PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES cardapio.restaurants(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE cardapio.stripe_tokens ENABLE ROW LEVEL SECURITY;

-- Configurações da plataforma (ex.: e-mails de superadmin), editáveis pelo banco
CREATE TABLE IF NOT EXISTS cardapio.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
ALTER TABLE cardapio.settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE cardapio.restaurants ADD COLUMN IF NOT EXISTS stripe_synced_at TIMESTAMPTZ;

-- Defesa extra: mesmo que alguém exponha o schema na API do Supabase,
-- nenhuma linha fica visível sem políticas. O backend conecta como dono das tabelas.
ALTER TABLE cardapio.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardapio.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardapio.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardapio.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardapio.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardapio.product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardapio.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardapio.order_items ENABLE ROW LEVEL SECURITY;
`;

export class ConfigError extends Error {}

// Lê a DATABASE_URL de forma tolerante: aceita senha com caracteres especiais
// (@ # / ? %), colchetes esquecidos do "[YOUR-PASSWORD]", espaços e aspas.
export function parseDatabaseUrl(raw) {
  let text = String(raw).trim().replace(/^DATABASE_URL\s*=\s*/i, '').trim();
  text = text.replace(/^["'`]+|["'`]+$/g, '').trim();
  const scheme = /^(postgres(?:ql)?):\/\//i.exec(text);
  if (!scheme) {
    throw new ConfigError('a DATABASE_URL deve começar com postgresql:// (copie a "Connection string" do Transaction pooler, não a URL https do projeto)');
  }
  const rest = text.slice(scheme[0].length);
  const at = rest.lastIndexOf('@');
  if (at < 0) throw new ConfigError('a DATABASE_URL não tem usuário e senha (formato: postgresql://usuario:senha@host:6543/postgres)');
  const userinfo = rest.slice(0, at);
  const colon = userinfo.indexOf(':');
  if (colon < 0) throw new ConfigError('a DATABASE_URL está sem a senha depois do usuário');
  const username = userinfo.slice(0, colon);
  let password = userinfo.slice(colon + 1);
  if (/^\[.*\]$/.test(password)) password = password.slice(1, -1);
  // A senha pode vir numa variável separada; assim a URL fica como o Supabase mostra.
  const separate = (process.env.DATABASE_PASSWORD || '').trim();
  if (separate) {
    password = separate;
  } else if (/YOUR-PASSWORD/i.test(password)) {
    throw new ConfigError('a DATABASE_URL ainda tem [YOUR-PASSWORD]. Crie a variável DATABASE_PASSWORD com a senha do banco (ou troque [YOUR-PASSWORD] pela senha) e faça um novo deploy');
  }
  if (!password) throw new ConfigError('a senha do banco está vazia');
  if (!separate && /%[0-9a-f]{2}/i.test(password)) {
    try { password = decodeURIComponent(password); } catch { /* usa como está */ }
  }
  let hostUrl;
  try {
    hostUrl = new URL(`postgres://${rest.slice(at + 1)}`);
  } catch {
    throw new ConfigError(`o endereço do servidor na DATABASE_URL está inválido ("${rest.slice(at + 1).slice(0, 80)}")`);
  }
  if (!hostUrl.hostname) throw new ConfigError('a DATABASE_URL está sem o endereço do servidor');
  return {
    host: hostUrl.hostname,
    port: Number(hostUrl.port) || 5432,
    database: decodeURIComponent(hostUrl.pathname.replace(/^\//, '')) || 'postgres',
    username: decodeURIComponent(username),
    password,
  };
}

// Versão da DATABASE_URL sem a senha, para mostrar no diagnóstico.
export function describeDatabaseUrl(raw) {
  try {
    const c = parseDatabaseUrl(raw);
    return `postgresql://${c.username}:****@${c.host}:${c.port}/${c.database}`;
  } catch {
    return null;
  }
}

async function connectPostgres(url) {
  const config = parseDatabaseUrl(url);
  const local = /^(localhost|127\.0\.0\.1)$/.test(config.host);
  const sql = postgres({
    ...config,
    prepare: false, // exigido pelo pooler em modo transação do Supabase (porta 6543)
    max: Number(process.env.DB_POOL_MAX) || 3,
    idle_timeout: 20,
    connect_timeout: 15,
    ssl: local ? false : 'require',
    onnotice: () => {},
  });
  // O lock evita corrida quando várias funções iniciam ao mesmo tempo.
  await sql.unsafe(`BEGIN; SELECT pg_advisory_xact_lock(727274); ${SCHEMA_SQL} COMMIT;`);
  return {
    query: (text, params = []) => sql.unsafe(text, params),
    tx: (fn) => sql.begin((s) => fn({ query: (text, params = []) => s.unsafe(text, params) })),
  };
}

async function connectPglite() {
  const target = process.env.DB_PATH || fileURLToPath(new URL('../data/pglite', import.meta.url));
  const dir = target === ':memory:' ? undefined : target;
  if (dir) fs.mkdirSync(path.dirname(dir), { recursive: true });
  // Nome em variável para os empacotadores de função não incluírem o PGlite.
  const moduleName = '@electric-sql/pglite';
  const { PGlite } = await import(moduleName);
  const pg = new PGlite(dir);
  await pg.exec(SCHEMA_SQL);
  const wrapQuery = (runner) => async (text, params = []) => (await runner.query(text, params)).rows;
  return {
    query: wrapQuery(pg),
    tx: (fn) => pg.transaction((t) => fn({ query: wrapQuery(t) })),
  };
}

// DATABASE_URL (configurada à mão) ou SUPABASE_DB_URL (injetada pelo Supabase).
export function databaseUrl() {
  return process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';
}

let ready;
function connection() {
  if (!ready) {
    const url = databaseUrl();
    ready = (url ? connectPostgres(url) : connectPglite())
      .catch((err) => { ready = null; throw err; });
  }
  return ready;
}

function helpers(runner) {
  return {
    query: runner.query,
    one: async (text, params) => (await runner.query(text, params))[0],
  };
}

export const db = {
  query: async (text, params) => (await connection()).query(text, params),
  one: async (text, params) => (await db.query(text, params))[0],
  tx: async (fn) => (await connection()).tx((runner) => fn(helpers(runner))),
};

export { SCHEMA_SQL };

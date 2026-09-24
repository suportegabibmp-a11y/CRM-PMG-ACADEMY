// Assinatura do SaaS via Stripe (plano único).
//
// As chaves do Stripe ficam só na função da Netlify (netlify/functions/stripe.js).
// Este servidor pede as operações a ela entregando um código de uso único; a
// função confirma o código chamando de volta este servidor (/api/internal/
// stripe-token) antes de agir. Assim ninguém consegue se passar pelo servidor,
// e o servidor confia nas respostas porque é ele quem chama o endereço fixo.
import crypto from 'node:crypto';
import { db } from './db.js';
import { STRIPE_SERVICE_URL, PAYMENT_LINK } from './config.js';
import { sha256 } from './security.js';

export const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];

export function enabled() {
  return Boolean(STRIPE_SERVICE_URL);
}

export function hasLiveSubscription(r) {
  return Boolean(r.stripe_subscription_id) && ACTIVE_STATUSES.includes(r.subscription_status);
}

async function issueToken(restaurantId, purpose) {
  const token = crypto.randomBytes(32).toString('hex');
  await db.query(
    `INSERT INTO cardapio.stripe_tokens (token, restaurant_id, purpose, expires_at)
     VALUES ($1, $2, $3, now() + interval '2 minutes')`,
    [sha256(token), restaurantId, purpose]
  );
  return token;
}

async function callService(path, body) {
  const res = await fetch(`${STRIPE_SERVICE_URL}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.error || `Serviço do Stripe respondeu ${res.status}`), {
      status: res.status >= 400 && res.status < 500 ? res.status : undefined,
    });
  }
  return data;
}

// Chamado pela função do Stripe para confirmar um código. Cada código vale
// uma vez só e expira em 2 minutos.
export async function redeemToken(token) {
  if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) return null;
  const row = await db.one(
    `UPDATE cardapio.stripe_tokens SET used = true
     WHERE token = $1 AND NOT used AND expires_at > now() RETURNING restaurant_id, purpose`,
    [sha256(token)]
  );
  if (!row) return null;
  const r = await db.one(
    `SELECT r.id, r.name, r.stripe_customer_id, r.stripe_subscription_id, u.email
     FROM cardapio.restaurants r JOIN cardapio.users u ON u.id = r.owner_id WHERE r.id = $1`,
    [row.restaurant_id]
  );
  return {
    purpose: row.purpose,
    restaurant_id: r.id,
    restaurant_name: r.name,
    email: r.email,
    customer_id: r.stripe_customer_id,
    subscription_id: r.stripe_subscription_id,
  };
}

// Preço mostrado no painel, guardado em memória por 10 minutos.
let priceCache = { at: 0, price: null };
export async function getPrice() {
  if (!enabled()) return null;
  if (priceCache.price && Date.now() - priceCache.at < 10 * 60e3) return priceCache.price;
  const price = await callService(PAYMENT_LINK ? `/price?link=${encodeURIComponent(PAYMENT_LINK)}` : '/price');
  priceCache = { at: Date.now(), price };
  return price;
}

export async function createCheckout({ restaurant, email, baseUrl }) {
  if (hasLiveSubscription(restaurant)) {
    throw Object.assign(new Error('Você já tem uma assinatura ativa.'), { status: 409 });
  }
  // Link de pagamento do Stripe: o client_reference_id diz de qual restaurante
  // é o pagamento; o webhook usa isso para ativar a assinatura.
  if (PAYMENT_LINK) {
    const url = new URL(PAYMENT_LINK);
    url.searchParams.set('client_reference_id', String(restaurant.id));
    if (email) url.searchParams.set('prefilled_email', email);
    return url.toString();
  }
  const token = await issueToken(restaurant.id, 'checkout');
  const data = await callService('/checkout', {
    token,
    success_url: `${baseUrl}/admin?assinatura=ok#billing`,
    cancel_url: `${baseUrl}/admin#billing`,
  });
  if (data.customer_id && data.customer_id !== restaurant.stripe_customer_id) {
    await db.query('UPDATE cardapio.restaurants SET stripe_customer_id = $1 WHERE id = $2', [data.customer_id, restaurant.id]);
  }
  return data.url;
}

export async function createPortal({ restaurant, baseUrl }) {
  if (!restaurant.stripe_customer_id) {
    throw Object.assign(new Error('Você ainda não tem assinatura.'), { status: 400 });
  }
  const token = await issueToken(restaurant.id, 'portal');
  const data = await callService('/portal', { token, return_url: `${baseUrl}/admin#billing` });
  return data.url;
}

// Busca no Stripe (pela função da Netlify) a assinatura atual e grava no banco.
// checkoutSessionId: vem do webhook quando alguém paga pelo link; a função do
// Stripe confere que a sessão é deste restaurante antes de responder.
export async function syncSubscription(restaurant, { checkoutSessionId } = {}) {
  if (!enabled()) return;
  const token = await issueToken(restaurant.id, 'status');
  const { subscription: sub } = await callService('/status', { token, checkout_session_id: checkoutSessionId });
  if (!sub) {
    await db.query('UPDATE cardapio.restaurants SET stripe_synced_at = now() WHERE id = $1', [restaurant.id]);
    return;
  }
  const live = ACTIVE_STATUSES.includes(sub.status);
  // Uma assinatura antiga encerrada não sobrescreve outra ativa.
  await db.query(
    `UPDATE cardapio.restaurants SET
       stripe_subscription_id = $2,
       subscription_status = $3,
       current_period_end = $4,
       plan = CASE WHEN $5::boolean AND plan <> 'suspended' THEN 'paid' ELSE plan END,
       stripe_customer_id = COALESCE(NULLIF($6, ''), stripe_customer_id),
       stripe_synced_at = now()
     WHERE id = $1 AND (stripe_subscription_id = '' OR stripe_subscription_id = $2 OR $5::boolean
       OR subscription_status NOT IN ('active', 'trialing', 'past_due'))`,
    [restaurant.id, sub.id, sub.status, sub.current_period_end ? new Date(sub.current_period_end * 1000) : null, live, sub.customer_id || '']
  );
}

// Sincroniza se a última sincronização for mais antiga que maxAgeMs. Erros só
// vão para o log: o painel continua funcionando com o último estado salvo.
export async function maybeSync(restaurant, maxAgeMs) {
  if (!enabled()) return false;
  const last = restaurant.stripe_synced_at ? new Date(restaurant.stripe_synced_at).getTime() : 0;
  if (Date.now() - last < maxAgeMs) return false;
  try {
    await syncSubscription(restaurant);
    return true;
  } catch (err) {
    console.error('Stripe (sincronização):', err.message);
    return false;
  }
}

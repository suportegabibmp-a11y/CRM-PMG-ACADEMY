// Assinatura do SaaS via Stripe: o restaurante paga a mensalidade (plano
// único) pelo Stripe Checkout e gerencia cartão e cancelamento pelo Portal
// do Cliente. Os webhooks mantêm a assinatura sincronizada.
const { db } = require('./db');

const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];

let client;
function stripe() {
  if (!client) {
    const Stripe = require('stripe');
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}

// Permite injetar um cliente falso nos testes.
function setClient(fake) { client = fake; }

// Aceita os nomes antigos das variáveis para quem já tinha configurado.
function priceId() {
  return process.env.STRIPE_PRICE_ID || process.env.STRIPE_PRICE_BASIC || process.env.STRIPE_PRICE_PRO || '';
}

function enabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY && priceId());
}

function hasLiveSubscription(r) {
  return Boolean(r.stripe_subscription_id) && ACTIVE_STATUSES.includes(r.subscription_status);
}

// Preço lido do Stripe e guardado em memória por 10 minutos.
let priceCache = { at: 0, price: null };
async function getPrice() {
  if (!enabled()) return null;
  if (priceCache.price && Date.now() - priceCache.at < 10 * 60e3) return priceCache.price;
  const price = await stripe().prices.retrieve(priceId());
  priceCache = {
    at: Date.now(),
    price: { amount_cents: price.unit_amount, currency: price.currency, interval: price.recurring?.interval || 'month' },
  };
  return priceCache.price;
}

async function createCheckout({ restaurant, user, baseUrl }) {
  if (hasLiveSubscription(restaurant)) {
    throw Object.assign(new Error('Você já tem uma assinatura ativa.'), { status: 409 });
  }

  let customerId = restaurant.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: user.email,
      name: restaurant.name,
      metadata: { restaurant_id: String(restaurant.id) },
    });
    customerId = customer.id;
    await db.query('UPDATE cardapio.restaurants SET stripe_customer_id = $1 WHERE id = $2', [customerId, restaurant.id]);
  }

  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: String(restaurant.id),
    line_items: [{ price: priceId(), quantity: 1 }],
    subscription_data: { metadata: { restaurant_id: String(restaurant.id) } },
    allow_promotion_codes: true,
    locale: 'pt-BR',
    success_url: `${baseUrl}/admin?assinatura=ok#billing`,
    cancel_url: `${baseUrl}/admin#billing`,
  });
  return session.url;
}

async function createPortal({ restaurant, baseUrl }) {
  if (!restaurant.stripe_customer_id) {
    throw Object.assign(new Error('Você ainda não tem assinatura.'), { status: 400 });
  }
  const session = await stripe().billingPortal.sessions.create({
    customer: restaurant.stripe_customer_id,
    return_url: `${baseUrl}/admin#billing`,
  });
  return session.url;
}

// Busca a assinatura no Stripe e grava o estado atual no restaurante.
// Sempre consultamos o Stripe em vez de confiar na ordem dos eventos.
async function syncSubscription(subscriptionId, restaurantIdHint) {
  const sub = await stripe().subscriptions.retrieve(subscriptionId);
  const restaurantId = Number(sub.metadata?.restaurant_id || restaurantIdHint);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) return;

  const item = sub.items?.data?.[0];
  const periodEnd = item?.current_period_end || sub.current_period_end;
  const live = ACTIVE_STATUSES.includes(sub.status);
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;

  // Um evento atrasado de uma assinatura antiga não pode sobrescrever a atual.
  await db.query(
    `UPDATE cardapio.restaurants SET
       stripe_customer_id = COALESCE(NULLIF($2, ''), stripe_customer_id),
       stripe_subscription_id = $3,
       subscription_status = $4,
       current_period_end = $5,
       plan = CASE WHEN $6::boolean AND plan <> 'suspended' THEN 'paid' ELSE plan END
     WHERE id = $1 AND (stripe_subscription_id = '' OR stripe_subscription_id = $3 OR $6::boolean)`,
    [
      restaurantId, customerId || '', sub.id, sub.status,
      periodEnd ? new Date(periodEnd * 1000) : null,
      live,
    ]
  );
}

async function handleWebhook(rawBody, signature) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw Object.assign(new Error('STRIPE_WEBHOOK_SECRET não configurado'), { status: 500 });
  let event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    throw Object.assign(new Error('Assinatura do webhook inválida'), { status: 400 });
  }

  const obj = event.data.object;
  switch (event.type) {
    case 'checkout.session.completed':
      if (obj.mode === 'subscription' && obj.subscription) {
        await syncSubscription(obj.subscription, obj.client_reference_id);
      }
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'customer.subscription.paused':
    case 'customer.subscription.resumed':
      await syncSubscription(obj.id);
      break;
    case 'invoice.paid':
    case 'invoice.payment_failed': {
      const subId = obj.parent?.subscription_details?.subscription || obj.subscription;
      if (subId) await syncSubscription(typeof subId === 'string' ? subId : subId.id);
      break;
    }
    default:
      break;
  }
}

module.exports = {
  ACTIVE_STATUSES,
  enabled,
  setClient,
  getPrice,
  createCheckout,
  createPortal,
  handleWebhook,
  hasLiveSubscription,
};

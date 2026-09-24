// Função da Netlify que guarda as chaves do Stripe (variáveis STRIPE_* da Netlify).
// O restante da API roda como Edge Function no Supabase, que tem o banco.
//
// Toda operação que envolve um restaurante chega com um código de uso único;
// antes de agir, esta função confirma o código chamando o servidor no Supabase
// (endereço fixo abaixo). Assim, ninguém de fora consegue abrir o portal ou
// consultar a assinatura de outro restaurante.
import process from 'node:process';
import { Buffer } from 'node:buffer';
import Stripe from 'stripe';

const EDGE_API_URL = (process.env.EDGE_API_URL
  || 'https://emowbrpmoofomhzcqpbz.supabase.co/functions/v1/api').replace(/\/$/, '');
const LIVE_STATUSES = ['active', 'trialing', 'past_due'];

let client;
function stripe() {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

// Permite injetar um cliente falso nos testes.
export function setClient(fake) { client = fake; }

function priceId() {
  return process.env.STRIPE_PRICE_ID || process.env.STRIPE_PRICE_BASIC || process.env.STRIPE_PRICE_PRO || '';
}

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function edge(path, body) {
  const res = await fetch(`${EDGE_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  return { ok: res.ok, data: await res.json().catch(() => ({})) };
}

async function redeem(token, purpose) {
  const { ok, data } = await edge('/internal/stripe-token', { token });
  if (!ok || data.purpose !== purpose) throw new HttpError(401, 'Código inválido ou expirado.');
  return data;
}

function json(status, body) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    body: JSON.stringify(body),
  };
}

function describePrice(price) {
  return { amount_cents: price.unit_amount, currency: price.currency, interval: price.recurring?.interval || 'month' };
}

// Preço do link de pagamento (quando informado) ou de STRIPE_PRICE_ID.
// Guardado em memória por 5 minutos: /price é público e não deve virar um
// jeito de gastar a cota da API do Stripe.
const priceCache = new Map();
async function getPrice(link) {
  const cached = priceCache.get(link);
  if (cached && Date.now() - cached.at < 5 * 60e3) return cached.price;
  const price = await fetchPrice(link);
  priceCache.set(link, { at: Date.now(), price });
  return price;
}

async function fetchPrice(link) {
  if (link) {
    const links = await stripe().paymentLinks.list({ limit: 100 });
    const found = links.data.find((l) => l.url === link);
    if (found) {
      const items = await stripe().paymentLinks.listLineItems(found.id, { limit: 1 });
      if (items.data[0]?.price) return describePrice(items.data[0].price);
    }
  }
  if (!priceId()) throw new HttpError(503, 'Preço da assinatura não configurado.');
  return describePrice(await stripe().prices.retrieve(priceId()));
}

async function checkout({ token, success_url, cancel_url }) {
  if (!priceId()) throw new HttpError(503, 'Preço da assinatura não configurado.');
  const info = await redeem(token, 'checkout');
  let customerId = info.customer_id;
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: info.email,
      name: info.restaurant_name,
      metadata: { restaurant_id: String(info.restaurant_id) },
    });
    customerId = customer.id;
  }
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: String(info.restaurant_id),
    line_items: [{ price: priceId(), quantity: 1 }],
    subscription_data: { metadata: { restaurant_id: String(info.restaurant_id) } },
    allow_promotion_codes: true,
    locale: 'pt-BR',
    success_url,
    cancel_url,
  });
  return { url: session.url, customer_id: customerId };
}

async function portal({ token, return_url }) {
  const info = await redeem(token, 'portal');
  if (!info.customer_id) throw new HttpError(400, 'Sem assinatura.');
  const session = await stripe().billingPortal.sessions.create({ customer: info.customer_id, return_url });
  return { url: session.url };
}

async function status({ token, checkout_session_id }) {
  const info = await redeem(token, 'status');
  let customerId = info.customer_id;
  // Pagamento feito pelo link: a sessão diz qual cliente do Stripe é deste
  // restaurante (client_reference_id foi colocado no link pelo servidor).
  if (checkout_session_id) {
    const session = await stripe().checkout.sessions.retrieve(checkout_session_id);
    if (session.client_reference_id !== String(info.restaurant_id) || session.status !== 'complete') {
      throw new HttpError(403, 'Sessão de pagamento não pertence a este restaurante.');
    }
    customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  }
  // Pagou pelo link sem estar logado (ou antes de criar a conta): procura
  // um cliente do Stripe com o mesmo e-mail da conta e assinatura ativa.
  let foundByEmail = false;
  if (!customerId && info.email) {
    const { data: customers } = await stripe().customers.list({ email: info.email, limit: 10 });
    for (const c of customers) {
      const { data: subs } = await stripe().subscriptions.list({ customer: c.id, status: 'all', limit: 10 });
      if (subs.some((s) => LIVE_STATUSES.includes(s.status))) {
        customerId = c.id;
        foundByEmail = true;
        break;
      }
    }
  }
  if (!customerId) return { subscription: null };
  const { data } = await stripe().subscriptions.list({ customer: customerId, status: 'all', limit: 10 });
  const mine = data.filter((s) => !s.metadata?.restaurant_id || s.metadata.restaurant_id === String(info.restaurant_id));
  const best = mine.find((s) => LIVE_STATUSES.includes(s.status)) || mine[0];
  if (!best) return { subscription: null };
  if (foundByEmail) {
    // Marca no Stripe de qual restaurante é, para os próximos eventos.
    const metadata = { restaurant_id: String(info.restaurant_id) };
    await stripe().customers.update(customerId, { metadata });
    if (!best.metadata?.restaurant_id) await stripe().subscriptions.update(best.id, { metadata });
  }
  const item = best.items?.data?.[0];
  return {
    subscription: {
      id: best.id,
      customer_id: customerId,
      status: best.status,
      current_period_end: item?.current_period_end || best.current_period_end || null,
    },
  };
}

// Descobre de qual restaurante é o evento e avisa o servidor, que então
// busca o estado real no Stripe (via /status).
async function webhook(event) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new HttpError(500, 'STRIPE_WEBHOOK_SECRET não configurado');
  const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64') : Buffer.from(event.body || '', 'utf8');
  const signature = event.headers?.['stripe-signature'] || event.headers?.['Stripe-Signature'];
  let evt;
  try {
    evt = stripe().webhooks.constructEvent(raw, signature, secret);
  } catch {
    throw new HttpError(400, 'Assinatura do webhook inválida');
  }

  const obj = evt.data.object;

  // Pagou pelo link: marca cliente e assinatura com o restaurante (para os
  // próximos eventos) e pede ao servidor para ativar, informando a sessão.
  if (evt.type === 'checkout.session.completed' && obj.mode === 'subscription' && obj.client_reference_id) {
    const restaurantId = obj.client_reference_id;
    const customerId = typeof obj.customer === 'string' ? obj.customer : obj.customer?.id;
    const subId = typeof obj.subscription === 'string' ? obj.subscription : obj.subscription?.id;
    if (customerId) await stripe().customers.update(customerId, { metadata: { restaurant_id: restaurantId } });
    if (subId) await stripe().subscriptions.update(subId, { metadata: { restaurant_id: restaurantId } });
    await edge('/internal/stripe-sync', { restaurant_id: Number(restaurantId), checkout_session_id: obj.id });
    return { received: true };
  }

  let restaurantId = obj.client_reference_id || obj.metadata?.restaurant_id;
  const customerId = typeof obj.customer === 'string' ? obj.customer : obj.customer?.id;
  let customer;
  if (!restaurantId) {
    const subId = obj.subscription || obj.parent?.subscription_details?.subscription;
    if (subId) {
      restaurantId = (await stripe().subscriptions.retrieve(typeof subId === 'string' ? subId : subId.id)).metadata?.restaurant_id;
    }
    if (!restaurantId && customerId) {
      customer = await stripe().customers.retrieve(customerId);
      restaurantId = customer.metadata?.restaurant_id;
    }
  }
  if (restaurantId) {
    await edge('/internal/stripe-sync', { restaurant_id: Number(restaurantId) });
  } else {
    // Pagou pelo link sem estar logado: o servidor procura a conta pelo e-mail
    // e confere a assinatura no Stripe antes de ativar.
    const email = obj.customer_details?.email || obj.customer_email || customer?.email;
    if (email) await edge('/internal/stripe-sync', { email });
  }
  return { received: true };
}

export async function handler(event) {
  const path = event.path || '';
  const route = path.includes('/webhooks/stripe') ? 'webhook' : path.split('/').filter(Boolean).pop();
  try {
    if (!process.env.STRIPE_SECRET_KEY) throw new HttpError(503, 'Stripe não configurado.');
    if (route === 'price' && event.httpMethod === 'GET') {
      const link = event.queryStringParameters?.link || '';
      return json(200, await getPrice(/^https:\/\/buy\.stripe\.com\//.test(link) ? link : ''));
    }
    if (event.httpMethod !== 'POST') throw new HttpError(405, 'Método não permitido.');
    if (route === 'webhook') return json(200, await webhook(event));

    let body;
    try {
      body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body || '{}');
    } catch {
      throw new HttpError(400, 'JSON inválido');
    }
    if (route === 'checkout') return json(200, await checkout(body));
    if (route === 'portal') return json(200, await portal(body));
    if (route === 'status') return json(200, await status(body));
    throw new HttpError(404, 'Rota não encontrada');
  } catch (err) {
    if (err instanceof HttpError) return json(err.status, { error: err.message });
    console.error('Stripe:', err.message);
    return json(502, { error: 'Falha ao falar com o Stripe.' });
  }
}

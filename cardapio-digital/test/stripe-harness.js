// Monta o caminho completo da assinatura para os testes: servidor (como no
// Supabase) ⇄ função do Stripe (como na Netlify) ⇄ Stripe falso em memória.
// A validação de assinatura dos webhooks usa o SDK real do Stripe.
import http from 'node:http';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import Stripe from 'stripe';

export async function startHarness(env = {}) {
  // Servidor que imita a Netlify chamando a função do Stripe.
  let stripeHandler;
  const netlify = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const url = new URL(req.url, 'http://x');
    const out = await stripeHandler({
      httpMethod: req.method,
      path: url.pathname,
      queryStringParameters: Object.fromEntries(url.searchParams),
      headers: req.headers,
      body: Buffer.concat(chunks).toString('utf8'),
      isBase64Encoded: false,
    });
    res.writeHead(out.statusCode, out.headers).end(out.body);
  });
  await new Promise((r) => netlify.listen(0, r));
  const netlifyUrl = `http://127.0.0.1:${netlify.address().port}`;

  Object.assign(process.env, {
    DB_PATH: ':memory:',
    STRIPE_SERVICE_URL: `${netlifyUrl}/.netlify/functions/stripe`,
    STRIPE_SECRET_KEY: 'sk_test_fake',
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
    STRIPE_PRICE_ID: 'price_mensal',
    ...env,
  });
  const { default: app } = await import('../server/index.js');
  const { db } = await import('../server/db.js');

  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  process.env.EDGE_API_URL = `${base}/api`;
  const stripeFn = await import('../netlify/functions/stripe.js');
  stripeHandler = stripeFn.handler;

  // Stripe falso.
  const realWebhooks = new Stripe('sk_test_fake').webhooks;
  const stripeState = { subsByCustomer: {}, sessions: [], checkoutSessions: {}, metadataUpdates: [], customers: [] };
  let customerSeq = 0;
  const allSubs = () => Object.values(stripeState.subsByCustomer).flat();
  stripeFn.setClient({
    webhooks: realWebhooks,
    prices: { retrieve: async (id) => ({ id, unit_amount: 4990, currency: 'brl', recurring: { interval: 'month' } }) },
    paymentLinks: {
      list: async () => ({ data: [{ id: 'plink_1', url: 'https://buy.stripe.com/test_link' }] }),
      listLineItems: async () => ({ data: [{ price: { id: 'price_link', unit_amount: 4990, currency: 'brl', recurring: { interval: 'month' } } }] }),
    },
    customers: {
      create: async (p) => ({ id: `cus_${++customerSeq}`, metadata: p.metadata }),
      retrieve: async (id) => stripeState.customers.find((c) => c.id === id) || { id, metadata: {} },
      list: async ({ email }) => ({ data: stripeState.customers.filter((c) => c.email === email) }),
      update: async (id, p) => { stripeState.metadataUpdates.push(['customer', id, p.metadata]); return { id }; },
    },
    checkout: {
      sessions: {
        create: async (p) => { stripeState.sessions.push(p); return { url: `https://checkout.stripe.test/${stripeState.sessions.length}` }; },
        retrieve: async (id) => stripeState.checkoutSessions[id],
      },
    },
    billingPortal: { sessions: { create: async (p) => ({ url: `https://billing.stripe.test/${p.customer}` }) } },
    subscriptions: {
      list: async ({ customer }) => ({ data: stripeState.subsByCustomer[customer] || [] }),
      retrieve: async (id) => allSubs().find((s) => s.id === id),
      update: async (id, p) => { stripeState.metadataUpdates.push(['subscription', id, p.metadata]); return { id }; },
    },
  });

  function client() {
    let token = '';
  const ip = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
    return async (path, { method = 'GET', body } = {}) => {
      const res = await fetch(base + path, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-nf-client-connection-ip': ip, ...(token && { Authorization: `Bearer ${token}` }) },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => null);
      if (data?.token) token = data.token;
      return { status: res.status, body: data };
    };
  }

  async function sendWebhook(type, object, { secret = 'whsec_test' } = {}) {
    const payload = JSON.stringify({ id: `evt_${Math.random()}`, object: 'event', type, data: { object } });
    const header = realWebhooks.generateTestHeaderString({ payload, secret });
    const res = await fetch(`${netlifyUrl}/api/webhooks/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Stripe-Signature': header },
      body: payload,
    });
    return res.status;
  }

  function setSubscription(customer, restaurantId, status, id = 'sub_1') {
    const sub = {
      id, object: 'subscription', status, customer,
      metadata: restaurantId ? { restaurant_id: String(restaurantId) } : {},
      items: { data: [{ price: { id: 'price_mensal' }, current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400 }] },
    };
    stripeState.subsByCustomer[customer] = [sub, ...(stripeState.subsByCustomer[customer] || []).filter((s) => s.id !== id)];
    return sub;
  }

  function close() { server.close(); netlify.close(); }

  return { db, base, netlifyUrl, client, sendWebhook, setSubscription, stripeState, close };
}

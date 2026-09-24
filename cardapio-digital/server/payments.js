// Integração de pagamentos. Cada restaurante usa o próprio Access Token do
// Mercado Pago, então o dinheiro cai direto na conta do restaurante.
// Sem token, e com ALLOW_DEMO_PAYMENTS ativo, usamos um provedor de demonstração.
import crypto from 'node:crypto';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { ON_EDGE } from './config.js';
import { decryptSecret } from './security.js';

const MP_API = 'https://api.mercadopago.com';

// Pagamento simulado ("Simular pagamento aprovado") só existe quando ligado
// explicitamente (ALLOW_DEMO_PAYMENTS=true) ou rodando localmente. Nunca no
// servidor publicado por padrão: senão um cliente marcaria pedidos como pagos.
export function demoPaymentsAllowed() {
  if (process.env.ALLOW_DEMO_PAYMENTS) return process.env.ALLOW_DEMO_PAYMENTS === 'true';
  return !ON_EDGE && process.env.NODE_ENV !== 'production';
}

// Token do Mercado Pago do restaurante, guardado cifrado no banco.
function mpToken(restaurant) {
  return decryptSecret(restaurant.mp_access_token);
}

export function providerFor(restaurant) {
  if (mpToken(restaurant)) return 'mercadopago';
  if (demoPaymentsAllowed()) return 'demo';
  return null;
}

async function mpFetch(token, pathname, { method = 'GET', body, idempotencyKey } = {}) {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;
  const res = await fetch(MP_API + pathname, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Mercado Pago respondeu ${res.status}`);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}

function isPublicUrl(url) {
  return /^https:\/\//.test(url) && !/localhost|127\.0\.0\.1/.test(url);
}

// Traduz o status do Mercado Pago para o status interno de pagamento.
function mapMpStatus(status) {
  if (status === 'approved') return 'approved';
  if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(status)) return 'rejected';
  return 'pending';
}

export async function createPix({ restaurant, order, baseUrl }) {
  const provider = providerFor(restaurant);
  if (provider === 'demo') {
    const code = `00020126DEMO-PIX-${order.id}-${(order.total_cents / 100).toFixed(2)}5204000053039865802BR`;
    return { provider, ref: `demo-${order.id}`, pixCode: code, pixQrBase64: '' };
  }
  const notificationUrl = `${baseUrl}/api/webhooks/mercadopago/${restaurant.id}`;
  const payment = await mpFetch(mpToken(restaurant), '/v1/payments', {
    method: 'POST',
    idempotencyKey: `pix-${order.id}`,
    body: {
      transaction_amount: order.total_cents / 100,
      description: `Pedido #${order.number} - ${restaurant.name}`,
      payment_method_id: 'pix',
      external_reference: order.id,
      notification_url: isPublicUrl(notificationUrl) ? notificationUrl : undefined,
      date_of_expiration: new Date(Date.now() + 30 * 60e3).toISOString(),
      payer: { email: order.customer_email, first_name: order.customer_name },
    },
  });
  const tx = payment.point_of_interaction?.transaction_data || {};
  return {
    provider,
    ref: String(payment.id),
    pixCode: tx.qr_code || '',
    pixQrBase64: tx.qr_code_base64 || '',
  };
}

export async function createCardCheckout({ restaurant, order, items, baseUrl }) {
  const provider = providerFor(restaurant);
  const returnUrl = `${baseUrl}/pedido/${order.id}`;
  if (provider === 'demo') {
    return { provider, ref: `demo-${order.id}`, checkoutUrl: `${returnUrl}?demo_checkout=1` };
  }
  const notificationUrl = `${baseUrl}/api/webhooks/mercadopago/${restaurant.id}`;
  const mpItems = items.map((it) => ({
    id: String(it.product_id),
    title: it.name,
    quantity: it.quantity,
    unit_price: it.unit_price_cents / 100,
    currency_id: 'BRL',
  }));
  if (order.delivery_fee_cents > 0) {
    mpItems.push({ id: 'entrega', title: 'Taxa de entrega', quantity: 1, unit_price: order.delivery_fee_cents / 100, currency_id: 'BRL' });
  }
  const pref = await mpFetch(mpToken(restaurant), '/checkout/preferences', {
    method: 'POST',
    idempotencyKey: `card-${order.id}`,
    body: {
      items: mpItems,
      external_reference: order.id,
      payer: { name: order.customer_name, email: order.customer_email || undefined },
      payment_methods: { excluded_payment_types: [{ id: 'ticket' }], installments: 12 },
      back_urls: { success: returnUrl, pending: returnUrl, failure: returnUrl },
      auto_return: isPublicUrl(returnUrl) ? 'approved' : undefined,
      notification_url: isPublicUrl(notificationUrl) ? notificationUrl : undefined,
      statement_descriptor: restaurant.name.slice(0, 22),
    },
  });
  return { provider, ref: pref.id, checkoutUrl: pref.init_point };
}

// Consulta o Mercado Pago e devolve { status, paymentId } do pagamento mais
// relevante do pedido (aprovado tem prioridade), ou null se não houver nenhum.
export async function fetchPaymentStatus({ restaurant, order }) {
  if (order.payment_provider !== 'mercadopago' || !mpToken(restaurant)) return null;
  const search = await mpFetch(
    mpToken(restaurant),
    `/v1/payments/search?external_reference=${encodeURIComponent(order.id)}&sort=date_created&criteria=desc`
  );
  const results = search.results || [];
  if (!results.length) return null;
  const best = results.find((p) => p.status === 'approved') || results[0];
  if (Math.round(best.transaction_amount * 100) < order.total_cents && best.status === 'approved') {
    return { status: 'rejected', paymentId: String(best.id) };
  }
  return { status: mapMpStatus(best.status), paymentId: String(best.id) };
}

export async function fetchPaymentById({ restaurant, paymentId }) {
  const p = await mpFetch(mpToken(restaurant), `/v1/payments/${encodeURIComponent(paymentId)}`);
  return {
    orderId: p.external_reference,
    status: mapMpStatus(p.status),
    amountCents: Math.round(p.transaction_amount * 100),
    paymentId: String(p.id),
  };
}

// Valida a assinatura x-signature enviada pelo Mercado Pago nos webhooks.
// Só é verificada quando MP_WEBHOOK_SECRET está configurado.
export function verifyWebhookSignature(req, dataId) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;
  const sig = req.headers['x-signature'] || '';
  const requestId = req.headers['x-request-id'] || '';
  const parts = Object.fromEntries(sig.split(',').map((p) => p.trim().split('=')));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return expected.length === parts.v1.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}


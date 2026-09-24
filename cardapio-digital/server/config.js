// Endereços públicos da instalação (nada aqui é segredo).
import process from 'node:process';

// Rodando como Edge Function do Supabase (Deno)?
export const ON_EDGE = Boolean(globalThis.Deno);

// Endereço do site na Netlify. Usado nos links de retorno de pagamento.
export const SITE_URL = (process.env.PUBLIC_URL || 'https://cardapiodigitalpmg.netlify.app').replace(/\/$/, '');

// Função da Netlify que guarda as chaves do Stripe. Localmente fica desligada,
// a menos que STRIPE_SERVICE_URL seja definida.
export const STRIPE_SERVICE_URL = (process.env.STRIPE_SERVICE_URL
  ?? (ON_EDGE ? `${SITE_URL}/.netlify/functions/stripe` : '')).replace(/\/$/, '');

// Link de pagamento do Stripe para assinar (Payment Link). Não é segredo.
// Com ele, o botão "Assinar" abre esse link; sem ele, o sistema cria uma
// sessão de checkout pelo preço STRIPE_PRICE_ID.
export const PAYMENT_LINK = (process.env.STRIPE_PAYMENT_LINK
  ?? 'https://buy.stripe.com/test_14A4gy6X03xH4iofhlgIo00').trim();

export function siteUrl(req) {
  if (process.env.PUBLIC_URL || ON_EDGE) return SITE_URL;
  return `${req.protocol}://${req.get('host')}`;
}

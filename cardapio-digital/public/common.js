// Utilitários compartilhados pelas páginas.
async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Erro inesperado. Tente novamente.');
    err.status = res.status;
    throw err;
  }
  return data;
}

const money = (cents) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Converte "12,50" ou "12.50" em centavos.
function toCents(text) {
  const clean = String(text).replace(/[^\d,.-]/g, '');
  const normalized = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean;
  const n = Math.round(parseFloat(normalized) * 100);
  return Number.isFinite(n) ? n : 0;
}

const centsToInput = (cents) => (cents / 100).toFixed(2).replace('.', ',');

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let toastTimer;
function toast(message, type = '') {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.setAttribute('role', 'status');
  el.textContent = message;
  document.body.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 3500);
}

function formatPhone(digits) {
  const d = String(digits).replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}

function formatDateTime(isoDate) {
  return new Date(isoDate).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function openModal(html, { onClose } = {}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => { backdrop.remove(); document.removeEventListener('keydown', onKey); onClose?.(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop || e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(backdrop);
  return { el: backdrop.querySelector('.modal'), close };
}

function setBrandColor(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
  document.documentElement.style.setProperty('--brand', hex);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  document.documentElement.style.setProperty('--brand-ink', lum > 0.62 ? '#1d1b19' : '#ffffff');
}

const ORDER_STATUS_LABEL = {
  awaiting_payment: 'Aguardando pagamento',
  received: 'Recebido',
  preparing: 'Em preparo',
  ready: 'Pronto',
  out_for_delivery: 'Saiu para entrega',
  completed: 'Finalizado',
  canceled: 'Cancelado',
};

const PAYMENT_LABEL = {
  pix: 'PIX online',
  card_online: 'Cartão online',
  cash: 'Dinheiro na entrega',
  card_on_delivery: 'Cartão na entrega',
};

const FULFILLMENT_LABEL = { delivery: 'Entrega', pickup: 'Retirada', table: 'Mesa' };

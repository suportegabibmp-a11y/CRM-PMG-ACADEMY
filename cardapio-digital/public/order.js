const orderId = decodeURIComponent(location.pathname.split('/')[2] || '');
const params = new URLSearchParams(location.search);
let order;
let pollTimer;

async function load(refresh = false) {
  try {
    order = refresh
      ? await api(`/api/public/orders/${orderId}/refresh-payment`, { method: 'POST' })
      : await api(`/api/public/orders/${orderId}`);
  } catch (err) {
    document.getElementById('app').innerHTML = `<div class="empty"><h2>Pedido não encontrado</h2><p>${esc(err.message)}</p></div>`;
    return;
  }
  setBrandColor(order.restaurant.primary_color);
  document.title = `Pedido #${order.number} · ${order.restaurant.name}`;
  render();
  schedulePoll();
}

function schedulePoll() {
  clearTimeout(pollTimer);
  if (['completed', 'canceled'].includes(order.status)) return;
  const waitingPayment = order.status === 'awaiting_payment' && order.payment_status !== 'rejected';
  pollTimer = setTimeout(() => load(waitingPayment), waitingPayment ? 4000 : 10000);
}

function steps() {
  const flow = ['received', 'preparing', 'ready'];
  flow.push(order.fulfillment === 'delivery' ? 'out_for_delivery' : null, 'completed');
  const labels = {
    received: 'Pedido recebido',
    preparing: 'Em preparo',
    ready: order.fulfillment === 'pickup' ? 'Pronto para retirada' : order.fulfillment === 'table' ? 'Pronto, já vai para a mesa' : 'Pronto',
    out_for_delivery: 'Saiu para entrega',
    completed: 'Finalizado',
  };
  const list = flow.filter(Boolean);
  const idx = list.indexOf(order.status);
  return `<ul class="steps">${list.map((s, i) => `
    <li class="${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}"><span class="dot"></span>${labels[s]}</li>`).join('')}</ul>`;
}

function qrSvg(text) {
  if (typeof qrcode !== 'function') return '';
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
}

function paymentBlock() {
  if (order.status !== 'awaiting_payment') return '';
  const demo = order.payment_provider === 'demo';
  if (order.payment_status === 'rejected') {
    return `<div class="card"><h2>Pagamento não aprovado</h2>
      <p class="muted">Seu pagamento foi recusado ou expirou. Faça o pedido novamente escolhendo outra forma de pagamento.</p>
      <a class="btn primary block" href="/m/${esc(order.restaurant.slug)}">Voltar ao cardápio</a></div>`;
  }
  if (order.payment_method === 'pix') {
    const qr = order.pix_qr_base64
      ? `<img src="data:image/png;base64,${esc(order.pix_qr_base64)}" alt="QR Code PIX">`
      : qrSvg(order.pix_code);
    return `<div class="card">
      <h2>Pague com PIX</h2>
      <p class="muted">Escaneie o QR Code ou copie o código abaixo no app do seu banco. A confirmação é automática.</p>
      <div class="big-status">${money(order.total_cents)}</div>
      <div class="qr">${qr}</div>
      <div class="pix-code" id="pix-code">${esc(order.pix_code)}</div>
      <button class="btn primary block" id="copy" style="margin-top:10px">Copiar código PIX</button>
      <p class="small muted" style="text-align:center">⏳ Aguardando confirmação do pagamento…</p>
      ${demo ? '<button class="btn block" id="demo-pay">Simular pagamento aprovado (demonstração)</button>' : ''}
    </div>`;
  }
  if (demo) {
    return `<div class="card">
      <h2>Checkout de cartão (demonstração)</h2>
      <p class="muted">Em produção, o cliente é levado ao checkout seguro do Mercado Pago. Aqui você pode simular a aprovação.</p>
      <button class="btn primary block" id="demo-pay">Aprovar pagamento de ${money(order.total_cents)}</button>
    </div>`;
  }
  return `<div class="card">
    <h2>Finalize o pagamento</h2>
    <p class="muted">Se você fechou a página de pagamento, pode voltar para ela abaixo.</p>
    <a class="btn primary block" href="${esc(order.checkout_url)}">Ir para o pagamento</a>
  </div>`;
}

function whatsappLink() {
  const r = order.restaurant;
  if (!r.whatsapp) return '';
  const lines = [
    `Olá! Fiz o pedido *#${order.number}* pelo cardápio digital.`,
    ...order.items.map((it) => `• ${it.quantity}x ${it.name}${it.addons.length ? ` (+ ${it.addons.map((a) => a.name).join(', ')})` : ''}`),
    `Total: ${money(order.total_cents)}`,
    `Acompanhar: ${location.origin}/pedido/${order.id}`,
  ];
  return `https://wa.me/55${r.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function render() {
  const r = order.restaurant;
  const statusBadge = order.status === 'canceled' ? 'danger' : order.status === 'completed' ? 'ok' : 'brand';
  const payBadge = order.payment_status === 'approved'
    ? '<span class="badge ok">Pago</span>'
    : order.payment_method === 'pix' || order.payment_method === 'card_online'
      ? `<span class="badge ${order.payment_status === 'rejected' ? 'danger' : 'warn'}">${order.payment_status === 'rejected' ? 'Recusado' : 'Pendente'}</span>`
      : '<span class="badge">Pagar na entrega</span>';

  document.getElementById('app').innerHTML = `
    <div class="top">
      ${r.logo_url ? `<img src="${esc(r.logo_url)}" alt="">` : `<div class="ph">${esc(r.name.charAt(0))}</div>`}
      <div class="spacer"><div class="muted small">${esc(r.name)}</div><h1 style="margin:0">Pedido #${order.number}</h1></div>
    </div>

    ${paymentBlock()}

    <div class="card">
      <div class="muted small">Status</div>
      <div class="row"><div class="big-status spacer">${ORDER_STATUS_LABEL[order.status]}</div><span class="badge ${statusBadge}">${FULFILLMENT_LABEL[order.fulfillment]}</span></div>
      ${order.status !== 'canceled' && order.status !== 'awaiting_payment' ? `<div style="margin-top:12px">${steps()}</div>` : ''}
    </div>

    <div class="card">
      <h3>Resumo</h3>
      ${order.items.map((it) => `
        <div class="line"><span>${it.quantity}× ${esc(it.name)}${it.addons.length ? `<br><span class="small muted">+ ${esc(it.addons.map((a) => a.name).join(', '))}</span>` : ''}${it.notes ? `<br><span class="small muted">Obs.: ${esc(it.notes)}</span>` : ''}</span>
        <span>${money(it.unit_price_cents * it.quantity)}</span></div>`).join('')}
      <div class="line" style="margin-top:6px"><span class="muted">Subtotal</span><span>${money(order.subtotal_cents)}</span></div>
      ${order.fulfillment === 'delivery' ? `<div class="line"><span class="muted">Entrega</span><span>${order.delivery_fee_cents ? money(order.delivery_fee_cents) : 'Grátis'}</span></div>` : ''}
      <div class="line total"><span>Total</span><span>${money(order.total_cents)}</span></div>
      <div class="line"><span class="muted">Pagamento</span><span>${PAYMENT_LABEL[order.payment_method]} ${payBadge}</span></div>
      ${order.change_for_cents ? `<div class="line"><span class="muted">Troco para</span><span>${money(order.change_for_cents)}</span></div>` : ''}
      ${order.address ? `<div class="line"><span class="muted">Endereço</span><span style="text-align:right">${esc(order.address)}</span></div>` : ''}
      ${order.table_number ? `<div class="line"><span class="muted">Mesa</span><span>${esc(order.table_number)}</span></div>` : ''}
    </div>

    <div class="row wrap" style="margin-top:16px">
      ${whatsappLink() ? `<a class="btn spacer" href="${whatsappLink()}" target="_blank" rel="noopener">Falar no WhatsApp</a>` : ''}
      <a class="btn spacer" href="/m/${esc(r.slug)}">Voltar ao cardápio</a>
    </div>`;

  document.getElementById('copy')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(order.pix_code); toast('Código PIX copiado!'); }
    catch { toast('Selecione e copie o código manualmente.', 'error'); }
  });
  document.getElementById('demo-pay')?.addEventListener('click', async () => {
    order = await api(`/api/public/orders/${orderId}/demo-pay`, { method: 'POST' });
    toast('Pagamento aprovado!');
    render();
    schedulePoll();
  });
}

// Voltando do checkout do Mercado Pago, consulta o status na hora.
load(params.has('payment_id') || params.has('collection_id'));

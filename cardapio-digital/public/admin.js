let me;
let restaurant;
let view = 'orders';
let ordersTimer;
let knownOrderIds = null;
let highlight = new Set();

const TITLES = {
  orders: 'Pedidos', menu: 'Cardápio', reports: 'Relatórios',
  share: 'Divulgar cardápio', settings: 'Configurações', superadmin: 'Clientes do SaaS',
};

async function boot() {
  try {
    const data = await api('/api/auth/me');
    me = data.user;
    restaurant = data.restaurant;
  } catch {
    location.href = '/';
    return;
  }
  document.getElementById('layout').classList.remove('hidden');
  document.getElementById('nav-superadmin').classList.toggle('hidden', !me.is_superadmin);
  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => go(b.dataset.view)));
  document.getElementById('logout').addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' });
    location.href = '/';
  });
  document.getElementById('open-toggle').addEventListener('change', async (e) => {
    await saveRestaurant({ is_open: e.target.checked });
    toast(e.target.checked ? 'Loja aberta para pedidos' : 'Loja fechada');
  });
  refreshChrome();
  go(location.hash.slice(1) in TITLES ? location.hash.slice(1) : 'orders');
  pollOrders();
}

function refreshChrome() {
  setBrandColor(restaurant.primary_color);
  document.getElementById('rname').textContent = restaurant.name;
  document.getElementById('view-menu').href = `/m/${restaurant.slug}`;
  document.getElementById('open-toggle').checked = Boolean(restaurant.is_open);
  document.getElementById('open-label').textContent = restaurant.is_open ? 'Aberto' : 'Fechado';

  const banners = [];
  if (restaurant.plan === 'suspended') {
    banners.push('<div class="banner danger">Sua conta está suspensa. Entre em contato com o suporte.</div>');
  } else if (!restaurant.subscription_active) {
    banners.push('<div class="banner danger">Seu período de teste terminou e o cardápio não está recebendo pedidos. Assine um plano para continuar.</div>');
  } else if (restaurant.plan === 'trial') {
    const days = Math.ceil((new Date(restaurant.trial_ends_at) - Date.now()) / 864e5);
    banners.push(`<div class="banner">Teste grátis: ${days} dia(s) restante(s).</div>`);
  }
  if (restaurant.payment_options.demo) {
    banners.push('<div class="banner">Pagamentos online em modo demonstração. Configure seu Access Token do Mercado Pago em Configurações para receber de verdade.</div>');
  }
  document.getElementById('banners').innerHTML = banners.join('');
}

async function saveRestaurant(patch) {
  const body = { ...restaurant, ...patch };
  delete body.mp_access_token;
  if ('mp_access_token' in patch) body.mp_access_token = patch.mp_access_token;
  restaurant = await api('/api/admin/restaurant', { method: 'PUT', body });
  refreshChrome();
}

function go(v) {
  view = v;
  location.hash = v;
  document.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
  document.getElementById('view-title').textContent = TITLES[v];
  document.getElementById('view').innerHTML = '<div class="empty">Carregando…</div>';
  ({ orders: renderOrders, menu: renderMenu, reports: renderReports, share: renderShare, settings: renderSettings, superadmin: renderSuperadmin })[v]();
}

// ================= PEDIDOS =================

let lastOrders = [];
let historyMode = false;

async function pollOrders() {
  clearTimeout(ordersTimer);
  try {
    const orders = await api('/api/admin/orders?scope=active');
    const ids = new Set(orders.filter((o) => o.status !== 'awaiting_payment').map((o) => o.id));
    if (knownOrderIds) {
      const fresh = [...ids].filter((id) => !knownOrderIds.has(id));
      if (fresh.length) {
        fresh.forEach((id) => highlight.add(id));
        beep();
        toast(fresh.length > 1 ? `${fresh.length} novos pedidos!` : 'Novo pedido!');
      }
    }
    knownOrderIds = ids;
    lastOrders = orders;
    const pending = orders.filter((o) => o.status === 'received').length;
    const counter = document.getElementById('order-count');
    counter.textContent = pending;
    counter.classList.toggle('hidden', !pending);
    document.title = pending ? `(${pending}) Pedidos · Painel` : 'Painel · Cardápio Digital';
    if (view === 'orders' && !historyMode) drawBoard();
  } catch (err) {
    if (err.status === 401) { location.href = '/'; return; }
  }
  ordersTimer = setTimeout(pollOrders, 5000);
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.25, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.2);
    });
  } catch { /* áudio bloqueado pelo navegador */ }
}

function renderOrders() {
  historyMode = false;
  document.getElementById('view').innerHTML = `
    <div class="row" style="margin-bottom:14px">
      <span class="muted small">Atualiza automaticamente a cada 5 segundos. Mantenha esta aba aberta para ouvir o alerta de novos pedidos.</span>
      <div class="spacer"></div>
      <button class="btn sm" id="toggle-history">Ver histórico</button>
    </div>
    <div id="orders-area"></div>`;
  document.getElementById('toggle-history').addEventListener('click', async (e) => {
    historyMode = !historyMode;
    e.target.textContent = historyMode ? 'Ver pedidos ativos' : 'Ver histórico';
    historyMode ? drawHistory() : drawBoard();
  });
  drawBoard();
}

function nextStatus(o) {
  const flow = o.fulfillment === 'delivery'
    ? ['received', 'preparing', 'ready', 'out_for_delivery', 'completed']
    : ['received', 'preparing', 'ready', 'completed'];
  return flow[flow.indexOf(o.status) + 1];
}

const NEXT_LABEL = {
  preparing: 'Aceitar e preparar',
  ready: 'Marcar como pronto',
  out_for_delivery: 'Saiu para entrega',
  completed: 'Finalizar',
};

function orderCard(o) {
  const next = nextStatus(o);
  const paid = o.payment_status === 'approved';
  return `
    <div class="ocard ${highlight.has(o.id) ? 'new' : ''}" data-order="${o.id}">
      <div class="row"><strong class="spacer">#${o.number} · ${esc(o.customer_name)}</strong><span class="muted small">${formatDateTime(o.created_at).split(' ')[1] || ''}</span></div>
      <div class="row wrap small" style="margin-top:6px;gap:6px">
        <span class="badge brand">${FULFILLMENT_LABEL[o.fulfillment]}${o.table_number ? ` ${esc(o.table_number)}` : ''}</span>
        <span class="badge ${paid ? 'ok' : 'warn'}">${paid ? 'Pago' : 'A receber'} · ${PAYMENT_LABEL[o.payment_method]}</span>
      </div>
      <div class="items">
        ${o.items.map((it) => `<div><strong>${it.quantity}×</strong> ${esc(it.name)}
          ${it.addons.length ? `<div class="small muted">+ ${esc(it.addons.map((a) => a.name).join(', '))}</div>` : ''}
          ${it.notes ? `<div class="small" style="color:var(--warn)">Obs.: ${esc(it.notes)}</div>` : ''}</div>`).join('')}
        ${o.notes ? `<div class="small" style="color:var(--warn);margin-top:6px">📝 ${esc(o.notes)}</div>` : ''}
      </div>
      ${o.address ? `<div class="small">📍 ${esc(o.address)}</div>` : ''}
      <div class="small"><a href="https://wa.me/55${esc(o.customer_phone)}" target="_blank" rel="noopener">📞 ${esc(formatPhone(o.customer_phone))}</a></div>
      ${o.change_for_cents ? `<div class="small">💵 Troco para ${money(o.change_for_cents)} (${money(o.change_for_cents - o.total_cents)})</div>` : ''}
      <div class="row" style="margin-top:6px"><span class="spacer muted small">Total</span><strong>${money(o.total_cents)}</strong></div>
      <div class="actions">
        ${o.status === 'awaiting_payment' ? '<span class="small muted">Aguardando o cliente pagar…</span>' : ''}
        ${next && o.status !== 'awaiting_payment' ? `<button class="btn primary sm" data-act="advance">${NEXT_LABEL[next]}</button>` : ''}
        <button class="btn sm" data-act="print">🖨️</button>
        <button class="btn sm danger" data-act="cancel">Cancelar</button>
      </div>
    </div>`;
}

function drawBoard() {
  const area = document.getElementById('orders-area');
  if (!area) return;
  const cols = [
    ['received', 'Novos'],
    ['preparing', 'Em preparo'],
    ['ready', 'Prontos / saiu para entrega'],
    ['awaiting_payment', 'Aguardando pagamento'],
  ];
  const inCol = (key, o) => key === 'ready' ? ['ready', 'out_for_delivery'].includes(o.status) : o.status === key;
  area.innerHTML = `<div class="board">${cols.map(([key, label]) => {
    const list = lastOrders.filter((o) => inCol(key, o));
    return `<div class="col"><h3><span>${label}</span><span class="muted">${list.length}</span></h3>
      ${list.map(orderCard).join('') || '<div class="small muted">Nenhum pedido</div>'}</div>`;
  }).join('')}</div>`;
  bindOrderActions(area);
}

function bindOrderActions(root) {
  root.querySelectorAll('[data-act]').forEach((btn) => btn.addEventListener('click', async () => {
    const id = btn.closest('[data-order]').dataset.order;
    const o = lastOrders.find((x) => x.id === id) || historyOrders.find((x) => x.id === id);
    highlight.delete(id);
    if (btn.dataset.act === 'print') return printOrder(o);
    let body;
    if (btn.dataset.act === 'cancel') {
      if (!confirm(`Cancelar o pedido #${o.number}?${o.payment_status === 'approved' ? '\n\nAtenção: o pedido já foi pago. Faça o estorno pelo Mercado Pago.' : ''}`)) return;
      body = { status: 'canceled' };
    } else {
      const next = nextStatus(o);
      body = { status: next, mark_paid: next === 'completed' && o.payment_status !== 'approved' };
    }
    btn.disabled = true;
    try {
      await api(`/api/admin/orders/${id}`, { method: 'PATCH', body });
      if (body.status === 'preparing') printOrder(o);
      pollOrders();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  }));
}

function printOrder(o) {
  document.getElementById('print-area').innerHTML = `
    <div style="text-align:center"><strong>${esc(restaurant.name)}</strong><br>PEDIDO #${o.number}<br>${formatDateTime(o.created_at)}</div><hr>
    <div>${FULFILLMENT_LABEL[o.fulfillment]}${o.table_number ? ` - Mesa ${esc(o.table_number)}` : ''}</div>
    <div>${esc(o.customer_name)} - ${esc(formatPhone(o.customer_phone))}</div>
    ${o.address ? `<div>${esc(o.address)}</div>` : ''}<hr>
    ${o.items.map((it) => `<div>${it.quantity}x ${esc(it.name)} ... ${money(it.unit_price_cents * it.quantity)}</div>
      ${it.addons.map((a) => `<div>&nbsp;&nbsp;+ ${esc(a.name)}</div>`).join('')}
      ${it.notes ? `<div>&nbsp;&nbsp;OBS: ${esc(it.notes)}</div>` : ''}`).join('')}
    ${o.notes ? `<hr><div>OBS: ${esc(o.notes)}</div>` : ''}<hr>
    <div>Subtotal: ${money(o.subtotal_cents)}</div>
    ${o.delivery_fee_cents ? `<div>Entrega: ${money(o.delivery_fee_cents)}</div>` : ''}
    <div><strong>TOTAL: ${money(o.total_cents)}</strong></div>
    <div>${PAYMENT_LABEL[o.payment_method]} - ${o.payment_status === 'approved' ? 'PAGO' : 'A RECEBER'}</div>
    ${o.change_for_cents ? `<div>Troco para ${money(o.change_for_cents)}</div>` : ''}`;
  window.print();
}

let historyOrders = [];
async function drawHistory() {
  const area = document.getElementById('orders-area');
  historyOrders = await api('/api/admin/orders?scope=history');
  area.innerHTML = historyOrders.length ? `<div class="card" style="overflow-x:auto"><table>
    <thead><tr><th>#</th><th>Data</th><th>Cliente</th><th>Tipo</th><th>Pagamento</th><th>Status</th><th>Total</th><th></th></tr></thead>
    <tbody>${historyOrders.map((o) => `<tr data-order="${o.id}">
      <td>${o.number}</td><td>${formatDateTime(o.created_at)}</td><td>${esc(o.customer_name)}</td>
      <td>${FULFILLMENT_LABEL[o.fulfillment]}</td>
      <td>${PAYMENT_LABEL[o.payment_method]} ${o.payment_status === 'approved' ? '<span class="badge ok">Pago</span>' : ''}</td>
      <td>${ORDER_STATUS_LABEL[o.status]}</td><td>${money(o.total_cents)}</td>
      <td><button class="btn sm" data-act="print">🖨️</button></td></tr>`).join('')}</tbody></table></div>`
    : '<div class="empty">Nenhum pedido nos últimos 60 dias.</div>';
  bindOrderActions(area);
}

// ================= CARDÁPIO =================

let menuData;

async function renderMenu() {
  menuData = await api('/api/admin/menu');
  const { categories, products } = menuData;
  const groups = [...categories.map((c) => ({ ...c, items: products.filter((p) => p.category_id === c.id) }))];
  const orphan = products.filter((p) => !categories.some((c) => c.id === p.category_id));
  if (orphan.length) groups.push({ id: 0, name: 'Sem categoria', items: orphan });

  document.getElementById('view').innerHTML = `
    <div class="row wrap" style="margin-bottom:18px">
      <button class="btn primary" id="new-product">+ Novo produto</button>
      <button class="btn" id="new-category">+ Nova categoria</button>
    </div>
    ${groups.length ? groups.map((g, gi) => `
      <div class="cat-block">
        <div class="cat-head">
          <h3>${esc(g.name)} <span class="muted small">(${g.items.length})</span></h3>
          ${g.id ? `
            <button class="btn sm" data-cat-move="${g.id}" data-dir="-1" ${gi === 0 ? 'disabled' : ''} aria-label="Subir">↑</button>
            <button class="btn sm" data-cat-move="${g.id}" data-dir="1" ${gi === categories.length - 1 ? 'disabled' : ''} aria-label="Descer">↓</button>
            <button class="btn sm" data-cat-rename="${g.id}">Renomear</button>
            <button class="btn sm danger" data-cat-del="${g.id}">Excluir</button>` : ''}
        </div>
        ${g.items.map((p) => `
          <div class="prow ${p.available ? '' : 'off'}">
            ${p.image_url ? `<img src="${esc(p.image_url)}" alt="">` : '<div class="noimg"></div>'}
            <div class="txt"><strong>${esc(p.name)}</strong><div class="muted small">${esc(p.description)}</div></div>
            <strong>${money(p.price_cents)}</strong>
            <label class="toggle" title="Disponível"><input type="checkbox" data-avail="${p.id}" ${p.available ? 'checked' : ''}><span></span></label>
            <button class="btn sm" data-edit="${p.id}">Editar</button>
          </div>`).join('') || '<div class="small muted">Nenhum produto nesta categoria.</div>'}
      </div>`).join('') : '<div class="empty">Comece criando uma categoria (ex.: Hambúrgueres) e depois adicione produtos.</div>'}`;

  document.getElementById('new-product').addEventListener('click', () => productForm());
  document.getElementById('new-category').addEventListener('click', async () => {
    const name = prompt('Nome da categoria:');
    if (!name?.trim()) return;
    await api('/api/admin/categories', { method: 'POST', body: { name } });
    renderMenu();
  });
  document.querySelectorAll('[data-cat-rename]').forEach((b) => b.addEventListener('click', async () => {
    const cat = categories.find((c) => c.id === Number(b.dataset.catRename));
    const name = prompt('Novo nome:', cat.name);
    if (!name?.trim()) return;
    await api(`/api/admin/categories/${cat.id}`, { method: 'PUT', body: { name } });
    renderMenu();
  }));
  document.querySelectorAll('[data-cat-del]').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('Excluir esta categoria? Os produtos dela ficarão "Sem categoria".')) return;
    await api(`/api/admin/categories/${b.dataset.catDel}`, { method: 'DELETE' });
    renderMenu();
  }));
  document.querySelectorAll('[data-cat-move]').forEach((b) => b.addEventListener('click', async () => {
    const idx = categories.findIndex((c) => c.id === Number(b.dataset.catMove));
    const swap = idx + Number(b.dataset.dir);
    const order = [...categories];
    [order[idx], order[swap]] = [order[swap], order[idx]];
    await Promise.all(order.map((c, i) => api(`/api/admin/categories/${c.id}`, { method: 'PUT', body: { position: i + 1 } })));
    renderMenu();
  }));
  document.querySelectorAll('[data-avail]').forEach((c) => c.addEventListener('change', async () => {
    await api(`/api/admin/products/${c.dataset.avail}/availability`, { method: 'PATCH', body: { available: c.checked } });
    c.closest('.prow').classList.toggle('off', !c.checked);
    toast(c.checked ? 'Produto disponível' : 'Produto pausado');
  }));
  document.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => {
    productForm(products.find((p) => p.id === Number(b.dataset.edit)));
  }));
}

function productForm(p = null) {
  const { categories } = menuData;
  const { el, close } = openModal(`
    <form id="pform">
      <div class="modal-body">
        <div class="row"><h2 class="spacer">${p ? 'Editar produto' : 'Novo produto'}</h2><button type="button" class="btn ghost" data-close aria-label="Fechar">✕</button></div>
        <div class="field"><label for="p-name">Nome</label><input id="p-name" name="name" required maxlength="100" value="${esc(p?.name)}"></div>
        <div class="field"><label for="p-desc">Descrição</label><textarea id="p-desc" name="description" rows="3" maxlength="500">${esc(p?.description)}</textarea></div>
        <div class="grid-2">
          <div class="field"><label for="p-price">Preço (R$)</label><input id="p-price" name="price" inputmode="decimal" required placeholder="0,00" value="${p ? centsToInput(p.price_cents) : ''}"></div>
          <div class="field"><label for="p-cat">Categoria</label><select id="p-cat" name="category_id">
            <option value="">Sem categoria</option>
            ${categories.map((c) => `<option value="${c.id}" ${p?.category_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
          </select></div>
        </div>
        <div class="field"><label for="p-img">URL da foto</label><input id="p-img" name="image_url" type="url" placeholder="https://…" value="${esc(p?.image_url)}">
          <div class="hint">Cole o link de uma imagem (ex.: do Instagram, Google Drive público ou Imgur).</div></div>
        <label class="check"><input type="checkbox" name="available" ${!p || p.available ? 'checked' : ''}> Disponível para venda</label>
        <h3 style="margin-top:16px">Adicionais</h3>
        <p class="hint">Opcionais que o cliente pode incluir, como bacon extra ou queijo.</p>
        <div id="addons"></div>
        <button type="button" class="btn sm" id="add-addon">+ Adicional</button>
      </div>
      <div class="modal-footer row">
        ${p ? '<button type="button" class="btn danger" id="del">Excluir</button>' : ''}
        <div class="spacer"></div>
        <button class="btn primary">Salvar</button>
      </div>
    </form>`);

  const addonsEl = el.querySelector('#addons');
  const addAddon = (a = {}) => {
    const row = document.createElement('div');
    row.className = 'addon-row';
    row.innerHTML = `<input placeholder="Nome" aria-label="Nome do adicional" value="${esc(a.name)}" maxlength="60">
      <input placeholder="Preço" aria-label="Preço do adicional" inputmode="decimal" value="${a.price_cents != null ? centsToInput(a.price_cents) : ''}">
      <button type="button" class="btn sm danger" aria-label="Remover">✕</button>`;
    row.querySelector('button').addEventListener('click', () => row.remove());
    addonsEl.appendChild(row);
  };
  (p?.addons || []).forEach(addAddon);
  el.querySelector('#add-addon').addEventListener('click', () => addAddon());

  el.querySelector('#del')?.addEventListener('click', async () => {
    if (!confirm(`Excluir "${p.name}"?`)) return;
    await api(`/api/admin/products/${p.id}`, { method: 'DELETE' });
    close();
    renderMenu();
  });

  el.querySelector('#pform').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target.elements;
    const body = {
      name: f.name.value,
      description: f.description.value,
      price_cents: toCents(f.price.value),
      category_id: f.category_id.value || null,
      image_url: f.image_url.value,
      available: f.available.checked,
      addons: [...addonsEl.children].map((row) => {
        const [n, pr] = row.querySelectorAll('input');
        return { name: n.value, price_cents: toCents(pr.value) };
      }).filter((a) => a.name.trim()),
    };
    try {
      await api(p ? `/api/admin/products/${p.id}` : '/api/admin/products', { method: p ? 'PUT' : 'POST', body });
      close();
      toast('Produto salvo');
      renderMenu();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

// ================= RELATÓRIOS =================

async function renderReports() {
  const s = await api('/api/admin/stats');
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({ key, label: `${d.getDate()}/${d.getMonth() + 1}`, ...(s.daily.find((x) => x.day === key) || { orders: 0, revenue_cents: 0 }) });
  }
  const max = Math.max(1, ...days.map((d) => d.revenue_cents));
  const ticket = (p) => p.orders ? money(Math.round(p.revenue_cents / p.orders)) : '—';
  document.getElementById('view').innerHTML = `
    <div class="stats">
      <div class="card stat"><div class="muted small">Hoje</div><div class="v">${money(s.today.revenue_cents)}</div><div class="small muted">${s.today.orders} pedidos</div></div>
      <div class="card stat"><div class="muted small">Últimos 7 dias</div><div class="v">${money(s.week.revenue_cents)}</div><div class="small muted">${s.week.orders} pedidos</div></div>
      <div class="card stat"><div class="muted small">Últimos 30 dias</div><div class="v">${money(s.month.revenue_cents)}</div><div class="small muted">${s.month.orders} pedidos</div></div>
      <div class="card stat"><div class="muted small">Ticket médio (30 dias)</div><div class="v">${ticket(s.month)}</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <h3>Faturamento diário (14 dias)</h3>
        <div class="bars">${days.map((d) => `<div style="height:${(d.revenue_cents / max) * 100}%" title="${d.label}: ${money(d.revenue_cents)} (${d.orders} pedidos)"></div>`).join('')}</div>
        <div class="bars-labels">${days.map((d, i) => `<span>${i % 2 ? '' : d.label}</span>`).join('')}</div>
      </div>
      <div class="card">
        <h3>Mais vendidos (30 dias)</h3>
        ${s.top.length ? `<table><tbody>${s.top.map((t, i) => `<tr><td>${i + 1}º</td><td>${esc(t.name)}</td><td style="text-align:right"><strong>${t.qty}</strong></td></tr>`).join('')}</tbody></table>` : '<p class="muted">Ainda sem vendas.</p>'}
      </div>
    </div>`;
}

// ================= DIVULGAR =================

function qrSvg(text) {
  if (typeof qrcode !== 'function') return '<p class="muted">Não foi possível carregar o gerador de QR Code.</p>';
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
}

function renderShare() {
  const url = `${location.origin}/m/${restaurant.slug}`;
  document.getElementById('view').innerHTML = `
    <div class="settings">
      <div class="card">
        <h2>Link do seu cardápio</h2>
        <p class="muted">Coloque na bio do Instagram, no WhatsApp Business e no Google Meu Negócio.</p>
        <div class="row"><input readonly value="${esc(url)}" id="share-url"><button class="btn primary" id="copy-url">Copiar</button></div>
      </div>
      <div class="card">
        <h2>QR Code</h2>
        <p class="muted">Imprima e coloque nas mesas, no balcão e nas embalagens.</p>
        <div class="row wrap" style="align-items:flex-start;gap:24px">
          <div class="qrbox" id="qr">${qrSvg(url)}</div>
          <div>
            <button class="btn" id="dl-qr">Baixar QR Code</button>
            <h3 style="margin-top:20px">QR Code por mesa</h3>
            <p class="hint">Gera QR Codes que já informam a mesa do cliente.</p>
            <div class="row"><input id="tables" type="number" min="1" max="100" value="10" style="width:90px" aria-label="Quantidade de mesas"><button class="btn" id="print-tables">Imprimir mesas</button></div>
          </div>
        </div>
      </div>
    </div>`;
  document.getElementById('copy-url').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(url); toast('Link copiado!'); } catch { document.getElementById('share-url').select(); }
  });
  document.getElementById('dl-qr').addEventListener('click', () => {
    const svg = document.querySelector('#qr svg');
    if (!svg) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([svg.outerHTML], { type: 'image/svg+xml' }));
    a.download = `qrcode-${restaurant.slug}.svg`;
    a.click();
  });
  document.getElementById('print-tables').addEventListener('click', () => {
    const n = Math.min(100, Math.max(1, Number(document.getElementById('tables').value) || 1));
    const w = window.open('', '_blank');
    if (!w) { toast('Permita pop-ups para imprimir.', 'error'); return; }
    w.document.write(`<html><head><title>QR Codes das mesas</title><style>
      body{font-family:sans-serif;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:16px}
      div{border:1px dashed #999;padding:12px;text-align:center;break-inside:avoid}svg{width:160px;height:160px}
      </style></head><body>${Array.from({ length: n }, (_, i) => `<div><strong>${esc(restaurant.name)}</strong><br>${qrSvg(`${url}?mesa=${i + 1}`)}<br>Mesa ${i + 1}<br><small>Aponte a câmera e peça pelo celular</small></div>`).join('')}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  });
}

// ================= CONFIGURAÇÕES =================

function renderSettings() {
  const r = restaurant;
  const chk = (name, label) => `<label class="check"><input type="checkbox" name="${name}" ${r[name] ? 'checked' : ''}> ${label}</label>`;
  document.getElementById('view').innerHTML = `
    <form class="settings" id="sform">
      <div class="card">
        <h2>Estabelecimento</h2>
        <div class="grid-2">
          <div class="field"><label for="s-name">Nome</label><input id="s-name" name="name" required value="${esc(r.name)}"></div>
          <div class="field"><label for="s-slug">Endereço do cardápio</label><input id="s-slug" name="slug" value="${esc(r.slug)}">
            <div class="hint">${esc(location.origin)}/m/<strong>${esc(r.slug)}</strong></div></div>
        </div>
        <div class="field"><label for="s-desc">Descrição curta</label><input id="s-desc" name="description" maxlength="300" value="${esc(r.description)}"></div>
        <div class="grid-2">
          <div class="field"><label for="s-wa">WhatsApp (com DDD)</label><input id="s-wa" name="whatsapp" type="tel" value="${esc(r.whatsapp)}"></div>
          <div class="field"><label for="s-hours">Horário de funcionamento</label><input id="s-hours" name="opening_hours" placeholder="Ter a Dom, 18h às 23h" value="${esc(r.opening_hours)}"></div>
        </div>
        <div class="field"><label for="s-addr">Endereço</label><input id="s-addr" name="address" value="${esc(r.address)}"></div>
      </div>

      <div class="card">
        <h2>Aparência</h2>
        <div class="grid-2">
          <div class="field"><label for="s-logo">URL do logo</label><input id="s-logo" name="logo_url" type="url" value="${esc(r.logo_url)}"></div>
          <div class="field"><label for="s-cover">URL da imagem de capa</label><input id="s-cover" name="cover_url" type="url" value="${esc(r.cover_url)}"></div>
        </div>
        <div class="field"><label for="s-color">Cor principal</label><input id="s-color" name="primary_color" type="color" value="${esc(r.primary_color)}" style="width:80px;height:44px;padding:4px"></div>
      </div>

      <div class="card">
        <h2>Entrega e pedidos</h2>
        ${chk('delivery_enabled', 'Entrega (delivery)')}
        ${chk('pickup_enabled', 'Retirada no local')}
        ${chk('table_enabled', 'Pedido na mesa')}
        <div class="grid-2" style="margin-top:10px">
          <div class="field"><label for="s-fee">Taxa de entrega (R$)</label><input id="s-fee" name="delivery_fee" inputmode="decimal" value="${centsToInput(r.delivery_fee_cents)}"></div>
          <div class="field"><label for="s-min">Pedido mínimo (R$)</label><input id="s-min" name="min_order" inputmode="decimal" value="${centsToInput(r.min_order_cents)}"></div>
        </div>
      </div>

      <div class="card">
        <h2>Pagamentos</h2>
        ${chk('accept_pix', 'PIX online (confirmação automática)')}
        ${chk('accept_card_online', 'Cartão de crédito/débito online')}
        ${chk('accept_on_delivery', 'Pagamento na entrega / no local (dinheiro ou maquininha)')}
        <div class="field" style="margin-top:14px">
          <label for="s-mp">Access Token do Mercado Pago</label>
          <input id="s-mp" name="mp_access_token" type="password" autocomplete="off" placeholder="${r.has_mp_token ? '•••••••• (configurado — deixe em branco para manter)' : 'APP_USR-…'}">
          <div class="hint">Os pagamentos online caem direto na sua conta Mercado Pago. Pegue o token em
            <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener">Mercado Pago Developers → Suas integrações → Credenciais de produção</a>.</div>
          ${r.has_mp_token ? '<label class="check" style="margin-top:8px"><input type="checkbox" name="remove_mp"> Remover token</label>' : ''}
        </div>
      </div>

      <div><button class="btn primary lg">Salvar configurações</button></div>
    </form>`;

  document.getElementById('sform').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target.elements;
    const patch = {
      name: f.name.value, slug: f.slug.value, description: f.description.value, whatsapp: f.whatsapp.value,
      opening_hours: f.opening_hours.value, address: f.address.value, logo_url: f.logo_url.value,
      cover_url: f.cover_url.value, primary_color: f.primary_color.value,
      delivery_enabled: f.delivery_enabled.checked, pickup_enabled: f.pickup_enabled.checked, table_enabled: f.table_enabled.checked,
      delivery_fee_cents: toCents(f.delivery_fee.value), min_order_cents: toCents(f.min_order.value),
      accept_pix: f.accept_pix.checked, accept_card_online: f.accept_card_online.checked, accept_on_delivery: f.accept_on_delivery.checked,
    };
    if (f.remove_mp?.checked) patch.mp_access_token = '';
    else if (f.mp_access_token.value.trim()) patch.mp_access_token = f.mp_access_token.value.trim();
    try {
      await saveRestaurant(patch);
      toast('Configurações salvas');
      renderSettings();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

// ================= SUPERADMIN =================

async function renderSuperadmin() {
  const list = await api('/api/superadmin/restaurants');
  document.getElementById('view').innerHTML = `
    <div class="card" style="overflow-x:auto"><table>
      <thead><tr><th>Estabelecimento</th><th>Dono</th><th>Criado em</th><th>Pedidos</th><th>Plano</th><th>Teste até</th><th></th></tr></thead>
      <tbody>${list.map((r) => `<tr data-rid="${r.id}">
        <td><a href="/m/${esc(r.slug)}" target="_blank" rel="noopener">${esc(r.name)}</a></td>
        <td>${esc(r.owner_email)}</td><td>${formatDateTime(r.created_at)}</td><td>${r.total_orders}</td>
        <td><select data-plan>${['trial', 'basic', 'pro', 'suspended'].map((p) => `<option ${p === r.plan ? 'selected' : ''}>${p}</option>`).join('')}</select></td>
        <td>${formatDateTime(r.trial_ends_at)}</td>
        <td class="row"><button class="btn sm" data-save>Salvar</button><button class="btn sm" data-extend>+14 dias</button></td>
      </tr>`).join('')}</tbody></table></div>`;
  document.querySelectorAll('[data-rid]').forEach((row) => {
    const id = row.dataset.rid;
    const plan = () => row.querySelector('[data-plan]').value;
    row.querySelector('[data-save]').addEventListener('click', async () => {
      await api(`/api/superadmin/restaurants/${id}`, { method: 'PATCH', body: { plan: plan() } });
      toast('Plano atualizado');
    });
    row.querySelector('[data-extend]').addEventListener('click', async () => {
      await api(`/api/superadmin/restaurants/${id}`, { method: 'PATCH', body: { plan: plan(), extend_trial_days: 14 } });
      renderSuperadmin();
    });
  });
}

boot();

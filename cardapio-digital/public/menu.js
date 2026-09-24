const slug = decodeURIComponent(location.pathname.split('/')[2] || '');
const CART_KEY = `cart:${slug}`;
const CUSTOMER_KEY = 'customer';
// QR Codes de mesa apontam para /m/slug?mesa=N
const tableFromUrl = new URLSearchParams(location.search).get('mesa') || '';
let data;
let cart = [];

const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* armazenamento indisponível */ } },
};

async function init() {
  try {
    data = await api(`/api/public/r/${encodeURIComponent(slug)}`);
  } catch (err) {
    document.getElementById('app').innerHTML = `<div class="empty"><h2>Cardápio não encontrado</h2><p>${esc(err.message)}</p></div>`;
    return;
  }
  const r = data.restaurant;
  document.title = `${r.name} · Cardápio`;
  setBrandColor(r.primary_color);
  // Descarta itens do carrinho que não existem mais no cardápio.
  const ids = new Set(data.products.map((p) => p.id));
  cart = store.get(CART_KEY, []).filter((it) => ids.has(it.product_id));
  render();
}

function render(filter = '') {
  const r = data.restaurant;
  const q = filter.trim().toLowerCase();
  const products = q
    ? data.products.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(q))
    : data.products;
  const groups = data.categories
    .map((c) => ({ ...c, items: products.filter((p) => p.category_id === c.id) }))
    .filter((c) => c.items.length);
  const uncategorized = products.filter((p) => !data.categories.some((c) => c.id === p.category_id));
  if (uncategorized.length) groups.push({ id: 0, name: 'Outros', items: uncategorized });

  const logo = r.logo_url
    ? `<img class="logo" src="${esc(r.logo_url)}" alt="">`
    : `<div class="logo placeholder">${esc(r.name.charAt(0))}</div>`;

  document.getElementById('app').innerHTML = `
    <div class="hero" style="${r.cover_url ? `background-image:url('${esc(r.cover_url)}')` : ''}"></div>
    <div class="wrap">
      <div class="head">${logo}</div>
      <div class="info">
        <h1>${esc(r.name)}</h1>
        ${r.description ? `<div class="muted">${esc(r.description)}</div>` : ''}
        <div class="meta">
          <span class="badge ${r.is_open ? 'ok' : 'danger'}">${r.is_open ? 'Aberto agora' : 'Fechado'}</span>
          ${r.opening_hours ? `<span>🕒 ${esc(r.opening_hours)}</span>` : ''}
          ${r.delivery_enabled ? `<span>🛵 Entrega ${r.delivery_fee_cents ? money(r.delivery_fee_cents) : 'grátis'}</span>` : ''}
          ${r.min_order_cents ? `<span>Pedido mínimo ${money(r.min_order_cents)}</span>` : ''}
        </div>
      </div>
      ${!r.is_open ? `<div class="closed-banner">${r.accepting_orders ? 'Estamos fechados no momento. Você pode ver o cardápio, mas não é possível fazer pedidos agora.' : 'Este cardápio não está recebendo pedidos no momento.'}</div>` : ''}
      <div class="search"><input id="search" type="search" placeholder="Buscar no cardápio…" value="${esc(filter)}" aria-label="Buscar no cardápio"></div>
    </div>
    <nav class="tabs"><div class="wrap">
      ${groups.map((g, i) => `<button class="tab ${i === 0 ? 'active' : ''}" data-cat="${g.id}">${esc(g.name)}</button>`).join('')}
    </div></nav>
    <main class="wrap">
      ${groups.length ? groups.map((g) => `
        <section class="cat" id="cat-${g.id}">
          <h2>${esc(g.name)}</h2>
          <div class="products">
            ${g.items.map((p) => `
              <button class="product" data-product="${p.id}">
                <div class="txt">
                  <h3>${esc(p.name)}</h3>
                  <p>${esc(p.description)}</p>
                  <div class="price">${money(p.price_cents)}</div>
                </div>
                ${p.image_url ? `<img src="${esc(p.image_url)}" alt="" loading="lazy">` : ''}
              </button>`).join('')}
          </div>
        </section>`).join('') : '<div class="empty">Nenhum item encontrado.</div>'}
    </main>
    <div class="footer muted small">
      ${r.address ? `📍 ${esc(r.address)}<br>` : ''}
      ${r.whatsapp ? `<a href="https://wa.me/55${esc(r.whatsapp)}" target="_blank" rel="noopener">Falar no WhatsApp</a>` : ''}
    </div>
    <div id="cartbar"></div>`;

  const search = document.getElementById('search');
  search.addEventListener('input', () => {
    const pos = search.selectionStart;
    render(search.value);
    const el = document.getElementById('search');
    el.focus();
    el.setSelectionRange(pos, pos);
  });
  document.querySelectorAll('[data-product]').forEach((el) => el.addEventListener('click', () => openProduct(Number(el.dataset.product))));
  document.querySelectorAll('[data-cat]').forEach((el) => el.addEventListener('click', () => {
    document.getElementById(`cat-${el.dataset.cat}`)?.scrollIntoView({ behavior: 'smooth' });
  }));
  observeCategories();
  renderCartBar();
}

function observeCategories() {
  const tabs = [...document.querySelectorAll('.tab')];
  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const id = e.target.id.replace('cat-', '');
      tabs.forEach((t) => t.classList.toggle('active', t.dataset.cat === id));
      tabs.find((t) => t.dataset.cat === id)?.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }, { rootMargin: '-70px 0px -70% 0px' });
  document.querySelectorAll('section.cat').forEach((s) => obs.observe(s));
}

function cartTotals() {
  const subtotal = cart.reduce((s, it) => s + it.unit_price_cents * it.quantity, 0);
  const count = cart.reduce((s, it) => s + it.quantity, 0);
  return { subtotal, count };
}

function saveCart() {
  store.set(CART_KEY, cart);
  renderCartBar();
}

function renderCartBar() {
  const bar = document.getElementById('cartbar');
  if (!bar) return;
  const { subtotal, count } = cartTotals();
  bar.innerHTML = count ? `
    <div class="cartbar"><button class="btn primary lg block" id="open-cart">
      <span>🛒 Ver carrinho (${count})</span><span>${money(subtotal)}</span>
    </button></div>` : '';
  document.getElementById('open-cart')?.addEventListener('click', openCart);
}

function openProduct(id) {
  const p = data.products.find((x) => x.id === id);
  let qty = 1;
  const selected = new Set();
  const { el, close } = openModal(`
    ${p.image_url ? `<img class="pimg" src="${esc(p.image_url)}" alt="">` : ''}
    <div class="modal-body">
      <div class="row"><h2 class="spacer">${esc(p.name)}</h2><button class="btn ghost" data-close aria-label="Fechar">✕</button></div>
      <p class="muted">${esc(p.description)}</p>
      <div style="font-weight:800;font-size:1.2rem">${money(p.price_cents)}</div>
      ${p.addons.length ? `
        <h3 style="margin-top:20px">Adicionais</h3>
        ${p.addons.map((a) => `
          <label class="addon"><input type="checkbox" value="${a.id}">
            <span class="spacer">${esc(a.name)}</span>
            <span class="muted">+ ${money(a.price_cents)}</span></label>`).join('')}` : ''}
      <div class="field" style="margin-top:18px">
        <label for="pnotes">Alguma observação?</label>
        <textarea id="pnotes" rows="2" maxlength="200" placeholder="Ex.: sem cebola, ponto da carne…"></textarea>
      </div>
    </div>
    <div class="modal-footer row">
      <div class="qty"><button data-q="-1" aria-label="Diminuir">−</button><span id="qv">1</span><button data-q="1" aria-label="Aumentar">+</button></div>
      <button class="btn primary spacer" id="add" ${data.restaurant.is_open ? '' : 'disabled'}></button>
    </div>`);

  const addBtn = el.querySelector('#add');
  const unit = () => p.price_cents + p.addons.filter((a) => selected.has(a.id)).reduce((s, a) => s + a.price_cents, 0);
  const update = () => {
    el.querySelector('#qv').textContent = qty;
    addBtn.textContent = data.restaurant.is_open ? `Adicionar · ${money(unit() * qty)}` : 'Fechado no momento';
  };
  el.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => {
    qty = Math.max(1, Math.min(99, qty + Number(b.dataset.q)));
    update();
  }));
  el.querySelectorAll('.addon input').forEach((c) => c.addEventListener('change', () => {
    c.checked ? selected.add(Number(c.value)) : selected.delete(Number(c.value));
    update();
  }));
  addBtn.addEventListener('click', () => {
    const addonIds = [...selected].sort((a, b) => a - b);
    const notes = el.querySelector('#pnotes').value.trim();
    const key = `${p.id}|${addonIds.join(',')}|${notes}`;
    const existing = cart.find((it) => it.key === key);
    if (existing) existing.quantity = Math.min(99, existing.quantity + qty);
    else {
      cart.push({
        key, product_id: p.id, name: p.name, addon_ids: addonIds,
        addons: p.addons.filter((a) => selected.has(a.id)).map((a) => a.name),
        unit_price_cents: unit(), quantity: qty, notes,
      });
    }
    saveCart();
    close();
    toast('Adicionado ao carrinho');
  });
  update();
}

function openCart() {
  const { el, close } = openModal('<div id="cart-content"></div>');
  const draw = () => {
    const { subtotal } = cartTotals();
    if (!cart.length) { close(); return; }
    const r = data.restaurant;
    const below = subtotal < r.min_order_cents;
    el.querySelector('#cart-content').innerHTML = `
      <div class="modal-body">
        <div class="row"><h2 class="spacer">Seu pedido</h2><button class="btn ghost" data-close aria-label="Fechar">✕</button></div>
        ${cart.map((it, i) => `
          <div class="cart-item">
            <div class="row"><strong class="spacer">${it.quantity}× ${esc(it.name)}</strong><span>${money(it.unit_price_cents * it.quantity)}</span></div>
            ${it.addons.length ? `<div class="small muted">+ ${esc(it.addons.join(', '))}</div>` : ''}
            ${it.notes ? `<div class="small muted">Obs.: ${esc(it.notes)}</div>` : ''}
            <div class="row" style="margin-top:8px">
              <div class="qty"><button data-dec="${i}" aria-label="Diminuir">−</button><span>${it.quantity}</span><button data-inc="${i}" aria-label="Aumentar">+</button></div>
            </div>
          </div>`).join('')}
        <div class="line" style="margin-top:12px"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
        ${below ? `<p class="small" style="color:var(--danger)">Pedido mínimo: ${money(r.min_order_cents)}. Faltam ${money(r.min_order_cents - subtotal)}.</p>` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn primary lg block" id="go-checkout" ${below || !r.is_open ? 'disabled' : ''}>Continuar</button>
      </div>`;
    el.querySelectorAll('[data-inc]').forEach((b) => b.addEventListener('click', () => {
      const it = cart[b.dataset.inc]; it.quantity = Math.min(99, it.quantity + 1); saveCart(); draw();
    }));
    el.querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', () => {
      const it = cart[b.dataset.dec];
      if (--it.quantity <= 0) cart.splice(Number(b.dataset.dec), 1);
      saveCart(); draw();
    }));
    el.querySelector('#go-checkout').addEventListener('click', () => { close(); openCheckout(); });
  };
  draw();
}

function openCheckout() {
  const r = data.restaurant;
  const po = r.payment_options;
  const saved = store.get(CUSTOMER_KEY, {});
  const fulfillments = [
    r.delivery_enabled && ['delivery', `Entrega${r.delivery_fee_cents ? ` (+ ${money(r.delivery_fee_cents)})` : ' grátis'}`],
    r.pickup_enabled && ['pickup', 'Retirar no local'],
    r.table_enabled && ['table', 'Consumir na mesa'],
  ].filter(Boolean);
  // Veio pelo QR Code da mesa: a mesa já vem selecionada.
  if (tableFromUrl && r.table_enabled) fulfillments.sort((a, b) => (b[0] === 'table') - (a[0] === 'table'));
  const methods = [
    po.pix && ['pix', '⚡ PIX (pagamento online)'],
    po.card_online && ['card_online', '💳 Cartão de crédito/débito online'],
    po.on_delivery && ['card_on_delivery', '💳 Cartão na entrega/no local'],
    po.on_delivery && ['cash', '💵 Dinheiro'],
  ].filter(Boolean);

  if (!fulfillments.length || !methods.length) {
    toast('Este estabelecimento ainda não configurou entrega ou pagamento.', 'error');
    return;
  }

  const { el, close } = openModal(`
    <form id="checkout" novalidate>
      <div class="modal-body">
        <div class="row"><h2 class="spacer">Finalizar pedido</h2><button type="button" class="btn ghost" data-close aria-label="Fechar">✕</button></div>
        ${po.demo ? '<p class="badge warn">Modo demonstração: pagamentos online são simulados</p>' : ''}
        <h3>Como você quer receber?</h3>
        ${fulfillments.map(([v, l], i) => `<label class="opt"><input type="radio" name="fulfillment" value="${v}" ${i === 0 ? 'checked' : ''}>${l}</label>`).join('')}
        <div id="f-address" class="field"><label for="address">Endereço completo</label>
          <textarea id="address" name="address" rows="2" placeholder="Rua, número, bairro, complemento e referência">${esc(saved.address || '')}</textarea></div>
        <div id="f-table" class="field"><label for="table_number">Número da mesa</label>
          <input id="table_number" name="table_number" inputmode="numeric" maxlength="10" value="${esc(tableFromUrl)}"></div>

        <h3 style="margin-top:18px">Seus dados</h3>
        <div class="field"><label for="customer_name">Nome</label>
          <input id="customer_name" name="customer_name" autocomplete="name" required value="${esc(saved.name || '')}"></div>
        <div class="field"><label for="customer_phone">WhatsApp</label>
          <input id="customer_phone" name="customer_phone" type="tel" autocomplete="tel" placeholder="(11) 99999-9999" required value="${esc(saved.phone || '')}"></div>

        <h3 style="margin-top:18px">Pagamento</h3>
        ${methods.map(([v, l], i) => `<label class="opt"><input type="radio" name="payment_method" value="${v}" ${i === 0 ? 'checked' : ''}>${l}</label>`).join('')}
        <div id="f-email" class="field"><label for="customer_email">E-mail (para o comprovante)</label>
          <input id="customer_email" name="customer_email" type="email" autocomplete="email" value="${esc(saved.email || '')}"></div>
        <div id="f-change" class="field"><label for="change_for">Troco para quanto? (opcional)</label>
          <input id="change_for" name="change_for" inputmode="decimal" placeholder="Ex.: 100,00"></div>

        <div class="field" style="margin-top:18px"><label for="notes">Observações do pedido</label>
          <textarea id="notes" name="notes" rows="2" maxlength="300"></textarea></div>

        <div id="summary"></div>
      </div>
      <div class="modal-footer"><button class="btn primary lg block" id="submit">Fazer pedido</button></div>
    </form>`);

  const form = el.querySelector('#checkout');
  const val = (name) => form.elements[name]?.value ?? '';
  const sync = () => {
    const f = form.querySelector('[name=fulfillment]:checked').value;
    const m = form.querySelector('[name=payment_method]:checked').value;
    el.querySelector('#f-address').classList.toggle('hidden', f !== 'delivery');
    el.querySelector('#f-table').classList.toggle('hidden', f !== 'table');
    el.querySelector('#f-email').classList.toggle('hidden', m !== 'pix' && m !== 'card_online');
    el.querySelector('#f-change').classList.toggle('hidden', m !== 'cash');
    const { subtotal } = cartTotals();
    const fee = f === 'delivery' ? r.delivery_fee_cents : 0;
    el.querySelector('#summary').innerHTML = `
      <div class="line"><span>Subtotal</span><span>${money(subtotal)}</span></div>
      ${f === 'delivery' ? `<div class="line"><span>Taxa de entrega</span><span>${fee ? money(fee) : 'Grátis'}</span></div>` : ''}
      <div class="line total"><span>Total</span><span>${money(subtotal + fee)}</span></div>`;
    el.querySelector('#submit').textContent = m === 'pix' ? 'Pagar com PIX' : m === 'card_online' ? 'Pagar com cartão' : 'Fazer pedido';
  };
  form.addEventListener('change', sync);
  sync();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = el.querySelector('#submit');
    btn.disabled = true;
    const payload = {
      fulfillment: form.querySelector('[name=fulfillment]:checked').value,
      payment_method: form.querySelector('[name=payment_method]:checked').value,
      customer_name: val('customer_name'),
      customer_phone: val('customer_phone'),
      customer_email: val('customer_email'),
      address: val('address'),
      table_number: val('table_number'),
      change_for_cents: toCents(val('change_for')),
      notes: val('notes'),
      items: cart.map((it) => ({ product_id: it.product_id, quantity: it.quantity, addon_ids: it.addon_ids, notes: it.notes })),
    };
    try {
      const res = await api(`/api/public/r/${encodeURIComponent(slug)}/orders`, { method: 'POST', body: payload });
      store.set(CUSTOMER_KEY, { name: payload.customer_name, phone: payload.customer_phone, email: payload.customer_email, address: payload.address });
      cart = [];
      saveCart();
      close();
      location.href = res.redirect_url || `/pedido/${res.order_id}`;
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
}

init();

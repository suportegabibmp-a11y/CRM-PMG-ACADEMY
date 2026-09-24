// Página inicial: cadastro, login, "esqueci minha senha" e botão Assinar.
let mode = 'signup';
const form = document.getElementById('form');
const submit = document.getElementById('submit');

function setMode(m) {
  mode = m;
  document.querySelectorAll('.switch button').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
  document.querySelectorAll('.signup-only').forEach((el) => el.classList.toggle('hidden', m !== 'signup'));
  document.querySelectorAll('.login-only').forEach((el) => el.classList.toggle('hidden', m !== 'login'));
  document.getElementById('password').autocomplete = m === 'signup' ? 'new-password' : 'current-password';
  submit.textContent = m === 'signup' ? 'Começar teste grátis de 14 dias' : 'Entrar no painel';
}
document.querySelectorAll('.switch button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submit.disabled = true;
  const body = Object.fromEntries(new FormData(form));
  try {
    await api(mode === 'signup' ? '/api/auth/signup' : '/api/auth/login', { method: 'POST', body });
    location.href = '/admin';
  } catch (err) {
    toast(err.message, 'error');
    submit.disabled = false;
  }
});

// Já logado? Mostra o atalho para o painel.
// Esqueci minha senha: a pessoa fala com o suporte, que gera uma senha
// temporária no painel; depois ela troca em Configurações.
document.getElementById('forgot').addEventListener('click', (e) => {
  e.preventDefault();
  const { el } = openModal(`<form class="modal-body" id="forgot-form">
    <div class="row"><h2 class="spacer">Esqueci minha senha</h2><button type="button" class="btn ghost" data-close aria-label="Fechar">✕</button></div>
    <p class="muted">Informe o e-mail da sua conta. O suporte vai te enviar uma senha temporária
      (pelo WhatsApp cadastrado na sua loja ou por e-mail). Depois de entrar, crie a sua em
      <strong>Configurações → Alterar senha</strong>.</p>
    <div class="field"><label for="forgot-email">E-mail da conta</label>
      <input id="forgot-email" type="email" autocomplete="email" required value="${esc(document.getElementById('email').value.trim())}"></div>
    <button class="btn primary block lg">Pedir nova senha</button>
  </form>`);
  el.querySelector('#forgot-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const btn = ev.target.querySelector('button.primary');
    btn.disabled = true;
    try {
      await api('/api/public/password-request', { method: 'POST', body: { email: el.querySelector('#forgot-email').value } });
      el.querySelector('#forgot-form').innerHTML = `
        <div class="row"><h2 class="spacer">Pedido enviado ✓</h2><button type="button" class="btn ghost" data-close aria-label="Fechar">✕</button></div>
        <p class="muted">Recebemos seu pedido. Em breve você recebe uma senha temporária para entrar.</p>
        <button type="button" class="btn primary block" data-close>Ok</button>`;
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
});

// Se o servidor ou o banco estiverem fora, avisa em vez de deixar o botão "morto".
fetch('/api/health').then((r) => r.json().then((d) => ({ ok: r.ok && d.ok, d })).catch(() => ({ ok: false, d: { database: `a API não respondeu (HTTP ${r.status}). A função da Netlify não foi publicada.` } })))
  .then(({ ok, d }) => {
    if (ok) return;
    const box = document.createElement('div');
    box.className = 'banner-error';
    box.innerHTML = `<strong>Sistema indisponível no momento.</strong><br><span class="small">Diagnóstico: ${esc(d.database || 'erro desconhecido')}</span>`;
    document.getElementById('auth').prepend(box);
  })
  .catch(() => {});

// Logado: o botão Assinar usa o link com a loja já identificada.
api('/api/auth/me').then(() => {
  document.getElementById('go-admin').classList.remove('hidden');
  document.getElementById('subscribe').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      location.href = (await api('/api/admin/billing/checkout', { method: 'POST' })).url;
    } catch (err) {
      if (err.status === 409) { location.href = '/admin#billing'; return; }
      location.href = e.target.href;
    }
  });
}).catch(() => {});

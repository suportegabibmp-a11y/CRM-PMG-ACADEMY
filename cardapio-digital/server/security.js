// Controles de segurança compartilhados: limite de tentativas persistente,
// IP do cliente, criptografia de segredos em repouso, validação de URLs de
// imagem, conferência do tipo real de arquivos e trilha de auditoria.
import crypto from 'node:crypto';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { db } from './db.js';

// ---------- IP do cliente ----------

// Atrás da Netlify, o IP real vem em x-nf-client-connection-ip (a Netlify
// sobrescreve esse cabeçalho). Sem ele, usa o primeiro X-Forwarded-For.
export function clientIp(req) {
  const nf = String(req.headers['x-nf-client-connection-ip'] || '').trim();
  if (/^[0-9a-fA-F:.]{3,45}$/.test(nf)) return nf;
  return String(req.ip || '').slice(0, 45) || 'desconhecido';
}

// ---------- limite de tentativas (guardado no banco) ----------
// Em Edge Functions cada instância tem memória própria, então o limite
// precisa ficar no banco para valer de verdade.

export async function rateHit(bucket, windowMs) {
  const row = await db.one(
    `INSERT INTO cardapio.rate_limits (bucket, count, reset_at)
     VALUES ($1, 1, now() + ($2::int * interval '1 millisecond'))
     ON CONFLICT (bucket) DO UPDATE SET
       count = CASE WHEN cardapio.rate_limits.reset_at < now() THEN 1 ELSE cardapio.rate_limits.count + 1 END,
       reset_at = CASE WHEN cardapio.rate_limits.reset_at < now()
         THEN now() + ($2::int * interval '1 millisecond') ELSE cardapio.rate_limits.reset_at END
     RETURNING count`,
    [bucket.slice(0, 200), Math.round(windowMs)]
  );
  // Limpeza ocasional de janelas vencidas.
  if (Math.random() < 0.01) {
    db.query('DELETE FROM cardapio.rate_limits WHERE reset_at < now()').catch(() => {});
  }
  return row.count;
}

export async function rateCount(bucket) {
  const row = await db.one(
    'SELECT count FROM cardapio.rate_limits WHERE bucket = $1 AND reset_at > now()', [bucket.slice(0, 200)]
  );
  return row ? row.count : 0;
}

export async function rateReset(bucket) {
  await db.query('DELETE FROM cardapio.rate_limits WHERE bucket = $1', [bucket.slice(0, 200)]);
}

// Middleware: `key(req)` define o que é contado (padrão: IP).
export function rateLimit(name, max, windowMs, key = clientIp) {
  return async (req, res, next) => {
    const count = await rateHit(`${name}:${key(req)}`, windowMs);
    if (count > max) {
      res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({ error: 'Muitas tentativas. Aguarde um pouco e tente de novo.' });
    }
    next();
  };
}

// ---------- segredos em repouso (AES-256-GCM) ----------
// A chave vem de DATA_ENCRYPTION_KEY ou, no Supabase, é derivada da
// SUPABASE_SERVICE_ROLE_KEY (que só existe no servidor). Sem chave (ambiente
// local), o valor fica como está.

function encryptionKey() {
  const material = process.env.DATA_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!material) return null;
  return crypto.createHash('sha256').update(`cardapio-digital:v1:${material}`).digest();
}

export function encryptSecret(plain) {
  if (!plain) return '';
  const key = encryptionKey();
  if (!key) return plain;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return `enc:v1:${iv.toString('base64')}:${cipher.getAuthTag().toString('base64')}:${data.toString('base64')}`;
}

// Devolve '' se não der para decifrar (ex.: chave trocada); o dono cadastra de novo.
export function decryptSecret(stored) {
  if (!stored || !stored.startsWith('enc:v1:')) return stored || '';
  const key = encryptionKey();
  if (!key) return '';
  try {
    const [, , iv, tag, data] = stored.split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
  } catch {
    console.error('Não foi possível decifrar um segredo guardado (chave trocada?).');
    return '';
  }
}

// ---------- tokens guardados só como hash ----------

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

// ---------- URLs de imagem ----------
// Aceita vazio, imagens enviadas ao próprio sistema ou https:// sem
// caracteres que permitam escapar de atributos HTML ou de url() no CSS.

export function safeImageUrl(value) {
  const url = typeof value === 'string' ? value.trim() : '';
  if (!url) return '';
  if (/^\/api\/img\/[0-9a-f-]{36}$/.test(url)) return url;
  if (url.length > 500 || !/^https:\/\/[^\s"'()<>\\`]+$/.test(url)) return null;
  try {
    return new URL(url).protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

// ---------- tipo real de imagem (magic bytes) ----------

export function detectImageType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length >= 12 && buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp';
  return null;
}

// ---------- trilha de auditoria ----------
// Registra ações sensíveis sem senhas nem tokens. Falha no log não derruba a ação.

export async function audit(req, action, { actorId = null, target = '', meta = {} } = {}) {
  try {
    await db.query(
      'INSERT INTO cardapio.audit_log (actor_user_id, action, target, ip, meta) VALUES ($1, $2, $3, $4, $5)',
      [actorId, action, String(target).slice(0, 200), req ? clientIp(req) : '', JSON.stringify(meta).slice(0, 2000)]
    );
  } catch (err) {
    console.error('Auditoria:', err.message);
  }
}

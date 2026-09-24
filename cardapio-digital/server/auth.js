import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import { db } from './db.js';
import { sha256 } from './security.js';

const SESSION_DAYS = 30;
export const MAX_PASSWORD_LENGTH = 128;

// scrypt N=2^14, r=8, p=5: configuração equivalente à mínima recomendada pelo
// OWASP (N=2^17, p=1), mas com 16 MB de memória, o que roda rápido também no
// Deno do Supabase (~0,25 s). O formato guarda os parâmetros para poder
// aumentar no futuro; hashes antigos ("sal:hash", p=1) continuam válidos e são
// atualizados no próximo login.
const SCRYPT = { N: 2 ** 14, r: 8, p: 5 };
const SCRYPT_LEGACY = { N: 2 ** 14, r: 8, p: 1 };
const MAXMEM = 256 * 1024 * 1024;

function scrypt(password, salt, params, keylen = 64) {
  return crypto.scryptSync(password, salt, keylen, { ...params, maxmem: MAXMEM });
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = scrypt(password, salt, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function parseHash(stored) {
  if (typeof stored !== 'string') return null;
  if (stored.startsWith('scrypt$')) {
    const [, N, r, p, salt, hash] = stored.split('$');
    return { params: { N: Number(N), r: Number(r), p: Number(p) }, salt, hash };
  }
  const [salt, hash] = stored.split(':');
  return salt && hash ? { params: SCRYPT_LEGACY, salt, hash } : null;
}

export function verifyPassword(password, stored) {
  const parsed = parseHash(stored);
  if (!parsed || typeof password !== 'string' || password.length > MAX_PASSWORD_LENGTH) return false;
  const expected = Buffer.from(parsed.hash, 'hex');
  const actual = scrypt(password, Buffer.from(parsed.salt, 'hex'), parsed.params, expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

export function needsRehash(stored) {
  const parsed = parseHash(stored);
  if (!parsed) return true;
  const cost = (x) => x.N * x.r * x.p;
  return cost(parsed.params) < cost(SCRYPT);
}

// Usado quando o e-mail não existe, para o tempo de resposta não revelar isso.
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));
export function dummyVerify(password) {
  verifyPassword(String(password || '').slice(0, MAX_PASSWORD_LENGTH), DUMMY_HASH);
}

// Cria a sessão e devolve o token. O navegador guarda o token e o envia no
// cabeçalho Authorization (sem cookie, então não há CSRF). No banco fica só o
// hash SHA-256 do token: um vazamento do banco não entrega sessões válidas.
export async function createSession(req, res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.query('INSERT INTO cardapio.sessions (token, user_id, expires_at) VALUES ($1, $2, $3)', [sha256(token), userId, expires]);
  return token;
}

export function currentToken(req) {
  return readToken(req) || '';
}

function readToken(req) {
  const header = String(req.headers.authorization || '');
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return /^[0-9a-f]{64}$/.test(token) ? token : null;
}

export async function destroySession(req) {
  const token = readToken(req);
  if (token) await db.query('DELETE FROM cardapio.sessions WHERE token = $1', [sha256(token)]);
}

// Encerra todas as sessões do usuário, menos a atual (se informada).
export async function destroyOtherSessions(userId, keepToken = '') {
  await db.query('DELETE FROM cardapio.sessions WHERE user_id = $1 AND token <> $2',
    [userId, keepToken ? sha256(keepToken) : '']);
}

// Anexa req.user e req.restaurant; responde 401 se não houver sessão válida.
export async function requireAuth(req, res, next) {
  const token = readToken(req);
  const row = token && await db.one(
    `SELECT u.id AS user_id, u.name AS user_name, u.email AS user_email, u.read_only AS user_read_only, r.*
     FROM cardapio.sessions s
     JOIN cardapio.users u ON u.id = s.user_id
     JOIN cardapio.restaurants r ON r.owner_id = u.id
     WHERE s.token = $1 AND s.expires_at > now()`,
    [sha256(token)]
  );
  if (!row) return res.status(401).json({ error: 'Não autenticado' });
  const { user_id, user_name, user_email, user_read_only, ...restaurant } = row;
  req.user = { id: user_id, name: user_name, email: user_email, read_only: Boolean(user_read_only) };
  req.restaurant = restaurant;
  next();
}

// Conta de demonstração: pode olhar tudo, mas não alterar nada.
export function blockReadOnly(req, res, next) {
  if (req.user?.read_only && req.method !== 'GET') {
    return res.status(403).json({ error: 'Conta de demonstração: somente leitura.' });
  }
  next();
}

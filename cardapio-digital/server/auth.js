import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import { db } from './db.js';

const SESSION_DAYS = 30;
const COOKIE = 'sid';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

// Cria a sessão e devolve o token. Ele vai num cookie e também na resposta,
// para o navegador enviar no cabeçalho Authorization (funciona mesmo quando
// a API passa por um proxy que não repassa cookies).
export async function createSession(req, res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.query('INSERT INTO cardapio.sessions (token, user_id, expires_at) VALUES ($1, $2, $3)', [token, userId, expires]);
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: req.secure, expires });
  return token;
}

export function currentToken(req) {
  return readToken(req) || '';
}

function readToken(req) {
  const header = String(req.headers.authorization || '');
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return readCookie(req, COOKIE);
}

export async function destroySession(req, res) {
  const token = readToken(req);
  if (token) await db.query('DELETE FROM cardapio.sessions WHERE token = $1', [token]);
  res.clearCookie(COOKIE);
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

// Anexa req.user e req.restaurant; responde 401 se não houver sessão válida.
export async function requireAuth(req, res, next) {
  const token = readToken(req);
  if (token && !/^[0-9a-f]{64}$/.test(token)) return res.status(401).json({ error: 'Não autenticado' });
  const row = token && await db.one(
    `SELECT u.id AS user_id, u.name AS user_name, u.email AS user_email, r.*
     FROM cardapio.sessions s
     JOIN cardapio.users u ON u.id = s.user_id
     JOIN cardapio.restaurants r ON r.owner_id = u.id
     WHERE s.token = $1 AND s.expires_at > now()`,
    [token]
  );
  if (!row) return res.status(401).json({ error: 'Não autenticado' });
  const { user_id, user_name, user_email, ...restaurant } = row;
  req.user = { id: user_id, name: user_name, email: user_email };
  req.restaurant = restaurant;
  next();
}


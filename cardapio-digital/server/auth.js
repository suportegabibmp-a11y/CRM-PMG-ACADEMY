const crypto = require('node:crypto');
const { db } = require('./db');

const SESSION_DAYS = 30;
const COOKIE = 'sid';

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .run(token, userId, expires.toISOString());
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires,
  });
}

function destroySession(req, res) {
  const token = readCookie(req, COOKIE);
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
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
function requireAuth(req, res, next) {
  const token = readCookie(req, COOKIE);
  const session = token && db.prepare(
    'SELECT user_id, expires_at FROM sessions WHERE token = ?'
  ).get(token);
  if (!session || new Date(session.expires_at) < new Date()) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  req.user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(session.user_id);
  req.restaurant = db.prepare('SELECT * FROM restaurants WHERE owner_id = ?').get(session.user_id);
  if (!req.user || !req.restaurant) return res.status(401).json({ error: 'Não autenticado' });
  next();
}

module.exports = { hashPassword, verifyPassword, createSession, destroySession, requireAuth };

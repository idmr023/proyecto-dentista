import { scryptSync, randomBytes, timingSafeEqual, createHash, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { getDb } from './db.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'twilight-dental-access-key-2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'twilight-dental-refresh-key-2026';
const ACCESS_EXPIRES = '15m';
const REFRESH_DAYS = 7;

// ─── Password ────────────────────────────────────────
export function hashPassword(password: string, salt: Buffer) {
  return scryptSync(password, salt, 64).toString('hex');
}

export function verifyPassword(password: string, storedHash: string, saltHex: string) {
  const salt = Buffer.from(saltHex, 'hex');
  const hash = scryptSync(password, salt, 64);
  return timingSafeEqual(hash, Buffer.from(storedHash, 'hex'));
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

// ─── JWT ─────────────────────────────────────────────
export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: `${REFRESH_DAYS}d` });
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// ─── Session Management ──────────────────────────────
export async function createSession(userId: string, refreshToken: string) {
  const db = getDb();
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 86400000).toISOString();
  await db.run(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    randomUUID(), userId, hashToken(refreshToken), expiresAt
  );
}

export async function revokeSession(tokenHash: string) {
  const db = getDb();
  await db.run('UPDATE sessions SET revoked = 1 WHERE token_hash = ?', tokenHash);
}

export async function revokeAllUserSessions(userId: string) {
  const db = getDb();
  await db.run('UPDATE sessions SET revoked = 1 WHERE user_id = ?', userId);
}

export async function isSessionRevoked(tokenHash: string): Promise<boolean> {
  const db = getDb();
  const row = await db.get('SELECT revoked FROM sessions WHERE token_hash = ?', tokenHash) as { revoked: number } | null;
  return row ? row.revoked === 1 : true;
}

export async function rotateRefreshToken(oldTokenHash: string, userId: string, newToken: string) {
  const db = getDb();
  await db.run('UPDATE sessions SET revoked = 1 WHERE token_hash = ?', oldTokenHash);
  await createSession(userId, newToken);
}

// ─── Rate Limiting ───────────────────────────────────
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function recordLoginAttempt(email: string, ip: string, success: boolean) {
  const db = getDb();
  await db.run(
    'INSERT INTO login_attempts (email, ip, success) VALUES (?, ?, ?)',
    email.toLowerCase(), ip, success ? 1 : 0
  );
}

export async function isLoginLocked(email: string, ip: string): Promise<{ locked: boolean; retryAfterSeconds: number }> {
  const db = getDb();
  const cutoff = new Date(Date.now() - LOCKOUT_WINDOW_MS).toISOString();
  const row = await db.get(
    `SELECT COUNT(*) as count FROM login_attempts WHERE email = ? AND ip = ? AND success = 0 AND created_at > ?`,
    email.toLowerCase(), ip, cutoff
  ) as { count: number };

  if (row.count >= MAX_ATTEMPTS) {
    const oldest = await db.get(
      `SELECT created_at FROM login_attempts WHERE email = ? AND ip = ? AND success = 0 AND created_at > ? ORDER BY created_at ASC LIMIT 1`,
      email.toLowerCase(), ip, cutoff
    ) as { created_at: string } | null;

    const expiresAt = oldest
      ? new Date(new Date(oldest.created_at).getTime() + LOCKOUT_WINDOW_MS)
      : new Date();
    const retryAfter = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 1000));
    return { locked: true, retryAfterSeconds: retryAfter };
  }

  return { locked: false, retryAfterSeconds: 0 };
}

// ─── Cookie Helpers ──────────────────────────────────
export function setRefreshCookie(res: any, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie',
    `refresh_token=${token}; Path=/api/auth/refresh; HttpOnly; SameSite=Strict; Max-Age=${REFRESH_DAYS * 86400}${isProd ? '; Secure' : ''}`
  );
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(c => c.trim().split('=').map(s => s.trim()) as [string, string])
  );
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

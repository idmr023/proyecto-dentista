import type { IncomingMessage, ServerResponse } from 'http';
import { verifyAccessToken, extractBearerToken, parseCookies, verifyRefreshToken, isSessionRevoked, hashToken, signRefreshToken, signAccessToken, rotateRefreshToken, setRefreshCookie, TokenPayload } from './auth';
import { getDb } from './db';

export type RouteHandler = (req: IncomingMessage, res: ServerResponse, params?: Record<string, string>) => void | Promise<void> | boolean | null;

// ─── Body Parsing ────────────────────────────────────
export function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

export async function parseJson(req: IncomingMessage) {
  const raw = await readBody(req);
  if (!raw) return {};
  return JSON.parse(raw);
}

// ─── Response Helpers ────────────────────────────────
export function json(res: ServerResponse, status: number, data: any) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export function error(res: ServerResponse, status: number, message: string) {
  json(res, status, { error: message });
}

export function ok(res: ServerResponse, data: any) {
  json(res, 200, data);
}

export function created(res: ServerResponse, data: any) {
  json(res, 201, data);
}

// ─── Auth Middleware ──────────────────────────────────
export function authenticate(req: IncomingMessage): TokenPayload | null {
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload) return null;
  return payload;
}

export function requireAuth(req: IncomingMessage, res: ServerResponse): TokenPayload | null {
  const user = authenticate(req);
  if (!user) {
    error(res, 401, 'No autorizado. Inicia sesión.');
    return null;
  }
  return user;
}

export function requireRole(roles: string[]): RouteHandler {
  return (req, res, params) => {
    const user = requireAuth(req, res);
    if (!user) return null;
    if (!roles.includes(user.role)) {
      error(res, 403, 'No tienes permiso para acceder a este recurso.');
      return null;
    }
    return true;
  };
}

// ─── Refresh Token Handler (inline, used by router) ──
export async function handleRefresh(req: IncomingMessage, res: ServerResponse) {
  const cookies = parseCookies(req.headers.cookie);
  const refreshToken = cookies.refresh_token;
  if (!refreshToken) {
    error(res, 401, 'No hay sesión activa.');
    return;
  }

  const oldTokenHash = hashToken(refreshToken);
  if (isSessionRevoked(oldTokenHash)) {
    error(res, 401, 'Sesión expirada. Inicia sesión nuevamente.');
    return;
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    error(res, 401, 'Sesión inválida.');
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT id, email, role, is_active FROM users WHERE id = ?').get(payload.sub) as any;
  if (!user || !user.is_active) {
    error(res, 401, 'Cuenta desactivada.');
    return;
  }

  const newPayload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
  const newRefresh = signRefreshToken(newPayload);
  const newAccess = signAccessToken(newPayload);

  rotateRefreshToken(oldTokenHash, user.id, newRefresh);
  setRefreshCookie(res, newRefresh);
  ok(res, { accessToken: newAccess, role: user.role, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

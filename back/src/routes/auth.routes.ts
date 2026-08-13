import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db.js';
import { hashPassword, verifyPassword, signAccessToken, signRefreshToken, createSession, revokeSession, hashToken, isLoginLocked, recordLoginAttempt, setRefreshCookie, parseCookies } from '../auth.js';
import { requireAuth, parseJson, ok, error, created, authenticate } from '../middleware.js';
import { randomBytes, randomUUID } from 'crypto';
import { loginSchema, registerClientSchema } from '../shared/schemas.js';

export function registerAuthRoutes(router: any) {
  // POST /api/auth/login
  router.post('/api/auth/login', async (req: IncomingMessage, res: ServerResponse) => {
    const body = await parseJson(req);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos');
      return;
    }

    const { email, password } = parsed.data;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || '127.0.0.1';

    const lock = await isLoginLocked(email, ip);
    if (lock.locked) {
      await recordLoginAttempt(email, ip, false);
      error(res, 429, `Demasiados intentos fallidos. Espera ${lock.retryAfterSeconds} segundos.`);
      return;
    }

    const db = getDb();
    const user = await db.get('SELECT id, name, email, password_hash, salt, role, is_active FROM users WHERE email = ?', email.toLowerCase()) as any;

    if (!user || !user.is_active) {
      await recordLoginAttempt(email, ip, false);
      error(res, 401, 'Correo electrónico o contraseña incorrectos.');
      return;
    }

    if (!verifyPassword(password, user.password_hash, user.salt)) {
      await recordLoginAttempt(email, ip, false);
      error(res, 401, 'Correo electrónico o contraseña incorrectos.');
      return;
    }

    await recordLoginAttempt(email, ip, true);

    const tokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);
    await createSession(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    ok(res, {
      accessToken,
      role: user.role,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });

  // POST /api/auth/register (public — clients only)
  router.post('/api/auth/register', async (req: IncomingMessage, res: ServerResponse) => {
    const body = await parseJson(req);
    const parsed = registerClientSchema.safeParse(body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos');
      return;
    }

    const { name, email, password } = parsed.data;
    const db = getDb();

    const existing = await db.get('SELECT id FROM users WHERE email = ?', email.toLowerCase());
    if (existing) {
      error(res, 409, 'Este correo ya está registrado.');
      return;
    }

    const salt = randomBytes(32);
    const passwordHash = hashPassword(password, salt);
    const userId = randomUUID();

    await db.run(
      'INSERT INTO users (id, name, email, password_hash, salt, role) VALUES (?, ?, ?, ?, ?, ?)',
      userId, name.trim(), email.toLowerCase(), passwordHash, salt.toString('hex'), 'cliente'
    );

    await db.run(
      'INSERT INTO patients (id, name, phone, email, user_id) VALUES (?, ?, ?, ?, ?)',
      randomUUID(), name.trim(), '', email.toLowerCase(), userId
    );

    const tokenPayload = { sub: userId, email: email.toLowerCase(), role: 'cliente' };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);
    await createSession(userId, refreshToken);
    setRefreshCookie(res, refreshToken);

    created(res, {
      accessToken,
      role: 'cliente',
      user: { id: userId, name: name.trim(), email: email.toLowerCase(), role: 'cliente' },
    });
  });

  // POST /api/auth/refresh
  router.post('/api/auth/refresh', async (req: IncomingMessage, res: ServerResponse) => {
    const { handleRefresh } = await import('../middleware.js');
    handleRefresh(req, res);
  });

  // POST /api/auth/logout
  router.post('/api/auth/logout', async (req: IncomingMessage, res: ServerResponse) => {
    const cookies = parseCookies(req.headers.cookie);
    const refreshToken = cookies.refresh_token;
    if (refreshToken) {
      await revokeSession(hashToken(refreshToken));
    }
    res.setHeader('Set-Cookie',
      'refresh_token=; Path=/api/auth/refresh; HttpOnly; SameSite=Strict; Max-Age=0'
    );
    ok(res, { message: 'Sesión cerrada.' });
  });

  // GET /api/auth/me
  router.get('/api/auth/me', async (req: IncomingMessage, res: ServerResponse) => {
    const user = requireAuth(req, res);
    if (!user) return;

    const db = getDb();
    const fullUser = await db.get('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?', user.sub) as any;

    if (!fullUser || !fullUser.is_active) {
      error(res, 404, 'Usuario no encontrado.');
      return;
    }

    ok(res, { user: fullUser });
  });
}

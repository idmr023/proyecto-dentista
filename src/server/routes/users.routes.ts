import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db.js';
import { requireAuth, requireRole, parseJson, ok, error, created } from '../middleware.js';
import { createUserSchema } from '../../shared/schemas.js';
import { randomBytes, randomUUID } from 'crypto';
import { hashPassword } from '../auth.js';

export function registerUserRoutes(router: any) {
  // GET /api/users (admin only)
  router.get('/api/users', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin'])(req, res);
    if (!guard) return;

    const db = getDb();
    const users = db.prepare('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC').all();
    ok(res, { users });
  });

  // POST /api/users (admin only)
  router.post('/api/users', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin'])(req, res);
    if (!guard) return;

    const body = await parseJson(req);
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos');
      return;
    }

    const { name, email, password, role } = parsed.data;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      error(res, 409, 'Este correo ya está registrado.');
      return;
    }

    const salt = randomBytes(32);
    const passwordHash = hashPassword(password, salt);
    const userId = randomUUID();

    db.prepare('INSERT INTO users (id, name, email, password_hash, salt, role) VALUES (?, ?, ?, ?, ?, ?)')
      .run(userId, name.trim(), email.toLowerCase(), passwordHash, salt.toString('hex'), role);

    created(res, {
      user: { id: userId, name: name.trim(), email: email.toLowerCase(), role, is_active: 1 },
    });
  });

  // PUT /api/users/:id (admin only)
  router.put('/api/users/:id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const body = await parseJson(req);
    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existing) {
      error(res, 404, 'Usuario no encontrado.');
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (body.name) {
      updates.push('name = ?');
      values.push(body.name.trim());
    }
    if (body.role) {
      updates.push('role = ?');
      values.push(body.role);
    }
    if (typeof body.is_active === 'number') {
      updates.push('is_active = ?');
      values.push(body.is_active);
    }
    if (body.password) {
      const salt = randomBytes(32);
      updates.push('password_hash = ?', 'salt = ?');
      values.push(hashPassword(body.password, salt), salt.toString('hex'));
    }

    if (updates.length === 0) {
      error(res, 400, 'Sin cambios para actualizar.');
      return;
    }

    values.push(id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const user = db.prepare('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?').get(id);
    ok(res, { user });
  });

  // DELETE /api/users/:id (admin only)
  router.delete('/api/users/:id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const db = getDb();

    // Prevent self-deletion
    const authUser = requireAuth(req, res);
    if (!authUser) return;
    if (authUser.sub === id) {
      error(res, 400, 'No puedes eliminar tu propia cuenta.');
      return;
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    if (result.changes === 0) {
      error(res, 404, 'Usuario no encontrado.');
      return;
    }

    ok(res, { message: 'Usuario eliminado.' });
  });
}

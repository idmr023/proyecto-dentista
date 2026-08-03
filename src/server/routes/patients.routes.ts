import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db';
import { requireAuth, requireRole, parseJson, ok, error, created } from '../middleware';
import { patientSchema } from '../../shared/schemas';
import { randomUUID } from 'crypto';

export function registerPatientRoutes(router: any) {
  // GET /api/patients (any authenticated user — clients need it to book appointments)
  router.get('/api/patients', async (req: IncomingMessage, res: ServerResponse) => {
    const user = requireAuth(req, res);
    if (!user) return;

    const db = getDb();
    let patients;
    if (user.role === 'cliente') {
      patients = db.prepare('SELECT * FROM patients WHERE user_id = ? ORDER BY created_at DESC').all(user.sub);
    } else {
      patients = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
    }
    ok(res, { patients });
  });

  // GET /api/patients/:id (admin, colaborador)
  router.get('/api/patients/:id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const db = getDb();
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    if (!patient) {
      error(res, 404, 'Paciente no encontrado.');
      return;
    }
    ok(res, { patient });
  });

  // POST /api/patients (admin, colaborador)
  router.post('/api/patients', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const body = await parseJson(req);
    const parsed = patientSchema.safeParse(body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos');
      return;
    }

    const { name, phone, email, birth_date, notes } = parsed.data;
    const db = getDb();
    const id = randomUUID();

    db.prepare(
      'INSERT INTO patients (id, name, phone, email, birth_date, notes) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, name.trim(), phone.trim(), email || '', birth_date || '', notes || '');

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    created(res, { patient });
  });

  // PUT /api/patients/:id (admin, colaborador)
  router.put('/api/patients/:id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const body = await parseJson(req);
    const parsed = patientSchema.partial().safeParse(body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos');
      return;
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM patients WHERE id = ?').get(id);
    if (!existing) {
      error(res, 404, 'Paciente no encontrado.');
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (parsed.data.name) { updates.push('name = ?'); values.push(parsed.data.name.trim()); }
    if (parsed.data.phone) { updates.push('phone = ?'); values.push(parsed.data.phone.trim()); }
    if (typeof parsed.data.email === 'string') { updates.push('email = ?'); values.push(parsed.data.email); }
    if (typeof parsed.data.birth_date === 'string') { updates.push('birth_date = ?'); values.push(parsed.data.birth_date); }
    if (typeof parsed.data.notes === 'string') { updates.push('notes = ?'); values.push(parsed.data.notes); }

    if (updates.length === 0) { error(res, 400, 'Sin cambios.'); return; }

    values.push(id);
    db.prepare(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    ok(res, { patient });
  });

  // DELETE /api/patients/:id (admin)
  router.delete('/api/patients/:id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const db = getDb();
    const result = db.prepare('DELETE FROM patients WHERE id = ?').run(id);
    if (result.changes === 0) {
      error(res, 404, 'Paciente no encontrado.');
      return;
    }
    ok(res, { message: 'Paciente eliminado.' });
  });
}

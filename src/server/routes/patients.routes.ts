import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db.js';
import { requireAuth, requireRole, parseJson, ok, error, created } from '../middleware.js';
import { patientSchema } from '../../shared/schemas.js';
import { randomUUID } from 'crypto';

export function registerPatientRoutes(router: any) {
  // GET /api/patients
  router.get('/api/patients', async (req: IncomingMessage, res: ServerResponse) => {
    const user = requireAuth(req, res);
    if (!user) return;

    const db = getDb();
    let patients;
    if (user.role === 'cliente') {
      patients = await db.all('SELECT * FROM patients WHERE user_id = ? ORDER BY created_at DESC', user.sub);
    } else {
      patients = await db.all('SELECT * FROM patients ORDER BY created_at DESC');
    }
    ok(res, { patients });
  });

  // GET /api/patients/:id
  router.get('/api/patients/:id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const db = getDb();
    const patient = await db.get('SELECT * FROM patients WHERE id = ?', id);
    if (!patient) { error(res, 404, 'Paciente no encontrado.'); return; }
    ok(res, { patient });
  });

  // POST /api/patients
  router.post('/api/patients', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const body = await parseJson(req);
    const parsed = patientSchema.safeParse(body);
    if (!parsed.success) { error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos'); return; }

    const { name, phone, email, birth_date, notes } = parsed.data;
    const db = getDb();
    const id = randomUUID();

    await db.run(
      'INSERT INTO patients (id, name, phone, email, birth_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      id, name.trim(), phone.trim(), email || '', birth_date || '', notes || ''
    );

    const patient = await db.get('SELECT * FROM patients WHERE id = ?', id);
    created(res, { patient });
  });

  // PUT /api/patients/:id
  router.put('/api/patients/:id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const body = await parseJson(req);
    const parsed = patientSchema.partial().safeParse(body);
    if (!parsed.success) { error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos'); return; }

    const db = getDb();
    const existing = await db.get('SELECT id FROM patients WHERE id = ?', id);
    if (!existing) { error(res, 404, 'Paciente no encontrado.'); return; }

    const updates: string[] = [];
    const values: any[] = [];

    if (parsed.data.name) { updates.push('name = ?'); values.push(parsed.data.name.trim()); }
    if (parsed.data.phone) { updates.push('phone = ?'); values.push(parsed.data.phone.trim()); }
    if (typeof parsed.data.email === 'string') { updates.push('email = ?'); values.push(parsed.data.email); }
    if (typeof parsed.data.birth_date === 'string') { updates.push('birth_date = ?'); values.push(parsed.data.birth_date); }
    if (typeof parsed.data.notes === 'string') { updates.push('notes = ?'); values.push(parsed.data.notes); }

    if (updates.length === 0) { error(res, 400, 'Sin cambios.'); return; }

    values.push(id);
    const setClause = updates.map((u, i) => u.replace('?', `$${i + 1}`)).join(', ');
    await db.run(`UPDATE patients SET ${setClause} WHERE id = $${values.length}`, ...values);

    const patient = await db.get('SELECT * FROM patients WHERE id = ?', id);
    ok(res, { patient });
  });

  // DELETE /api/patients/:id
  router.delete('/api/patients/:id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const db = getDb();
    const result = await db.run('DELETE FROM patients WHERE id = ?', id);
    if (result.changes === 0) { error(res, 404, 'Paciente no encontrado.'); return; }
    ok(res, { message: 'Paciente eliminado.' });
  });
}

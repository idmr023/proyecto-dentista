import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db.js';
import { requireRole, parseJson, ok, error } from '../middleware.js';
import { bulkOdontogramSchema } from '../../shared/schemas.js';

export function registerOdontogramRoutes(router: any) {
  // GET /api/patients/:id/odontogram
  router.get('/api/patients/:id/odontogram', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const db = getDb();
    const marks = await db.all('SELECT tooth_id, tool, face FROM tooth_marks WHERE patient_id = ?', id);
    ok(res, { marks });
  });

  // PUT /api/patients/:id/odontogram
  router.put('/api/patients/:id/odontogram', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const body = await parseJson(req);
    const parsed = bulkOdontogramSchema.safeParse(body);
    if (!parsed.success) { error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos'); return; }

    const db = getDb();

    const patient = await db.get('SELECT id FROM patients WHERE id = ?', id);
    if (!patient) { error(res, 404, 'Paciente no encontrado.'); return; }

    await db.run('DELETE FROM tooth_marks WHERE patient_id = ?', id);
    for (const mark of parsed.data.marks) {
      await db.run(
        'INSERT INTO tooth_marks (patient_id, tooth_id, tool, face) VALUES (?, ?, ?, ?)',
        id, mark.tooth_id, mark.tool, mark.face
      );
    }

    const marks = await db.all('SELECT tooth_id, tool, face FROM tooth_marks WHERE patient_id = ?', id);
    ok(res, { marks });
  });
}

import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db';
import { requireRole, parseJson, ok, error } from '../middleware';
import { bulkOdontogramSchema } from '../../shared/schemas';

export function registerOdontogramRoutes(router: any) {
  // GET /api/patients/:id/odontogram (admin only)
  router.get('/api/patients/:id/odontogram', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const db = getDb();
    const marks = db.prepare('SELECT tooth_id, tool, face FROM tooth_marks WHERE patient_id = ?').all(id);
    ok(res, { marks });
  });

  // PUT /api/patients/:id/odontogram (admin only — replaces all marks)
  router.put('/api/patients/:id/odontogram', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const body = await parseJson(req);
    const parsed = bulkOdontogramSchema.safeParse(body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos');
      return;
    }

    const db = getDb();

    // Verify patient exists
    const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(id);
    if (!patient) {
      error(res, 404, 'Paciente no encontrado.');
      return;
    }

    const deleteStmt = db.prepare('DELETE FROM tooth_marks WHERE patient_id = ?');
    const insertStmt = db.prepare('INSERT INTO tooth_marks (patient_id, tooth_id, tool, face) VALUES (?, ?, ?, ?)');

    deleteStmt.run(id);
    for (const mark of parsed.data.marks) {
      insertStmt.run(id, mark.tooth_id, mark.tool, mark.face);
    }

    const marks = db.prepare('SELECT tooth_id, tool, face FROM tooth_marks WHERE patient_id = ?').all(id);
    ok(res, { marks });
  });
}

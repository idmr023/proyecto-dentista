import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db.js';
import { requireRole, parseJson, ok, error, created } from '../middleware.js';
import { medicalHistorySchema } from '../../shared/schemas.js';
import { randomUUID } from 'crypto';

export function registerMedicalHistoryRoutes(router: any) {
  // GET /api/medical-histories/:patient_id
  router.get('/api/medical-histories/:patient_id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const { patient_id } = (req as any).params;
    const db = getDb();
    const histories = await db.all('SELECT * FROM medical_histories WHERE patient_id = ? ORDER BY created_at DESC', patient_id);
    ok(res, { histories });
  });

  // POST /api/medical-histories
  router.post('/api/medical-histories', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const body = await parseJson(req);
    const parsed = medicalHistorySchema.safeParse(body);
    if (!parsed.success) { error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos'); return; }

    const { patient_id, treatment, paid, total, observations } = parsed.data;
    const db = getDb();
    const id = randomUUID();

    await db.run(
      'INSERT INTO medical_histories (id, patient_id, treatment, paid, total, observations) VALUES (?, ?, ?, ?, ?, ?)',
      id, patient_id, treatment, paid, total, observations || ''
    );

    const history = await db.get('SELECT * FROM medical_histories WHERE id = ?', id);
    created(res, { history });
  });
}

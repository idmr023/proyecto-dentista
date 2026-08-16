import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db.js';
import { requireRole, parseJson, ok, error, created } from '../middleware.js';
import { medicalHistorySchema, medicalHistoryPaymentSchema } from '../shared/schemas.js';
import { randomUUID } from 'crypto';

export function registerMedicalHistoryRoutes(router: any) {
  // GET /api/medical-histories/:patient_id
  router.get('/api/medical-histories/:patient_id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const { patient_id } = (req as any).params;
    const db = getDb();
    const histories = await db.all(
      'SELECT * FROM medical_histories WHERE patient_id = ? ORDER BY created_at DESC',
      patient_id
    );
    ok(res, { histories });
  });

  // POST /api/medical-histories
  router.post('/api/medical-histories', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const body = await parseJson(req);
    const parsed = medicalHistorySchema.safeParse(body);
    if (!parsed.success) { error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos'); return; }

    const { patient_id, treatment, total, paid, signature, observations } = parsed.data;
    const db = getDb();
    const id = randomUUID();
    const balance = Number((total - paid).toFixed(2));

    await db.run(
      'INSERT INTO medical_histories (id, patient_id, treatment, total, paid, balance, signature, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      id, patient_id, treatment, total, paid, balance, signature || '', observations || ''
    );

    const history = await db.get('SELECT * FROM medical_histories WHERE id = ?', id);
    created(res, { history });
  });

  // PATCH /api/medical-histories/:id — abonar saldo (pago fraccionado)
  router.patch('/api/medical-histories/:id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const body = await parseJson(req);
    const parsed = medicalHistoryPaymentSchema.safeParse(body);
    if (!parsed.success) { error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos'); return; }

    const db = getDb();
    const existing = await db.get('SELECT * FROM medical_histories WHERE id = ?', id);
    if (!existing) { error(res, 404, 'Tratamiento no encontrado.'); return; }

    const newPaid = Number((existing.paid + parsed.data.paid).toFixed(2));
    if (newPaid > existing.total) { error(res, 400, 'El abono excede el total del tratamiento.'); return; }

    const balance = Number((existing.total - newPaid).toFixed(2));
    const signature = typeof parsed.data.signature === 'string' ? parsed.data.signature : existing.signature;
    const observations = typeof parsed.data.observations === 'string' ? parsed.data.observations : existing.observations;

    await db.run(
      'UPDATE medical_histories SET paid = ?, balance = ?, signature = ?, observations = ? WHERE id = ?',
      newPaid, balance, signature, observations, id
    );

    const history = await db.get('SELECT * FROM medical_histories WHERE id = ?', id);
    ok(res, { history });
  });

  // DELETE /api/medical-histories/:id
  router.delete('/api/medical-histories/:id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const db = getDb();
    const result = await db.run('DELETE FROM medical_histories WHERE id = ?', id);
    if (result.changes === 0) { error(res, 404, 'Tratamiento no encontrado.'); return; }
    ok(res, { message: 'Tratamiento eliminado.' });
  });
}

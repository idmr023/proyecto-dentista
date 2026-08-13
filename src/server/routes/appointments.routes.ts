import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db.js';
import { requireRole, requireAuth, parseJson, ok, error, created } from '../middleware.js';
import { appointmentSchema, appointmentStatusSchema } from '../../shared/schemas.js';
import { randomUUID } from 'crypto';

export function registerAppointmentRoutes(router: any) {
  // GET /api/appointments (admin, colaborador → all; cliente → own)
  router.get('/api/appointments', async (req: IncomingMessage, res: ServerResponse) => {
    const user = requireAuth(req, res);
    if (!user) return;

    const db = getDb();
    let appointments;

    if (user.role === 'cliente') {
      appointments = db.prepare(`
        SELECT a.*, p.name as patient_name, p.phone as patient_phone
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE p.user_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `).all(user.sub);
    } else if (user.role === 'colaborador') {
      appointments = db.prepare(`
        SELECT a.*, p.name as patient_name, p.phone as patient_phone
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `).all();
    } else {
      appointments = db.prepare(`
        SELECT a.*, p.name as patient_name, p.phone as patient_phone
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `).all();
    }

    ok(res, { appointments });
  });

  // POST /api/appointments (admin, colaborador → for any patient; cliente → own)
  router.post('/api/appointments', async (req: IncomingMessage, res: ServerResponse) => {
    const user = requireAuth(req, res);
    if (!user) return;

    const body = await parseJson(req);
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) {
      error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos');
      return;
    }

    const { patient_id, service, appointment_date, appointment_time, notes } = parsed.data;
    const db = getDb();

    // Verify patient exists
    const patient = db.prepare('SELECT id, user_id FROM patients WHERE id = ?').get(patient_id) as { id: string; user_id: string | null } | undefined;
    if (!patient) {
      error(res, 404, 'Paciente no encontrado.');
      return;
    }

    if (user.role === 'cliente' && patient.user_id !== user.sub) {
      error(res, 403, 'Solo puedes agendar citas para ti mismo.');
      return;
    }

    // Check time conflict
    const conflict = db.prepare(
      `SELECT id FROM appointments
       WHERE appointment_date = ? AND appointment_time = ? AND status != 'cancelada'`
    ).get(appointment_date, appointment_time);
    if (conflict) {
      error(res, 409, 'Este horario ya está ocupado.');
      return;
    }

    const id = randomUUID();
    db.prepare(
      'INSERT INTO appointments (id, patient_id, service, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, patient_id, service, appointment_date, appointment_time, notes || '');

    const appt = db.prepare(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone
      FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.id = ?
    `).get(id);
    created(res, { appointment: appt });
  });

  // PATCH /api/appointments/:id/status (admin, colaborador)
  router.patch('/api/appointments/:id/status', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const body = await parseJson(req);
    const parsed = appointmentStatusSchema.safeParse(body);
    if (!parsed.success) {
      error(res, 400, 'Estado inválido.');
      return;
    }

    const db = getDb();
    const result = db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(parsed.data.status, id);
    if (result.changes === 0) {
      error(res, 404, 'Cita no encontrada.');
      return;
    }

    const appt = db.prepare(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone
      FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.id = ?
    `).get(id);
    ok(res, { appointment: appt });
  });

  // DELETE /api/appointments/:id (admin, colaborador)
  router.delete('/api/appointments/:id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const db = getDb();
    const result = db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
    if (result.changes === 0) {
      error(res, 404, 'Cita no encontrada.');
      return;
    }
    ok(res, { message: 'Cita eliminada.' });
  });
}

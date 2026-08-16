import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../db.js';
import { requireRole, requireAuth, parseJson, ok, error, created } from '../middleware.js';
import { appointmentSchema, appointmentStatusSchema } from '../shared/schemas.js';
import { randomUUID } from 'crypto';
import { sendAppointmentNotification } from '../mailer.js';

export function registerAppointmentRoutes(router: any) {
  // GET /api/appointments
  router.get('/api/appointments', async (req: IncomingMessage, res: ServerResponse) => {
    const user = requireAuth(req, res);
    if (!user) return;

    const db = getDb();
    let appointments;

    if (user.role === 'cliente') {
      appointments = await db.all(`
        SELECT a.*, p.name as patient_name, p.phone as patient_phone
        FROM appointments a JOIN patients p ON a.patient_id = p.id
        WHERE p.user_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `, user.sub);
    } else {
      appointments = await db.all(`
        SELECT a.*, p.name as patient_name, p.phone as patient_phone
        FROM appointments a JOIN patients p ON a.patient_id = p.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `);
    }

    ok(res, { appointments });
  });

  // POST /api/appointments
  router.post('/api/appointments', async (req: IncomingMessage, res: ServerResponse) => {
    const user = requireAuth(req, res);
    if (!user) return;

    const body = await parseJson(req);
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) { error(res, 400, parsed.error.issues[0]?.message || 'Datos inválidos'); return; }

    const { patient_id, service, appointment_date, appointment_time, notes } = parsed.data;
    const db = getDb();

    const patient = await db.get('SELECT id, user_id, name, phone, email FROM patients WHERE id = ?', patient_id) as { id: string; user_id: string | null; name: string; phone: string; email: string } | null;
    if (!patient) { error(res, 404, 'Paciente no encontrado.'); return; }

    if (user.role === 'cliente' && patient.user_id !== user.sub) {
      error(res, 403, 'Solo puedes agendar citas para ti mismo.'); return;
    }

    const conflict = await db.get(
      `SELECT id FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND status != 'cancelada'`,
      appointment_date, appointment_time
    );
    if (conflict) { error(res, 409, 'Este horario ya está ocupado.'); return; }

    const id = randomUUID();
    await db.run(
      'INSERT INTO appointments (id, patient_id, service, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
      id, patient_id, service, appointment_date, appointment_time, notes || ''
    );

    // Notificar a la dentista por correo (citas autoagendadas)
    const dentist = await db.get('SELECT email FROM users WHERE role = ? AND is_active = 1', 'admin') as { email: string } | null;
    if (dentist?.email) {
      sendAppointmentNotification(
        { id, service, appointment_date, appointment_time, notes, status: 'pendiente' },
        patient,
        dentist.email
      );
    }

    const appt = await db.get(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone
      FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.id = ?
    `, id);
    created(res, { appointment: appt });
  });

  // PATCH /api/appointments/:id/status
  router.patch('/api/appointments/:id/status', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const body = await parseJson(req);
    const parsed = appointmentStatusSchema.safeParse(body);
    if (!parsed.success) { error(res, 400, 'Estado inválido.'); return; }

    const db = getDb();
    const result = await db.run('UPDATE appointments SET status = ? WHERE id = ?', parsed.data.status, id);
    if (result.changes === 0) { error(res, 404, 'Cita no encontrada.'); return; }

    const appt = await db.get(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone
      FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.id = ?
    `, id);
    ok(res, { appointment: appt });
  });

  // DELETE /api/appointments/:id
  router.delete('/api/appointments/:id', async (req: IncomingMessage, res: ServerResponse) => {
    const guard = requireRole(['admin', 'colaborador'])(req, res);
    if (!guard) return;

    const { id } = (req as any).params;
    const db = getDb();
    const result = await db.run('DELETE FROM appointments WHERE id = ?', id);
    if (result.changes === 0) { error(res, 404, 'Cita no encontrada.'); return; }
    ok(res, { message: 'Cita eliminada.' });
  });
}

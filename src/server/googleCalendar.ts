import { google } from 'googleapis';
import { getDb } from '../db.js';

export async function syncToGoogleCalendar(appointmentId: string): Promise<boolean> {
  try {
    const db = getDb();
    const appointment = await db.get(
      `SELECT a.*, p.name as patient_name, p.email, p.phone, u.email as dentist_email, u.name as dentist_name
       FROM appointments a JOIN patients p ON a.patient_id = p.id
       LEFT JOIN users u ON u.role = 'admin' AND u.is_active = 1
       WHERE a.id = ?`,
      appointmentId
    );

    if (!appointment) {
      console.error('[GOOGLE CALENDAR] Cita no encontrada:', appointmentId);
      return false;
    }

    if (!process.env.GOOGLE_CALENDAR_CLIENT_ID || !process.env.GOOGLE_CALENDAR_CLIENT_SECRET || !process.env.GOOGLE_CALENDAR_REFRESH_TOKEN) {
      console.warn('[GOOGLE CALENDAR] Credenciales de Google Calendar no configuradas');
      return false;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: `Cita - ${appointment.service} con Dr. ${appointment.dentist_name || 'Personal'}`,,
      description: `Paciente: ${appointment.patient_name}\nTeléfono: ${appointment.phone}\nEmail: ${appointment.email}\nNotas: ${appointment.notes || 'Ninguna'}`,
      start: {
        dateTime: `${appointment.appointment_date}T${appointment.appointment_time}:00-05:00`,
        timeZone: 'America/Lima',
      },
      end: {
        dateTime: `${appointment.appointment_date}T${appointment.appointment_time}:00-05:00`,
        timeZone: 'America/Lima',
      },
      attendees: [
        { email: appointment.email },
        { email: appointment.dentist_email },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    console.log('[GOOGLE CALENDAR] Evento creado exitosamente:', response.data.id);

    return true;
  } catch (error) {
    console.error('[GOOGLE CALENDAR] Error al sincronizar con Google Calendar:', error);
    return false;
  }
}

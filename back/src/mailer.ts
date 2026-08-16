import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendAppointmentNotification(appointment: any, patient: any, dentistEmail: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[MAIL] SMTP no configurado. Cita registrada sin notificación por correo:', appointment.id);
    return false;
  }

  const subject = `📅 Nueva cita — ${patient.name} (${appointment.service})`;
  const text = [
    `Nueva cita registrada en el sistema:`,
    ``,
    `Paciente: ${patient.name}`,
    `Teléfono: ${patient.phone}`,
    `Email: ${patient.email || '—'}`,
    `Servicio: ${appointment.service}`,
    `Fecha: ${appointment.appointment_date}`,
    `Hora: ${appointment.appointment_time}`,
    `Notas: ${appointment.notes || '—'}`,
    `Estado: ${appointment.status}`,
  ].join('\n');

  try {
    await transporter.sendMail({
      from: `"Dental Colors" <${process.env.SMTP_USER}>`,
      to: dentistEmail,
      subject,
      text,
    });
    console.log('[MAIL] Notificación enviada para la cita:', appointment.id);
    return true;
  } catch (err) {
    console.error('[MAIL] Error al enviar correo:', err);
    return false;
  }
}

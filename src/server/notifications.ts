import nodemailer from 'nodemailer';

export async function sendAppointmentNotification(appointment: any, patient: any, dentist: any) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const patientMailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@clinic.com',
    to: patient.email,
    subject: '✅ Tu cita ha sido agendada - Dental Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; font-size: 28px; margin-bottom: 10px;">¡Cita Confirmada!</h1>
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 30px;">
              ✅
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; font-size: 22px; margin-bottom: 15px;">Detalles de tu cita</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #64748b;">Paciente:</td>
                <td style="padding: 10px; color: #1e293b;">${patient.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #64748b;">Servicio:</td>
                <td style="padding: 10px; color: #1e293b;">${appointment.service}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #64748b;">Fecha:</td>
                <td style="padding: 10px; color: #1e293b;">${appointment.appointment_date}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #64748b;">Hora:</td>
                <td style="padding: 10px; color: #1e293b;">${appointment.appointment_time}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #64748b;">Estado:</td>
                <td style="padding: 10px;">
                  <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ${appointment.status}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #92400e; font-size: 18px; margin-bottom: 10px;">Información de contacto</h3>
            <p style="color: #78350f; margin: 5px 0;"><strong>Teléfono:</strong> ${patient.phone}</p>
            ${patient.email ? `<p style="color: #78350f; margin: 5px 0;"><strong>Email:</strong> ${patient.email}</p>` : ''}
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">¡Gracias por elegirnos para el cuidado de tu sonrisa!</p>
            <p style="color: #64748b; font-size: 14px;">Si necesitas cancelar o modificar tu cita, contáctanos con 24 horas de antelación.</p>
          </div>
        </div>
      </div>
    `,
  };

  const dentistMailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@clinic.com',
    to: dentist.email,
    subject: '📅 Nueva cita asignada - Dental Clinic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; font-size: 28px; margin-bottom: 10px;">¡Nueva Cita Asignada!</h1>
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 30px;">
              📅
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; font-size: 22px; margin-bottom: 15px;">Detalles de la cita</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #64748b;">Paciente:</td>
                <td style="padding: 10px; color: #1e293b;">${patient.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #64748b;">Teléfono:</td>
                <td style="padding: 10px; color: #1e293b;">${patient.phone}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #64748b;">Servicio:</td>
                <td style="padding: 10px; color: #1e293b;">${appointment.service}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #64748b;">Fecha:</td>
                <td style="padding: 10px; color: #1e293b;">${appointment.appointment_date}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #64748b;">Hora:</td>
                <td style="padding: 10px; color: #1e293b;">${appointment.appointment_time}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #64748b;">Email del paciente:</td>
                <td style="padding: 10px; color: #1e293b;">${patient.email}</td>
              </tr>
              ${appointment.notes ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px; font-weight: bold; color: #64748b;">Notas:</td>
                  <td style="padding: 10px; color: #1e293b;">${appointment.notes}</td>
                </tr>
              ` : ''}
            </table>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px;">La cita ha sido asignada automáticamente a las ${new Date().toLocaleTimeString()}.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(patientMailOptions);
    await transporter.sendMail(dentistMailOptions);
    console.log('[NOTIFICATION] Correos enviados para la cita:', appointment.id);
    return true;
  } catch (error) {
    console.error('[NOTIFICATION] Error al enviar correos:', error);
    return false;
  }
}

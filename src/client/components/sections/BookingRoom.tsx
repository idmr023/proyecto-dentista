import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Phone, MessageCircle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface FormData {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
}

export default function BookingRoom() {
  const [form, setForm] = useState<FormData>({
    name: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim() || !form.phone.trim() || !form.service || !form.date || !form.time) {
      setFormError('Completa nombre, WhatsApp, servicio, fecha y hora para continuar.');
      return;
    }

    const message = encodeURIComponent(
      `Hola Sonrisa Dental 🦷\nQuiero agendar una cita:\n\n` +
      `👤 Nombre: ${form.name}\n` +
      `📞 WhatsApp: ${form.phone}\n` +
      `🩺 Servicio: ${form.service}\n` +
      `📅 Fecha: ${form.date}\n` +
      `⏰ Hora: ${form.time}` +
      (form.notes ? `\n📝 Notas: ${form.notes}` : '')
    );
    window.open(`https://wa.me/51970998860?text=${message}`, '_blank');

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const services = [
    'Odontopediatría',
    'Endodoncia',
    'Implantes Dentales',
    'Cirugías Dentales',
    'Rehabilitación Dental',
    'Ortodoncia',
    'Estética Dental',
    'Restauraciones de Resina',
    'Blanqueamiento Láser',
    'Limpieza Profunda',
  ];

  return (
    <section className="relative min-h-screen bg-[#F0F7FF] flex items-center justify-center py-24 px-6">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#7CC4EB]/15 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#F7B8D1]/20 rounded-full blur-[120px]" />

      <div className="max-w-5xl w-full mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-bold text-[#5AB0E4] tracking-[0.2em] uppercase mb-4"
          >
            Sala de Atención
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-[#1A2E3D] tracking-tight"
          >
            Agenda tu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7CC4EB] to-[#5AB0E4]">
              cita ahora
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#5A7A94] mt-3 text-sm"
          >
            Completa el formulario y recibe confirmación por WhatsApp
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 backdrop-blur-xl bg-white border border-[#D6E8F5] rounded-3xl p-8 md:p-10 space-y-6 shadow-xl"
          >
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5A7A94] tracking-wider uppercase flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#5AB0E4]" /> Nombre completo
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: María Fernanda Gómez"
                className="w-full bg-[#F0F7FF] border border-[#D6E8F5] rounded-xl px-4 py-3.5 text-sm text-[#1A2E3D] placeholder:text-[#5A7A94]/60 outline-none focus:ring-2 focus:ring-[#7CC4EB]/40 focus:border-[#7CC4EB] transition-all"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5A7A94] tracking-wider uppercase flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#5AB0E4]" /> Número de WhatsApp
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="Ej: +51 970 998 860"
                className="w-full bg-[#F0F7FF] border border-[#D6E8F5] rounded-xl px-4 py-3.5 text-sm text-[#1A2E3D] placeholder:text-[#5A7A94]/60 outline-none focus:ring-2 focus:ring-[#7CC4EB]/40 focus:border-[#7CC4EB] transition-all"
              />
            </div>

            {/* Service + Date row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5A7A94] tracking-wider uppercase flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#5AB0E4]" /> Servicio
                </label>
                <select
                  value={form.service}
                  onChange={e => setForm({ ...form, service: e.target.value })}
                  className="w-full bg-[#F0F7FF] border border-[#D6E8F5] rounded-xl px-4 py-3.5 text-sm text-[#1A2E3D] outline-none focus:ring-2 focus:ring-[#7CC4EB]/40 focus:border-[#7CC4EB] transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-white">Seleccionar...</option>
                  {services.map((s, i) => (
                    <option key={i} value={s} className="bg-white">{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5A7A94] tracking-wider uppercase flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#5AB0E4]" /> Fecha preferida
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-[#F0F7FF] border border-[#D6E8F5] rounded-xl px-4 py-3.5 text-sm text-[#1A2E3D] outline-none focus:ring-2 focus:ring-[#7CC4EB]/40 focus:border-[#7CC4EB] transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5A7A94] tracking-wider uppercase flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#5AB0E4]" /> Hora preferida
              </label>
              <div className="flex flex-wrap gap-2">
                {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setForm({ ...form, time })}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      form.time === time
                        ? 'bg-[#7CC4EB] text-white shadow-md shadow-[#7CC4EB]/30'
                        : 'bg-[#F0F7FF] border border-[#D6E8F5] text-[#5A7A94] hover:bg-[#E8F2FA] hover:text-[#1A2E3D]'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5A7A94] tracking-wider uppercase flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#5AB0E4]" /> Notas adicionales
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Describe brevemente tu motivo de consulta o alguna condición especial..."
                rows={3}
                className="w-full bg-[#F0F7FF] border border-[#D6E8F5] rounded-xl px-4 py-3.5 text-sm text-[#1A2E3D] placeholder:text-[#5A7A94]/60 outline-none focus:ring-2 focus:ring-[#7CC4EB]/40 focus:border-[#7CC4EB] transition-all resize-none"
              />
            </div>

            {/* Submit */}
            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-600 text-center">
                {formError}
              </div>
            )}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#7CC4EB] hover:bg-[#5AB0E4] text-white font-extrabold py-4 rounded-xl shadow-lg shadow-[#7CC4EB]/30 transition-all text-sm flex items-center justify-center gap-2"
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> ¡Cita confirmada! Te contactamos por WhatsApp
                </>
              ) : (
                <>
                  Agendar Cita <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Sidebar - Quick info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Contact card */}
            <div className="backdrop-blur-xl bg-white border border-[#D6E8F5] rounded-3xl p-8 space-y-6 shadow-xl">
              <h3 className="text-lg font-bold text-[#1A2E3D]">Contacto Directo</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7CC4EB]/15 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#5AB0E4]" />
                  </div>
                  <div>
                    <span className="text-xs text-[#5A7A94] block">WhatsApp / Llamada</span>
                    <span className="text-sm text-[#1A2E3D] font-semibold">+51 970 998 860</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F7B8D1]/30 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-[#945A7A]" />
                  </div>
                  <div>
                    <span className="text-xs text-[#5A7A94] block">Horario de atención</span>
                    <span className="text-sm text-[#1A2E3D] font-semibold">Lun - Vie: 8:00 AM - 6:00 PM</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-xs text-[#5A7A94] block">Métodos de pago</span>
                    <span className="text-sm text-[#1A2E3D] font-semibold">Yape / Plim / Tarjetas / Transferencia</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment options */}
            <div className="backdrop-blur-xl bg-white border border-[#D6E8F5] rounded-3xl p-8 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-[#1A2E3D]">Facilidades de Pago</h3>
              <div className="space-y-3">
                <div className="bg-[#F0F7FF] border border-[#D6E8F5] rounded-xl p-4">
                  <span className="text-[10px] font-bold text-[#5AB0E4] tracking-widest uppercase">Contado</span>
                  <p className="text-sm text-[#1A2E3D] font-bold mt-1">5% de descuento inmediato</p>
                </div>
                <div className="bg-[#F0F7FF] border border-[#D6E8F5] rounded-xl p-4">
                  <span className="text-[10px] font-bold text-[#945A7A] tracking-widest uppercase">Fraccionado</span>
                  <p className="text-sm text-[#1A2E3D] font-bold mt-1">Hasta 3 cuotas sin interés</p>
                </div>
              </div>
            </div>

            {/* CTA WhatsApp */}
            <motion.a
              href="https://wa.me/51970998860"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl text-center transition-all shadow-lg shadow-emerald-600/20"
            >
              💬 Enviar mensaje por WhatsApp
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

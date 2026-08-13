import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { api } from '../../lib/api.ts';

const services = [
  'Odontopediatría', 'Endodoncia', 'Implantes Dentales', 
  'Cirugías Dentales', 'Rehabilitación Oral', 'Ortodoncia'
];
const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export default function AppointmentsPage() {
  const location = useLocation();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appointmentMsg, setAppointmentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    patient_id: '',
    service: (location.state as any)?.service || '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });

  useEffect(() => {
    api('/patients').then(res => {
      setPatients(res.patients || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAppointmentMsg(null);
    try {
      await api('/appointments', {
        method: 'POST',
        body: form,
      });
      setAppointmentMsg({ type: 'success', text: 'Cita registrada exitosamente.' });
      setForm({ patient_id: '', service: '', appointment_date: '', appointment_time: '', notes: '' });
    } catch (err) {
      setAppointmentMsg({ type: 'error', text: (err as Error).message || 'Error al registrar la cita.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#7CC4EB] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-bold text-[#1A2E3D] mb-6">Agendar Cita</h2>

      <AnimatePresence>
        {appointmentMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-6 px-5 py-3 rounded-xl text-sm font-medium border ${
              appointmentMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-red-500/10 text-red-600 border-red-500/20'
            }`}
          >
            {appointmentMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="bg-white border border-[#D6E8F5] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <label className="text-xs font-bold text-[#5A7A94] uppercase tracking-widest block mb-2">Paciente</label>
          <select
            value={form.patient_id}
            onChange={(e) => setForm((f) => ({ ...f, patient_id: e.target.value }))}
            required
            className="w-full bg-[#F0F7FF] border border-[#D6E8F5] rounded-xl px-4 py-3 text-sm text-[#1A2E3D] focus:outline-none focus:border-[#7CC4EB] transition-colors appearance-none"
          >
            <option value="">Seleccionar paciente</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-[#5A7A94] uppercase tracking-widest block mb-2">Servicio</label>
          <select
            value={form.service}
            onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
            required
            className="w-full bg-[#F0F7FF] border border-[#D6E8F5] rounded-xl px-4 py-3 text-sm text-[#1A2E3D] focus:outline-none focus:border-[#7CC4EB] transition-colors appearance-none"
          >
            <option value="">Seleccionar servicio</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-[#5A7A94] uppercase tracking-widest block mb-2">Fecha</label>
            <input
              type="date"
              value={form.appointment_date}
              onChange={(e) => setForm((f) => ({ ...f, appointment_date: e.target.value }))}
              required
              className="w-full bg-[#F0F7FF] border border-[#D6E8F5] rounded-xl px-4 py-3 text-sm text-[#1A2E3D] focus:outline-none focus:border-[#7CC4EB] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#5A7A94] uppercase tracking-widest block mb-2">Hora</label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, appointment_time: slot }))}
                  className={`py-2 rounded-lg text-xs font-medium transition-all ${
                    form.appointment_time === slot
                      ? 'bg-[#7CC4EB] text-white shadow-md'
                      : 'bg-[#F0F7FF] text-[#5A7A94] border border-[#D6E8F5] hover:bg-[#E8F2FA]'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#5A7A94] uppercase tracking-widest block mb-2">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Motivo de la consulta, síntomas, etc."
            className="w-full bg-[#F0F7FF] border border-[#D6E8F5] rounded-xl px-4 py-3 text-sm text-[#1A2E3D] placeholder:text-[#5A7A94]/60 focus:outline-none focus:border-[#7CC4EB] transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7CC4EB] to-[#5AB0E4] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? 'Agendando...' : 'Agendar Cita'}
        </button>
      </form>
    </motion.div>
  );
}

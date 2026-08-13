import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../lib/api.ts';
import { Calendar, Check, Clock } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await api('/appointments');
      setAppointments(res.appointments || []);
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api(`/appointments/${id}/status`, { method: 'PATCH', body: { status } });
      loadData();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Citas Registradas ({appointments.length})</h3>
      </div>
      {appointments.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No hay citas registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">{a.patient_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    a.status === 'confirmada' ? 'bg-emerald-500/20 text-emerald-300' :
                    a.status === 'pendiente' ? 'bg-amber-500/20 text-amber-300' :
                    a.status === 'cancelada' ? 'bg-red-500/20 text-red-300' :
                    'bg-cyan-500/20 text-cyan-300'
                  }`}>{a.status}</span>
                </div>
                <span className="text-xs text-slate-400">{a.service} • {a.appointment_date} {a.appointment_time}</span>
                {a.notes && <p className="text-xs text-slate-500 mt-1">{a.notes}</p>}
              </div>
              <div className="flex gap-2">
                {a.status === 'pendiente' && (
                  <>
                    <button onClick={() => updateStatus(a.id, 'confirmada')}
                      className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition">
                      <Check className="w-3 h-3 inline mr-1" />Confirmar
                    </button>
                    <button onClick={() => updateStatus(a.id, 'cancelada')}
                      className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition">
                      Cancelar
                    </button>
                  </>
                )}
                {a.status === 'confirmada' && (
                  <button onClick={() => updateStatus(a.id, 'completada')}
                    className="bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-cyan-500/30 transition">
                    Completar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

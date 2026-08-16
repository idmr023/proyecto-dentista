import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../lib/api.ts';
import { Calendar, Check, Clock, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const WEEKDAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

const statusBadge: Record<string, string> = {
  confirmada: 'bg-emerald-500/20 text-emerald-300',
  pendiente: 'bg-amber-500/20 text-amber-300',
  cancelada: 'bg-red-500/20 text-red-300',
  completada: 'bg-cyan-500/20 text-cyan-300',
};

const statusDot: Record<string, string> = {
  confirmada: 'bg-emerald-400',
  pendiente: 'bg-amber-400',
  cancelada: 'bg-red-400',
  completada: 'bg-cyan-400',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMonth, setViewMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const byDate = useCallback((date: string | null) =>
    appointments.filter(a => a.appointment_date === date),
    [appointments]);

  const visible = selectedDate ? byDate(selectedDate) : appointments;

  // ── Construir celdas del mes (semana inicia lunes) ──
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(i + 1).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    }),
  ];

  const todayStr = new Date().toISOString().slice(0, 10);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Citas Registradas ({appointments.length})</h3>
        {selectedDate && (
          <button onClick={() => setSelectedDate(null)} className="bg-white/[0.05] text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/[0.08] transition">
            <CalendarDays className="w-3 h-3 inline mr-1" />Ver todas
          </button>
        )}
      </div>

      {/* ── Calendario mensual ── */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setViewMonth(new Date(year, month - 1, 1))}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 flex items-center justify-center transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white">{MONTHS[month]} {year}</span>
          <button onClick={() => setViewMonth(new Date(year, month + 1, 1))}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 flex items-center justify-center transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {WEEKDAYS.map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-500">{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((date, idx) => {
            if (!date) return <div key={`blank-${idx}`} />;
            const dayApps = byDate(date);
            const isSelected = date === selectedDate;
            const isToday = date === todayStr;
            return (
              <button key={date} onClick={() => setSelectedDate(isSelected ? null : date)}
                className={`relative min-h-[56px] rounded-xl border p-1.5 flex flex-col items-center gap-1 transition ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/15'
                    : dayApps.length
                      ? 'border-cyan-500/30 bg-white/[0.03] hover:bg-white/[0.07]'
                      : 'border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.05]'
                }`}>
                <span className={`text-xs font-bold ${isToday ? 'text-cyan-300' : 'text-slate-300'}`}>
                  {Number(date.slice(8, 10))}
                </span>
                {dayApps.length > 0 && (
                  <div className="flex gap-1 flex-wrap justify-center">
                    {dayApps.slice(0, 3).map(a => (
                      <span key={a.id} className={`w-1.5 h-1.5 rounded-full ${statusDot[a.status] || 'bg-slate-500'}`} />
                    ))}
                    {dayApps.length > 3 && <span className="text-[9px] text-slate-400 leading-none">+{dayApps.length - 3}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Lista de citas (filtrada por día) ── */}
      {selectedDate && (
        <p className="text-xs text-slate-400 font-semibold">
          Citas del <span className="text-cyan-300">{selectedDate}</span> ({byDate(selectedDate).length})
        </p>
      )}
      {visible.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No hay citas registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(a => (
            <div key={a.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">{a.patient_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusBadge[a.status] || 'bg-slate-500/20 text-slate-300'}`}>{a.status}</span>
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

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, FileText, Save, Stethoscope, User } from 'lucide-react';
import { api } from '../../lib/api.ts';
import OdontogramChart from '../odontogram/OdontogramChart.tsx';
import { ToothMark } from '../odontogram/ToothSVG.tsx';

interface HistoriaPatient {
  id: string; name: string; phone: string; email: string; birth_date: string; notes: string; created_at: string;
}

interface HistoriaAppointment {
  id: string; patient_id: string; service: string; appointment_date: string; appointment_time: string;
  status: string; notes: string; patient_name: string; patient_phone: string;
}

type Tab = 'resumen' | 'odontograma' | 'citas';

export default function HistoriaClinica({ patient, appointments, onClose, onSaved }: {
  patient: HistoriaPatient;
  appointments: HistoriaAppointment[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tab, setTab] = useState<Tab>('resumen');
  const [notes, setNotes] = useState(patient.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [marks, setMarks] = useState<Record<number, ToothMark[]>>({});
  const [marksLoaded, setMarksLoaded] = useState(false);
  const [error, setError] = useState('');

  const patientAppointments = appointments.filter(a => a.patient_id === patient.id);

  useEffect(() => {
    if (tab !== 'odontograma' || marksLoaded) return;
    api(`/patients/${patient.id}/odontogram`).then(data => {
      const m: Record<number, ToothMark[]> = {};
      for (const mark of (data.marks as any[]) || []) {
        if (!m[mark.tooth_id]) m[mark.tooth_id] = [];
        m[mark.tooth_id].push({ tool: mark.tool, face: mark.face || 'all' });
      }
      setMarks(m);
      setMarksLoaded(true);
    }).catch(() => setMarksLoaded(true));
  }, [tab, marksLoaded, patient.id]);

  const saveNotes = async () => {
    setSavingNotes(true);
    setError('');
    try {
      await api(`/patients/${patient.id}`, {
        method: 'PUT',
        body: {
          name: patient.name, phone: patient.phone, email: patient.email,
          birth_date: patient.birth_date, notes,
        },
      });
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Error al guardar');
    }
    setSavingNotes(false);
  };

  const statusColor = (s: string) =>
    s === 'confirmada' ? 'bg-emerald-500/20 text-emerald-300' :
    s === 'pendiente' ? 'bg-amber-500/20 text-amber-300' :
    s === 'cancelada' ? 'bg-red-500/20 text-red-300' :
    'bg-cyan-500/20 text-cyan-300';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-slate-900 border border-white/[0.08] rounded-3xl p-6 w-full max-w-2xl space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Historia Clínica</h3>
              <span className="text-xs text-slate-400">{patient.name}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition text-xl leading-none">&times;</button>
        </div>

        <div className="flex gap-2">
          {([
            { id: 'resumen', label: 'Resumen', icon: User },
            { id: 'odontograma', label: 'Odontograma', icon: Stethoscope },
            { id: 'citas', label: `Citas (${patientAppointments.length})`, icon: Calendar },
          ] as { id: Tab; label: string; icon: any }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                tab === t.id ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'text-slate-400 border-white/[0.06] bg-white/[0.02] hover:text-white'
              }`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'resumen' && (
            <motion.div key="resumen" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  ['Teléfono', patient.phone],
                  ['Email', patient.email || '—'],
                  ['Nacimiento', patient.birth_date || '—'],
                  ['Registrado', new Date(patient.created_at).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">{k}</span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Historial / Notas
                </label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
                  placeholder="Historial, tratamientos, alergias..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40 transition resize-none" />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">{error}</div>}
              <button onClick={saveNotes} disabled={savingNotes}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> {savingNotes ? 'Guardando...' : 'Guardar historial'}
              </button>
            </motion.div>
          )}

          {tab === 'odontograma' && (
            <motion.div key="odontograma" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
              {!marksLoaded ? (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 text-center text-sm text-slate-400">Cargando odontograma...</div>
              ) : (
                <>
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-4 backdrop-blur-xl">
                    <OdontogramChart marks={marks} readOnly />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                    <span>Cubitos por cara:</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-[#ef4444] inline-block" /> Caries</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-[#3b82f6] inline-block" /> Obturado</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-[#f59e0b] inline-block" /> Corona</span>
                    <span className="ml-2">Pieza: <span className="text-slate-400">✕ Ausente · ✕ roja Extracción · ▲ Implante</span></span>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {tab === 'citas' && (
            <motion.div key="citas" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
              {patientAppointments.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 text-center text-sm text-slate-400">Sin citas registradas</div>
              ) : (
                patientAppointments.map(a => (
                  <div key={a.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">{a.service}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(a.status)}`}>{a.status}</span>
                    </div>
                    <span className="text-xs text-slate-400">{a.appointment_date} {a.appointment_time}</span>
                    {a.notes && <p className="text-xs text-slate-500 mt-1">{a.notes}</p>}
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

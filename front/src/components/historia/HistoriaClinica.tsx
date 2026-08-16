import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, FileText, Plus, Stethoscope, Trash2, User } from 'lucide-react';
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

interface MedicalHistory {
  id: string; patient_id: string; treatment: string;
  total: number; paid: number; balance: number;
  signature: string; observations: string; created_at: string;
}

const formatSoles = (n: number) =>
  `S/ ${Number(n || 0).toFixed(2)}`;

export default function HistoriaClinica({ patient, appointments, onClose, onSaved }: {
  patient: HistoriaPatient;
  appointments: HistoriaAppointment[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tab, setTab] = useState<Tab>('resumen');
  const [marks, setMarks] = useState<Record<number, ToothMark[]>>({});
  const [marksLoaded, setMarksLoaded] = useState(false);
  const [error, setError] = useState('');

  // Tratamientos / historia médica real
  const [histories, setHistories] = useState<MedicalHistory[]>([]);
  const [historiesLoaded, setHistoriesLoaded] = useState(false);
  const [showNewTreatment, setShowNewTreatment] = useState(false);
  const [tForm, setTForm] = useState({ treatment: '', total: '', paid: '', signature: '', observations: '' });
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [savingHistory, setSavingHistory] = useState(false);

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

  useEffect(() => {
    if (tab !== 'resumen' || historiesLoaded) return;
    api(`/medical-histories/${patient.id}`).then(data => {
      setHistories(data.histories || []);
      setHistoriesLoaded(true);
    }).catch(() => setHistoriesLoaded(true));
  }, [tab, historiesLoaded, patient.id]);

  const addTreatment = async () => {
    const total = parseFloat(tForm.total);
    const paid = parseFloat(tForm.paid || '0') || 0;
    if (!tForm.treatment.trim()) { setError('Ingresa el nombre del tratamiento.'); return; }
    if (isNaN(total) || total <= 0) { setError('Ingresa un total válido.'); return; }
    if (paid > total) { setError('El monto "a cuenta" no puede exceder el total.'); return; }
    setSavingHistory(true);
    setError('');
    try {
      await api('/medical-histories', {
        method: 'POST',
        body: {
          patient_id: patient.id,
          treatment: tForm.treatment.trim(),
          total,
          paid,
          signature: tForm.signature.trim(),
          observations: tForm.observations.trim(),
        },
      });
      setTForm({ treatment: '', total: '', paid: '', signature: '', observations: '' });
      setShowNewTreatment(false);
      const data = await api(`/medical-histories/${patient.id}`);
      setHistories(data.histories || []);
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Error al guardar el tratamiento.');
    }
    setSavingHistory(false);
  };

  const payTreatment = async (id: string) => {
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) { setError('Ingresa un monto de abono válido.'); return; }
    setSavingHistory(true);
    setError('');
    try {
      await api(`/medical-histories/${id}`, { method: 'PATCH', body: { paid: amount } });
      setPayingId(null);
      setPayAmount('');
      const data = await api(`/medical-histories/${patient.id}`);
      setHistories(data.histories || []);
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Error al registrar el abono.');
    }
    setSavingHistory(false);
  };

  const deleteTreatment = async (id: string) => {
    if (!confirm('¿Eliminar este tratamiento?')) return;
    try {
      await api(`/medical-histories/${id}`, { method: 'DELETE' });
      setHistories(h => h.filter(x => x.id !== id));
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Error al eliminar.');
    }
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
            { id: 'resumen', label: 'Historia', icon: User },
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

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Tratamientos realizados
                </span>
                <button onClick={() => { setShowNewTreatment(v => !v); setError(''); }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition">
                  <Plus className="w-3.5 h-3.5" /> Nuevo Tratamiento
                </button>
              </div>

              {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">{error}</div>}

              {showNewTreatment && (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input value={tForm.treatment} onChange={e => setTForm(f => ({ ...f, treatment: e.target.value }))}
                      placeholder="Tratamiento realizado *"
                      className="sm:col-span-3 w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40" />
                    <input type="number" min="0" step="0.01" value={tForm.total} onChange={e => setTForm(f => ({ ...f, total: e.target.value }))}
                      placeholder="Total (S/) *"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40" />
                    <input type="number" min="0" step="0.01" value={tForm.paid} onChange={e => setTForm(f => ({ ...f, paid: e.target.value }))}
                      placeholder="A cuenta (S/)"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40" />
                    <input value={tForm.signature} onChange={e => setTForm(f => ({ ...f, signature: e.target.value }))}
                      placeholder="Firma del paciente"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40" />
                    <textarea value={tForm.observations} onChange={e => setTForm(f => ({ ...f, observations: e.target.value }))}
                      placeholder="Observaciones" rows={2}
                      className="sm:col-span-3 w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none" />
                  </div>
                  <button onClick={addTreatment} disabled={savingHistory}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50">
                    {savingHistory ? 'Guardando...' : 'Guardar tratamiento'}
                  </button>
                </div>
              )}

              {!historiesLoaded ? (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 text-center text-sm text-slate-400">Cargando historia clínica...</div>
              ) : histories.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 text-center text-sm text-slate-400">Sin tratamientos registrados</div>
              ) : (
                <div className="overflow-x-auto bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                  <table className="w-full text-left text-xs min-w-[720px]">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[10px] uppercase text-slate-500">
                        <th className="px-3 py-2.5">Tratamiento realizado</th>
                        <th className="px-3 py-2.5 text-right">Total</th>
                        <th className="px-3 py-2.5 text-right">A cuenta</th>
                        <th className="px-3 py-2.5 text-right">Saldo</th>
                        <th className="px-3 py-2.5">Observaciones</th>
                        <th className="px-3 py-2.5">Firma del paciente</th>
                        <th className="px-3 py-2.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {histories.map(h => (
                        <tr key={h.id} className="border-b border-white/[0.04] last:border-0 align-top">
                          <td className="px-3 py-3">
                            <span className="font-bold text-white">{h.treatment}</span>
                            <span className={`ml-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${h.balance > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                              {h.balance > 0 ? 'Pendiente' : 'Pagado'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right text-white font-semibold whitespace-nowrap">{formatSoles(h.total)}</td>
                          <td className="px-3 py-3 text-right text-emerald-300 font-semibold whitespace-nowrap">{formatSoles(h.paid)}</td>
                          <td className={`px-3 py-3 text-right font-bold whitespace-nowrap ${h.balance > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>{formatSoles(h.balance)}</td>
                          <td className="px-3 py-3 text-slate-400 max-w-[180px]">{h.observations || '—'}</td>
                          <td className="px-3 py-3 text-slate-300 italic font-semibold">{h.signature || '—'}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              {h.balance > 0 && (
                                payingId === h.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <input type="number" min="0" step="0.01" autoFocus value={payAmount}
                                      onChange={e => setPayAmount(e.target.value)}
                                      placeholder={`S/ ${h.balance.toFixed(2)}`}
                                      className="w-24 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500/40" />
                                    <button onClick={() => payTreatment(h.id)} disabled={savingHistory}
                                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition disabled:opacity-50">
                                      Abonar
                                    </button>
                                    <button onClick={() => { setPayingId(null); setPayAmount(''); }} className="text-slate-400 hover:text-white text-[11px] font-semibold">✕</button>
                                  </div>
                                ) : (
                                  <button onClick={() => { setPayingId(h.id); setPayAmount(''); setError(''); }}
                                    className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold hover:bg-emerald-500/25 transition">
                                    Abonar
                                  </button>
                                )
                              )}
                              <button onClick={() => deleteTreatment(h.id)} className="text-red-400 hover:text-red-300 transition" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

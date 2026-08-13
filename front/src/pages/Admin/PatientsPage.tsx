import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api.ts';
import { Users, Plus, FileText, Edit2, Trash2 } from 'lucide-react';
import HistoriaClinica from '../../components/historia/HistoriaClinica.tsx';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [historiaPatient, setHistoriaPatient] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      const [pRes, aRes] = await Promise.all([
        api('/patients').catch(() => ({ patients: [] })),
        api('/appointments').catch(() => ({ appointments: [] })),
      ]);
      setPatients(pRes.patients || []);
      setAppointments(aRes.appointments || []);
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Pacientes ({patients.length})</h3>
        <button onClick={() => { setEditingPatient(null); setShowPatientModal(true); }}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
          <Plus className="w-3.5 h-3.5" /> Nuevo Paciente
        </button>
      </div>
      {patients.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No hay pacientes registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map(p => (
            <div key={p.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                {p.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-white block">{p.name}</span>
                <span className="text-xs text-slate-400">{p.phone} • {p.email}</span>
                {p.notes && <p className="text-xs text-slate-500 mt-1 truncate">{p.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setHistoriaPatient(p)}
                  className="bg-cyan-500/10 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-cyan-500/20 transition">
                  <FileText className="w-3 h-3 inline mr-1" />Historia
                </button>
                <button onClick={() => { setEditingPatient(p); setShowPatientModal(true); }}
                  className="bg-white/[0.05] text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/[0.08] transition">
                  <Edit2 className="w-3 h-3 inline mr-1" />Editar
                </button>
                <button onClick={async () => { if (confirm('¿Eliminar paciente?')) { await api(`/patients/${p.id}`, { method: 'DELETE' }); loadData(); } }}
                  className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition">
                  <Trash2 className="w-3 h-3 inline" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Modal */}
      <AnimatePresence>
        {showPatientModal && (
          <PatientModal
            patient={editingPatient}
            onClose={() => setShowPatientModal(false)}
            onSaved={() => { setShowPatientModal(false); loadData(); }}
          />
        )}
      </AnimatePresence>

      {/* Historia Clinica Modal */}
      <AnimatePresence>
        {historiaPatient && (
          <HistoriaClinica
            patient={historiaPatient}
            appointments={appointments}
            onClose={() => setHistoriaPatient(null)}
            onSaved={() => loadData()}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PatientModal({ patient, onClose, onSaved }: { patient: any; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(patient?.name || '');
  const [phone, setPhone] = useState(patient?.phone || '');
  const [email, setEmail] = useState(patient?.email || '');
  const [birthDate, setBirthDate] = useState(patient?.birth_date || '');
  const [notes, setNotes] = useState(patient?.notes || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { setError('Nombre y teléfono son requeridos.'); return; }
    setSaving(true);
    try {
      const body = { name: name.trim(), phone: phone.trim(), email, birth_date: birthDate, notes };
      if (patient) {
        await api(`/patients/${patient.id}`, { method: 'PUT', body });
      } else {
        await api('/patients', { method: 'POST', body });
      }
      onSaved();
    } catch (e: any) { setError(e.message || 'Error al guardar'); }
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-slate-900 border border-white/[0.08] rounded-3xl p-8 w-full max-w-lg space-y-5 shadow-2xl">
        <h3 className="text-lg font-bold text-white">{patient ? 'Editar' : 'Nuevo'} Paciente</h3>
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre *"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono *"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40" />
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40" />
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas" rows={2}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/[0.05] text-slate-400 py-3 rounded-xl text-sm font-semibold hover:bg-white/[0.08]">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

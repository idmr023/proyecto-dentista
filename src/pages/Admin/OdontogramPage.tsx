import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../client/lib/api.ts';
import { Stethoscope } from 'lucide-react';
import OdontogramChart from '../../client/components/odontogram/OdontogramChart.tsx';
import { ToothMark, FACE_TOOLS } from '../../client/components/odontogram/ToothSVG.tsx';

export default function OdontogramPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [toothMarks, setToothMarks] = useState<Record<number, ToothMark[]>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/patients').then(res => {
      setPatients(res.patients || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPatientId) { setToothMarks({}); return; }
    api(`/patients/${selectedPatientId}/odontogram`).then(data => {
      const marks: Record<number, ToothMark[]> = {};
      for (const m of data.marks as any[]) {
        if (!marks[m.tooth_id]) marks[m.tooth_id] = [];
        marks[m.tooth_id].push({ tool: m.tool, face: m.face || 'all' });
      }
      setToothMarks(marks);
    }).catch(() => setToothMarks({}));
  }, [selectedPatientId]);

  const cycleFace = (toothNum: number, face: string) => {
    setToothMarks(prev => {
      const current = prev[toothNum] || [];
      const order: (string | null)[] = [null, ...FACE_TOOLS];
      const currentTool = current.find(m => m.face === face && FACE_TOOLS.includes(m.tool))?.tool ?? null;
      const next = order[(order.indexOf(currentTool) + 1) % order.length];
      const rest = current.filter(m => !(m.face === face && FACE_TOOLS.includes(m.tool)));
      if (next) rest.push({ tool: next, face });
      return { ...prev, [toothNum]: rest };
    });
  };

  const cycleWhole = (toothNum: number) => {
    setToothMarks(prev => {
      const current = prev[toothNum] || [];
      const order: (string | null)[] = [null, 'missing', 'extraction', 'implant'];
      const currentTool = current.find(m => m.face === 'all')?.tool ?? null;
      const next = order[(order.indexOf(currentTool) + 1) % order.length];
      const rest = current.filter(m => m.face !== 'all');
      if (next) rest.push({ tool: next, face: 'all' });
      return { ...prev, [toothNum]: rest };
    });
  };

  const saveOdontogram = async () => {
    if (!selectedPatientId) return;
    setSaving(true);
    const marks = Object.entries(toothMarks).flatMap(([tid, list]) =>
      list.map(m => ({ tooth_id: parseInt(tid), tool: m.tool, face: m.face }))
    );
    try {
      await api(`/patients/${selectedPatientId}/odontogram`, { method: 'PUT', body: { marks } });
    } catch (e) { console.error('Save odontogram error:', e); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-slate-400">Paciente:</span>
        <select value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white outline-none">
          <option value="" className="bg-slate-900">Seleccionar paciente...</option>
          {patients.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
        </select>
        {selectedPatientId && (
          <button onClick={saveOdontogram} disabled={saving}
            className="ml-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50">
            {saving ? 'Guardando...' : '💾 Guardar'}
          </button>
        )}
      </div>

      {!selectedPatientId && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Stethoscope className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Selecciona un paciente para ver y editar su odontograma</p>
        </div>
      )}

      {selectedPatientId && (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 md:p-10 backdrop-blur-xl">
          <OdontogramChart marks={toothMarks}
            onFaceCycle={(toothId, face) => cycleFace(toothId, face)}
            onBodyCycle={(toothId) => cycleWhole(toothId)} />
          <div className="flex flex-wrap items-center gap-3 mt-4 text-[10px] text-slate-500">
            <span className="font-bold text-slate-400">Cubitos por cara:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-[#ef4444] inline-block" /> Caries</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-[#3b82f6] inline-block" /> Obturado</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-[#f59e0b] inline-block" /> Corona</span>
            <span className="ml-2">Clic en el cubito = marcar cara · Clic en la pieza:</span>
            <span>✕ Ausente · <span className="text-red-400">✕ Extracción</span> · <span className="text-emerald-400">▲ Implante</span></span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../client/lib/api.ts';
import { 
  Users, Calendar, Clock, DollarSign, 
  Stethoscope, Package 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api('/stats').then(res => {
      setStats(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pacientes', value: stats?.totalPatients || 0, icon: Users, color: 'text-white' },
          { label: 'Citas Hoy', value: stats?.todayAppointments || 0, icon: Calendar, color: 'text-cyan-400' },
          { label: 'Citas Pendientes', value: stats?.pendingAppointments || 0, icon: Clock, color: 'text-amber-400' },
          { label: 'Ingresos Mes', value: `S/. ${(stats?.monthRevenue || 0).toFixed(0)}`, icon: DollarSign, color: 'text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">{s.label}</span>
              <s.icon className="w-4 h-4 text-slate-600" />
            </div>
            <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => navigate('/admin/odontograma')} className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-left hover:bg-cyan-500/15 transition group">
            <Stethoscope className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition" />
            <span className="text-sm font-bold text-white block">Odontograma</span>
            <span className="text-[10px] text-slate-400">Explorador dental por paciente</span>
          </button>
          <button onClick={() => navigate('/admin/pacientes')} className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-left hover:bg-violet-500/15 transition group">
            <Users className="w-6 h-6 text-violet-400 mb-2 group-hover:scale-110 transition" />
            <span className="text-sm font-bold text-white block">Pacientes</span>
            <span className="text-[10px] text-slate-400">Gestionar base de datos</span>
          </button>
          <button onClick={() => navigate('/admin/citas')} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-left hover:bg-emerald-500/15 transition group">
            <Calendar className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition" />
            <span className="text-sm font-bold text-white block">Citas</span>
            <span className="text-[10px] text-slate-400">Control de agenda</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { Logo } from '../components/ui/Logo.tsx';
import {
  LayoutDashboard, Stethoscope, Calendar, ShoppingBag,
  FileText, Users, Settings, LogOut, ChevronRight, Menu, X,
  Plus, Trash2, Edit2, Check, Clock, AlertCircle, UserPlus,
  TrendingUp, DollarSign, Package, Eye
} from 'lucide-react';
import OdontogramChart from '../components/odontogram/OdontogramChart.tsx';
import { ToothMark, FACE_TOOLS } from '../components/odontogram/ToothSVG.tsx';
import HistoriaClinica from '../components/historia/HistoriaClinica.tsx';

/* ═══════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════ */

type View = 'dashboard' | 'odontogram' | 'patients' | 'appointments' | 'users' | 'orders';

interface Patient { id: string; name: string; phone: string; email: string; birth_date: string; notes: string; created_at: string; }
interface Appointment { id: string; patient_id: string; service: string; appointment_date: string; appointment_time: string; status: string; notes: string; patient_name: string; patient_phone: string; }
interface AppUser { id: string; name: string; email: string; role: string; is_active: number; created_at: string; }
interface Product { id: string; name: string; description: string; price: number; stock: number; }
interface Order { id: string; user_id: string; user_name?: string; user_email?: string; total: number; status: string; created_at: string; items: any[]; }
interface Stats { totalPatients: number; totalUsers: number; totalProducts: number; todayAppointments: number; pendingAppointments: number; totalRevenue: number; monthOrders: number; monthRevenue: number; activeTreatments: number; }

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [stats, setStats] = useState<Stats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Odontogram
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [toothMarks, setToothMarks] = useState<Record<number, ToothMark[]>>({});
  const [savingOdontogram, setSavingOdontogram] = useState(false);

  // Modals
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [historiaPatient, setHistoriaPatient] = useState<Patient | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [s, p, a, u, o, pr] = await Promise.all([
        api('/stats').catch(() => null),
        api('/patients').catch(() => ({ patients: [] })),
        api('/appointments').catch(() => ({ appointments: [] })),
        api('/users').catch(() => ({ users: [] })),
        api('/orders').catch(() => ({ orders: [] })),
        api('/products').catch(() => ({ products: [] })),
      ]);
      if (s) setStats(s);
      setPatients(p.patients || []);
      setAppointments(a.appointments || []);
      setUsers(u.users || []);
      setOrders(o.orders || []);
      setProducts(pr.products || []);
    } catch (e) { console.error('Load data error:', e); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Load odontogram when patient selected
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
    setSavingOdontogram(true);
    const marks = Object.entries(toothMarks).flatMap(([tid, list]) =>
      list.map(m => ({ tooth_id: parseInt(tid), tool: m.tool, face: m.face }))
    );
    try {
      await api(`/patients/${selectedPatientId}/odontogram`, { method: 'PUT', body: { marks } });
    } catch (e) { console.error('Save odontogram error:', e); }
    setSavingOdontogram(false);
  };

  const navItems: { id: View; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Panel General', icon: LayoutDashboard },
    { id: 'odontogram', label: 'Odontograma', icon: Stethoscope },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'users', label: 'Usuarios', icon: UserPlus },
    { id: 'orders', label: 'Compras', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/[0.06] transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 h-20 border-b border-white/[0.06]">
          <Logo size="md" />
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeView === item.id ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-300">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-white block truncate">{user?.name}</span>
              <span className="text-[10px] text-cyan-400 capitalize">{user?.role}</span>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-red-400 transition" title="Cerrar sesión">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 min-h-screen">
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white"><Menu className="w-5 h-5" /></button>
            <h2 className="text-sm font-bold text-white">{navItems.find(n => n.id === activeView)?.label}</h2>
          </div>
          <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full font-semibold">
            👑 {user?.role === 'admin' ? 'Administrador' : 'Colaborador'}
          </span>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* ─── DASHBOARD ─── */}
            {activeView === 'dashboard' && stats && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Pacientes', value: stats.totalPatients, icon: Users, color: 'text-white' },
                    { label: 'Citas Hoy', value: stats.todayAppointments, icon: Calendar, color: 'text-cyan-400' },
                    { label: 'Citas Pendientes', value: stats.pendingAppointments, icon: Clock, color: 'text-amber-400' },
                    { label: 'Ingresos Mes', value: `S/. ${stats.monthRevenue.toFixed(0)}`, icon: DollarSign, color: 'text-emerald-400' },
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
                    <button onClick={() => setActiveView('odontogram')} className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-left hover:bg-cyan-500/15 transition group">
                      <Stethoscope className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition" />
                      <span className="text-sm font-bold text-white block">Odontograma</span>
                      <span className="text-[10px] text-slate-400">Explorador dental por paciente</span>
                    </button>
                    <button onClick={() => setActiveView('patients')} className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-left hover:bg-violet-500/15 transition group">
                      <Users className="w-6 h-6 text-violet-400 mb-2 group-hover:scale-110 transition" />
                      <span className="text-sm font-bold text-white block">Pacientes</span>
                      <span className="text-[10px] text-slate-400">{patients.length} registrados</span>
                    </button>
                    <button onClick={() => setActiveView('appointments')} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-left hover:bg-emerald-500/15 transition group">
                      <Calendar className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition" />
                      <span className="text-sm font-bold text-white block">Citas</span>
                      <span className="text-[10px] text-slate-400">{appointments.length} totales</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── ODONTOGRAM ─── */}
            {activeView === 'odontogram' && (
              <motion.div key="odontogram" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">Paciente:</span>
                  <select value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white outline-none">
                    <option value="" className="bg-slate-900">Seleccionar paciente...</option>
                    {patients.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
                  </select>
                  {selectedPatientId && (
                    <button onClick={saveOdontogram} disabled={savingOdontogram}
                      className="ml-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50">
                      {savingOdontogram ? 'Guardando...' : '💾 Guardar'}
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
            )}

            {/* ─── APPOINTMENTS ─── */}
            {activeView === 'appointments' && (
              <motion.div key="appointments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Citas ({appointments.length})</h3>
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
                              <button onClick={async () => { await api(`/appointments/${a.id}/status`, { method: 'PATCH', body: { status: 'confirmada' } }); loadData(); }}
                                className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition">
                                <Check className="w-3 h-3 inline mr-1" />Confirmar
                              </button>
                              <button onClick={async () => { await api(`/appointments/${a.id}/status`, { method: 'PATCH', body: { status: 'cancelada' } }); loadData(); }}
                                className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition">
                                Cancelar
                              </button>
                            </>
                          )}
                          {a.status === 'confirmada' && (
                            <button onClick={async () => { await api(`/appointments/${a.id}/status`, { method: 'PATCH', body: { status: 'completada' } }); loadData(); }}
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
            )}

            {/* ─── PATIENTS ─── */}
            {activeView === 'patients' && (
              <motion.div key="patients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
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
              </motion.div>
            )}

            {/* ─── USERS ─── */}
            {activeView === 'users' && user?.role === 'admin' && (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Usuarios ({users.length})</h3>
                  <button onClick={() => { setEditingUser(null); setShowUserModal(true); }}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                    <UserPlus className="w-3.5 h-3.5" /> Crear Usuario
                  </button>
                </div>
                <div className="space-y-3">
                  {users.map(u => (
                    <div key={u.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                        u.role === 'admin' ? 'bg-cyan-500/20 text-cyan-300' :
                        u.role === 'colaborador' ? 'bg-violet-500/20 text-violet-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>{u.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{u.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            u.role === 'admin' ? 'bg-cyan-500/20 text-cyan-300' :
                            u.role === 'colaborador' ? 'bg-violet-500/20 text-violet-300' :
                            'bg-emerald-500/20 text-emerald-300'
                          }`}>{u.role}</span>
                          {!u.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">Inactivo</span>}
                        </div>
                        <span className="text-xs text-slate-400">{u.email}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingUser(u); setShowUserModal(true); }}
                          className="bg-white/[0.05] text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/[0.08] transition">
                          <Edit2 className="w-3 h-3 inline mr-1" />Editar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── ORDERS ─── */}
            {activeView === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-2">
                    <span className="text-xs text-slate-500 font-semibold">Total Pedidos</span>
                    <span className="text-3xl font-black text-white">{orders.length}</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-2">
                    <span className="text-xs text-slate-500 font-semibold">Ingresos Totales</span>
                    <span className="text-3xl font-black text-emerald-400">S/. {orders.reduce((s, o) => s + o.total, 0).toFixed(2)}</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-2">
                    <span className="text-xs text-slate-500 font-semibold">Productos Activos</span>
                    <span className="text-3xl font-black text-cyan-400">{products.length}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white">Pedidos Recientes</h3>
                {orders.length === 0 ? (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
                    <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No hay pedidos aún</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(o => (
                      <div key={o.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-sm font-bold text-white">{o.user_name || 'Cliente'}</span>
                            <span className="text-xs text-slate-500 ml-2">{o.user_email}</span>
                          </div>
                          <span className="text-lg font-black text-cyan-400">S/. {o.total.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">{new Date(o.created_at).toLocaleDateString()}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              o.status === 'pagada' ? 'bg-emerald-500/20 text-emerald-300' :
                              o.status === 'cancelada' ? 'bg-red-500/20 text-red-300' :
                              'bg-amber-500/20 text-amber-300'
                            }`}>{o.status}</span>
                            {o.items && <span className="text-[10px] text-slate-500">{o.items.length} ítems</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ─── PATIENT MODAL ─── */}
      <AnimatePresence>
        {showPatientModal && (
          <PatientModal
            patient={editingPatient}
            onClose={() => setShowPatientModal(false)}
            onSaved={() => { setShowPatientModal(false); loadData(); }}
          />
        )}
      </AnimatePresence>

      {/* ─── USER MODAL ─── */}
      <AnimatePresence>
        {showUserModal && (
          <UserModal
            user={editingUser}
            onClose={() => setShowUserModal(false)}
            onSaved={() => { setShowUserModal(false); loadData(); }}
          />
        )}
      </AnimatePresence>

      {/* ─── HISTORIA CLINICA ─── */}
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
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PATIENT MODAL
   ═══════════════════════════════════════════════════════ */

function PatientModal({ patient, onClose, onSaved }: { patient: Patient | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(patient?.name || '');
  const [phone, setPhone] = useState(patient?.phone || '');
  const [email, setEmail] = useState(patient?.email || '');
  const [birthDate, setBirthDate] = useState(patient?.birth_date || '');
  const [notes, setNotes] = useState(patient?.notes || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [nameErr, setNameErr] = useState('');

  const validateName = (v: string) => {
    if (v.length > 0 && /[0-9]/.test(v)) { setNameErr('No pueden haber números'); return false; }
    if (v.length > 0 && v.length < 2) { setNameErr('Mínimo 2 caracteres'); return false; }
    setNameErr('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(name) || !name.trim() || !phone.trim()) { setError('Nombre y teléfono son requeridos.'); return; }

    setSaving(true);
    setError('');
    try {
      const body = { name: name.trim(), phone: phone.trim(), email, birth_date: birthDate, notes };
      if (patient) {
        await api(`/patients/${patient.id}`, { method: 'PUT', body });
      } else {
        await api('/patients', { method: 'POST', body });
      }
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Error al guardar');
    }
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-slate-900 border border-white/[0.08] rounded-3xl p-8 w-full max-w-lg space-y-5 shadow-2xl">
        <h3 className="text-lg font-bold text-white">{patient ? 'Editar' : 'Nuevo'} Paciente</h3>
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Nombre *</label>
            <input value={name} onChange={e => { setName(e.target.value); validateName(e.target.value); }}
              className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm text-white outline-none transition ${nameErr ? 'border-red-500/40' : 'border-white/[0.08] focus:ring-2 focus:ring-cyan-500/40'}`} />
            {nameErr && <p className="text-[10px] text-red-400">{nameErr}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Teléfono *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+51 999 888 777"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40 transition" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="paciente@email.com"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40 transition" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Fecha de nacimiento</label>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40 transition cursor-pointer" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Historial, tratamientos, alergias..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40 transition resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-white/[0.05] text-slate-400 py-3 rounded-xl text-sm font-semibold hover:bg-white/[0.08] transition">Cancelar</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   USER MODAL
   ═══════════════════════════════════════════════════════ */

function UserModal({ user, onClose, onSaved }: { user: AppUser | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(user?.role || 'cliente');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    const errs = { ...fieldErrors };
    if (field === 'name') {
      if (value.length > 0 && /[0-9]/.test(value)) errs.name = 'No pueden haber números';
      else if (value.length > 0 && value.length < 2) errs.name = 'Mínimo 2 caracteres';
      else delete errs.name;
    }
    if (field === 'email') {
      if (value.length > 0 && !value.includes('@')) errs.email = 'Debe contener un @';
      else if (value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errs.email = 'Correo inválido';
      else delete errs.email;
    }
    if (field === 'password' && !user) {
      if (value.length > 0 && value.length < 8) errs.password = 'Mínimo 8 caracteres';
      else if (value.length > 0 && !/[a-zA-Z]/.test(value)) errs.password = 'Debe contener letras';
      else if (value.length > 0 && !/[0-9]/.test(value)) errs.password = 'Debe contener números';
      else delete errs.password;
    }
    if (field === 'confirmPassword') {
      if (value !== password) errs.confirmPassword = 'No coinciden';
      else delete errs.confirmPassword;
    }
    setFieldErrors(errs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    ['name', 'email', 'password', 'confirmPassword'].forEach(f => {
      const v = f === 'name' ? name : f === 'email' ? email : f === 'password' ? password : confirmPassword;
      validateField(f, v);
    });

    if (!name.trim() || !email.trim()) { setError('Nombre y email son requeridos.'); return; }
    if (!user && (!password || password !== confirmPassword)) { setError('La contraseña es requerida y debe coincidir.'); return; }
    if (Object.keys(fieldErrors).length > 0) { setError('Corrige los errores.'); return; }

    setSaving(true);
    setError('');
    try {
      if (user) {
        const body: any = { name: name.trim(), email: email.trim(), role };
        if (password) { body.password = password; body.confirmPassword = confirmPassword; }
        await api(`/users/${user.id}`, { method: 'PUT', body });
      } else {
        await api('/users', { method: 'POST', body: { name: name.trim(), email: email.trim(), password, confirmPassword, role } });
      }
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Error al guardar');
    }
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-slate-900 border border-white/[0.08] rounded-3xl p-8 w-full max-w-lg space-y-5 shadow-2xl">
        <h3 className="text-lg font-bold text-white">{user ? 'Editar' : 'Crear'} Usuario</h3>
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Nombre *</label>
            <input value={name} onChange={e => { setName(e.target.value); validateField('name', e.target.value); }}
              className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm text-white outline-none transition ${fieldErrors.name ? 'border-red-500/40' : 'border-white/[0.08] focus:ring-2 focus:ring-cyan-500/40'}`} />
            {fieldErrors.name && <p className="text-[10px] text-red-400">{fieldErrors.name}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Email *</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); validateField('email', e.target.value); }}
              className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm text-white outline-none transition ${fieldErrors.email ? 'border-red-500/40' : 'border-white/[0.08] focus:ring-2 focus:ring-cyan-500/40'}`} />
            {fieldErrors.email && <p className="text-[10px] text-red-400">{fieldErrors.email}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{user ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); validateField('password', e.target.value); }} placeholder="Mínimo 8, letras y números"
              className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm text-white outline-none transition ${fieldErrors.password ? 'border-red-500/40' : 'border-white/[0.08] focus:ring-2 focus:ring-cyan-500/40'}`} />
            {fieldErrors.password && <p className="text-[10px] text-red-400">{fieldErrors.password}</p>}
          </div>
          {!user && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Confirmar contraseña *</label>
              <input type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); validateField('confirmPassword', e.target.value); }}
                className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm text-white outline-none transition ${fieldErrors.confirmPassword ? 'border-red-500/40' : 'border-white/[0.08] focus:ring-2 focus:ring-cyan-500/40'}`} />
              {fieldErrors.confirmPassword && <p className="text-[10px] text-red-400">{fieldErrors.confirmPassword}</p>}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Rol *</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40 transition appearance-none cursor-pointer">
              <option value="cliente" className="bg-slate-900">Cliente</option>
              <option value="colaborador" className="bg-slate-900">Colaborador</option>
              <option value="admin" className="bg-slate-900">Administrador</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-white/[0.05] text-slate-400 py-3 rounded-xl text-sm font-semibold hover:bg-white/[0.08] transition">Cancelar</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

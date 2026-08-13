import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../client/lib/api.ts';
import { UserPlus, Edit2 } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await api('/users');
      setUsers(res.users || []);
      setLoading(false);
    } catch { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Usuarios del Sistema ({users.length})</h3>
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

      <AnimatePresence>
        {showUserModal && (
          <UserModal
            user={editingUser}
            onClose={() => setShowUserModal(false)}
            onSaved={() => { setShowUserModal(false); loadData(); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UserModal({ user, onClose, onSaved }: { user: any; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role || 'cliente');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('Nombre y email son requeridos.'); return; }
    setSaving(true);
    try {
      if (user) {
        const body: any = { name: name.trim(), email: email.trim(), role };
        if (password) body.password = password;
        await api(`/users/${user.id}`, { method: 'PUT', body });
      } else {
        await api('/users', { method: 'POST', body: { name: name.trim(), email: email.trim(), password, confirmPassword: password, role } });
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
        <h3 className="text-lg font-bold text-white">{user ? 'Editar' : 'Crear'} Usuario</h3>
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre *"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email *"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={user ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40" />
          <select value={role} onChange={e => setRole(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40 appearance-none">
            <option value="cliente" className="bg-slate-900">Cliente</option>
            <option value="colaborador" className="bg-slate-900">Colaborador</option>
            <option value="admin" className="bg-slate-900">Administrador</option>
          </select>
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

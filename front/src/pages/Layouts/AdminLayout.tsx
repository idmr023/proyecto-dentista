import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Logo } from '../../components/ui/Logo.tsx';
import { 
  LayoutDashboard, Stethoscope, Calendar, Users, 
  UserPlus, Package, LogOut, Menu, X 
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Panel General', icon: LayoutDashboard },
    { path: '/admin/odontograma', label: 'Odontograma', icon: Stethoscope },
    { path: '/admin/citas', label: 'Citas', icon: Calendar },
    { path: '/admin/pacientes', label: 'Pacientes', icon: Users },
    { path: '/admin/usuarios', label: 'Usuarios', icon: UserPlus },
    { path: '/admin/compras', label: 'Compras', icon: Package },
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
            <NavLink 
              key={item.path} 
              to={item.path} 
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
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
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition" title="Cerrar sesión">
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
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {navItems.find(n => window.location.pathname.startsWith(n.path))?.label || 'Panel'}
            </h2>
          </div>
          <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full font-semibold">
            👑 {user?.role === 'admin' ? 'Administrador' : 'Colaborador'}
          </span>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

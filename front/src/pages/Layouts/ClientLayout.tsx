import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Logo } from '../../components/ui/Logo.tsx';
import { LogOut } from 'lucide-react';

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { path: '/dashboard', label: 'Servicios' },
    { path: '/citas', label: 'Citas' },
    { path: '/tienda', label: 'Tienda' },
    { path: '/pedidos', label: 'Pedidos' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-[#1A2E3D]">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#D6E8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Logo />
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((t) => (
              <NavLink
                key={t.path}
                to={t.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#7CC4EB]/20 text-[#1A2E3D] font-bold shadow-sm'
                      : 'text-[#5A7A94] hover:text-[#1A2E3D] hover:bg-[#E8F2FA]'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-[#1A2E3D]">{user?.name}</p>
              <p className="text-xs text-[#5A7A94]">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7CC4EB] to-[#F7B8D1] flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#5A7A94] hover:text-red-500 hover:bg-red-500/10 transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="md:hidden flex overflow-x-auto border-t border-[#D6E8F5] px-4 gap-1 py-2">
          {tabs.map((t) => (
            <NavLink
              key={t.path}
              to={t.path}
              className={({ isActive }) =>
                `flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#7CC4EB]/20 text-[#1A2E3D] font-bold'
                    : 'text-[#5A7A94] hover:text-[#1A2E3D]'
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

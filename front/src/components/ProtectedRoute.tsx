import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { Role } from '../shared/schemas.ts';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, allowedRoles, fallback }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Acceso no autorizado</h2>
          <p className="text-sm text-slate-400">Debes iniciar sesión para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-amber-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Acceso Restringido</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Esta sección ({allowedRoles.includes('admin') ? 'Odontograma / Panel Administrativo' : 'Área de Cliente'}) 
              es exclusiva para <strong className="text-white">{allowedRoles.includes('admin') ? 'Administradores' : 'Clientes'}</strong>.
            </p>
            <p className="text-xs text-slate-500">
              Tu rol actual: <span className="text-cyan-400 font-semibold">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/[0.08] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

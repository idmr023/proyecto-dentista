import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { api, setAccessToken, getAccessToken } from '../lib/api.ts';
import type { Role } from '../shared/schemas.ts';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isCollaborator: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await api('/auth/me', { auth: true });
        if (data.user) {
          setUser({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role });
        }
      } catch {
        // Not logged in or session expired
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
      return {};
    } catch (e: any) {
      return { error: e.message || 'Error al iniciar sesión' };
    }
  }, []);

  const register = useCallback(async (
    name: string, email: string, password: string, confirmPassword: string
  ): Promise<{ error?: string }> => {
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: { name, email, password, confirmPassword },
        auth: false,
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
      return {};
    } catch (e: any) {
      return { error: e.message || 'Error al registrarse' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isClient: user?.role === 'cliente',
      isCollaborator: user?.role === 'colaborador',
      login,
      register,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

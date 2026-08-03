import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, User, Shield, UserCheck, ArrowRight, Sparkles, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage({ onBack }: { onBack?: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState('');

  const resetForm = () => {
    setEmail(''); setPassword(''); setConfirmPassword(''); setName('');
    setError(''); setFieldErrors({}); setLockoutInfo('');
  };

  const switchMode = (newMode: 'login' | 'register') => {
    resetForm();
    setMode(newMode);
  };

  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = { ...fieldErrors };

    if (field === 'name') {
      if (value.length > 0 && value.length < 2) errors.name = 'Mínimo 2 caracteres';
      else if (value.length > 0 && /[0-9]/.test(value)) errors.name = 'No pueden haber números';
      else if (value.length > 0 && !/^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s]+$/.test(value)) errors.name = 'Solo letras';
      else delete errors.name;
    }

    if (field === 'email') {
      if (value.length > 0 && !value.includes('@')) errors.email = 'Debe contener un @';
      else if (value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Correo inválido';
      else delete errors.email;
    }

    if (field === 'password') {
      if (value.length > 0 && value.length < 8) errors.password = 'Mínimo 8 caracteres';
      else if (value.length > 0 && !/[a-zA-Z]/.test(value)) errors.password = 'Debe contener letras';
      else if (value.length > 0 && !/[0-9]/.test(value)) errors.password = 'Debe contener números';
      else delete errors.password;
    }

    if (field === 'confirmPassword') {
      if (value.length > 0 && value !== password) errors.confirmPassword = 'Las contraseñas no coinciden';
      else delete errors.confirmPassword;
    }

    setFieldErrors(errors);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Completa todos los campos.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setLockoutInfo('');

    const result = await login(email, password);

    if (result.error) {
      if (result.error.includes('429') || result.error.includes('intentos')) {
        setLockoutInfo(result.error);
      } else {
        setError(result.error);
      }
    }
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    ['name', 'email', 'password', 'confirmPassword'].forEach(f => {
      const val = f === 'name' ? name : f === 'email' ? email : f === 'password' ? password : confirmPassword;
      validateField(f, val);
    });

    if (Object.keys(fieldErrors).length > 0 || !name || !email || !password || !confirmPassword) {
      setError('Corrige los errores antes de continuar.');
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Las contraseñas no coinciden' });
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await register(name, email, password, confirmPassword);

    if (result.error) {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/8 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/6 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition mb-5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio
            </button>
          )}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-cyan-500/20"
          >
            🦷
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight">Twilight Dental</h1>
          <p className="text-slate-500 text-sm mt-2">Sistema de Gestión Odontológica</p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 space-y-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </span>
          </div>

          {/* Error / Lockout */}
          {lockoutInfo && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 text-center">
              {lockoutInfo}
            </div>
          )}
          {error && !lockoutInfo && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 text-center">
              {error}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); validateField('name', e.target.value); }}
                    placeholder="Ej: María Fernanda"
                    className={`w-full bg-white/[0.04] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all ${
                      fieldErrors.name ? 'border-red-500/40 focus:ring-2 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40'
                    }`}
                  />
                </div>
                {fieldErrors.name && <p className="text-[10px] text-red-400">{fieldErrors.name}</p>}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); validateField('email', e.target.value); }}
                  placeholder="tu@email.com"
                  className={`w-full bg-white/[0.04] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all ${
                    fieldErrors.email ? 'border-red-500/40 focus:ring-2 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40'
                  }`}
                />
              </div>
              {fieldErrors.email && <p className="text-[10px] text-red-400">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); validateField('password', e.target.value); }}
                  placeholder="Mínimo 8 caracteres, letras y números"
                  className={`w-full bg-white/[0.04] border rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all ${
                    fieldErrors.password ? 'border-red-500/40 focus:ring-2 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40'
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-[10px] text-red-400">{fieldErrors.password}</p>}
            </div>

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); validateField('confirmPassword', e.target.value); }}
                    placeholder="Repite tu contraseña"
                    className={`w-full bg-white/[0.04] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all ${
                      fieldErrors.confirmPassword ? 'border-red-500/40 focus:ring-2 focus:ring-red-500/30' : 'border-white/[0.08] focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40'
                    }`}
                  />
                </div>
                {fieldErrors.confirmPassword && <p className="text-[10px] text-red-400">{fieldErrors.confirmPassword}</p>}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar al sistema' : 'Crear cuenta'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Role info */}
          <div className="pt-3 border-t border-white/[0.04]">
            {mode === 'login' ? (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-500 text-center">Cuentas de demo (contraseña: Admin1234!):</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <button onClick={() => { setEmail('admin@twilightdental.com'); setPassword('Admin1234!'); }}
                    className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 hover:bg-cyan-500/15 transition">
                    <Shield className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                    <span className="text-[9px] text-cyan-300 font-semibold block">Admin</span>
                  </button>
                  <button onClick={() => { setEmail('colaborador@twilightdental.com'); setPassword('Admin1234!'); }}
                    className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-2 hover:bg-violet-500/15 transition">
                    <UserCheck className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                    <span className="text-[9px] text-violet-300 font-semibold block">Colaborador</span>
                  </button>
                  <button onClick={() => { setEmail('cliente@twilightdental.com'); setPassword('Admin1234!'); }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 hover:bg-emerald-500/15 transition">
                    <User className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[9px] text-emerald-300 font-semibold block">Cliente</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-400">Tu cuenta será de tipo Cliente</strong> con acceso a servicios, citas y tienda dental.
                </p>
              </div>
            )}
          </div>

          {/* Switch mode */}
          <div className="text-center">
            <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs text-slate-500 hover:text-cyan-400 transition">
              {mode === 'login'
                ? <>¿No tienes cuenta? <strong className="text-cyan-400">Crear cuenta</strong></>
                : <>¿Ya tienes cuenta? <strong className="text-cyan-400">Iniciar sesión</strong></>
              }
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-6">
          &copy; 2026 Twilight Dental — Sistema de Gestión Odontológica
        </p>
      </motion.div>
    </div>
  );
}

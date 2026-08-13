import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Lock, Mail, User, Shield, UserCheck, ArrowRight, Sparkles, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/ui/Logo.tsx';

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
    <div className="min-h-screen bg-[#F0F7FF] text-[#1A2E3D] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#7CC4EB]/15 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#F7B8D1]/20 rounded-full blur-[120px]" />

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
              className="inline-flex items-center gap-1.5 text-xs text-[#5A7A94] hover:text-[#5AB0E4] transition mb-5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio
            </button>
          )}
          <div>
            <Logo/>
          </div>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white border border-[#D6E8F5] rounded-3xl p-8 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-[#5AB0E4]" />
            <span className="text-xs font-bold text-[#5A7A94] tracking-wider uppercase">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </span>
          </div>

          {/* Error / Lockout */}
          {lockoutInfo && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-600 text-center">
              {lockoutInfo}
            </div>
          )}
          {error && !lockoutInfo && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-600 text-center">
              {error}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5A7A94] tracking-wider uppercase">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A94]" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); validateField('name', e.target.value); }}
                    placeholder="Ej: María Fernanda"
                    className={`w-full bg-[#F0F7FF] border rounded-xl pl-10 pr-4 py-3 text-sm text-[#1A2E3D] placeholder:text-[#5A7A94]/60 outline-none transition-all ${
                      fieldErrors.name ? 'border-red-400 focus:ring-2 focus:ring-red-400/30' : 'border-[#D6E8F5] focus:ring-2 focus:ring-[#7CC4EB]/40 focus:border-[#7CC4EB]'
                    }`}
                  />
                </div>
                {fieldErrors.name && <p className="text-[10px] text-red-500">{fieldErrors.name}</p>}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A7A94] tracking-wider uppercase">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A94]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); validateField('email', e.target.value); }}
                  placeholder="tu@email.com"
                  className={`w-full bg-[#F0F7FF] border rounded-xl pl-10 pr-4 py-3 text-sm text-[#1A2E3D] placeholder:text-[#5A7A94]/60 outline-none transition-all ${
                    fieldErrors.email ? 'border-red-400 focus:ring-2 focus:ring-red-400/30' : 'border-[#D6E8F5] focus:ring-2 focus:ring-[#7CC4EB]/40 focus:border-[#7CC4EB]'
                  }`}
                />
              </div>
              {fieldErrors.email && <p className="text-[10px] text-red-500">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5A7A94] tracking-wider uppercase">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A94]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); validateField('password', e.target.value); }}
                  placeholder="Mínimo 8 caracteres, letras y números"
                  className={`w-full bg-[#F0F7FF] border rounded-xl pl-10 pr-10 py-3 text-sm text-[#1A2E3D] placeholder:text-[#5A7A94]/60 outline-none transition-all ${
                    fieldErrors.password ? 'border-red-400 focus:ring-2 focus:ring-red-400/30' : 'border-[#D6E8F5] focus:ring-2 focus:ring-[#7CC4EB]/40 focus:border-[#7CC4EB]'
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A7A94] hover:text-[#1A2E3D] transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-[10px] text-red-500">{fieldErrors.password}</p>}
            </div>

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5A7A94] tracking-wider uppercase">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7A94]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); validateField('confirmPassword', e.target.value); }}
                    placeholder="Repite tu contraseña"
                    className={`w-full bg-[#F0F7FF] border rounded-xl pl-10 pr-4 py-3 text-sm text-[#1A2E3D] placeholder:text-[#5A7A94]/60 outline-none transition-all ${
                      fieldErrors.confirmPassword ? 'border-red-400 focus:ring-2 focus:ring-red-400/30' : 'border-[#D6E8F5] focus:ring-2 focus:ring-[#7CC4EB]/40 focus:border-[#7CC4EB]'
                    }`}
                  />
                </div>
                {fieldErrors.confirmPassword && <p className="text-[10px] text-red-500">{fieldErrors.confirmPassword}</p>}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#7CC4EB] text-white shadow-lg shadow-[#7CC4EB]/30 transition-all disabled:opacity-60 hover:bg-[#5AB0E4]"
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
          <div className="pt-3 border-t border-[#D6E8F5]">
            {mode === 'login' ? (
              <div className="space-y-3">
                <p className="text-[11px] text-[#5A7A94] text-center">Cuentas de demo (contraseña: Admin1234!):</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <button onClick={() => { setEmail('admin@twilightdental.com'); setPassword('Admin1234!'); }}
                    className="bg-[#7CC4EB]/10 border border-[#7CC4EB]/30 rounded-lg p-2 hover:bg-[#7CC4EB]/20 transition">
                    <Shield className="w-4 h-4 text-[#5AB0E4] mx-auto mb-1" />
                    <span className="text-[9px] text-[#1A2E3D] font-semibold block">Admin</span>
                  </button>
                  <button onClick={() => { setEmail('colaborador@twilightdental.com'); setPassword('Admin1234!'); }}
                    className="bg-[#F7B8D1]/20 border border-[#F7B8D1]/40 rounded-lg p-2 hover:bg-[#F7B8D1]/30 transition">
                    <UserCheck className="w-4 h-4 text-[#945A7A] mx-auto mb-1" />
                    <span className="text-[9px] text-[#1A2E3D] font-semibold block">Colaborador</span>
                  </button>
                  <button onClick={() => { setEmail('cliente@twilightdental.com'); setPassword('Admin1234!'); }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 hover:bg-emerald-500/15 transition">
                    <User className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[9px] text-[#1A2E3D] font-semibold block">Cliente</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#5AB0E4] mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-[#5A7A94] leading-relaxed">
                  <strong className="text-[#1A2E3D]">Tu cuenta será de tipo Cliente</strong> con acceso a servicios, citas y tienda dental.
                </p>
              </div>
            )}
          </div>

          {/* Switch mode */}
          <div className="text-center">
            <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs text-[#5A7A94] hover:text-[#5AB0E4] transition">
              {mode === 'login'
                ? <>¿No tienes cuenta? <strong className="text-[#5AB0E4]">Crear cuenta</strong></>
                : <>¿Ya tienes cuenta? <strong className="text-[#5AB0E4]">Iniciar sesión</strong></>
              }
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#5A7A94] mt-6">
          &copy; 2026 Sonrisa Dental — Sistema de Gestión Odontológica
        </p>
      </motion.div>
    </div>
  );
}

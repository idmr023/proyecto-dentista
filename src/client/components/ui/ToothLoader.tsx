import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  '¡Bienvenido a la Odontología!',
  'Preparando los consultorios...',
  'Cargando tu experiencia dental...',
  'Sacando brillo a tu sonrisa...',
];

export default function ToothLoader() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const msgTimer = setInterval(() => setMsgIndex(i => (i + 1) % MESSAGES.length), 1700);
    const blinkTimer = setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 160);
    }, 2600);
    return () => {
      clearInterval(msgTimer);
      clearInterval(blinkTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-7 px-6 text-center">
      {/* Speech bubble */}
      <div className="relative">
        <div className="absolute -inset-6 bg-cyan-500/15 blur-3xl rounded-full" />
        <div className="relative min-h-[72px] max-w-xs flex items-center justify-center backdrop-blur-xl bg-white/[0.06] border border-white/[0.12] rounded-2xl px-6 py-4 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="text-sm md:text-base font-semibold text-cyan-100"
            >
              {MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-white/[0.06] border-b border-r border-white/[0.12] rotate-45" />
      </div>

      {/* Tooth */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-3xl" />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <svg width="150" height="170" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="tooth-grad" x1="40" y1="20" x2="120" y2="140" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="55%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>

            {/* Tooth body */}
            <path
              d="M 80 20 C 102 20 116 34 120 56 C 122 76 120 96 112 112 C 108 120 102 128 96 136 C 93 139 88 140 86 136 C 84 132 83 124 80 124 C 77 124 76 132 74 136 C 72 140 67 139 64 136 C 58 128 52 120 48 112 C 40 96 38 76 40 56 C 44 34 58 20 80 20 Z"
              fill="url(#tooth-grad)"
              stroke="#e2e8f0"
              strokeOpacity="0.6"
              strokeWidth="2"
            />

            {/* Shine */}
            <ellipse cx="64" cy="56" rx="10" ry="7" fill="#ffffff" opacity="0.55" transform="rotate(-18 64 56)" />

            {/* Eyes (blinking) */}
            <motion.ellipse
              cx="68" cy="88" rx="5.5" ry="6.5" fill="#0f172a"
              animate={{ scaleY: blink ? 0.12 : 1 }}
              style={{ transformOrigin: '68px 88px' }}
              transition={{ duration: 0.12 }}
            />
            <motion.ellipse
              cx="92" cy="88" rx="5.5" ry="6.5" fill="#0f172a"
              animate={{ scaleY: blink ? 0.12 : 1 }}
              style={{ transformOrigin: '92px 88px' }}
              transition={{ duration: 0.12 }}
            />
            <ellipse cx="66.2" cy="85.4" rx="1.6" ry="1.8" fill="#ffffff" opacity="0.9" />
            <ellipse cx="90.2" cy="85.4" rx="1.6" ry="1.8" fill="#ffffff" opacity="0.9" />

            {/* Cheeks */}
            <ellipse cx="58" cy="98" rx="6" ry="4" fill="#f472b6" opacity="0.35" />
            <ellipse cx="102" cy="98" rx="6" ry="4" fill="#f472b6" opacity="0.35" />

            {/* Smile */}
            <path d="M 66 102 Q 80 118 94 102" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Title */}
      <div className="space-y-1.5">
        <p className="text-lg md:text-xl font-black text-white tracking-tight">
          Twilight <span className="text-cyan-400">Dental</span>
        </p>
        <p className="text-xs text-slate-500">Sistema de Gestión Odontológica</p>
      </div>

      {/* Progress bar */}
      <div className="w-56 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

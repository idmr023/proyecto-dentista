import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToothZone {
  id: string;
  label: string;
  description: string;
  services: string[];
  icon: string;
}

const zones: ToothZone[] = [
  {
    id: 'frontales',
    label: 'Dientes Frontales',
    description: 'Carillas estéticas, blanqueamiento láser y diseño de sonrisa personalizado.',
    services: ['Blanqueamiento Láser', 'Carillas de Porcelana', 'Diseño de Sonrisa'],
    icon: '✨',
  },
  {
    id: 'muelas',
    label: 'Muelas Posteriores',
    description: 'Endodoncia, restauraciones de resina y tratamientos de conducto sin dolor.',
    services: ['Endodoncia', 'Resinas Estéticas', 'Incrustaciones'],
    icon: '🦷',
  },
  {
    id: 'encias',
    label: 'Encías & Estructura',
    description: 'Cirugías periodontales, injertos de encía y tratamientos de gingivitis.',
    services: ['Cirugía Periodontal', 'Injertos de Encía', 'Limpieza Profunda'],
    icon: '🏥',
  },
  {
    id: 'implantes',
    label: 'Implantes Dentales',
    description: 'Reemplazo de piezas perdidas con implantes de titanio de alta gama.',
    services: ['Implantes de Titanio', 'Prótesis Fija', 'Overdentures'],
    icon: '💎',
  },
  {
    id: 'ortodoncia',
    label: 'Ortodoncia',
    description: 'Brackets autoligados, alineadores invisibles y corrección maxilar.',
    services: ['Brackets Metálicos', 'Alineadores Invisibles', 'Ortodoncia Interceptiva'],
    icon: '😁',
  },
];

const zoneColors: Record<string, { base: string; lit: string; glow: string; grad: [string, string] }> = {
  frontales: { base: '#1e293b', lit: '#22d3ee', glow: '#06b6d4', grad: ['#0e7490', '#22d3ee'] },
  muelas:    { base: '#1e293b', lit: '#a78bfa', glow: '#8b5cf6', grad: ['#6d28d9', '#a78bfa'] },
  encias:    { base: '#1e293b', lit: '#34d399', glow: '#10b981', grad: ['#059669', '#34d399'] },
  implantes: { base: '#1e293b', lit: '#fbbf24', glow: '#f59e0b', grad: ['#d97706', '#fbbf24'] },
  ortodoncia:{ base: '#1e293b', lit: '#fb7185', glow: '#f43f5e', grad: ['#e11d48', '#fb7185'] },
};

/* --- Anatomical Tooth Paths --- */
function Incisor({ cx, cy, zone, active }: { cx: number; cy: number; zone: string; active: boolean }) {
  const c = zoneColors[zone];
  const id = `inc-${cx}-${cy}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={active ? c.lit : '#94a3b8'} stopOpacity={active ? 0.9 : 0.3} />
          <stop offset="100%" stopColor={active ? c.grad[0] : '#475569'} stopOpacity={active ? 0.8 : 0.15} />
        </linearGradient>
        {active && <filter id={`glow-${id}`}><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>}
      </defs>
      <path
        d={`M ${cx-7} ${cy}
            C ${cx-8} ${cy-4}, ${cx-7} ${cy-22}, ${cx-1} ${cy-32}
            C ${cx+1} ${cy-34}, ${cx+5} ${cy-34}, ${cx+7} ${cy-32}
            C ${cx+13} ${cy-22}, ${cx+14} ${cy-4}, ${cx+13} ${cy}
            C ${cx+13} ${cy+3}, ${cx+10} ${cy+5}, ${cx+3} ${cy+6}
            C ${cx-1} ${cy+6}, ${cx-5} ${cy+5}, ${cx-7} ${cy+3} Z`}
        fill={`url(#${id})`}
        stroke={active ? c.lit : 'rgba(148,163,184,0.25)'}
        strokeWidth={active ? 1.2 : 0.6}
        filter={active ? `url(#glow-${id})` : undefined}
        style={{ transition: 'all 0.3s ease' }}
      />
      {/* Enamel highlight */}
      <path
        d={`M ${cx-4} ${cy-26} C ${cx-3} ${cy-30}, ${cx+3} ${cy-30}, ${cx+5} ${cy-26}`}
        fill="none" stroke={active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'}
        strokeWidth="0.8" style={{ transition: 'all 0.3s ease' }}
      />
    </g>
  );
}

function Canine({ cx, cy, zone, active }: { cx: number; cy: number; zone: string; active: boolean }) {
  const c = zoneColors[zone];
  const id = `can-${cx}-${cy}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={active ? c.lit : '#94a3b8'} stopOpacity={active ? 0.9 : 0.3} />
          <stop offset="100%" stopColor={active ? c.grad[0] : '#475569'} stopOpacity={active ? 0.8 : 0.15} />
        </linearGradient>
      </defs>
      <path
        d={`M ${cx-8} ${cy}
            C ${cx-9} ${cy-6}, ${cx-6} ${cy-24}, ${cx} ${cy-36}
            C ${cx+2} ${cy-38}, ${cx+6} ${cy-38}, ${cx+8} ${cy-36}
            C ${cx+14} ${cy-24}, ${cx+15} ${cy-6}, ${cx+14} ${cy}
            C ${cx+14} ${cy+4}, ${cx+10} ${cy+6}, ${cx+3} ${cy+7}
            C ${cx-1} ${cy+7}, ${cx-6} ${cy+5}, ${cx-8} ${cy+2} Z`}
        fill={`url(#${id})`}
        stroke={active ? c.lit : 'rgba(148,163,184,0.25)'}
        strokeWidth={active ? 1.2 : 0.6}
        style={{ transition: 'all 0.3s ease' }}
      />
      <path
        d={`M ${cx-3} ${cy-30} C ${cx-2} ${cy-34}, ${cx+4} ${cy-34}, ${cx+6} ${cy-30}`}
        fill="none" stroke={active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'}
        strokeWidth="0.8" style={{ transition: 'all 0.3s ease' }}
      />
    </g>
  );
}

function Molar({ cx, cy, zone, active }: { cx: number; cy: number; zone: string; active: boolean }) {
  const c = zoneColors[zone];
  const id = `mol-${cx}-${cy}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={active ? c.lit : '#94a3b8'} stopOpacity={active ? 0.9 : 0.3} />
          <stop offset="50%" stopColor={active ? c.grad[0] : '#475569'} stopOpacity={active ? 0.7 : 0.12} />
          <stop offset="100%" stopColor={active ? c.grad[1] : '#334155'} stopOpacity={active ? 0.6 : 0.08} />
        </linearGradient>
      </defs>
      {/* Crown */}
      <path
        d={`M ${cx-10} ${cy}
            C ${cx-12} ${cy-3}, ${cx-10} ${cy-16}, ${cx-6} ${cy-22}
            C ${cx-3} ${cy-26}, ${cx+3} ${cy-26}, ${cx+6} ${cy-22}
            C ${cx+10} ${cy-16}, ${cx+12} ${cy-3}, ${cx+10} ${cy}
            C ${cx+10} ${cy+4}, ${cx+6} ${cy+7}, ${cx} ${cy+8}
            C ${cx-6} ${cy+7}, ${cx-10} ${cy+4}, ${cx-10} ${cy} Z`}
        fill={`url(#${id})`}
        stroke={active ? c.lit : 'rgba(148,163,184,0.25)'}
        strokeWidth={active ? 1.2 : 0.6}
        style={{ transition: 'all 0.3s ease' }}
      />
      {/* Fissure lines on occlusal */}
      <path
        d={`M ${cx-5} ${cy-18} L ${cx} ${cy-14} L ${cx+5} ${cy-18}`}
        fill="none" stroke={active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)'}
        strokeWidth="0.5" style={{ transition: 'all 0.3s ease' }}
      />
      {/* Enamel highlight */}
      <path
        d={`M ${cx-5} ${cy-22} C ${cx-2} ${cy-25}, ${cx+4} ${cy-25}, ${cx+7} ${cy-22}`}
        fill="none" stroke={active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.06)'}
        strokeWidth="0.7" style={{ transition: 'all 0.3s ease' }}
      />
      {/* Root 1 */}
      <path
        d={`M ${cx-6} ${cy+6} C ${cx-7} ${cy+12}, ${cx-8} ${cy+22}, ${cx-5} ${cy+30}
            C ${cx-4} ${cy+32}, ${cx-2} ${cy+32}, ${cx-1} ${cy+30}
            C ${cx+1} ${cy+22}, ${cx+0} ${cy+12}, ${cx+0} ${cy+8}`}
        fill={active ? c.grad[0] : '#1e293b'}
        fillOpacity={active ? 0.5 : 0.2}
        stroke={active ? c.lit : 'rgba(148,163,184,0.15)'}
        strokeWidth={active ? 0.8 : 0.4}
        style={{ transition: 'all 0.3s ease' }}
      />
      {/* Root 2 */}
      <path
        d={`M ${cx+0} ${cy+8} C ${cx+0} ${cy+12}, ${cx+1} ${cy+22}, ${cx+2} ${cy+30}
            C ${cx+3} ${cy+32}, ${cx+5} ${cy+32}, ${cx+6} ${cy+30}
            C ${cx+8} ${cy+22}, ${cx+7} ${cy+12}, ${cx+6} ${cy+6}`}
        fill={active ? c.grad[0] : '#1e293b'}
        fillOpacity={active ? 0.5 : 0.2}
        stroke={active ? c.lit : 'rgba(148,163,184,0.15)'}
        strokeWidth={active ? 0.8 : 0.4}
        style={{ transition: 'all 0.3s ease' }}
      />
    </g>
  );
}

function Premolar({ cx, cy, zone, active }: { cx: number; cy: number; zone: string; active: boolean }) {
  const c = zoneColors[zone];
  const id = `pre-${cx}-${cy}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={active ? c.lit : '#94a3b8'} stopOpacity={active ? 0.9 : 0.3} />
          <stop offset="100%" stopColor={active ? c.grad[0] : '#475569'} stopOpacity={active ? 0.7 : 0.12} />
        </linearGradient>
      </defs>
      {/* Crown - slightly smaller than molar */}
      <path
        d={`M ${cx-8} ${cy}
            C ${cx-9} ${cy-3}, ${cx-8} ${cy-14}, ${cx-4} ${cy-20}
            C ${cx-2} ${cy-23}, ${cx+2} ${cy-23}, ${cx+4} ${cy-20}
            C ${cx+8} ${cy-14}, ${cx+9} ${cy-3}, ${cx+8} ${cy}
            C ${cx+8} ${cy+4}, ${cx+5} ${cy+6}, ${cx} ${cy+7}
            C ${cx-5} ${cy+6}, ${cx-8} ${cy+4}, ${cx-8} ${cy} Z`}
        fill={`url(#${id})`}
        stroke={active ? c.lit : 'rgba(148,163,184,0.25)'}
        strokeWidth={active ? 1.2 : 0.6}
        style={{ transition: 'all 0.3s ease' }}
      />
      {/* Highlight */}
      <path
        d={`M ${cx-4} ${cy-18} C ${cx-1} ${cy-21}, ${cx+3} ${cy-21}, ${cx+5} ${cy-18}`}
        fill="none" stroke={active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.06)'}
        strokeWidth="0.7" style={{ transition: 'all 0.3s ease' }}
      />
      {/* Single root */}
      <path
        d={`M ${cx-3} ${cy+6} C ${cx-4} ${cy+12}, ${cx-5} ${cy+20}, ${cx-3} ${cy+28}
            C ${cx-2} ${cy+30}, ${cx+2} ${cy+30}, ${cx+3} ${cy+28}
            C ${cx+5} ${cy+20}, ${cx+4} ${cy+12}, ${cx+3} ${cy+6}`}
        fill={active ? c.grad[0] : '#1e293b'}
        fillOpacity={active ? 0.5 : 0.2}
        stroke={active ? c.lit : 'rgba(148,163,184,0.15)'}
        strokeWidth={active ? 0.8 : 0.4}
        style={{ transition: 'all 0.3s ease' }}
      />
    </g>
  );
}

/* --- Data --- */
const upperTeeth = [
  { x: 35,  zone: 'muelas',     label: '18', type: 'molar' as const },
  { x: 80,  zone: 'muelas',     label: '17', type: 'molar' as const },
  { x: 125, zone: 'muelas',     label: '16', type: 'molar' as const },
  { x: 168, zone: 'muelas',     label: '15', type: 'premolar' as const },
  { x: 208, zone: 'ortodoncia', label: '14', type: 'premolar' as const },
  { x: 248, zone: 'frontales',  label: '13', type: 'canine' as const },
  { x: 286, zone: 'frontales',  label: '12', type: 'incisor' as const },
  { x: 322, zone: 'frontales',  label: '11', type: 'incisor' as const },
  { x: 358, zone: 'frontales',  label: '21', type: 'incisor' as const },
  { x: 394, zone: 'frontales',  label: '22', type: 'incisor' as const },
  { x: 432, zone: 'frontales',  label: '23', type: 'canine' as const },
  { x: 472, zone: 'ortodoncia', label: '24', type: 'premolar' as const },
  { x: 512, zone: 'muelas',     label: '25', type: 'premolar' as const },
  { x: 555, zone: 'muelas',     label: '26', type: 'molar' as const },
  { x: 600, zone: 'muelas',     label: '27', type: 'molar' as const },
  { x: 645, zone: 'muelas',     label: '28', type: 'molar' as const },
];

const lowerTeeth = [
  { x: 35,  zone: 'muelas',     label: '48', type: 'molar' as const },
  { x: 80,  zone: 'muelas',     label: '47', type: 'molar' as const },
  { x: 125, zone: 'muelas',     label: '46', type: 'molar' as const },
  { x: 168, zone: 'muelas',     label: '45', type: 'premolar' as const },
  { x: 208, zone: 'ortodoncia', label: '44', type: 'premolar' as const },
  { x: 248, zone: 'frontales',  label: '43', type: 'canine' as const },
  { x: 286, zone: 'frontales',  label: '42', type: 'incisor' as const },
  { x: 322, zone: 'frontales',  label: '41', type: 'incisor' as const },
  { x: 358, zone: 'frontales',  label: '31', type: 'incisor' as const },
  { x: 394, zone: 'frontales',  label: '32', type: 'incisor' as const },
  { x: 432, zone: 'frontales',  label: '33', type: 'canine' as const },
  { x: 472, zone: 'ortodoncia', label: '34', type: 'premolar' as const },
  { x: 512, zone: 'muelas',     label: '35', type: 'premolar' as const },
  { x: 555, zone: 'muelas',     label: '36', type: 'molar' as const },
  { x: 600, zone: 'muelas',     label: '37', type: 'molar' as const },
  { x: 645, zone: 'muelas',     label: '38', type: 'molar' as const },
];

function ToothByType({ cx, cy, type, zone, active }: {
  cx: number; cy: number; type: 'incisor' | 'canine' | 'premolar' | 'molar'; zone: string; active: boolean;
}) {
  if (type === 'incisor') return <Incisor cx={cx} cy={cy} zone={zone} active={active} />;
  if (type === 'canine') return <Canine cx={cx} cy={cy} zone={zone} active={active} />;
  if (type === 'premolar') return <Premolar cx={cx} cy={cy} zone={zone} active={active} />;
  return <Molar cx={cx} cy={cy} zone={zone} active={active} />;
}

export default function DentalExplorer() {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const activeData = zones.find(z => z.id === activeZone);

  return (
    <section className="relative min-h-screen bg-slate-950 flex items-center justify-center py-20 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl w-full mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase mb-4"
          >
            Explorador Dental Interactivo
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight"
          >
            Pasa el cursor sobre la{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">dentadura</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 mt-3 text-sm"
          >
            Cada zona ilumina su especialidad correspondiente
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-center">
          {/* SVG Model - container handles mouseLeave */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 md:p-10 backdrop-blur-xl"
          >
            <svg
              viewBox="0 0 690 480"
              className="w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
              onMouseLeave={() => setActiveZone(null)}
            >
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="0.5"/>
                </pattern>
                <filter id="globalGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect width="690" height="480" fill="url(#grid)"/>

              {/* Upper arch label */}
              <text x="345" y="16" textAnchor="middle" className="text-[9px] font-bold" fill="rgba(255,255,255,0.15)">
                ARCADA SUPERIOR (MAXILAR)
              </text>

              {/* Upper teeth row */}
              <g transform="translate(0, 30)">
                {upperTeeth.map((t, i) => {
                  const isActive = activeZone === t.zone;
                  return (
                    <g
                      key={i}
                      onMouseEnter={() => setActiveZone(t.zone)}
                      className="cursor-pointer"
                    >
                      <ToothByType cx={t.x} cy={120} type={t.type} zone={t.zone} active={isActive} />
                      <text
                        x={t.x} y={56}
                        textAnchor="middle"
                        className="text-[8px] font-bold select-none"
                        fill={isActive ? zoneColors[t.zone].lit : 'rgba(255,255,255,0.18)'}
                        style={{ transition: 'fill 0.3s ease' }}
                      >
                        {t.label}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Center line */}
              <line x1="50" y1="238" x2="640" y2="238" stroke="rgba(34,211,238,0.08)" strokeWidth="0.5" strokeDasharray="4,6"/>

              {/* Lower arch label */}
              <text x="345" y="256" textAnchor="middle" className="text-[9px] font-bold" fill="rgba(255,255,255,0.15)">
                ARCADA INFERIOR (MANDIBULAR)
              </text>

              {/* Lower teeth row - roots go up, crown down */}
              <g transform="translate(0, 270)">
                {lowerTeeth.map((t, i) => {
                  const isActive = activeZone === t.zone;
                  return (
                    <g
                      key={i}
                      onMouseEnter={() => setActiveZone(t.zone)}
                      className="cursor-pointer"
                    >
                      {/* Flip vertically for lower teeth */}
                      <g transform={`translate(${t.x}, 60) scale(1, -1) translate(${-t.x}, -60)`}>
                        <ToothByType cx={t.x} cy={60} type={t.type} zone={t.zone} active={isActive} />
                      </g>
                      <text
                        x={t.x} y={140}
                        textAnchor="middle"
                        className="text-[8px] font-bold select-none"
                        fill={isActive ? zoneColors[t.zone].lit : 'rgba(255,255,255,0.18)'}
                        style={{ transition: 'fill 0.3s ease' }}
                      >
                        {t.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </motion.div>

          {/* Info Panel */}
          <div className="relative min-h-[420px]">
            <AnimatePresence mode="wait">
              {activeData ? (
                <motion.div
                  key={activeData.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 shadow-2xl"
                  style={{
                    boxShadow: `0 0 40px ${zoneColors[activeData.id].glow}15, 0 20px 60px rgba(0,0,0,0.4)`,
                    borderColor: `${zoneColors[activeData.id].lit}30`,
                  }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${zoneColors[activeData.id].grad[0]}40, ${zoneColors[activeData.id].grad[1]}20)`, boxShadow: `0 0 20px ${zoneColors[activeData.id].glow}20` }}
                    >
                      {activeData.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{activeData.label}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Zona explorada</p>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {activeData.description}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Tratamientos disponibles</span>
                    <div className="flex flex-wrap gap-2">
                      {activeData.services.map((service, i) => (
                        <span
                          key={i}
                          className="text-xs px-3 py-1.5 rounded-lg border"
                          style={{
                            background: `${zoneColors[activeData.id].glow}08`,
                            borderColor: `${zoneColors[activeData.id].lit}15`,
                            color: zoneColors[activeData.id].lit,
                          }}
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 backdrop-blur-xl bg-white/[0.02] border border-dashed border-white/[0.06] rounded-3xl p-8 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">🦷</span>
                  </div>
                  <h4 className="text-white font-bold mb-1">Explora la dentadura</h4>
                  <p className="text-slate-500 text-xs max-w-[200px]">
                    Haz hover sobre diferentes zonas para descubrir cada especialidad
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

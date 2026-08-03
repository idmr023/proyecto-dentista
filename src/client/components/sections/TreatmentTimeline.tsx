import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface TimelineNode {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  align: 'left' | 'right';
}

const nodes: TimelineNode[] = [
  {
    id: 1,
    title: 'Contexto & Evaluación',
    subtitle: 'Tu historia importa',
    description: 'Recibimos tu consulta, evaluamos tus necesidades y tomamos una historia clínica completa: antecedentes, alergias, motivo de visita y expectativas.',
    icon: '📋',
    align: 'left',
  },
  {
    id: 2,
    title: 'Tecnología & Diagnóstico',
    subtitle: 'Precisión digital',
    description: 'Utilizamos odontogramas digitales interactivos, radiografías de alta resolución y fotografía intraoral para un diagnóstico exacto por cada pieza dental.',
    icon: '🔬',
    align: 'right',
  },
  {
    id: 3,
    title: 'Acción & Tratamiento',
    subtitle: 'Especialistas en acción',
    description: 'Cada tratamiento integral es ejecutado por especialistas certificados. Endodoncia, implantes, ortodoncia o estética, siempre con la más alta tecnología.',
    icon: '⚡',
    align: 'left',
  },
  {
    id: 4,
    title: 'Evolución & Resultados',
    subtitle: 'Seguimiento continuo',
    description: 'Registramos tu progreso en historias clínicas digitales. Enviamos recordatorios de citas, recetas digitales post-tratamiento y seguimiento periódico.',
    icon: '📈',
    align: 'right',
  },
];

function TimelineLine({ progress }: { progress: number }) {
  const pathLength = progress;

  return (
    <svg
      viewBox="0 0 100 1600"
      className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-20 pointer-events-none"
      preserveAspectRatio="none"
    >
      {/* Background line (dim) */}
      <path
        d="M 50 0 C 50 200, 30 300, 50 400 C 70 500, 50 600, 50 800 C 50 1000, 70 1100, 50 1200 C 30 1300, 50 1400, 50 1600"
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1.5"
      />
      {/* Animated drawn line */}
      <motion.path
        d="M 50 0 C 50 200, 30 300, 50 400 C 70 500, 50 600, 50 800 C 50 1000, 70 1100, 50 1200 C 30 1300, 50 1400, 50 1600"
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ pathLength }}
      />
      {/* Glow line */}
      <motion.path
        d="M 50 0 C 50 200, 30 300, 50 400 C 70 500, 50 600, 50 800 C 50 1000, 70 1100, 50 1200 C 30 1300, 50 1400, 50 1600"
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        style={{ pathLength }}
        className="opacity-20 blur-sm"
      />
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TimelineNode({ node, index, progress }: { node: TimelineNode; index: number; progress: number }) {
  const nodeThreshold = (index + 0.5) / nodes.length;
  const isLit = progress >= nodeThreshold;
  const isLeft = node.align === 'left';

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative flex items-center gap-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'} w-full`}
    >
      {/* Card */}
      <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
        <motion.div
          initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`
            relative backdrop-blur-xl bg-white/[0.03] border border-white/[0.06]
            rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-500
            ${isLit ? 'ring-1 ring-cyan-500/20 shadow-cyan-500/5' : ''}
          `}
        >
          <div className={`flex items-center gap-3 mb-4 ${isLeft ? 'justify-end' : ''}`}>
            <div className={`text-2xl ${isLit ? '' : 'grayscale opacity-40'} transition-all duration-500`}>
              {node.icon}
            </div>
            <div className={isLeft ? 'text-right' : ''}>
              <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase block">
                Paso {node.id}
              </span>
              <h3 className="text-lg md:text-xl font-black text-white">{node.title}</h3>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-400 mb-2">{node.subtitle}</p>
          <p className="text-sm text-slate-500 leading-relaxed">{node.description}</p>
        </motion.div>
      </div>

      {/* Center Node Dot */}
      <div className="relative z-10 flex-shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
          isLit
            ? 'bg-gradient-to-br from-cyan-500 to-violet-500 shadow-lg shadow-cyan-500/30'
            : 'bg-slate-800 border border-slate-700'
        }`}>
          <span className={`text-sm font-black ${isLit ? 'text-white' : 'text-slate-600'} transition-colors`}>
            {node.id}
          </span>
        </div>
      </div>

      {/* Empty space for the other side */}
      <div className="flex-1" />
    </motion.div>
  );
}

export default function TreatmentTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className="relative min-h-[180vh] bg-slate-950 py-32 px-6">
      {/* Background accents */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px]" />

      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase mb-4"
          >
            Flujo de Atención
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight"
          >
            De la recepción a la{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
              evolución
            </span>
          </motion.h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* SVG Line */}
          <motion.div
            style={{ pathLength: progress }}
            className="absolute inset-0 pointer-events-none"
          >
            <TimelineLine progress={progress.get()} />
          </motion.div>

          {/* Nodes */}
          <div className="relative space-y-24 md:space-y-32">
            {nodes.map((node, index) => (
              <TimelineNodeWrapper key={node.id} node={node} index={index} progress={progress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineNodeWrapper({ node, index, progress }: { node: TimelineNode; index: number; progress: any }) {
  const nodeThreshold = (index + 0.5) / nodes.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative flex items-center gap-8 ${node.align === 'left' ? 'flex-row' : 'flex-row-reverse'} w-full`}
    >
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, x: node.align === 'left' ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-2xl"
        >
          <div className={`flex items-center gap-3 mb-4 ${node.align === 'left' ? 'justify-end' : ''}`}>
            <div className="text-2xl">{node.icon}</div>
            <div className={node.align === 'left' ? 'text-right' : ''}>
              <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase block">
                Paso {node.id}
              </span>
              <h3 className="text-lg md:text-xl font-black text-white">{node.title}</h3>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-400 mb-2">{node.subtitle}</p>
          <p className="text-sm text-slate-500 leading-relaxed">{node.description}</p>
        </motion.div>
      </div>

      <div className="relative z-10 flex-shrink-0">
        <motion.div
          className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-800 border border-slate-700"
          whileInView={{
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            boxShadow: '0 0 20px rgba(34,211,238,0.3)',
          }}
          viewport={{ once: false, margin: '-200px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-black text-white">{node.id}</span>
        </motion.div>
      </div>

      <div className="flex-1" />
    </motion.div>
  );
}

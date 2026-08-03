import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';

export default function Reception() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const doorScale = useTransform(scrollYProgress, [0.2, 0.8], [0.85, 1.15]);
  const doorOpacity = useTransform(scrollYProgress, [0.15, 0.5], [0, 1]);
  const overlayOpacity = useTransform(scrollYProgress, [0.3, 0.7], [0, 0.6]);

  return (
    <section ref={ref} className="relative h-[200vh]">
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">

        {/* Background gradient pulses */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px] animate-pulse" />
        </div>

        {/* Hero text */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="absolute z-20 text-center px-6 max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-8"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-300 tracking-widest uppercase">Consultorio Odontológico de Vanguardia</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6"
          >
            Tu sonrisa en{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400">
              manos reales
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Recorre nuestro consultorio de forma digital. Desde la recepción hasta la silla de operaciones, cada paso es una experiencia inmersiva.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-12 flex flex-col items-center gap-2"
          >
            <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">Scroll para entrar</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-5 h-5 text-cyan-400" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Door / Corridor illustration - appears on scroll */}
        <motion.div
          style={{ scale: doorScale, opacity: doorOpacity }}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          {/* Corridor perspective */}
          <div className="relative w-full h-full flex items-center justify-center perspective-[1200px]">
            {/* Left wall */}
            <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-slate-950 via-slate-900/95 to-transparent z-10" />
            {/* Right wall */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-slate-950 via-slate-900/95 to-transparent z-10" />

            {/* Door frame */}
            <div className="relative z-20 w-[320px] md:w-[420px] h-[520px] md:h-[620px] border border-cyan-500/30 rounded-t-[160px] overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.08)]">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/40 via-slate-900/80 to-slate-950/95" />
              {/* Door light stripe */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-cyan-400/60 via-cyan-500/20 to-transparent" />
              {/* Inner glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyan-500/5 to-transparent" />

              {/* Cross / Plus sign */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-20 h-20">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-full bg-cyan-400/40 rounded-full" />
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[3px] bg-cyan-400/40 rounded-full" />
                </div>
              </div>
            </div>

            {/* Floor reflection */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-t from-cyan-500/5 to-transparent blur-xl rounded-full" />
          </div>
        </motion.div>

        {/* Dark overlay that builds up as we scroll deeper */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-slate-950 z-30 pointer-events-none"
        />
      </div>
    </section>
  );
}

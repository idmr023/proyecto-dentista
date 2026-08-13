import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export default function GlassCard({ children, className = '', glow = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={`
        relative backdrop-blur-xl
        bg-white/[0.03] border border-white/[0.06]
        rounded-2xl shadow-2xl
        ${glow ? 'ring-1 ring-cyan-500/20 shadow-cyan-500/5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}

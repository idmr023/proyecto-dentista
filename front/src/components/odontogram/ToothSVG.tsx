import React from 'react';

export interface ToothMark {
  tool: string;
  face: string;
}

export const TOOL_COLORS: Record<string, string> = {
  caries: '#ef4444',
  filled: '#3b82f6',
  missing: '#64748b',
  crown: '#f59e0b',
  implant: '#10b981',
  extraction: '#ef4444',
};

export const FACE_TOOLS = ['caries', 'filled', 'crown'];

export const FACE_LABELS: Record<string, string> = {
  oclusal: 'Oclusal',
  vestibular: 'Vestibular',
  palatina: 'Palatina/Lingual',
  mesial: 'Mesial',
  distal: 'Distal',
};

export const FACE_LAYOUT: { face: string; dx: number; dy: number }[] = [
  { face: 'oclusal', dx: 0, dy: -1 },
  { face: 'mesial', dx: -1, dy: 0 },
  { face: 'vestibular', dx: 0, dy: 0 },
  { face: 'distal', dx: 1, dy: 0 },
  { face: 'palatina', dx: 0, dy: 1 },
];

export const zoneColors: Record<string, { lit: string; grad: [string, string] }> = {
  frontales: { lit: '#22d3ee', grad: ['#0e7490', '#22d3ee'] },
  muelas: { lit: '#a78bfa', grad: ['#6d28d9', '#a78bfa'] },
  encias: { lit: '#34d399', grad: ['#059669', '#34d399'] },
  implantes: { lit: '#fbbf24', grad: ['#d97706', '#fbbf24'] },
  ortodoncia: { lit: '#fb7185', grad: ['#e11d48', '#fb7185'] },
};

export default function ToothSVG({ cx, cy, type, zone, active, marks, readOnly, onFaceCycle, onBodyCycle }: {
  cx: number; cy: number; type: 'incisor' | 'canine' | 'premolar' | 'molar';
  zone: string; active: boolean; marks: ToothMark[]; readOnly?: boolean;
  onFaceCycle?: (face: string) => void; onBodyCycle?: () => void;
}) {
  const c = zoneColors[zone] || zoneColors.frontales;
  const id = `t-${cx}-${cy}`;
  const isMolar = type === 'molar';
  const isCanine = type === 'canine';
  const h = isCanine ? 36 : isMolar ? 22 : 32;
  const w = isMolar ? 10 : isCanine ? 8 : 7;

  const wholeMark = marks.find(m => m.face === 'all');
  const wholeTool = wholeMark?.tool || null;
  const faceTool = (face: string) => marks.find(m => m.face === face && FACE_TOOLS.includes(m.tool))?.tool;

  const cubeSize = 3;
  const my = cy + 44;

  return (
    <g className={readOnly ? '' : 'cursor-pointer'}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={active ? c.lit : '#94a3b8'} stopOpacity={active ? 0.9 : 0.3} />
          <stop offset="100%" stopColor={active ? c.grad[0] : '#475569'} stopOpacity={active ? 0.8 : 0.15} />
        </linearGradient>
      </defs>

      {/* Crown */}
      <path
        d={`M ${cx - w} ${cy} C ${cx - w - 1} ${cy - 3}, ${cx - w} ${cy - h}, ${cx - 1} ${cy - h - 10} C ${cx + 1} ${cy - h - 12}, ${cx + w - 2} ${cy - h - 12}, ${cx + w - 1} ${cy - h - 10} C ${cx + w + 1} ${cy - h}, ${cx + w + 2} ${cy - 3}, ${cx + w + 1} ${cy} C ${cx + w + 1} ${cy + 3}, ${cx + w - 2} ${cy + 5}, ${cx} ${cy + 6} C ${cx - w + 2} ${cy + 5}, ${cx - w - 1} ${cy + 3}, ${cx - w} ${cy} Z`}
        fill={`url(#${id})`}
        stroke={active ? c.lit : 'rgba(148,163,184,0.25)'}
        strokeWidth={active ? 1.2 : 0.6}
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* Root(s) */}
      {(isMolar || type === 'premolar') && (
        <>
          <path d={`M ${cx - 3} ${cy + 5} C ${cx - 4} ${cy + 12}, ${cx - 5} ${cy + 22}, ${cx - 3} ${cy + 30} C ${cx - 2} ${cy + 32}, ${cx} ${cy + 32}, ${cx + 1} ${cy + 30} C ${cx + 3} ${cy + 22}, ${cx + 2} ${cy + 12}, ${cx + 2} ${cy + 5}`}
            fill={active ? c.grad[0] : '#1e293b'} fillOpacity={active ? 0.5 : 0.2}
            stroke={active ? c.lit : 'rgba(148,163,184,0.15)'} strokeWidth={active ? 0.8 : 0.4}
            style={{ transition: 'all 0.3s ease' }} />
          {isMolar && (
            <path d={`M ${cx + 2} ${cy + 5} C ${cx + 2} ${cy + 12}, ${cx + 3} ${cy + 22}, ${cx + 4} ${cy + 30} C ${cx + 5} ${cy + 32}, ${cx + 7} ${cy + 32}, ${cx + 8} ${cy + 30} C ${cx + 10} ${cy + 22}, ${cx + 9} ${cy + 12}, ${cx + 8} ${cy + 5}`}
              fill={active ? c.grad[0] : '#1e293b'} fillOpacity={active ? 0.5 : 0.2}
              stroke={active ? c.lit : 'rgba(148,163,184,0.15)'} strokeWidth={active ? 0.8 : 0.4}
              style={{ transition: 'all 0.3s ease' }} />
          )}
        </>
      )}
      {!isMolar && type !== 'premolar' && (
        <path d={`M ${cx - 2} ${cy + 5} C ${cx - 3} ${cy + 12}, ${cx - 3} ${cy + 22}, ${cx - 1} ${cy + 30} C ${cx} ${cy + 32}, ${cx + 2} ${cy + 32}, ${cx + 3} ${cy + 30} C ${cx + 5} ${cy + 22}, ${cx + 4} ${cy + 12}, ${cx + 3} ${cy + 5}`}
          fill={active ? c.grad[0] : '#1e293b'} fillOpacity={active ? 0.5 : 0.2}
          stroke={active ? c.lit : 'rgba(148,163,184,0.15)'} strokeWidth={active ? 0.8 : 0.4}
          style={{ transition: 'all 0.3s ease' }} />
      )}

      {/* Whole-tooth conditions (as dentists chart them) */}
      {wholeTool === 'missing' && (
        <g stroke="#64748b" strokeWidth={2} opacity={0.95}>
          <line x1={cx - w} y1={cy - h - 10} x2={cx + w} y2={cy + 5} />
          <line x1={cx + w} y1={cy - h - 10} x2={cx - w} y2={cy + 5} />
        </g>
      )}
      {wholeTool === 'extraction' && (
        <g stroke="#ef4444" strokeWidth={2} opacity={0.95}>
          <line x1={cx - w} y1={cy - h - 10} x2={cx + w} y2={cy + 5} />
          <line x1={cx + w} y1={cy - h - 10} x2={cx - w} y2={cy + 5} />
        </g>
      )}
      {wholeTool === 'implant' && (
        <polygon points={`${cx},${cy + 32} ${cx - 3},${cy + 40} ${cx + 3},${cy + 40}`}
          fill="#10b981" fillOpacity={0.9} stroke="#10b981" strokeWidth={0.5} />
      )}

      {/* Clickable body overlay (whole-tooth conditions) */}
      {!readOnly && onBodyCycle && (
        <rect x={cx - w - 3} y={cy - h - 14} width={w * 2 + 6} height={h + 48}
          fill="transparent" onClick={(e) => { e.stopPropagation(); onBodyCycle(); }}>
          <title>Condición de pieza completa (Ausente / Extracción / Implante)</title>
        </rect>
      )}

      {/* Cross of 5 face cubes */}
      {FACE_LAYOUT.map(({ face, dx, dy }) => {
        const tool = faceTool(face);
        const color = tool ? TOOL_COLORS[tool] : '#64748b';
        const lit = Boolean(tool);
        const px = cx + dx * 4.5;
        const py = my + dy * 4.5;
        return (
          <g key={face} onClick={(e) => {
            e.stopPropagation();
            if (!readOnly && onFaceCycle) onFaceCycle(face);
          }}>
            <title>{FACE_LABELS[face]}</title>
            <rect x={px - cubeSize / 2} y={py - cubeSize / 2} width={cubeSize} height={cubeSize} rx={0.5}
              fill={color} fillOpacity={lit ? 1 : 0.15} stroke={color} strokeWidth={lit ? 0.8 : 0.3}
              style={{ transition: 'all 0.2s' }} />
          </g>
        );
      })}
    </g>
  );
}

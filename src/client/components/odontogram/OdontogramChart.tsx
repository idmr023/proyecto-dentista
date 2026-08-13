import React, { useState } from 'react';
import ToothSVG, { ToothMark, zoneColors } from './ToothSVG.tsx';

const teethData = [
  { x: 35, zone: 'muelas', label: '18', type: 'molar' as const },
  { x: 80, zone: 'muelas', label: '17', type: 'molar' as const },
  { x: 125, zone: 'muelas', label: '16', type: 'molar' as const },
  { x: 168, zone: 'muelas', label: '15', type: 'premolar' as const },
  { x: 208, zone: 'ortodoncia', label: '14', type: 'premolar' as const },
  { x: 248, zone: 'frontales', label: '13', type: 'canine' as const },
  { x: 286, zone: 'frontales', label: '12', type: 'incisor' as const },
  { x: 322, zone: 'frontales', label: '11', type: 'incisor' as const },
  { x: 358, zone: 'frontales', label: '21', type: 'incisor' as const },
  { x: 394, zone: 'frontales', label: '22', type: 'incisor' as const },
  { x: 432, zone: 'frontales', label: '23', type: 'canine' as const },
  { x: 472, zone: 'ortodoncia', label: '24', type: 'premolar' as const },
  { x: 512, zone: 'muelas', label: '25', type: 'premolar' as const },
  { x: 555, zone: 'muelas', label: '26', type: 'molar' as const },
  { x: 600, zone: 'muelas', label: '27', type: 'molar' as const },
  { x: 645, zone: 'muelas', label: '28', type: 'molar' as const },
];

export default function OdontogramChart({ marks, readOnly, onFaceCycle, onBodyCycle }: {
  marks: Record<number, ToothMark[]>;
  readOnly?: boolean;
  onFaceCycle?: (toothId: number, face: string) => void;
  onBodyCycle?: (toothId: number) => void;
}) {
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const upperToothId = (label: string) => parseInt(label);
  const lowerToothId = (label: string) => {
    const num = parseInt(label);
    return num >= 11 && num <= 18 ? num + 30 : num >= 21 && num <= 28 ? num + 10 : num;
  };

  return (
    <svg viewBox="0 0 690 520" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg"
      onMouseLeave={() => setActiveZone(null)}>
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="690" height="520" fill="url(#grid)" />
      <text x="345" y="16" textAnchor="middle" className="text-[9px] font-bold" fill="rgba(255,255,255,0.15)">ARCADA SUPERIOR</text>

      <g transform="translate(0, 30)">
        {teethData.map((t, i) => (
          <g key={i} onMouseEnter={() => setActiveZone(t.zone)}>
            <ToothSVG cx={t.x} cy={120} type={t.type} zone={t.zone} active={activeZone === t.zone}
              marks={marks[upperToothId(t.label)] || []} readOnly={readOnly}
              onFaceCycle={onFaceCycle ? (face) => onFaceCycle(upperToothId(t.label), face) : undefined}
              onBodyCycle={onBodyCycle ? () => onBodyCycle(upperToothId(t.label)) : undefined} />
            <text x={t.x} y={56} textAnchor="middle" className="text-[8px] font-bold select-none"
              fill={activeZone === t.zone ? '#22d3ee' : 'rgba(255,255,255,0.18)'} style={{ transition: 'fill 0.3s' }}>
              {t.label}
            </text>
          </g>
        ))}
      </g>

      <line x1="50" y1="260" x2="640" y2="260" stroke="rgba(34,211,238,0.08)" strokeWidth="0.5" strokeDasharray="4,6" />
      <text x="345" y="280" textAnchor="middle" className="text-[9px] font-bold" fill="rgba(255,255,255,0.15)">ARCADA INFERIOR</text>

      <g transform="translate(0, 300)">
        {teethData.map((t, i) => {
          const inv = lowerToothId(t.label);
          return (
            <g key={i} onMouseEnter={() => setActiveZone(t.zone)}>
              <g transform={`translate(${t.x}, 60) scale(1, -1) translate(${-t.x}, -60)`}>
                <ToothSVG cx={t.x} cy={60} type={t.type} zone={t.zone} active={activeZone === t.zone}
                  marks={marks[inv] || []} readOnly={readOnly}
                  onFaceCycle={onFaceCycle ? (face) => onFaceCycle(inv, face) : undefined}
                  onBodyCycle={onBodyCycle ? () => onBodyCycle(inv) : undefined} />
              </g>
              <text x={t.x} y={140} textAnchor="middle" className="text-[8px] font-bold select-none"
                fill={activeZone === t.zone ? zoneColors[t.zone]?.lit || '#22d3ee' : 'rgba(255,255,255,0.18)'} style={{ transition: 'fill 0.3s' }}>
                {inv}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

import { Stethoscope, Sparkles, HeartHandshake, ShieldCheck } from 'lucide-react';

const reasons = [
  {
    icon: Stethoscope,
    title: 'Atención Personalizada',
    desc: 'Planes de tratamiento hechos a la medida de cada paciente.',
  },
  {
    icon: Sparkles,
    title: 'Tecnología Avanzada',
    desc: 'Equipos de última generación para diagnósticos precisos.',
  },
  {
    icon: HeartHandshake,
    title: 'Trato Cercano',
    desc: 'Te explicamos cada paso y cuidamos tu comodidad siempre.',
  },
  {
    icon: ShieldCheck,
    title: 'Total Confianza',
    desc: 'Higiene, seguridad y bioseguridad en todos los procedimientos.',
  },
];

export default function WhyChooseUs() {
  return (
    <section id="nosotros" className="py-16 md:py-20 bg-[#F0F7FF]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5AB0E4]">¿Por qué nosotros?</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-[#1A2E3D] tracking-tight">Por qué elegirnos</h2>
        </div>

        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {reasons.map(r => (
            <div key={r.title}
              className="group bg-white/60 backdrop-blur border border-[#D6E8F5] rounded-3xl p-6 hover:border-[#5AB0E4]/50 hover:shadow-xl hover:shadow-[#5AB0E4]/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#5AB0E4]/10 flex items-center justify-center group-hover:bg-[#5AB0E4] group-hover:text-white transition-colors">
                <r.icon className="w-6 h-6 text-[#5AB0E4] group-hover:text-white" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#1A2E3D]">{r.title}</h3>
              <p className="mt-1.5 text-xs text-[#5A7A94] leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

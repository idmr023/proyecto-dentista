import GlassCard from '../ui/GlassCard.tsx';

export const WhyChooseUs = () => (
  <section id="why" className="py-16 bg-[#F0F7FF]">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center text-[#1A2E3D] mb-12">Por qué elegirnos</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { title: 'Tecnología Avanzada', icon: '💻' },
          { title: 'Atención Personalizada', icon: '🤝' },
          { title: 'Profesionales Certificados', icon: '🎓' },
          { title: 'Resultados Garantizados', icon: '✨' },
        ].map((item) => (
          <GlassCard key={item.title} className="p-6 flex flex-col items-center gap-4 text-center">
            <span className="text-4xl">{item.icon}</span>
            <h3 className="font-semibold text-[#1A2E3D]">{item.title}</h3>
          </GlassCard>
        ))}
      </div>
    </div>
  </section>
);

import { useState } from 'react';

const services = [
  { id: 'ortodoncia', title: 'Ortodoncia', desc: 'Alineación precisa para tu sonrisa.' },
  { id: 'implantes', title: 'Implantes', desc: 'Soluciones duraderas para piezas faltantes.' },
  { id: 'cirugia', title: 'Cirugía', desc: 'Procedimientos especializados y seguros.' },
];

export const ServicesSection = () => {
  const [active, setActive] = useState(services[0].id);

  return (
    <section id="services" className="py-16 max-w-7xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center text-[#1A2E3D] mb-12">Todo lo que tu sonrisa necesita</h2>
      <div className="grid md:grid-cols-[1fr_2fr] gap-12">
        <div className="flex flex-col gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`text-left px-6 py-4 rounded-xl font-semibold transition ${
                active === s.id ? 'bg-[#5AB0E4] text-white' : 'bg-white text-[#1A2E3D] hover:bg-[#E8F2FA]'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
        <div className="bg-white p-8 rounded-3xl border border-[#D6E8F5] flex flex-col items-center gap-6">
          <div className="w-48 h-48 rounded-full bg-[#D6E8F5]" />
          <h3 className="text-2xl font-bold">{services.find(s => s.id === active)?.title}</h3>
          <p className="text-[#5A7A94] text-center">{services.find(s => s.id === active)?.desc}</p>
        </div>
      </div>
    </section>
  );
};

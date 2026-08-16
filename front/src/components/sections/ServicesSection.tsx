import { useState } from 'react';

const services = [
  {
    id: 'ortodoncia',
    name: 'Ortodoncia',
    desc: 'Alinea tus dientes y corrige la mordida con brackets o alineadores invisibles. Logramos una sonrisa sana y estética en cada etapa de la vida.',
  },
  {
    id: 'implantes',
    name: 'Implantes Dentales',
    desc: 'Reemplazamos piezas perdidas con implantes de titanio de alta calidad, devolviéndote la función y la confianza para sonreír sin límites.',
  },
  {
    id: 'blanqueamiento',
    name: 'Blanqueamiento',
    desc: 'Ilumina tu sonrisa de forma segura y rápida con técnicas profesionales que cuidan tu esmalte y ofrecen resultados visibles desde la primera sesión.',
  },
  {
    id: 'carillas',
    name: 'Carillas',
    desc: 'Diseñadas a la medida de tu rostro, las carillas corrigen color, forma y tamaño para una sonrisa perfecta de aspecto totalmente natural.',
  },
  {
    id: 'endodoncia',
    name: 'Endodoncia',
    desc: 'Salvamos dientes dañados o infectados con tratamientos indoloros de conducto, evitando la extracción y preservando tu dentadura natural.',
  },
  {
    id: 'odontopediatria',
    name: 'Odontopediatría',
    desc: 'Atención especializada y amigable para los más pequeños, creando hábitos de higiene bucal saludables desde la infancia.',
  },
];

export default function ServicesSection() {
  const [active, setActive] = useState(services[0]);

  return (
    <section id="servicios" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5AB0E4]">Nuestros servicios</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-[#1A2E3D] tracking-tight">
            Todo lo que tu sonrisa necesita
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-[1fr_2fr] gap-6 items-start">
          <div className="flex flex-col gap-2">
            {services.map(s => (
              <button key={s.id} onClick={() => setActive(s)}
                className={`text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  active.id === s.id
                    ? 'bg-[#5AB0E4] text-white shadow-lg shadow-[#5AB0E4]/25'
                    : 'bg-white/60 text-[#5A7A94] hover:bg-white hover:text-[#1A2E3D] border border-[#D6E8F5]'
                }`}>
                {s.name}
              </button>
            ))}
          </div>

          <div className="bg-white/70 backdrop-blur border border-[#D6E8F5] rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-36 h-36 md:w-44 md:h-44 flex-shrink-0 rounded-full bg-[#5AB0E4]/10 border border-[#5AB0E4]/30 flex items-center justify-center text-5xl overflow-hidden">
                🦷
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1A2E3D]">{active.name}</h3>
                <p className="mt-3 text-sm md:text-base text-[#5A7A94] leading-relaxed">{active.desc}</p>
                <a href="https://wa.me/51947499397?text=Hola%2C%20quiero%20información%20sobre%20"
                  target="_blank" rel="noreferrer"
                  className="mt-5 inline-block bg-[#25D366] hover:bg-[#1fb959] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">
                  Consultar este servicio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

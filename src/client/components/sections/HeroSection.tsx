import { Check } from 'lucide-react';

export const HeroSection = () => (
  <section id="hero" className="grid md:grid-cols-2 gap-12 items-center py-16 px-6 max-w-7xl mx-auto">
    <div className="space-y-6">
      <h1 className="text-5xl font-bold text-[#1A2E3D] leading-tight">Tu sonrisa, nuestra pasión y compromiso.</h1>
      <p className="text-lg text-[#5A7A94]">Ofrecemos tratamientos de vanguardia para garantizar que luzcas la sonrisa que siempre soñaste.</p>
      <button className="bg-[#5AB0E4] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#4a9ad6] transition">
        Agenda tu cita
      </button>
      <div className="inline-block px-4 py-2 bg-[#E8F2FA] rounded-full text-xs font-semibold text-[#1A2E3D]">
        +10 años de experiencia
      </div>
      <div className="grid grid-cols-2 gap-4">
        {['Ortodoncia', 'Implantes', 'Cirugía', 'Blanqueamiento', 'Odontopediatría', 'Endodoncia'].map((s) => (
          <div key={s} className="flex items-center gap-2 text-sm text-[#1A2E3D]">
            <Check className="w-4 h-4 text-[#5AB0E4]" /> {s}
          </div>
        ))}
      </div>
    </div>
    <div className="h-[400px] border-4 border-dashed border-[#D6E8F5] rounded-3xl flex items-center justify-center text-[#5A7A94]">
      <!-- Aquí va el modelo 3D Interactivo -->
    </div>
  </section>
);


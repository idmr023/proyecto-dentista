import { CheckCircle2, ArrowRight } from 'lucide-react';

const services = [
  'Ortodoncia',
  'Implantes Dentales',
  'Blanqueamiento',
  'Carillas',
  'Endodoncia',
  'Odontopediatría',
];

export default function HeroSection() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7CC4EB]/15 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#F7B8D1]/20 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 bg-[#5AB0E4]/10 border border-[#5AB0E4]/30 text-[#1A2E3D] text-xs font-bold px-4 py-1.5 rounded-full">
            ✨ +10 años de experiencia
          </span>
          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-black text-[#1A2E3D] leading-[1.05] tracking-tight">
            Tu sonrisa,
            <br />
            <span className="text-[#5AB0E4]">nuestra</span> pasión.
          </h1>
          <p className="mt-5 text-base md:text-lg text-[#5A7A94] leading-relaxed max-w-xl">
            Cuidamos la salud bucal de toda tu familia con la tecnología más avanzada y un trato cercano.
            Agenda tu cita online en segundos y conoce por qué somos la clínica dental de confianza.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="/login"
              className="inline-flex items-center gap-2 bg-[#5AB0E4] hover:bg-[#4a9fd4] text-white px-6 py-3.5 rounded-2xl text-sm font-bold transition shadow-md shadow-[#5AB0E4]/25">
              Inicia Sesión para tu Cita <ArrowRight className="w-4 h-4" />
            </a>
            <a href="https://wa.me/51947499397" target="_blank" rel="noreferrer"
              className="px-6 py-3.5 rounded-2xl text-sm font-bold text-[#1A2E3D] border border-[#D6E8F5] bg-white/60 hover:bg-white transition">
              Consulta por WhatsApp
            </a>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 max-w-lg">
            {services.map(s => (
              <div key={s} className="flex items-center gap-2.5 bg-white/70 backdrop-blur border border-[#D6E8F5] rounded-2xl px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-[#5AB0E4] flex-shrink-0" />
                <span className="text-sm font-semibold text-[#1A2E3D]">{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative aspect-[4/3] rounded-3xl border-2 border-dashed border-[#5AB0E4]/40 bg-white/40 backdrop-blur flex items-center justify-center">
          {/* Aquí va el modelo 3D Interactivo */}
          <div className="text-center px-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#5AB0E4]/10 border border-[#5AB0E4]/30 flex items-center justify-center text-2xl">🦷</div>
            <p className="mt-4 text-sm text-[#5A7A94] font-medium">Modelo 3D interactivo</p>
          </div>
        </div>
      </div>
    </section>
  );
}

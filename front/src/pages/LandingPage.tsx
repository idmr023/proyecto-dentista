import { MessageCircle, Phone, MapPin, Clock } from 'lucide-react';
import { Logo } from '../components/ui/Logo.tsx';
import Topbar from '../components/ui/Topbar.tsx';
import Navbar from '../components/ui/Navbar.tsx';
import HeroSection from '../components/sections/HeroSection.tsx';
import WhyChooseUs from '../components/sections/WhyChooseUs.tsx';
import DentalExplorer from '../components/sections/DentalExplorer.tsx';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="bg-[#F0F7FF] text-[#1A2E3D] min-h-screen">
      <Topbar />
      <Navbar onLogin={onLogin} />

      <main>
        <HeroSection />
        <WhyChooseUs />
        <DentalExplorer />

        {/* CTA de agendar (requiere sesión) */}
        <section id="contacto" className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center bg-white/70 backdrop-blur border border-[#D6E8F5] rounded-3xl py-12 px-6">
            <h2 className="text-2xl md:text-3xl font-black text-[#1A2E3D] tracking-tight">
              ¿Listo para tu próxima cita?
            </h2>
            <p className="mt-3 text-sm md:text-base text-[#5A7A94] max-w-lg mx-auto">
              Agenda en línea, de forma rápida y segura. Solo inicia sesión y elige el día y la hora que prefieras.
              Para consultas puntuales, escríbenos por WhatsApp.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={onLogin}
                className="inline-flex items-center gap-2 bg-[#5AB0E4] hover:bg-[#4a9fd4] text-white px-6 py-3.5 rounded-2xl text-sm font-bold transition shadow-md shadow-[#5AB0E4]/25">
                Iniciar Sesión para tu Cita
              </button>
              <a href="https://wa.me/51947499397" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb959] text-white px-6 py-3.5 rounded-2xl text-sm font-bold transition">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D6E8F5] py-10 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-[#5A7A94]">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#5AB0E4]" /> +51 947 499 397</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#5AB0E4]" /> Lun-Vie 8AM-6PM</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#5AB0E4]" /> Av. Principal 123</span>
          </div>
        </div>
        <p className="text-center text-[10px] text-[#5A7A94] mt-8">© 2026 Dental Colors — Sistema de Gestión Odontológica | Creado por <a href="https://portafolio-red-seven.vercel.app/es" className="text-[#5AB0E4] hover:underline">IDMR</a></p>
      </footer>

      {/* WhatsApp flotante para consultas puntuales */}
      <a href="https://wa.me/51947499397" target="_blank" rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1fb959] text-white flex items-center justify-center shadow-xl shadow-[#25D366]/30 transition">
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
}

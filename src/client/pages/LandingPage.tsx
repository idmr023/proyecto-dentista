import { Topbar } from '../components/ui/Topbar.tsx';
import { Navbar } from '../components/ui/Navbar.tsx';
import { HeroSection } from '../components/sections/HeroSection.tsx';
import { WhyChooseUs } from '../components/sections/WhyChooseUs.tsx';
import { ServicesSection } from '../components/sections/ServicesSection.tsx';
import { Logo } from '../components/ui/Logo.tsx';
import { Phone, MapPin, Clock } from 'lucide-react';

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
        <ServicesSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D6E8F5] py-10 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo/>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-[#5A7A94]">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#5AB0E4]" /> +51 970 998 860</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#5AB0E4]" /> Lun-Vie 8AM-6PM</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#5AB0E4]" /> Av. Principal 123</span>
          </div>
        </div>
        <p className="text-center text-[10px] text-[#5A7A94] mt-8">© 2026 Dental Colors — Sistema de Gestión Odontológica | Creado por <a href="https://portafolio-red-seven.vercel.app/es" className="text-[#5AB0E4] hover:underline">IDMR</a></p>
      </footer>
    </div>
  );
}

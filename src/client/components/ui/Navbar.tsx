import { Logo } from './Logo.tsx';

interface NavbarProps {
  onLogin: () => void;
}

export const Navbar = ({ onLogin }: NavbarProps) => (
  <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-[#D6E8F5] h-16 flex items-center justify-between px-6">
    <Logo />
    <div className="hidden md:flex gap-6 text-sm font-medium text-[#1A2E3D]">
      <a href="#hero" className="hover:text-[#5AB0E4]">Inicio</a>
      <a href="#why" className="hover:text-[#5AB0E4]">Por qué elegirnos</a>
      <a href="#services" className="hover:text-[#5AB0E4]">Servicios</a>
    </div>
    <button onClick={onLogin} className="bg-[#5AB0E4] text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-[#4a9ad6] transition">
      Iniciar Sesión
    </button>
  </nav>
);

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Logo } from '../ui/Logo.tsx';

const links = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contacto', href: '#contacto' },
];

export default function Navbar({ onLogin }: { onLogin?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#D6E8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#inicio" className="flex items-center"><Logo size="sm" /></a>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href}
              className="text-sm font-semibold text-[#5A7A94] hover:text-[#1A2E3D] transition">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button onClick={onLogin}
            className="px-4 py-2 rounded-xl text-sm font-bold text-[#1A2E3D] border border-[#D6E8F5] hover:bg-[#F0F7FF] transition">
            Iniciar Sesión
          </button>
          <a href="https://wa.me/51947499397" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb959] text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>

        <button onClick={() => setOpen(o => !o)} className="md:hidden text-[#1A2E3D] text-2xl leading-none">☰</button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#D6E8F5] bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block text-sm font-semibold text-[#5A7A94] hover:text-[#1A2E3D]">
              {l.label}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            <button onClick={() => { setOpen(false); onLogin?.(); }}
              className="flex-1 px-4 py-2 rounded-xl text-sm font-bold text-[#1A2E3D] border border-[#D6E8F5]">
              Iniciar Sesión
            </button>
            <a href="https://wa.me/51947499397" target="_blank" rel="noreferrer"
              className="flex-1 inline-flex justify-center items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl text-sm font-bold">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

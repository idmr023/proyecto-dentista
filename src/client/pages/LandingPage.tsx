import React from 'react';
import Reception from '../components/sections/Reception';
import TreatmentTimeline from '../components/sections/TreatmentTimeline';
import DentalExplorer from '../components/sections/DentalExplorer';
import BookingRoom from '../components/sections/BookingRoom';
import { LogIn, Phone, MapPin, Clock } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Fixed nav */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center text-lg">🦷</div>
            <div className="leading-tight">
              <span className="text-sm font-black text-white block">Twilight Dental</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">Sistema Odontológico</span>
            </div>
          </div>
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] transition px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          >
            <LogIn className="w-4 h-4 text-cyan-400" /> Iniciar Sesión
          </button>
        </div>
      </header>

      <main>
        <Reception />
        <TreatmentTimeline />
        <DentalExplorer />
        <BookingRoom />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-lg">🦷</div>
            <div>
              <p className="text-sm font-bold text-white">Twilight Dental</p>
              <p className="text-[10px] text-slate-500">Sonrisas que dejan huella</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-cyan-400" /> +51 970 998 860</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> Lun-Vie 8AM-6PM</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> Av. Principal 123</span>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-8">© 2026 Twilight Dental — Sistema de Gestión Odontológica</p>
      </footer>
    </div>
  );
}

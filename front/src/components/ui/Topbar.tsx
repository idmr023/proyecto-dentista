import { Phone, Facebook, Instagram } from 'lucide-react';

export default function Topbar() {
  return (
    <div className="h-8 bg-[#1A2E3D] text-white/90 flex items-center justify-between px-4 sm:px-6 text-[11px]">
      <span className="flex items-center gap-1.5">
        <Phone className="w-3 h-3 text-[#7CC4EB]" />
        <span className="font-semibold">Llámanos:</span> +51 947 499 397
      </span>
      <div className="flex items-center gap-3">
        <a href="#" className="hover:text-white transition" aria-label="Facebook"><Facebook className="w-3.5 h-3.5" /></a>
        <a href="#" className="hover:text-white transition" aria-label="Instagram"><Instagram className="w-3.5 h-3.5" /></a>
      </div>
    </div>
  );
}

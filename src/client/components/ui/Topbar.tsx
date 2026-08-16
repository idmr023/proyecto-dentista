import { Phone, Facebook, Instagram } from 'lucide-react';

export const Topbar = () => (
  <div className="h-8 bg-[#1A2E3D] text-white flex items-center justify-between px-4 text-[10px]">
    <span>Llámanos: +51 970 998 860</span>
    <div className="flex gap-3">
      <Facebook className="w-3 h-3" />
      <Instagram className="w-3 h-3" />
    </div>
  </div>
);

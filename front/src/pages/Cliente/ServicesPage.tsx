import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { ArrowRight, Phone, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const services = [
  { title: 'Odontopediatría', desc: 'Cuidado preventivo y lúdico para niños.', icon: '👶' },
  { title: 'Endodoncia', desc: 'Tratamiento de conductos con tecnología rotatoria.', icon: '🦷' },
  { title: 'Implantes Dentales', desc: 'Reemplazo fijo de titanio de alta gama.', icon: '✨' },
  { title: 'Cirugías Dentales', desc: 'Exodoncias complejas y cirugías maxilofaciales.', icon: '🏥' },
  { title: 'Rehabilitación Oral', desc: 'Devolución integral de función y estética.', icon: '💎' },
  { title: 'Ortodoncia', desc: 'Brackets estéticos y alineadores invisibles.', icon: '😁' },
];

export default function ServicesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="bg-gradient-to-r from-[#7CC4EB]/10 via-[#5AB0E4]/10 to-[#7CC4EB]/10 border border-white/[0.06] rounded-2xl p-8 mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1A2E3D]">
          Bienvenido, <span className="bg-gradient-to-r from-[#7CC4EB] to-[#5AB0E4] bg-clip-text text-transparent">{user?.name}</span>
        </h2>
        <p className="text-[#5A7A94] mt-2 text-sm sm:text-base">
          Explora nuestros servicios y agenda tu próxima cita.
        </p>
      </div>

      <h3 className="text-xs font-bold text-[#5A7A94] uppercase tracking-widest mb-4">Nuestros Servicios</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {services.map((s) => (
          <div
            key={s.title}
            className="bg-white border border-[#D6E8F5] rounded-2xl p-6 hover:shadow-lg transition-all group"
          >
            <div className="text-3xl mb-3">{s.icon}</div>
            <h4 className="text-base font-semibold text-[#1A2E3D] mb-1">{s.title}</h4>
            <p className="text-sm text-[#5A7A94] mb-4 leading-relaxed">{s.desc}</p>
            <button
              onClick={() => navigate('/citas', { state: { service: s.title } })}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#5AB0E4] hover:text-[#7CC4EB] transition-colors"
            >
              Agendar ahora <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      <h3 className="text-xs font-bold text-[#5A7A94] uppercase tracking-widest mb-4">Contacto</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#D6E8F5] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Phone size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#5A7A94] uppercase">WhatsApp</p>
            <p className="text-sm font-medium text-[#1A2E3D]">+51 970 998 860</p>
          </div>
        </div>
        <div className="bg-white border border-[#D6E8F5] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#7CC4EB]/10 flex items-center justify-center">
            <Clock size={18} className="text-[#5AB0E4]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#5A7A94] uppercase">Horario</p>
            <p className="text-sm font-medium text-[#1A2E3D]">Lun-Vie 8AM-6PM</p>
          </div>
        </div>
        <div className="bg-white border border-[#D6E8F5] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <MapPin size={18} className="text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#5A7A94] uppercase">Ubicación</p>
            <p className="text-sm font-medium text-[#1A2E3D]">Av. Principal 123</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

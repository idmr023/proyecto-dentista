import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { ArrowRight, Clock, MapPin, Phone, LogOut } from 'lucide-react';
import { Logo } from '../components/ui/Logo.tsx';

const services = [
  { title: 'Odontopediatría', desc: 'Cuidado preventivo y lúdico para niños.', icon: '👶' },
  { title: 'Endodoncia', desc: 'Tratamiento de conductos con tecnología rotatoria.', icon: '🦷' },
  { title: 'Implantes Dentales', desc: 'Reemplazo fijo de titanio de alta gama.', icon: '✨' },
  { title: 'Cirugías Dentales', desc: 'Exodoncias complejas y cirugías maxilofaciales.', icon: '🏥' },
  { title: 'Rehabilitación Oral', desc: 'Devolución integral de función y estética.', icon: '💎' },
  { title: 'Ortodoncia', desc: 'Brackets estéticos y alineadores invisibles.', icon: '😁' },
];
const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

type Tab = 'services' | 'appointments' | 'shop' | 'orders';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface Patient {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface OrderItem {
  product_id: string;
  qty: number;
  name?: string;
  price?: number;
}

interface Order {
  id: string;
  user_name: string;
  user_email: string;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface CartItem {
  product: Product;
  qty: number;
}

const statusColors: Record<string, string> = {
  pagada: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pendiente: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  cancelada: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('services');
  const [products, setProducts] = useState<Product[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '',
    service: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });
  const [appointmentMsg, setAppointmentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, patientRes, orderRes] = await Promise.all([
        api('/products').catch(() => null),
        api('/patients').catch(() => null),
        api('/orders').catch(() => null),
      ]);
      setProducts(prodRes?.products || []);
      setPatients(patientRes?.patients || []);
      setOrders(orderRes?.orders || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (appointmentMsg) {
      const t = setTimeout(() => setAppointmentMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [appointmentMsg]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.product.id === productId ? { ...c, qty: c.qty + delta } : c
        )
        .filter((c) => c.qty > 0)
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.product.price * c.qty, 0);

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAppointmentMsg(null);
    try {
      await api('/appointments', {
        method: 'POST',
        body: appointmentForm,
      });
      setAppointmentMsg({ type: 'success', text: 'Cita registrada exitosamente.' });
      setAppointmentForm({ patient_id: '', service: '', appointment_date: '', appointment_time: '', notes: '' });
    } catch (err) {
      setAppointmentMsg({ type: 'error', text: (err as Error).message || 'Error al registrar la cita.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      await api('/orders', {
        method: 'POST',
        body: { items: cart.map((c) => ({ product_id: c.product.id, qty: c.qty })) },
      });
      setCart([]);
      setTab('orders');
      loadData();
    } catch (err) {
      alert((err as Error).message || 'Error al procesar el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  const preSelectService = (serviceTitle: string) => {
    setAppointmentForm((prev) => ({ ...prev, service: serviceTitle }));
    setTab('appointments');
  };

  const userOrders = orders.filter(
    (o) => o.user_email === user?.email || o.user_name === user?.name
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'services', label: 'Servicios' },
    { key: 'appointments', label: 'Citas' },
    { key: 'shop', label: 'Tienda' },
    { key: 'orders', label: 'Pedidos' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-[#1A2E3D]">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#D6E8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === t.key
                    ? 'bg-[#7CC4EB]/20 text-[#1A2E3D] font-bold shadow-sm'
                    : 'text-[#5A7A94] hover:text-[#1A2E3D] hover:bg-[#E8F2FA]'
                }`}
              >
                {t.label}
                {t.key === 'shop' && cart.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-[#7CC4EB] text-white rounded-full">
                    {cart.reduce((s, c) => s + c.qty, 0)}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-[#1A2E3D]">{user?.name}</p>
              <p className="text-xs text-[#5A7A94]">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7CC4EB] to-[#F7B8D1] flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-[#5A7A94] hover:text-red-500 hover:bg-red-500/10 transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="md:hidden flex overflow-x-auto border-t border-[#D6E8F5] px-4 gap-1 py-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                tab === t.key
                  ? 'bg-[#7CC4EB]/20 text-[#1A2E3D] font-bold'
                  : 'text-[#5A7A94] hover:text-[#1A2E3D]'
              }`}
            >
              {t.label}
              {t.key === 'shop' && cart.length > 0 && (
                <span className="ml-1.5 px-1 py-0.5 text-[9px] bg-[#7CC4EB] text-white rounded-full">
                  {cart.reduce((s, c) => s + c.qty, 0)}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-cyan-500/10 border border-white/[0.06] rounded-2xl p-8 mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                    Bienvenido, <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">{user?.name}</span>
                  </h2>
                  <p className="text-slate-400 mt-2 text-sm sm:text-base">
                    Explora nuestros servicios y agenda tu próxima cita.
                  </p>
                </div>

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Nuestros Servicios</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                  {services.map((s) => (
                    <div
                      key={s.title}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] transition-all group"
                    >
                      <div className="text-3xl mb-3">{s.icon}</div>
                      <h4 className="text-base font-semibold text-slate-100 mb-1">{s.title}</h4>
                      <p className="text-sm text-slate-400 mb-4 leading-relaxed">{s.desc}</p>
                      <button
                        onClick={() => preSelectService(s.title)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Agendar ahora <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contacto</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Phone size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">WhatsApp</p>
                      <p className="text-sm font-medium text-slate-200">+51 970 998 860</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <Clock size={18} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Horario</p>
                      <p className="text-sm font-medium text-slate-200">Lun-Vie 8AM-6PM</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <MapPin size={18} className="text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Ubicación</p>
                      <p className="text-sm font-medium text-slate-200">Av. Principal 123</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'appointments' && (
              <motion.div
                key="appointments"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl mx-auto"
              >
                <h2 className="text-xl font-bold text-slate-100 mb-6">Agendar Cita</h2>

                <AnimatePresence>
                  {appointmentMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mb-6 px-5 py-3 rounded-xl text-sm font-medium border ${
                        appointmentMsg.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {appointmentMsg.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form
                  onSubmit={handleAppointmentSubmit}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-6"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Paciente</label>
                    <select
                      value={appointmentForm.patient_id}
                      onChange={(e) => setAppointmentForm((f) => ({ ...f, patient_id: e.target.value }))}
                      required
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none"
                    >
                      <option value="" className="bg-slate-900">Seleccionar paciente</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Servicio</label>
                    <select
                      value={appointmentForm.service}
                      onChange={(e) => setAppointmentForm((f) => ({ ...f, service: e.target.value }))}
                      required
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none"
                    >
                      <option value="" className="bg-slate-900">Seleccionar servicio</option>
                      {services.map((s) => (
                        <option key={s.title} value={s.title} className="bg-slate-900">{s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Fecha</label>
                      <input
                        type="date"
                        value={appointmentForm.appointment_date}
                        onChange={(e) => setAppointmentForm((f) => ({ ...f, appointment_date: e.target.value }))}
                        required
                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Hora</label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setAppointmentForm((f) => ({ ...f, appointment_time: slot }))}
                            className={`py-2 rounded-lg text-xs font-medium transition-all ${
                              appointmentForm.appointment_time === slot
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08]'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Notas</label>
                    <textarea
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm((f) => ({ ...f, notes: e.target.value }))}
                      rows={3}
                      placeholder="Motivo de la consulta, síntomas, etc."
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {submitting ? 'Agendando...' : 'Agendar Cita'}
                  </button>
                </form>
              </motion.div>
            )}

            {tab === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-bold text-slate-100 mb-6">Tienda</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                  {products.map((p) => (
                    <div key={p.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col">
                      <h4 className="text-base font-semibold text-slate-100 mb-1">{p.name}</h4>
                      <p className="text-sm text-slate-400 mb-3 leading-relaxed flex-1">{p.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-cyan-400">S/ {p.price.toFixed(2)}</span>
                        <button
                          onClick={() => addToCart(p)}
                          disabled={p.stock <= 0}
                          className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs font-semibold text-slate-200 hover:bg-white/[0.1] transition-all disabled:opacity-40"
                        >
                          {p.stock > 0 ? 'Agregar' : 'Agotado'}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">
                        {p.stock > 0 ? `${p.stock} en stock` : 'Sin stock'}
                      </p>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <p className="text-slate-500 text-sm col-span-full text-center py-12">No hay productos disponibles.</p>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Carrito</h3>
                    <div className="space-y-3 mb-4">
                      {cart.map((c) => (
                        <div key={c.product.id} className="flex items-center justify-between bg-white/[0.04] rounded-xl px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{c.product.name}</p>
                            <p className="text-xs text-slate-500">S/ {c.product.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartQty(c.product.id, -1)}
                                className="w-7 h-7 rounded-lg bg-white/[0.06] text-slate-300 text-xs font-bold hover:bg-white/[0.1] transition-all"
                              >
                                -
                              </button>
                              <span className="text-sm font-medium text-slate-200 w-6 text-center">{c.qty}</span>
                              <button
                                onClick={() => updateCartQty(c.product.id, 1)}
                                className="w-7 h-7 rounded-lg bg-white/[0.06] text-slate-300 text-xs font-bold hover:bg-white/[0.1] transition-all"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(c.product.id)}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                      <span className="text-sm text-slate-400">Total</span>
                      <span className="text-xl font-bold text-cyan-400">S/ {cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={submitting}
                      className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {submitting ? 'Procesando...' : 'Ir a Pagar'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-bold text-slate-100 mb-6">Mis Pedidos</h2>
                {userOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-slate-500 text-sm">No tienes pedidos aún.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((o) => (
                      <div key={o.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-200">
                              Pedido #{o.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(o.created_at).toLocaleDateString('es-PE', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${statusColors[o.status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-slate-500">{o.items.length} artículo{o.items.length !== 1 ? 's' : ''}</p>
                          <p className="text-base font-bold text-cyan-400">S/ {o.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

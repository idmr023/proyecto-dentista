import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../lib/api.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';

const statusColors: Record<string, string> = {
  pagada: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  pendiente: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  cancelada: 'bg-red-500/20 text-red-600 border-red-500/30',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/orders').then(res => {
      setOrders(res.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const userOrders = orders.filter(
    (o) => o.user_email === user?.email || o.user_name === user?.name
  );

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#7CC4EB] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="text-xl font-bold text-[#1A2E3D] mb-6">Mis Pedidos</h2>
      {userOrders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#D6E8F5] rounded-2xl shadow-sm">
          <p className="text-[#5A7A94] text-sm">No tienes pedidos aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((o) => (
            <div key={o.id} className="bg-white border border-[#D6E8F5] rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1A2E3D]">
                    Pedido #{o.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-[#5A7A94] mt-1">
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
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${statusColors[o.status] || 'bg-slate-500/20 text-slate-500 border-slate-500/30'}`}>
                    {o.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-[#5A7A94] font-medium">{o.items.length} artículo{o.items.length !== 1 ? 's' : ''}</p>
                <p className="text-base font-bold text-[#5AB0E4]">S/ {o.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../client/lib/api.ts';
import { Package } from 'lucide-react';

export default function PurchasesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/orders').catch(() => ({ orders: [] })),
      api('/products').catch(() => ({ products: [] })),
    ]).then(([oRes, pRes]) => {
      setOrders(oRes.orders || []);
      setProducts(pRes.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-2">
          <span className="text-xs text-slate-500 font-semibold">Total Pedidos</span>
          <span className="text-3xl font-black text-white">{orders.length}</span>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-2">
          <span className="text-xs text-slate-500 font-semibold">Ingresos Totales</span>
          <span className="text-3xl font-black text-emerald-400">S/. {orders.reduce((s, o) => s + o.total, 0).toFixed(2)}</span>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-2">
          <span className="text-xs text-slate-500 font-semibold">Productos Activos</span>
          <span className="text-3xl font-black text-cyan-400">{products.length}</span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white">Historial de Compras/Pedidos</h3>
      {orders.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No hay compras ni pedidos aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-bold text-white">{o.user_name || 'Cliente'}</span>
                  <span className="text-xs text-slate-500 ml-2">{o.user_email}</span>
                </div>
                <span className="text-lg font-black text-cyan-400">S/. {o.total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{new Date(o.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    o.status === 'pagada' ? 'bg-emerald-500/20 text-emerald-300' :
                    o.status === 'cancelada' ? 'bg-red-500/20 text-red-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>{o.status}</span>
                  {o.items && <span className="text-[10px] text-slate-500">{o.items.length} ítems</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

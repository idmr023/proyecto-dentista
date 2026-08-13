import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../lib/api.ts';
import { useCart } from '../../contexts/CartContext.tsx';
import { useNavigate } from 'react-router-dom';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, removeFromCart, updateCartQty, cartTotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api('/products').then(res => {
      setProducts(res.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      await api('/orders', {
        method: 'POST',
        body: { items: cart.map((c) => ({ product_id: c.product.id, qty: c.qty })) },
      });
      clearCart();
      navigate('/pedidos');
    } catch (err) {
      alert((err as Error).message || 'Error al procesar el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#7CC4EB] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="text-xl font-bold text-[#1A2E3D] mb-6">Tienda Dental</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {products.map((p) => (
          <div key={p.id} className="bg-white border border-[#D6E8F5] rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition-all">
            <h4 className="text-base font-semibold text-[#1A2E3D] mb-1">{p.name}</h4>
            <p className="text-sm text-[#5A7A94] mb-3 leading-relaxed flex-1">{p.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[#5AB0E4]">S/ {p.price.toFixed(2)}</span>
              <button
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                className="px-4 py-2 rounded-xl bg-[#F0F7FF] border border-[#D6E8F5] text-xs font-semibold text-[#1A2E3D] hover:bg-[#7CC4EB] hover:text-white transition-all disabled:opacity-40"
              >
                {p.stock > 0 ? 'Agregar' : 'Agotado'}
              </button>
            </div>
            <p className="text-[10px] text-[#5A7A94] mt-2">
              {p.stock > 0 ? `${p.stock} en stock` : 'Sin stock'}
            </p>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-[#5A7A94] text-sm col-span-full text-center py-12">No hay productos disponibles.</p>
        )}
      </div>

      {cart.length > 0 && (
        <div className="bg-white border border-[#D6E8F5] rounded-2xl p-6 shadow-lg">
          <h3 className="text-xs font-bold text-[#5A7A94] uppercase tracking-widest mb-4">Carrito de Compras</h3>
          <div className="space-y-3 mb-4">
            {cart.map((c) => (
              <div key={c.product.id} className="flex items-center justify-between bg-[#F0F7FF] rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A2E3D] truncate">{c.product.name}</p>
                  <p className="text-xs text-[#5A7A94]">S/ {c.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQty(c.product.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-[#D6E8F5] text-[#1A2E3D] text-xs font-bold hover:bg-[#D6E8F5] transition-all"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium text-[#1A2E3D] w-6 text-center">{c.qty}</span>
                    <button
                      onClick={() => updateCartQty(c.product.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-[#D6E8F5] text-[#1A2E3D] text-xs font-bold hover:bg-[#D6E8F5] transition-all"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(c.product.id)}
                    className="text-xs text-red-500 hover:text-red-600 font-semibold"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#D6E8F5] pt-4">
            <span className="text-sm text-[#5A7A94]">Total a pagar</span>
            <span className="text-xl font-bold text-[#5AB0E4]">S/ {cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#7CC4EB] to-[#5AB0E4] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md shadow-[#7CC4EB]/20"
          >
            {submitting ? 'Procesando...' : 'Finalizar Compra'}
          </button>
        </div>
      )}
    </motion.div>
  );
}

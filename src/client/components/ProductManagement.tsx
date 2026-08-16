import { useState, useEffect } from 'react';
import { api } from '../lib/api.ts';
import { Package, TrendingUp, AlertCircle, DollarSign, Edit2, Trash2, Plus, Search } from 'lucide-react';

export default function ProductManagement() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api('/products');
      setProducts(data.products || []);
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este producto?')) {
      try {
        await api(`/products/${id}`, { method: 'DELETE' });
        loadProducts();
      } catch (e) {
        console.error('Error deleting product:', e);
      }
    }
  };

  const handleSave = async (productData: any) => {
    try {
      if (editingProduct) {
        await api(`/products/${editingProduct.id}`, { method: 'PUT', body: productData });
      } else {
        await api('/products', { method: 'POST', body: productData });
      }
      setShowModal(false);
      setEditingProduct(null);
      loadProducts();
    } catch (e) {
      console.error('Error saving product:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Package className="w-8 h-8 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-cyan-400" /> Gestión de Productos
        </h3>
        <button
          onClick={() => { setEditingProduct(null); setShowModal(true); }}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo Producto
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No hay productos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white mb-1">{product.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{product.description}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => { setEditingProduct(product); setShowModal(true); }}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t border-white/[0.05]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Precio:</span>
                  <span className="text-sm font-bold text-cyan-400">S/. {product.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Stock:</span>
                  <span className={`text-sm font-bold ${product.stock > 10 ? 'text-emerald-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                    {product.stock} unidades
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Estado:</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${product.stock > 0
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-red-500/20 text-red-300'
                  }`}>{
                    product.stock > 10 ? 'Bueno' : product.stock > 0 ? 'Bajo' : 'Agotado'
                  }</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave }: { product: any; onClose: () => void; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (formData.price <= 0) newErrors.price = 'El precio debe ser mayor a 0';
    if (formData.stock < 0) newErrors.stock = 'El stock no puede ser negativo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-slate-900 border border-white/[0.08] rounded-3xl p-8 w-full max-w-lg space-y-5 shadow-2xl"
      >
        <h3 className="text-lg font-bold text-white">
          {product ? 'Editar' : 'Nuevo'} Producto
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm text-white outline-none transition ${errors.name ? 'border-red-500/40' : 'border-white/[0.08] focus:ring-2 focus:ring-cyan-500/40'}`}
              placeholder="Nombre del producto"
            />
            {errors.name && <p className="text-[10px] text-red-400">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40 transition resize-none"
              placeholder="Descripción del producto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Precio *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm text-white outline-none transition ${errors.price ? 'border-red-500/40' : 'border-white/[0.08] focus:ring-2 focus:ring-cyan-500/40'}`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-[10px] text-red-400">{errors.price}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Stock *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm text-white outline-none transition ${errors.stock ? 'border-red-500/40' : 'border-white/[0.08] focus:ring-2 focus:ring-cyan-500/40'}`}
                placeholder="0"
              />
              {errors.stock && <p className="text-[10px] text-red-400">{errors.stock}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/[0.05] text-slate-400 py-3 rounded-xl text-sm font-semibold hover:bg-white/[0.08] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

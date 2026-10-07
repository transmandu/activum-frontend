import React from 'react';
import { X, ShoppingCart, Trash2, Minus, Package } from 'lucide-react';

const ModalCarrito = ({ isOpen, onClose, carrito, vaciarCarrito, eliminarDelCarrito }) => {
  if (!isOpen) return null;

  const items = Array.isArray(carrito) ? carrito : [];
  const totalItems = items.reduce((sum, item) => sum + (item.cantidad || 0), 0);

  const generarCodigo = (id) => {
    if (!id) return 'CON-000';
    return `CON-${String(id).padStart(3, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header con diseño mejorado */}
        <div className="px-6 py-4 bg-linear-to-r from-orange-50 to-amber-50/80 border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-orange-200/50 text-orange-600">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Carrito de Consumibles</h2>
              <p className="text-xs font-medium text-slate-500">
                {totalItems} {totalItems === 1 ? 'item seleccionado' : 'items seleccionados'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/60 transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido con diseño de tarjetas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-50">🛒</div>
              <p className="text-sm font-semibold text-slate-500">El carrito está vacío</p>
              <p className="text-xs text-slate-400 mt-1">Agrega consumibles desde el inventario usando el botón <span className="font-mono bg-slate-200 px-2 py-0.5 rounded">-</span></p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/50">
                      <Package size={14} />
                    </div>
                    <span className="font-bold text-slate-800 truncate">{item.nombre || 'Sin nombre'}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 ml-8">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {generarCodigo(item.id)}
                    </span>
                    <span className="text-xs font-medium text-slate-600">
                      Cantidad: <strong className="text-slate-800">{item.cantidad || 0}</strong>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => eliminarDelCarrito(item.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-200"
                  title="Quitar uno del carrito"
                >
                  <Minus size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer con acciones mejoradas */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {items.length > 0 ? `${items.length} ${items.length === 1 ? 'consumible' : 'consumibles'}` : 'Sin items'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={vaciarCarrito}
              disabled={items.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 bg-white hover:bg-rose-50 rounded-xl border border-rose-200/50 hover:border-rose-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Trash2 size={15} />
              <span>Vaciar Carrito</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCarrito;
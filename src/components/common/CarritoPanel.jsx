// src/components/common/CarritoPanel.jsx
import React from 'react';
import { X, ShoppingCart, Trash2, Minus, Plus, ClipboardCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';

const CarritoPanel = ({ isOpen, onClose }) => {
  const { 
    carrito, 
    incrementarCarrito, 
    decrementarCarrito, 
    vaciarCarrito, 
    consumibles,
    registrarSalidaCarrito,
    cargarConsumibles,
    cargarMovimientos,
    totalCarrito
  } = useData();

  if (!isOpen) return null;

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  const obtenerStock = (id, color) => {
    const item = consumibles?.find(c => c.id === id);
    if (!item) return 0;
    if (color) {
      const colorItem = item.colores?.find(c => c.color === color);
      return colorItem ? colorItem.cantidad : 0;
    }
    return item.cantidad || 0;
  };

  const handleRegistrarMovimiento = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío. Agrega artículos primero.');
      return;
    }

    const confirmar = window.confirm(
      `¿Registrar movimiento de ${totalItems} artículo(s)?\n\nSe descontarán del inventario y se vaciará el carrito.`
    );
    if (!confirmar) return;

    try {
      await registrarSalidaCarrito(
        carrito.map(item => ({ 
          id: item.id, 
          cantidad: item.cantidad,
          color: item.color || null
        })),
        'Salida desde carrito'
      );
      await cargarConsumibles(1);
      await cargarMovimientos({}, 1);
      alert('Movimiento registrado correctamente. El carrito se ha vaciado.');
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      alert('Error al registrar el movimiento. Revisa la consola.');
    }
  };

  const handleAgregarUno = (item) => {
    incrementarCarrito(item);
  };

  const handleEliminarUno = (item) => {
    decrementarCarrito(item);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200">
        {/* Cabecera */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-linear-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Carrito</h3>
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
              {totalItems}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {carrito.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Carrito vacío</p>
              <p className="text-xs">Agrega artículos desde el inventario</p>
            </div>
          ) : (
            carrito.map((item) => {
              const stock = obtenerStock(item.id, item.color);
              // ✅ Mostrar nombre sin duplicar el color (el nombre ya incluye el color si se agregó desde un color específico)
              const nombreMostrar = item.nombre;
              // ✅ Obtener tipo y modelo para mostrarlos en detalles
              const tipo = item.categoria?.nombre || '';
              const modelo = item.modelo?.nombre || '';

              return (
                <div
                  key={`${item.id}-${item.color || 'sin-color'}`}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{nombreMostrar}</p>
                    {/* ✅ Mostrar tipo y modelo si existen */}
                    {(tipo || modelo) && (
                      <p className="text-[10px] text-slate-500 truncate">
                        {tipo && <span>Tipo: {tipo}</span>}
                        {tipo && modelo && <span className="mx-1">|</span>}
                        {modelo && <span>Modelo: {modelo}</span>}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-medium">Cant: {item.cantidad}</span>
                      <span className="text-emerald-600 font-medium">Stock: {stock}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleAgregarUno(item)}
                      className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
                      title="Agregar uno más (descuenta del stock)"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => handleEliminarUno(item)}
                      className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors"
                      title="Quitar uno (devuelve al stock)"
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Botones de acción */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
          <button
            onClick={handleRegistrarMovimiento}
            disabled={carrito.length === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ClipboardCheck size={16} />
            Registrar Movimiento
          </button>
          <button
            onClick={vaciarCarrito}
            disabled={carrito.length === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            Vaciar carrito
          </button>
          <div className="text-xs text-slate-400 text-center pt-1">
            Total de ítems: <strong>{totalItems}</strong>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarritoPanel;
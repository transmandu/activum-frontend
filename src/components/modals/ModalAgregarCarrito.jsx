// src/components/modals/ModalAgregarCarrito.jsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalAgregarCarrito = ({ isOpen, onClose, consumible, color = null }) => {
  const { agregarAlCarrito, actualizarConsumible } = useData();
  const [cantidad, setCantidad] = useState(1);
  const [selectedColor, setSelectedColor] = useState(color || '');
  const [stockDisponible, setStockDisponible] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCantidad(1);
      setSelectedColor(color || '');
      return;
    }

    // Calcular stock disponible
    if (consumible) {
      if (color) {
        // Si es un color específico
        const colorItem = consumible.colores?.find(c => c.color === color);
        setStockDisponible(colorItem ? colorItem.cantidad : 0);
        setSelectedColor(color);
      } else if (consumible.colores && consumible.colores.length > 0) {
        // Si tiene colores, seleccionar el primero por defecto
        setSelectedColor(consumible.colores[0].color);
        setStockDisponible(consumible.colores[0].cantidad || 0);
      } else {
        // Sin colores
        setStockDisponible(consumible.cantidad || 0);
        setSelectedColor('');
      }
    }
  }, [isOpen, consumible, color]);

  const handleCantidadChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    setCantidad(Math.min(val, stockDisponible));
  };

  const incrementar = () => {
    if (cantidad < stockDisponible) {
      setCantidad(cantidad + 1);
    } else {
      alert('No hay suficiente stock.');
    }
  };

  const decrementar = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const handleGuardar = async () => {
    if (cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0.');
      return;
    }
    if (cantidad > stockDisponible) {
      alert('No hay suficiente stock.');
      return;
    }

    // Determinar el nombre y color a enviar
    let nombreItem = consumible.nombre;
    let colorFinal = selectedColor || null;

    if (colorFinal) {
      nombreItem = `${consumible.nombre} (${colorFinal})`;
    }

    // Crear el item para el carrito
    const itemCarrito = {
      id: consumible.id,
      nombre: nombreItem,
      cantidad: cantidad,
      color: colorFinal,
    };

    // Mover al carrito (esto descuenta del stock)
    agregarAlCarrito(itemCarrito);

    // Descontar del inventario
    if (colorFinal) {
      // Si tiene colores, descontar del color específico
      const coloresActualizados = consumible.colores.map(c =>
        c.color === colorFinal ? { ...c, cantidad: (c.cantidad || 0) - cantidad } : c
      );
      await actualizarConsumible(consumible.id, { colores: coloresActualizados });
    } else {
      // Si no tiene colores, descontar de la cantidad general
      await actualizarConsumible(consumible.id, { cantidad: (consumible.cantidad || 0) - cantidad });
    }

    onClose();
    alert(`${cantidad} unidad(es) de "${nombreItem}" agregadas al carrito.`);
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
    const colorItem = consumible.colores?.find(c => c.color === newColor);
    setStockDisponible(colorItem ? colorItem.cantidad : 0);
    setCantidad(1);
  };

  if (!isOpen || !consumible) return null;

  const tieneColores = consumible.colores && consumible.colores.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Agregar al Carrito</h2>
              <p className="text-xs text-slate-500">Mover unidades al carrito de compras</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Artículo</label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800">
              {consumible.nombre}
              {color && <span className="text-slate-400 font-normal ml-1">({color})</span>}
            </div>
          </div>

          {tieneColores && !color && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Color</label>
              <select
                value={selectedColor}
                onChange={handleColorChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Seleccione un color...</option>
                {consumible.colores.map(c => (
                  <option key={c.color} value={c.color}>
                    {c.color} (Stock: {c.cantidad})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Cantidad a mover</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={decrementar}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                disabled={cantidad <= 1}
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min="1"
                max={stockDisponible}
                value={cantidad}
                onChange={handleCantidadChange}
                className="w-20 text-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={incrementar}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                disabled={cantidad >= stockDisponible}
              >
                <Plus size={16} />
              </button>
              <span className="text-xs text-slate-400 ml-2">
                Stock: <strong>{stockDisponible}</strong>
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={cantidad <= 0 || cantidad > stockDisponible}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              <ShoppingCart size={16} />
              Agregar al Carrito
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAgregarCarrito;
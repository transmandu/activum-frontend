// src/components/modals/ModalTipoRapido.jsx
import React, { useState } from 'react';
import { X, Save, Tag, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalTipoRapido = ({ isOpen, onClose, onTipoCreado }) => {
  const { agregarCategoriaConsumible } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del tipo es obligatorio.');
      return;
    }
    setIsSubmitting(true);
    try {
      const nuevoTipo = await agregarCategoriaConsumible({ nombre: nombre.trim() });
      if (onTipoCreado) onTipoCreado(nuevoTipo);
      setNombre('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el tipo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Nuevo Tipo Rápido</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block">Nombre del Tipo *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setError(''); }}
              placeholder="Ej: Tóner, Cables, Accesorios..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              autoFocus
            />
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTipoRapido;
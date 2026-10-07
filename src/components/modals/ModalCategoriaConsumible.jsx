// src/components/modals/ModalCategoriaConsumible.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalCategoriaConsumible = ({ isOpen, onClose, categoriaAEditar = null }) => {
  const { agregarCategoriaConsumible, actualizarCategoriaConsumible } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (categoriaAEditar) {
      setFormData({
        nombre: categoriaAEditar.nombre || '',
        descripcion: categoriaAEditar.descripcion || ''
      });
    } else {
      setFormData({ nombre: '', descripcion: '' });
    }
    setErrors({});
  }, [categoriaAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la categoría es obligatorio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      if (categoriaAEditar) {
        await actualizarCategoriaConsumible(categoriaAEditar.id, formData);
      } else {
        await agregarCategoriaConsumible(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error guardando categoría de consumible:', error);
      alert('Error al guardar la categoría. Intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-linear-to-r from-emerald-50 to-teal-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
              <Tag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {categoriaAEditar ? 'Editar Categoría de Consumible' : 'Nueva Categoría de Consumible'}
              </h2>
              <p className="text-xs text-slate-500">Clasificación de consumibles y materiales</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre de la Categoría *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Ej: Tóner, Cables, Accesorios..."
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                errors.nombre ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.nombre && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.nombre}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Descripción (opcional)</label>
            <textarea
              name="descripcion"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Breve descripción de la categoría..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> {categoriaAEditar ? 'Actualizar' : 'Guardar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCategoriaConsumible;
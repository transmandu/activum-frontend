// src/components/modals/ModalEstado.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalEstado = ({ isOpen, onClose, estadoAEditar = null }) => {
  const { agregarEstado, actualizarEstado } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#3b82f6',
  });
  const [errors, setErrors] = useState({});

  const coloresPredefinidos = [
    '#10b981', // Verde
    '#3b82f6', // Azul
    '#f59e0b', // Ámbar
    '#ef4444', // Rojo
    '#8b5cf6', // Púrpura
    '#ec4899', // Rosa
    '#14b8a6', // Teal
    '#f97316', // Naranja
    '#6366f1', // Índigo
    '#6b7280', // Gris
  ];

  useEffect(() => {
    if (estadoAEditar) {
      setFormData({
        nombre: estadoAEditar.nombre || '',
        descripcion: estadoAEditar.descripcion || '',
        color: estadoAEditar.color || '#3b82f6',
      });
    } else {
      setFormData({ nombre: '', descripcion: '', color: '#3b82f6' });
    }
    setErrors({});
  }, [estadoAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del estado es obligatorio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      if (estadoAEditar) {
        await actualizarEstado(estadoAEditar.id, formData);
      } else {
        await agregarEstado(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error guardando estado:', error);
      alert('Error al guardar el estado. Intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              <Tag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {estadoAEditar ? 'Editar Estado' : 'Nuevo Estado'}
              </h2>
              <p className="text-xs text-slate-500">Clasificación del estado operativo de los activos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre del Estado *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Ej: Operativo, En Mantenimiento..."
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.nombre ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.nombre && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.nombre}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Descripción (opcional)</label>
            <textarea
              name="descripcion"
              rows="2"
              value={formData.descripcion}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Breve descripción del estado..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Color (para badges)</label>
            <div className="flex flex-wrap gap-2">
              {coloresPredefinidos.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? 'border-slate-800 ring-2 ring-blue-500 ring-offset-2'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="#3b82f6"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
            />
          </div>

          {/* Botones */}
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> {estadoAEditar ? 'Actualizar' : 'Guardar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEstado;
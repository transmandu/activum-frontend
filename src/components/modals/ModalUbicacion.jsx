// src/components/modals/ModalUbicacion.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalUbicacion = ({ isOpen, onClose, ubicacionAEditar = null }) => {
  const { agregarUbicacion, actualizarUbicacion } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (ubicacionAEditar) {
      setFormData({
        nombre: ubicacionAEditar.nombre || '',
        descripcion: ubicacionAEditar.descripcion || '',
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
      });
    }
    setErrors({});
    setErrorMsg('');
  }, [ubicacionAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la ubicación es obligatorio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion?.trim() || null,
    };

    try {
      if (ubicacionAEditar) {
        await actualizarUbicacion(ubicacionAEditar.id, payload);
      } else {
        await agregarUbicacion(payload);
      }
      onClose();
    } catch (error) {
      console.error('❌ Error guardando ubicación:', error);
      setErrorMsg(error.response?.data?.message || 'Error al guardar la ubicación.');
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
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {ubicacionAEditar ? 'Editar Ubicación' : 'Nueva Ubicación'}
              </h2>
              <p className="text-xs text-slate-500">Espacios físicos para asignar activos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre de la Ubicación */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre de la Ubicación *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Sede Principal - Lobby"
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
            <label className="text-xs font-bold text-slate-600 block">Descripción (Opcional)</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Detalles adicionales sobre esta ubicación..."
              rows="3"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle size={14} />
              {errorMsg}
            </div>
          )}

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
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> {ubicacionAEditar ? 'Actualizar' : 'Guardar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUbicacion;
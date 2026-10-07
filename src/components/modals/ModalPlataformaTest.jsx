// src/components/modals/ModalPlataformaTest.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalPlataformaTest = ({ isOpen, onClose, plataformaAEditar = null }) => {
  const { agregarPlataformaTest, actualizarPlataformaTest } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    activo: true,
    orden: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (plataformaAEditar) {
      setFormData({
        nombre: plataformaAEditar.nombre || '',
        activo: plataformaAEditar.activo ?? true,
        orden: plataformaAEditar.orden || 0
      });
    } else {
      setFormData({ nombre: '', activo: true, orden: 0 });
    }
    setErrors({});
  }, [plataformaAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la plataforma es obligatorio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      if (plataformaAEditar) {
        await actualizarPlataformaTest(plataformaAEditar.id, formData);
      } else {
        await agregarPlataformaTest(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error guardando plataforma:', error);
      alert('Error al guardar la plataforma. Intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {plataformaAEditar ? 'Editar Plataforma' : 'Nueva Plataforma de Test'}
              </h2>
              <p className="text-xs text-slate-500">Plataformas para pruebas de velocidad de internet</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre de la Plataforma *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Ej: speedtest, gfiber, nperf..."
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Orden de Visualización</label>
            <input
              type="number"
              name="orden"
              value={formData.orden}
              onChange={handleChange}
              autoComplete="off"
              min="0"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <p className="text-[10px] text-slate-400">Número menor = aparece primero en la lista</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label className="text-xs font-medium text-slate-600">Plataforma activa (visible en el sistema)</label>
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> {plataformaAEditar ? 'Actualizar' : 'Guardar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPlataformaTest;
// src/components/modals/ModalModeloRapido.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Tag, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalModeloRapido = ({ isOpen, onClose, marcaId, onModeloCreado, tipoPredeterminado = 'hardware' }) => {
  const { agregarModelo } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: tipoPredeterminado,
  });
  const [errors, setErrors] = useState({});

  // Reiniciar tipo si cambia el prop mientras el modal está abierto
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, tipo: tipoPredeterminado }));
    }
  }, [isOpen, tipoPredeterminado]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del modelo es obligatorio.';
    }
    if (!formData.tipo) {
      newErrors.tipo = 'Debes seleccionar un tipo.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ============================================================
    // 🔹 VALIDACIÓN EXTRA: marcaId debe ser un número válido
    // ============================================================
    if (!marcaId || isNaN(marcaId) || Number(marcaId) <= 0) {
      setErrors(prev => ({
        ...prev,
        marca_id: 'Debe seleccionar una marca válida antes de crear un modelo.'
      }));
      // Mostrar un alert para que el usuario sepa qué hacer
      alert('No se puede crear el modelo porque no se ha seleccionado una marca válida. Por favor, selecciona una marca primero.');
      return;
    }

    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        marca_id: Number(marcaId), // Asegurar que sea número
        descripcion: formData.descripcion || null,
        tipo: formData.tipo,
      };

      const nuevoModelo = await agregarModelo(payload);

      if (onModeloCreado) {
        onModeloCreado(nuevoModelo);
      }

      setFormData({ nombre: '', descripcion: '', tipo: tipoPredeterminado });
      onClose();
    } catch (error) {
      console.error('Error guardando modelo:', error);
      if (error.response && error.response.status === 422) {
        const errorsData = error.response.data.errors;
        let mensaje = 'Errores de validación:\n';
        for (const key in errorsData) {
          mensaje += `${errorsData[key][0]}\n`;
        }
        alert(mensaje);
      } else {
        alert(error.response?.data?.message || 'Error al guardar el modelo. Intente de nuevo.');
      }
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
              <Tag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">➕ Nuevo Modelo</h2>
              <p className="text-xs text-slate-500">Registrar modelo para la marca seleccionada</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre del Modelo *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Ej: Latitude 5420, ProLiant DL360..."
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.nombre ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.nombre && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <Tag size={12} /> {errors.nombre}
              </p>
            )}
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Tipo *</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.tipo ? 'border-rose-300' : 'border-slate-200'
              }`}
            >
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="ambos">Ambos</option>
            </select>
            {errors.tipo && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <Tag size={12} /> {errors.tipo}
              </p>
            )}
            <p className="text-[10px] text-slate-400">Seleccione el tipo de producto que representa este modelo.</p>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Descripción (opcional)</label>
            <textarea
              name="descripcion"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Breve descripción del modelo..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Mensaje de error de marca (si existe) */}
          {errors.marca_id && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              ⚠️ {errors.marca_id}
            </div>
          )}

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
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar Modelo</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalModeloRapido;
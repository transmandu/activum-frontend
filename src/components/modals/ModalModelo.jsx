// src/components/modals/ModalModelo.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalModelo = ({
  isOpen,
  onClose,
  modeloAEditar = null,
  tipoFiltro = null // 'hardware', 'software', o null (todos)
}) => {
  const { agregarModelo, actualizarModelo, marcas = [] } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    marca_id: '',
    descripcion: '',
    tipo: 'hardware', // Valor por defecto
  });
  const [errors, setErrors] = useState({});

  // Filtrar marcas según el tipoFiltro
  const marcasFiltradas = tipoFiltro
    ? marcas.filter(m => m.tipo === tipoFiltro || m.tipo === 'ambos')
    : marcas;

  // Cargar datos al editar
  useEffect(() => {
    if (modeloAEditar) {
      setFormData({
        nombre: modeloAEditar.nombre || '',
        marca_id: modeloAEditar.marca_id || '',
        descripcion: modeloAEditar.descripcion || '',
        tipo: modeloAEditar.tipo || 'hardware',
      });
    } else {
      setFormData({
        nombre: '',
        marca_id: '',
        descripcion: '',
        tipo: 'hardware',
      });
    }
    setErrors({});
  }, [modeloAEditar, isOpen]);

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
    if (!formData.marca_id) {
      newErrors.marca_id = 'Debe seleccionar una marca.';
    }
    if (!formData.tipo) {
      newErrors.tipo = 'Debe seleccionar un tipo.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        marca_id: parseInt(formData.marca_id), // Asegurar que sea número
        descripcion: formData.descripcion || null,
        tipo: formData.tipo,
      };

      if (modeloAEditar) {
        await actualizarModelo(modeloAEditar.id, payload);
      } else {
        await agregarModelo(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error guardando modelo:', error);
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        let msg = '❌ Errores de validación:\n';
        Object.keys(backendErrors).forEach(key => {
          msg += `• ${key}: ${backendErrors[key].join(', ')}\n`;
        });
        alert(msg);
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
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {modeloAEditar ? 'Editar Modelo' : 'Nuevo Modelo'}
              </h2>
              <p className="text-xs text-slate-500">
                {tipoFiltro
                  ? `Modelos de ${tipoFiltro === 'hardware' ? 'hardware' : 'software'}`
                  : 'Modelos de equipos tecnológicos'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selección de Marca */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Marca *</label>
            <select
              name="marca_id"
              value={formData.marca_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.marca_id ? 'border-rose-300' : 'border-slate-200'
              }`}
            >
              <option value="">-- Seleccione una marca --</option>
              {marcasFiltradas.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
            {errors.marca_id && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.marca_id}
              </p>
            )}
            {marcasFiltradas.length === 0 && (
              <p className="text-xs text-amber-500">
                ⚠️ No hay marcas disponibles del tipo {tipoFiltro || 'hardware'}.
                {tipoFiltro ? ` Cree una marca de tipo "${tipoFiltro}" primero.` : ''}
              </p>
            )}
          </div>

          {/* Nombre del Modelo */}
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
                <AlertCircle size={12} /> {errors.nombre}
              </p>
            )}
          </div>

          {/* Tipo del Modelo */}
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
                <AlertCircle size={12} /> {errors.tipo}
              </p>
            )}
          </div>

          {/* Descripción (opcional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Observaciones / Descripción</label>
            <textarea
              name="descripcion"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Detalles adicionales del modelo..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
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
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> {modeloAEditar ? 'Actualizar' : 'Guardar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalModelo;
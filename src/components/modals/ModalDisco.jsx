// src/components/modals/ModalDisco.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, HardDrive, AlertCircle, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalDisco = ({ isOpen, onClose, tipo = 'tipo', itemAEditar = null }) => {
  const {
    agregarTipoDisco,
    actualizarTipoDisco,
    agregarInterfazDisco,
    actualizarInterfazDisco,
    agregarTamanoDisco,
    actualizarTamanoDisco,
  } = useData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(tipo || 'tipo');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });
  const [errors, setErrors] = useState({});

  const tiposDisponibles = [
    { value: 'tipo', label: 'Tipo de Disco' },
    { value: 'interfaz', label: 'Interfaz de Disco' },
    { value: 'tamano', label: 'Tamaño de Disco (2.5", 3.5", etc.)' },
  ];

  // Cargar datos al editar
  useEffect(() => {
    if (itemAEditar) {
      setFormData({
        nombre: itemAEditar.nombre || '',
        descripcion: itemAEditar.descripcion || '',
      });
    } else {
      setFormData({ nombre: '', descripcion: '' });
    }
    setErrors({});
  }, [itemAEditar]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      let response;
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
      };

      if (tipoSeleccionado === 'tipo') {
        if (itemAEditar) {
          await actualizarTipoDisco(itemAEditar.id, payload);
        } else {
          await agregarTipoDisco(payload);
        }
      } else if (tipoSeleccionado === 'interfaz') {
        if (itemAEditar) {
          await actualizarInterfazDisco(itemAEditar.id, payload);
        } else {
          await agregarInterfazDisco(payload);
        }
      } else if (tipoSeleccionado === 'tamano') {
        if (itemAEditar) {
          await actualizarTamanoDisco(itemAEditar.id, payload);
        } else {
          await agregarTamanoDisco(payload);
        }
      }

      onClose();
    } catch (error) {
      console.error('Error guardando:', error);
      alert('Error al guardar. Intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitulo = () => {
    const label = tiposDisponibles.find(t => t.value === tipoSeleccionado)?.label || 'Disco';
    return itemAEditar ? `✏️ Editar ${label}` : `➕ Nuevo ${label}`;
  };

  const getPlaceholder = () => {
    if (tipoSeleccionado === 'tipo') return 'Ej: SSD, HDD, NVMe...';
    if (tipoSeleccionado === 'interfaz') return 'Ej: SATA, SAS, M.2...';
    return 'Ej: 2.5", 3.5", 1.8"...';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              <HardDrive size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">{getTitulo()}</h2>
              <p className="text-xs text-slate-500">Registro de catálogo de discos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selector de tipo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Categoría a registrar *</label>
            <select
              value={tipoSeleccionado}
              onChange={(e) => {
                setTipoSeleccionado(e.target.value);
                setFormData({ nombre: '', descripcion: '' });
                setErrors({});
              }}
              disabled={!!itemAEditar}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                itemAEditar ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'border-slate-200'
              }`}
            >
              {tiposDisponibles.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {itemAEditar && (
              <p className="text-[10px] text-amber-500">No se puede cambiar el tipo en modo edición.</p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              autoComplete="off"
              placeholder={getPlaceholder()}
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
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Breve descripción..."
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
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> {itemAEditar ? 'Actualizar' : 'Guardar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalDisco;
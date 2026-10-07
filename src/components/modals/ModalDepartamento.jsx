// src/components/modals/ModalDepartamento.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Building2, AlertCircle, Loader2, GitMerge } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalDepartamento = ({ isOpen, onClose, departamentoAEditar = null, departamentoPadre = null }) => {
  const { 
    agregarDepartamento, 
    actualizarDepartamento,
    departamentos,
    cargarCronogramas,
    cargarDatosIniciales
  } = useData();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    nombre: '',
    padre_id: null 
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (departamentoAEditar) {
      setFormData({ 
        nombre: departamentoAEditar.nombre || '',
        padre_id: departamentoAEditar.padre_id ?? null
      });
    } else {
      setFormData({ 
        nombre: '', 
        padre_id: departamentoPadre ? departamentoPadre.id : null 
      });
    }
    setErrorMsg('');
  }, [departamentoAEditar, departamentoPadre, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'padre_id' ? (value ? Number(value) : null) : value 
    }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!formData.nombre.trim()) {
      setErrorMsg('El nombre es obligatorio.');
      return;
    }

    // Validar que no se seleccione a sí mismo como padre
    if (departamentoAEditar && Number(formData.padre_id) === Number(departamentoAEditar.id)) {
      setErrorMsg('Un departamento no puede ser su propio padre.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        padre_id: formData.padre_id,
        nivel: formData.padre_id ? 2 : 1, // El backend ajustará la profundidad si es necesario
      };

      if (departamentoAEditar) {
        await actualizarDepartamento(departamentoAEditar.id, payload);
      } else {
        await agregarDepartamento(payload);
      }

      await cargarDatosIniciales();
      await cargarCronogramas();
      onClose();
    } catch (error) {
      console.error('❌ Error guardando departamento:', error);
      setErrorMsg(error.response?.data?.message || error.message || 'Error al guardar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar departamentos disponibles para evitar bucles (ej: no mostrarse a sí mismo en el selector)
  const departamentosDisponibles = departamentos.filter(d => {
    if (!departamentoAEditar) return true;
    return d.id !== departamentoAEditar.id;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              {departamentoPadre ? <GitMerge size={20} /> : <Building2 size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {departamentoAEditar ? 'Editar Unidad' : 'Nueva Unidad Organizativa'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Gestión de jerarquía empresarial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle size={14} />
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre de la Unidad *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Jefatura de Soporte..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Departamento Padre (Ubicación en el Organigrama)</label>
            <select
              name="padre_id"
              value={formData.padre_id || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">-- Ninguno (Es una Dirección / Raíz Principal) --</option>
              {departamentosDisponibles.map(d => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400">Si seleccionas un padre, este departamento pasará a ser su sub-división.</p>
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
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> {departamentoAEditar ? 'Actualizar' : 'Guardar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalDepartamento;
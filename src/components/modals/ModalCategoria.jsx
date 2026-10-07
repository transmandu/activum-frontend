import React, { useState, useEffect } from 'react';
import { X, Save, Tag, AlertCircle, Loader2, Cpu, HardDrive, Network, ShieldCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalCategoria = ({ isOpen, onClose, categoriaAEditar = null }) => {
  const { agregarCategoria, actualizarCategoria, categorias = [] } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    prefijo: '',
    modulos: {
      hardware: true,
      almacenamiento: true,
      red: true,
      software: true
    }
  });
  const [errors, setErrors] = useState({});

  const prefijosExistentes = categorias
    .filter(cat => cat.prefijo && cat.id !== categoriaAEditar?.id)
    .map(cat => cat.prefijo.toUpperCase());

  useEffect(() => {
    if (categoriaAEditar) {
      setFormData({
        nombre: categoriaAEditar.nombre || '',
        descripcion: categoriaAEditar.descripcion || '',
        prefijo: categoriaAEditar.prefijo || '',
        modulos: categoriaAEditar.modulos || {
          hardware: true,
          almacenamiento: true,
          red: true,
          software: true
        }
      });
    } else {
      setFormData({ 
        nombre: '', 
        descripcion: '', 
        prefijo: '',
        modulos: {
          hardware: true,
          almacenamiento: true,
          red: true,
          software: true
        }
      });
    }
    setErrors({});
  }, [categoriaAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'prefijo' ? value.toUpperCase().slice(0, 3) : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleModuloToggle = (modulo) => {
    setFormData(prev => ({
      ...prev,
      modulos: {
        ...prev.modulos,
        [modulo]: !prev.modulos[modulo]
      }
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la categoría es obligatorio.';
    }

    const prefijo = formData.prefijo.trim().toUpperCase();
    if (prefijo) {
      if (!/^[A-Z]{2,3}$/.test(prefijo)) {
        newErrors.prefijo = 'El prefijo debe tener entre 2 y 3 letras mayúsculas (ej: LP, PC, RAD).';
      } else if (prefijosExistentes.includes(prefijo)) {
        newErrors.prefijo = `El prefijo "${prefijo}" ya está en uso.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion || null,
        prefijo: formData.prefijo ? formData.prefijo.trim().toUpperCase() : null,
        modulos: formData.modulos
      };

      if (categoriaAEditar) {
        await actualizarCategoria(categoriaAEditar.id, dataToSend);
      } else {
        await agregarCategoria(dataToSend);
      }
      onClose();
    } catch (error) {
      console.error('Error guardando categoría:', error);
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const errorMsg = Object.values(backendErrors).flat().join('\n');
        alert(`Error de validación:\n${errorMsg}`);
      } else {
        alert('Error al guardar la categoría. Intente de nuevo.');
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
                {categoriaAEditar ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <p className="text-xs text-slate-500">Clasificación de activos tecnológicos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre de la Categoría *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              autoComplete="off"
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
            <label className="text-xs font-bold text-slate-600 block">
              Prefijo para Etiquetas
              <span className="text-slate-400 font-normal ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              name="prefijo"
              value={formData.prefijo}
              onChange={handleChange}
              autoComplete="off"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase ${
                errors.prefijo ? 'border-rose-300' : 'border-slate-200'
              }`}
              maxLength={3}
            />
            {errors.prefijo && (
              <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errors.prefijo}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Módulos Habilitados</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { id: 'hardware', icon: Cpu, label: 'Hardware Base' },
                { id: 'almacenamiento', icon: HardDrive, label: 'Discos' },
                { id: 'red', icon: Network, label: 'Red / IP' },
                { id: 'software', icon: ShieldCheck, label: 'Software' },
              ].map((mod) => {
                const Icon = mod.icon;
                const isActive = formData.modulos[mod.id];
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleModuloToggle(mod.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-blue-500' : 'text-slate-400'} />
                    {mod.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Descripción (opcional)</label>
            <textarea
              name="descripcion"
              rows="2"
              value={formData.descripcion}
              onChange={handleChange}
              autoComplete="off"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> {categoriaAEditar ? 'Actualizar' : 'Guardar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCategoria;
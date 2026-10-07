// src/components/modals/ModalMarcaRapida.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Tag, Loader2, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalMarcaRapida = ({ isOpen, onClose, onMarcaCreada, tipoPredeterminado = 'hardware' }) => {
  const { agregarMarca, categorias = [] } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: tipoPredeterminado,
  });
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ nombre: '', descripcion: '', tipo: tipoPredeterminado });
      setCategoriasSeleccionadas([]);
      setErrors({});
    }
  }, [isOpen, tipoPredeterminado]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCategoriaToggle = (categoriaId) => {
    setCategoriasSeleccionadas(prev =>
      prev.includes(categoriaId)
        ? prev.filter(id => id !== categoriaId)
        : [...prev, categoriaId]
    );
    if (errors.categorias) setErrors(prev => ({ ...prev, categorias: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la marca es obligatorio.';
    }
    if (!formData.tipo) {
      newErrors.tipo = 'Debes seleccionar un tipo de marca.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion || null,
        tipo: formData.tipo,
        categorias: categoriasSeleccionadas,
      };

      const nuevaMarca = await agregarMarca(payload);

      if (onMarcaCreada) {
        onMarcaCreada(nuevaMarca);
      }

      setFormData({ nombre: '', descripcion: '', tipo: tipoPredeterminado });
      setCategoriasSeleccionadas([]);
      onClose();
    } catch (error) {
      console.error('Error guardando marca rápida:', error);
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        let msg = '❌ Errores de validación:\n';
        Object.keys(backendErrors).forEach(key => {
          msg += `• ${key}: ${backendErrors[key].join(', ')}\n`;
        });
        alert(msg);
      } else {
        alert(error.response?.data?.message || 'Error al guardar la marca. Intente de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(e);
    }
  };

  return createPortal(
    <div 
      // 👇 AQUÍ ESTÁ EL CAMBIO: Usamos z-50 que es estándar en Tailwind
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onMouseDown={(e) => e.stopPropagation()} 
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              <Tag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Nueva Marca</h2>
              <p className="text-xs text-slate-500">Fabricantes de equipos</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} 
            className="p-1.5 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre de la Marca *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Ej: Dell, HP, Lenovo..."
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

          {/* Tipo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Tipo de Marca *</label>
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
            <p className="text-[10px] text-slate-400">Seleccione si esta marca aplica para hardware, software o ambos.</p>
          </div>

          {/* Categorías */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="text-xs font-bold text-slate-600 block">Categorías asociadas</label>
            <p className="text-[10px] text-slate-400">Seleccione las categorías a las que pertenece esta marca.</p>
            {categorias.length === 0 ? (
              <p className="text-[10px] text-amber-500">⚠️ No hay categorías registradas. Cree categorías primero.</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1">
                {categorias.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      categoriasSeleccionadas.includes(cat.id)
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={categoriasSeleccionadas.includes(cat.id)}
                      onChange={() => handleCategoriaToggle(cat.id)}
                      className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-slate-700 truncate">{cat.nombre}</span>
                    {cat.prefijo && (
                      <span className="ml-auto text-[9px] font-mono font-bold text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        {cat.prefijo}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
            {errors.categorias && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.categorias}
              </p>
            )}
            <p className="text-[9px] text-slate-400">Seleccione una o varias categorías donde se usará esta marca.</p>
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
              placeholder="Breve descripción de la marca..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar Marca</>}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalMarcaRapida;
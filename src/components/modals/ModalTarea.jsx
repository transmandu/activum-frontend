// src/components/modals/ModalTarea.jsx
import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Briefcase, Loader2 } from 'lucide-react';

const ModalTarea = ({ isOpen, onClose, tareaAEditar = null, onGuardar, soloRutinaria = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: '',
    proyecto: '',
  });
  const [errores, setErrores] = useState({});

  // Resetear formulario al abrir/editar
  useEffect(() => {
    if (tareaAEditar) {
      setFormData({
        descripcion: tareaAEditar.descripcion || '',
        proyecto: tareaAEditar.proyecto || '',
      });
    } else {
      setFormData({
        descripcion: '',
        proyecto: '',
      });
    }
    setErrores({});
  }, [tareaAEditar, isOpen]);

  if (!isOpen) return null;

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción de la tarea es obligatoria.';
    }
    if (!formData.proyecto.trim()) {
      nuevosErrores.proyecto = 'Debe especificar el proyecto o área.';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setIsSubmitting(true);

    // Payload con valores por defecto para campos no mostrados
    const payload = {
      codigo: `TAR-${Date.now()}`,
      descripcion: formData.descripcion,
      proyecto: formData.proyecto,
      clasificacion: 'rutinaria',
      prioridad: 'media',
      dia_asignado: 'lunes',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: null,
      responsables: '',
      personal: 'SOPORTE IT',
      tipo: 'rutinaria',
      completada: false,
      categoria: 'Mantenimiento'
    };

    try {
      if (onGuardar) {
        await onGuardar(payload);
      } else {
        console.warn('No se proporcionó la función onGuardar');
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      alert('Error al guardar la tarea. Intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: null }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Cabecera del Modal */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl shadow-inner">
              <CheckSquare size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
                {tareaAEditar ? 'Modificar Actividad' : 'Nueva Tarea Rutinaria'}
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {soloRutinaria ? 'Registro de tarea rutinaria' : 'Programación y asignación de tareas operativas'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Formulario Scrolleable */}
        <form id="form-tarea" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-white">
          {/* Descripción */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Descripción de la Actividad *</label>
            <textarea
              name="descripcion"
              rows="2"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Ej: Mantenimiento preventivo de servidores en rack principal"
              className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all resize-none ${
                errores.descripcion ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errores.descripcion && <p className="text-xs text-rose-500 font-bold mt-1">{errores.descripcion}</p>}
          </div>

          {/* Proyecto / Área */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Briefcase size={14} /> Proyecto o Área Vinculada *
            </label>
            <input
              type="text"
              name="proyecto"
              value={formData.proyecto}
              onChange={handleChange}
              placeholder="Ej: Infraestructura, AVSEC, Desarrollo"
              className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all ${
                errores.proyecto ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errores.proyecto && <p className="text-xs text-rose-500 font-bold mt-1">{errores.proyecto}</p>}
          </div>

          {/* Nota informativa simplificada (siempre visible) */}
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
            <div>
              <span className="text-xs text-blue-800 font-bold uppercase tracking-wider block mb-1">Nota del Sistema</span>
              <p className="text-xs text-blue-600/80 leading-relaxed">
                Al guardar, la tarea se agregará al <strong>Registro Semanal</strong> automáticamente.
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 bg-white hover:bg-slate-100 hover:text-slate-700 rounded-xl border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-tarea"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : <><CheckSquare size={18} /> Asignar Tarea</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTarea;
// src/components/modals/ModalCronograma.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalCronograma = ({ isOpen, onClose, cronogramaAEditar = null, onGuardar }) => {
  const { departamentos = [], cronogramas = [], categorias = [] } = useData(); // ✅ Agregado categorias
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria_id: '',
  });
  const [errors, setErrors] = useState({});

  const MESES_ANIO = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const generarCodigoCronograma = () => {
    const ultimo = cronogramas?.length > 0 ? cronogramas.reduce((max, c) => {
      const match = c.codigo?.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0) : 0;
    return `CRO-${String(ultimo + 1).padStart(5, '0')}`;
  };

  useEffect(() => {
    if (cronogramaAEditar) {
      setFormData({
        titulo: cronogramaAEditar.titulo || '',
        descripcion: cronogramaAEditar.descripcion || '',
        categoria_id: cronogramaAEditar.categoria_id || '', // ✅ Cargar categoría
      });
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        categoria_id: '',
      });
    }
    setErrors({});
  }, [cronogramaAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título de la planificación es obligatorio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const hoy = new Date();
      const fechaStr = hoy.toISOString().split('T')[0];
      const mes = MESES_ANIO[hoy.getMonth()].toLowerCase();
      const codigo = cronogramaAEditar ? cronogramaAEditar.codigo : generarCodigoCronograma();

      const payload = {
        codigo: codigo,
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion?.trim() || '',
        fecha: fechaStr,
        mes: mes,
        hora: '08:00 AM',
        tipo: 'Mantenimiento',
        frecuencia: 'Mensual',
        frecuencia_original: 'mensual',
        frecuencia_dias: 30,
        estado: 'Programado',
        personal: ['Soporte I.T'],
        departamentos: departamentos.map(d => d.id),
        categoria_id: formData.categoria_id || null, // ✅ Enviar categoría
      };

      if (cronogramaAEditar && cronogramaAEditar.id) {
        await onGuardar(cronogramaAEditar.id, payload);
      } else {
        await onGuardar(payload);
      }

      onClose();
    } catch (error) {
      console.error('Error al guardar cronograma:', error);
      alert('Error al guardar la planificación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 z-10 overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-slate-50 to-white shrink-0">
          <div>
            <h4 className="text-base font-extrabold text-slate-800 m-0">
              {cronogramaAEditar ? 'Editar Planificación' : 'Nueva Planificación'}
            </h4>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              {cronogramaAEditar ? 'Modifique el título de la planificación' : 'Ingrese el título de la nueva planificación'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Título de la Planificación <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ej: Mantenimiento Preventivo de Detectores de Metales"
              className={`w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all ${errors.titulo ? 'border-rose-300' : ''}`}
            />
            {errors.titulo && <p className="text-xs text-rose-500 mt-1">{errors.titulo}</p>}
          </div>

          {/* ✅ NUEVO: Selector de categoría */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Categoría de Activos a Mantener <span className="text-red-500">*</span>
            </label>
            <select
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all"
            >
              <option value="">-- Seleccione una categoría --</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre} {cat.prefijo ? `(${cat.prefijo})` : ''}
                </option>
              ))}
            </select>
            {errors.categoria_id && <p className="text-xs text-rose-500 mt-1">{errors.categoria_id}</p>}
            <p className="text-[10px] text-slate-400">
              Seleccione la categoría de activos a los que aplicará este mantenimiento.
            </p>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Descripción (opcional)</label>
            <textarea
              name="descripcion"
              rows="2"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Detalles adicionales de la planificación..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all resize-none"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar size={12} className="text-blue-500" />
              <span className="font-bold uppercase tracking-wider">Nota:</span>
            </div>
            <p>La planificación se asignará de forma <strong>global</strong> a <strong>TODOS los departamentos</strong> registrados en el sistema, pero <strong>solo se mostrarán los activos de la categoría seleccionada</strong>.</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all disabled:bg-blue-400"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Guardando...</>
              ) : (
                <><Calendar size={16} /> {cronogramaAEditar ? 'Actualizar' : 'Crear'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCronograma;
// src/components/modals/ModalLicencia.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Key, AlertCircle, Loader2, Calendar, Users } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalLicencia = ({ isOpen, onClose, licenciaAEditar = null }) => {
  const { agregarLicencia, actualizarLicencia } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    clave_licencia: '',
    version: '',
    edicion: '',
    fecha_compra: '',
    fecha_expiracion: '',
    tipo: 'Perpetua',
    cantidad_usuarios: '',
    observaciones: '',
    activa: true,
  });
  const [errors, setErrors] = useState({});

  const tiposLicencia = ['Perpetua', 'Anual', 'Mensual', 'Suscripción', 'Volumen'];

  useEffect(() => {
    if (licenciaAEditar) {
      setFormData({
        nombre: licenciaAEditar.nombre || '',
        clave_licencia: licenciaAEditar.clave_licencia || '',
        version: licenciaAEditar.version || '',
        edicion: licenciaAEditar.edicion || '',
        fecha_compra: licenciaAEditar.fecha_compra || '',
        fecha_expiracion: licenciaAEditar.fecha_expiracion || '',
        tipo: licenciaAEditar.tipo || 'Perpetua',
        cantidad_usuarios: licenciaAEditar.cantidad_usuarios || '',
        observaciones: licenciaAEditar.observaciones || '',
        activa: licenciaAEditar.activa ?? true,
      });
    } else {
      setFormData({
        nombre: '',
        clave_licencia: '',
        version: '',
        edicion: '',
        fecha_compra: '',
        fecha_expiracion: '',
        tipo: 'Perpetua',
        cantidad_usuarios: '',
        observaciones: '',
        activa: true,
      });
    }
    setErrors({});
  }, [licenciaAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la licencia es obligatorio.';
    }
    if (formData.fecha_compra && formData.fecha_expiracion && new Date(formData.fecha_expiracion) <= new Date(formData.fecha_compra)) {
      newErrors.fecha_expiracion = 'La fecha de expiración debe ser posterior a la fecha de compra.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...formData,
      cantidad_usuarios: formData.cantidad_usuarios || null,
    };

    try {
      if (licenciaAEditar) {
        await actualizarLicencia(licenciaAEditar.id, payload);
      } else {
        await agregarLicencia(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error guardando licencia:', error);
      alert('Error al guardar la licencia. Intente de nuevo.');
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
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {licenciaAEditar ? 'Editar Licencia' : 'Nueva Licencia'}
              </h2>
              <p className="text-xs text-slate-500">Gestión de licencias de software</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre de la Licencia *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Ej: Microsoft Office 365"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.nombre ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
            {errors.nombre && <p className="text-xs text-rose-500">{errors.nombre}</p>}
          </div>

          {/* Clave de licencia */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Clave de Licencia (opcional)</label>
            <input
              type="text"
              name="clave_licencia"
              value={formData.clave_licencia}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Ej: XXX-XXX-XXX-XXX"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Versión */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Versión</label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                autoComplete="off"
                placeholder="Ej: 2023"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            {/* Edición */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Edición</label>
              <input
                type="text"
                name="edicion"
                value={formData.edicion}
                onChange={handleChange}
                autoComplete="off"
                placeholder="Ej: Enterprise"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha de compra */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Fecha de Compra</label>
              <input
                type="date"
                name="fecha_compra"
                value={formData.fecha_compra}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            {/* Fecha de expiración */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Fecha de Expiración</label>
              <input
                type="date"
                name="fecha_expiracion"
                value={formData.fecha_expiracion}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  errors.fecha_expiracion ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {errors.fecha_expiracion && <p className="text-xs text-rose-500">{errors.fecha_expiracion}</p>}
            </div>
          </div>

          {/* Tipo y cantidad de usuarios */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Tipo de Licencia</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {tiposLicencia.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Cantidad de Usuarios</label>
              <input
                type="number"
                name="cantidad_usuarios"
                value={formData.cantidad_usuarios}
                onChange={handleChange}
                min="1"
                placeholder="Ej: 10"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Activa */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="activa"
              checked={formData.activa}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label className="text-xs font-medium text-slate-600">Licencia activa</label>
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Observaciones</label>
            <textarea
              name="observaciones"
              rows="2"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales..."
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
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> {licenciaAEditar ? 'Actualizar' : 'Guardar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalLicencia;
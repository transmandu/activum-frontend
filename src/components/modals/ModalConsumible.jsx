// src/components/modals/ModalConsumible.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Package, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import ModalTipoRapido from './ModalTipoRapido';
import ModalModeloConsumibleRapido from './ModalModeloConsumibleRapido';

const ModalConsumible = ({ isOpen, onClose, onGuardar, consumibleAEditar }) => {
  const { categoriasConsumibles, modelosConsumibles, consumibles } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showModeloModal, setShowModeloModal] = useState(false);
  const [errors, setErrors] = useState({});

  const coloresDisponibles = [
    'Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Amarillo',
    'Naranja', 'Morado', 'Rosa', 'Gris', 'Cian', 'Magenta',
    'Marrón', 'Plateado', 'Dorado', 'Transparente'
  ];

  const nombresExistentes = useMemo(() => {
    if (!consumibles || !Array.isArray(consumibles)) return [];
    return consumibles.map(item => item.nombre).filter(Boolean);
  }, [consumibles]);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_consumible_id: '',
    modelo_consumible_id: '',
    cantidad: '',
    stock_minimo: '',
    colores: [],
  });

  useEffect(() => {
    if (consumibleAEditar) {
      setFormData({
        nombre: consumibleAEditar.nombre || '',
        descripcion: consumibleAEditar.descripcion || '',
        categoria_consumible_id: consumibleAEditar.categoria_consumible_id || '',
        modelo_consumible_id: consumibleAEditar.modelo_consumible_id || '',
        cantidad: consumibleAEditar.cantidad || '',
        stock_minimo: consumibleAEditar.stock_minimo || '',
        colores: consumibleAEditar.colores || [],
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        categoria_consumible_id: '',
        modelo_consumible_id: '',
        cantidad: '',
        stock_minimo: '',
        colores: [],
      });
    }
    setErrors({});
  }, [consumibleAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleColorChange = (index, field, value) => {
    const nuevosColores = [...formData.colores];
    nuevosColores[index][field] = value;
    setFormData(prev => ({ ...prev, colores: nuevosColores }));
    const errorKey = `color_${index}`;
    if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: null }));
  };

  const agregarColor = () => {
    setFormData(prev => ({
      ...prev,
      colores: [...prev.colores, { color: '', cantidad: '' }]
    }));
  };

  const eliminarColor = (index) => {
    if (formData.colores.length <= 1) {
      setFormData(prev => ({ ...prev, colores: [] }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      colores: prev.colores.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!formData.categoria_consumible_id) newErrors.categoria_consumible_id = 'Debe seleccionar un tipo.';
    if (formData.cantidad && isNaN(formData.cantidad)) newErrors.cantidad = 'La cantidad debe ser un número.';
    if (formData.stock_minimo && isNaN(formData.stock_minimo)) newErrors.stock_minimo = 'El stock mínimo debe ser un número.';

    formData.colores.forEach((item, index) => {
      if (item.color && !item.cantidad) {
        newErrors[`color_${index}`] = `El color "${item.color}" requiere cantidad.`;
      }
      if (item.cantidad && !item.color) {
        newErrors[`color_${index}`] = `Debe seleccionar un color para la cantidad.`;
      }
    });

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
        descripcion: formData.descripcion || null,
        categoria_consumible_id: formData.categoria_consumible_id || null,
        modelo_consumible_id: formData.modelo_consumible_id || null,
        cantidad: formData.cantidad ? parseInt(formData.cantidad) : 0,
        stock_minimo: formData.stock_minimo ? parseInt(formData.stock_minimo) : 0,
        colores: formData.colores
          .filter(item => item.color && item.cantidad)
          .map(item => ({
            color: item.color,
            cantidad: parseInt(item.cantidad) || 0
          })),
      };
      await onGuardar(payload);
      onClose();
    } catch (error) {
      console.error('Error en modal consumible:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tipos = Array.isArray(categoriasConsumibles) ? categoriasConsumibles : [];
  const modelos = Array.isArray(modelosConsumibles) ? modelosConsumibles : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {consumibleAEditar ? 'Editar Artículo' : 'Nuevo Artículo'}
              </h2>
              <p className="text-xs text-slate-500">Ingrese los datos del consumible</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Tipo *</label>
            <div className="flex gap-2">
              <select
                name="categoria_consumible_id"
                value={formData.categoria_consumible_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  errors.categoria_consumible_id ? 'border-rose-300' : 'border-slate-200'
                }`}
              >
                <option value="">-- Seleccione un tipo --</option>
                {tipos.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowTipoModal(true)}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 flex items-center gap-1 text-xs font-bold whitespace-nowrap"
              >
                <Plus size={14} /> Tipo
              </button>
            </div>
            {errors.categoria_consumible_id && <p className="text-xs text-rose-500">{errors.categoria_consumible_id}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Modelo (opcional)</label>
            <div className="flex gap-2">
              <select
                name="modelo_consumible_id"
                value={formData.modelo_consumible_id}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">-- Sin modelo --</option>
                {modelos.map(modelo => (
                  <option key={modelo.id} value={modelo.id}>{modelo.nombre}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowModeloModal(true)}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 flex items-center gap-1 text-xs font-bold whitespace-nowrap"
              >
                <Plus size={14} /> Modelo
              </button>
            </div>
            <p className="text-[9px] text-slate-400">Opcional: seleccione un modelo registrado</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre del Artículo *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              list="nombres-consumibles-list"
              autoComplete="off"
              placeholder="Ej: Tóner HP 12A, Cable HDMI 2m..."
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.nombre ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            <datalist id="nombres-consumibles-list">
              {nombresExistentes.map((nombre, index) => (
                <option key={index} value={nombre} />
              ))}
            </datalist>
            {errors.nombre && <p className="text-xs text-rose-500">{errors.nombre}</p>}
            <p className="text-[9px] text-slate-400">Puede seleccionar un nombre existente o escribir uno nuevo.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Descripción (opcional)</label>
            <textarea
              name="descripcion"
              rows="2"
              value={formData.descripcion}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Detalles adicionales..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Cantidad *</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                min="0"
                placeholder="0"
                autoComplete="off"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  errors.cantidad ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.cantidad && <p className="text-xs text-rose-500">{errors.cantidad}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Stock Mínimo</label>
              <input
                type="number"
                name="stock_minimo"
                value={formData.stock_minimo}
                onChange={handleChange}
                min="0"
                placeholder="0"
                autoComplete="off"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  errors.stock_minimo ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.stock_minimo && <p className="text-xs text-rose-500">{errors.stock_minimo}</p>}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-600 block">Colores (opcional)</label>
              <button
                type="button"
                onClick={agregarColor}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus size={12} /> Agregar color
              </button>
            </div>
            <p className="text-[9px] text-slate-400">Agregue colores y sus cantidades si el artículo lo requiere.</p>

            {formData.colores.length === 0 ? (
              <div className="text-center py-3 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                Sin colores agregados
              </div>
            ) : (
              formData.colores.map((item, index) => {
                const errorKey = `color_${index}`;
                return (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="flex-1">
                      <select
                        value={item.color}
                        onChange={(e) => handleColorChange(index, 'color', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="">Seleccionar color</option>
                        {coloresDisponibles.map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => handleColorChange(index, 'cantidad', e.target.value)}
                        placeholder="Cant."
                        min="0"
                        autoComplete="off"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarColor(index)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Quitar color"
                    >
                      <Trash2 size={14} />
                    </button>
                    {errors[errorKey] && (
                      <p className="text-[10px] text-rose-500">{errors[errorKey]}</p>
                    )}
                  </div>
                );
              })
            )}
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
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> {consumibleAEditar ? 'Actualizar' : 'Guardar'}</>}
            </button>
          </div>
        </form>
      </div>

      <ModalTipoRapido
        isOpen={showTipoModal}
        onClose={() => setShowTipoModal(false)}
        onTipoCreado={(nuevoTipo) => {
          setFormData(prev => ({ ...prev, categoria_consumible_id: nuevoTipo.id }));
        }}
      />
      <ModalModeloConsumibleRapido
        isOpen={showModeloModal}
        onClose={() => setShowModeloModal(false)}
        tipoId={formData.categoria_consumible_id}
        onModeloCreado={(nuevoModelo) => {
          setFormData(prev => ({ ...prev, modelo_consumible_id: nuevoModelo.id }));
        }}
      />
    </div>
  );
};

export default ModalConsumible;
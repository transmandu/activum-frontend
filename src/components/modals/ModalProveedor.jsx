// src/components/modals/ModalProveedor.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, Building2, CreditCard, Briefcase, User, Phone, Mail, AlertCircle, Loader2, Globe, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import {
  validarEmail,
  validarTelefono,
  formatearTelefono,
  limpiarTelefono,
  paisesTelefono,
  formatearRIF,
  validarRIF,
} from '../../utils/validaciones';

const ModalProveedor = ({ isOpen, onClose, proveedorAEditar = null }) => {
  const { agregarProveedor, actualizarProveedor, eliminarProveedor, proveedores } = useData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    rif: '',
    tipo: '',
    categoria: '',
    contacto: '',
    correo: '',
    pais: 'VE',
  });

  const [telefonoRaw, setTelefonoRaw] = useState('');
  const [telefonoDisplay, setTelefonoDisplay] = useState('');
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  // ===== GENERAR CÓDIGO CORRELATIVO PARA PROVEEDOR =====
  const generarCodigoProveedor = () => {
    const proveedoresExistentes = proveedores || [];
    let maxNum = 0;
    proveedoresExistentes.forEach(p => {
      const match = p.codigo?.match(/^PROV-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const siguiente = maxNum + 1;
    return `PROV-${String(siguiente).padStart(5, '0')}`;
  };

  // ===== ESPECIALIDADES EXISTENTES =====
  const especialidadesExistentes = useMemo(() => {
    if (!proveedores) return [];
    const especialidades = proveedores.map(p => p.categoria).filter(Boolean);
    return [...new Set(especialidades)];
  }, [proveedores]);

  const tiposProveedor = [
    { valor: 'Venezolano', label: 'Venezolano' },
    { valor: 'Extranjero', label: 'Extranjero' },
    { valor: 'Jurídico', label: 'Jurídico' },
    { valor: 'Gobierno', label: 'Gobierno' },
  ];

  // ===== CARGAR DATOS AL ABRIR =====
  useEffect(() => {
    if (proveedorAEditar) {
      const numeros = proveedorAEditar.telefono ? proveedorAEditar.telefono.replace(/\D/g, '') : '';
      setTelefonoRaw(numeros);
      setTelefonoDisplay(formatearTelefono(numeros, 'VE'));

      setFormData({
        nombre: proveedorAEditar.nombre || '',
        rif: proveedorAEditar.rif || '',
        tipo: proveedorAEditar.tipo || '',
        categoria: proveedorAEditar.categoria || '',
        contacto: proveedorAEditar.contacto || '',
        correo: proveedorAEditar.correo || '',
        pais: 'VE',
      });
    } else {
      setTelefonoRaw('');
      setTelefonoDisplay('');
      setFormData({
        nombre: '',
        rif: '',
        tipo: '',
        categoria: '',
        contacto: '',
        correo: '',
        pais: 'VE',
      });
    }
    setErrors({});
    setErrorMsg('');
  }, [proveedorAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // ===== MANEJO DE RIF =====
  const handleRIFChange = (e) => {
    const valor = e.target.value;
    if (!valor.match(/^[Jj]-/)) {
      const numeros = valor.replace(/[^0-9]/g, '');
      if (numeros.length === 0) {
        setFormData(prev => ({ ...prev, rif: 'J-' }));
        return;
      }
      const formateado = formatearRIF(`J-${numeros}`);
      setFormData(prev => ({ ...prev, rif: formateado }));
      if (errors.rif) setErrors(prev => ({ ...prev, rif: null }));
      return;
    }
    const formateado = formatearRIF(valor);
    setFormData(prev => ({ ...prev, rif: formateado }));
    if (errors.rif) setErrors(prev => ({ ...prev, rif: null }));
  };

  // ===== MANEJO DE TELÉFONO =====
  const handleTelefonoChange = (e) => {
    const valor = e.target.value;
    const numeros = valor.replace(/\D/g, '');
    setTelefonoRaw(numeros);
    const display = formatearTelefono(numeros, formData.pais);
    setTelefonoDisplay(display);
    if (errors.telefono) setErrors(prev => ({ ...prev, telefono: null }));
  };

  const handleBlurTelefono = () => {
    if (telefonoRaw) {
      const display = formatearTelefono(telefonoRaw, formData.pais);
      setTelefonoDisplay(display);
    } else {
      setTelefonoDisplay('');
    }
  };

  const handlePaisChange = (e) => {
    const nuevoPais = e.target.value;
    setFormData(prev => ({ ...prev, pais: nuevoPais }));
    if (telefonoRaw) {
      const display = formatearTelefono(telefonoRaw, nuevoPais);
      setTelefonoDisplay(display);
    }
    if (errors.telefono) setErrors(prev => ({ ...prev, telefono: null }));
  };

  // ===== VALIDACIONES =====
  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre de la empresa es obligatorio.';

    if (!formData.rif.trim() || formData.rif === 'J-') {
      newErrors.rif = 'El RIF es obligatorio.';
    } else {
      const resultadoRIF = validarRIF(formData.rif);
      if (!resultadoRIF.valido) {
        newErrors.rif = resultadoRIF.mensaje;
      }
    }

    if (!formData.tipo) newErrors.tipo = 'Debe seleccionar el tipo de proveedor.';
    if (!formData.categoria.trim()) newErrors.categoria = 'Debe seleccionar una especialidad.';
    if (!formData.contacto.trim()) newErrors.contacto = 'El contacto es obligatorio.';

    if (!telefonoRaw) {
      newErrors.telefono = 'El teléfono es requerido.';
    } else {
      // ✅ Validación de teléfono: acepta 10 dígitos para VE (sin el 0)
      const resultadoTelefono = validarTelefono(telefonoRaw, formData.pais);
      if (!resultadoTelefono.valido) {
        newErrors.telefono = resultadoTelefono.mensaje;
      }
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo electrónico es obligatorio.';
    } else {
      const resultadoEmail = validarEmail(formData.correo);
      if (!resultadoEmail.valido) {
        newErrors.correo = resultadoEmail.mensaje;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== GUARDAR =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;
    setIsSubmitting(true);

    const telefonoLimpio = limpiarTelefono(telefonoRaw);

    // ✅ GENERAR CÓDIGO SI ES NUEVO
    const esNuevo = !proveedorAEditar;
    const codigo = esNuevo ? generarCodigoProveedor() : proveedorAEditar.codigo;

    const payload = {
      codigo: codigo,
      nombre: formData.nombre,
      rif: formData.rif,
      tipo: formData.tipo,
      categoria: formData.categoria,
      contacto: formData.contacto,
      telefono: telefonoLimpio,
      correo: formData.correo,
      estado: 'Activo',
    };

    try {
      if (proveedorAEditar) {
        await actualizarProveedor(proveedorAEditar.codigo, payload);
      } else {
        await agregarProveedor(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error guardando proveedor:', error);
      alert('Ocurrió un error al guardar el proveedor. Intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== ELIMINAR =====
  const handleDelete = async () => {
    if (!proveedorAEditar) return;
    if (!window.confirm(`¿Está seguro de eliminar el proveedor "${proveedorAEditar.nombre}"? Esta acción no se puede deshacer.`)) return;

    setIsDeleting(true);
    try {
      await eliminarProveedor(proveedorAEditar.codigo);
      onClose();
    } catch (error) {
      console.error('Error eliminando proveedor:', error);
      alert('Ocurrió un error al eliminar el proveedor.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getMaxLength = () => {
    switch (formData.pais) {
      case 'VE': return 11;
      case 'US': return 10;
      default: return 15;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 w-full max-w-xl shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Building2 size={18} className="text-blue-600" />
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider">
                {proveedorAEditar ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
              </h4>
              <p className="text-[11px] text-slate-400 font-normal">
                {proveedorAEditar ? 'Modifique los datos del aliado comercial' : 'Añada una nueva empresa o técnico externo al directorio'}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting || isDeleting} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white text-left overflow-y-auto flex-1">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Nombre de la Empresa / Razón Social *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Ej: Inversiones Tecnológicas Globales C.A."
              className={`p-2.5 border rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-all ${
                errors.nombre ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
            {errors.nombre && <span className="text-[10px] text-rose-600">{errors.nombre}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* RIF */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <CreditCard size={12} /> RIF *
              </label>
              <input
                type="text"
                name="rif"
                value={formData.rif}
                onChange={handleRIFChange}
                autoComplete="off"
                placeholder="J-12345678"
                className={`p-2.5 border rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500 transition-all ${
                  errors.rif ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
                maxLength={14}
              />
              {errors.rif && <span className="text-[10px] text-rose-600">{errors.rif}</span>}
              <p className="text-[9px] text-slate-400">Formato automático: J-XXXXXXXXXX (máximo 10 dígitos)</p>
            </div>

            {/* Tipo de Proveedor */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Globe size={12} /> Tipo de Proveedor *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className={`p-2.5 border rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500 transition-all ${
                  errors.tipo ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <option value="">-- Seleccione --</option>
                {tiposProveedor.map(t => (
                  <option key={t.valor} value={t.valor}>{t.label}</option>
                ))}
              </select>
              {errors.tipo && <span className="text-[10px] text-rose-600">{errors.tipo}</span>}
            </div>
          </div>

          {/* Especialidad */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Briefcase size={12} /> Especialidad *
            </label>
            <input
              type="text"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              list="especialidades-list"
              autoComplete="off"
              placeholder="Ej: Servicio Técnico y Servidores..."
              className={`p-2.5 border rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-all ${
                errors.categoria ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
            <datalist id="especialidades-list">
              {especialidadesExistentes.map(esp => (
                <option key={esp} value={esp} />
              ))}
            </datalist>
            {errors.categoria && <span className="text-[10px] text-rose-600">{errors.categoria}</span>}
            <p className="text-[10px] text-slate-400">Debe seleccionar una especialidad existente.</p>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <User size={12} /> Persona de Contacto *
            </label>
            <input
              type="text"
              name="contacto"
              value={formData.contacto}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Ej: Ing. Luis Martínez"
              className={`p-2.5 border rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-all ${
                errors.contacto ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
            {errors.contacto && <span className="text-[10px] text-rose-600">{errors.contacto}</span>}
          </div>

          {/* Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Globe size={12} /> País
              </label>
              <select
                value={formData.pais}
                onChange={handlePaisChange}
                className="p-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500 transition-all"
              >
                {paisesTelefono.map(p => (
                  <option key={p.codigo} value={p.codigo}>
                    {p.nombre} ({p.prefijo})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Phone size={12} /> Teléfono *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  {formData.pais === 'VE' ? '+58 ' :
                   formData.pais === 'US' ? '+1 ' :
                   paisesTelefono.find(p => p.codigo === formData.pais)?.prefijo || '+'}
                </span>
                <input
                  type="text"
                  value={telefonoRaw}
                  onChange={handleTelefonoChange}
                  onBlur={handleBlurTelefono}
                  autoComplete="off"
                  placeholder={`Ej: ${formData.pais === 'VE' ? '4149261158' : '1234567890'}`}
                  className={`p-2.5 pl-12 border rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500 transition-all w-full ${
                    errors.telefono ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                  maxLength={getMaxLength()}
                />
              </div>
              {errors.telefono && <span className="text-[10px] text-rose-600">{errors.telefono}</span>}
              <p className="text-[9px] text-slate-400">
                {formData.pais === 'VE' ? '10 dígitos (ej: 4149261158) - sin el 0 inicial' :
                 formData.pais === 'US' ? '10 dígitos (ej: 1234567890)' :
                 'Ingrese solo números'}
              </p>
            </div>
          </div>

          {/* Correo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Mail size={12} /> Correo Electrónico *
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              autoComplete="off"
              placeholder="contacto@empresa.com"
              className={`p-2.5 border rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-all ${
                errors.correo ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
            {errors.correo && <span className="text-[10px] text-rose-600">{errors.correo}</span>}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle size={14} />
              {errorMsg}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>

            {proveedorAEditar && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? <><Loader2 size={13} className="animate-spin" /> Eliminando...</> : <><Trash2 size={13} /> Eliminar</>}
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="w-36 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 disabled:bg-blue-400"
            >
              {isSubmitting ? <><Loader2 size={13} className="animate-spin" /> Guardando...</> : <span>Guardar Proveedor</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalProveedor;
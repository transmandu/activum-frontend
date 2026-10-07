// src/components/modals/ModalPersonal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, User, AlertCircle, Loader2, Phone, Mail, IdCard, GitMerge } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatearCedula, validarCedula, validarEmail } from '../../utils/validaciones';

const ModalPersonal = ({ isOpen, onClose, personalAEditar = null }) => {
  const { agregarPersonal, actualizarPersonal, departamentos } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    cedula: '',
    cargo: '',
    telefono: '',
    email: '',
  });

  const [departamentoPaths, setDepartamentoPaths] = useState([]);
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  const nivelesDeDepartamentos = useMemo(() => {
    if (!departamentos) return [];

    const levels = [];
    const roots = departamentos.filter(d => !d.padre_id);
    levels.push({ opciones: roots, value: departamentoPaths[0] || '' });

    for (let i = 0; i < departamentoPaths.length; i++) {
      const currentSelected = departamentoPaths[i];
      if (currentSelected) {
        const hijos = departamentos.filter(d => String(d.padre_id) === String(currentSelected));
        if (hijos.length > 0) {
          levels.push({ opciones: hijos, value: departamentoPaths[i + 1] || '' });
        }
      }
    }
    return levels;
  }, [departamentos, departamentoPaths]);

  useEffect(() => {
    if (personalAEditar && departamentos) {
      const idBuscado = personalAEditar.departamento_id || personalAEditar.departamento?.id;
      
      if (idBuscado) {
        const path = [];
        let actual = departamentos.find(d => String(d.id) === String(idBuscado));
        
        while (actual) {
          path.unshift(String(actual.id));
          actual = departamentos.find(d => String(d.id) === String(actual.padre_id));
        }
        setDepartamentoPaths(path);
      } else {
        setDepartamentoPaths([]);
      }

      setFormData({
        nombre_completo: personalAEditar.nombre_completo || '',
        cedula: personalAEditar.cedula || '',
        cargo: personalAEditar.cargo || '',
        telefono: personalAEditar.telefono || '',
        email: personalAEditar.email || '',
      });
    } else {
      setDepartamentoPaths([]);
      setFormData({
        nombre_completo: '',
        cedula: '',
        cargo: '',
        telefono: '',
        email: '',
      });
    }
    setErrors({});
    setErrorMsg('');
  }, [personalAEditar, isOpen, departamentos]);

  if (!isOpen) return null;

  const handleCedulaChange = (e) => {
    const valor = e.target.value;
    if (!valor.match(/^[Vv]-/)) {
      const numeros = valor.replace(/[^0-9]/g, '');
      if (numeros.length === 0) {
        setFormData(prev => ({ ...prev, cedula: 'V-' }));
        return;
      }
      const formateado = formatearCedula(`V-${numeros}`);
      setFormData(prev => ({ ...prev, cedula: formateado }));
      if (errors.cedula) setErrors(prev => ({ ...prev, cedula: null }));
      return;
    }
    const formateado = formatearCedula(valor);
    setFormData(prev => ({ ...prev, cedula: formateado }));
    if (errors.cedula) setErrors(prev => ({ ...prev, cedula: null }));
  };

  const handleTelefonoChange = (e) => {
    const valor = e.target.value;
    const soloNumeros = valor.replace(/\D/g, '');
    const limitado = soloNumeros.slice(0, 11);
    setFormData(prev => ({ ...prev, telefono: limitado }));
    if (errors.telefono) setErrors(prev => ({ ...prev, telefono: null }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleNivelChange = (index, value) => {
    const newPath = departamentoPaths.slice(0, index);
    if (value) {
      newPath.push(value);
    }
    setDepartamentoPaths(newPath);
    if (errors.departamentos) setErrors(prev => ({ ...prev, departamentos: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre_completo.trim()) {
      newErrors.nombre_completo = 'El nombre completo es obligatorio.';
    }
    
    // Validar cédula solo si fue ingresada y tiene algo más que "V-"
    if (formData.cedula && formData.cedula.trim() !== '' && formData.cedula !== 'V-') {
      const resultadoCedula = validarCedula(formData.cedula);
      if (!resultadoCedula.valido) {
        newErrors.cedula = resultadoCedula.mensaje;
      }
    }
    
    if (departamentoPaths.length === 0 || !departamentoPaths[0]) {
      newErrors.departamentos = 'Debe seleccionar al menos un departamento general.';
    }

    if (formData.email && formData.email.trim() !== '') {
      const resultadoEmail = validarEmail(formData.email);
      if (!resultadoEmail.valido) {
        newErrors.email = resultadoEmail.mensaje;
      }
    }
    
    if (formData.telefono && formData.telefono.trim() !== '') {
      if (formData.telefono.length > 11) {
        newErrors.telefono = 'El teléfono no puede tener más de 11 dígitos.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;

    const departamentoIdSeleccionado = departamentoPaths[departamentoPaths.length - 1];
    const idNumerico = Number(departamentoIdSeleccionado);
    
    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      setErrorMsg('La estructura de departamento seleccionada no es válida.');
      return;
    }

    setIsSubmitting(true);

    // Preparar la cédula: si está vacía o es solo 'V-', enviar null
    const cedulaFinal = (formData.cedula && formData.cedula.trim() !== '' && formData.cedula !== 'V-') 
      ? formData.cedula.trim() 
      : null;

    const payload = {
      nombre_completo: formData.nombre_completo.trim(),
      cedula: cedulaFinal,
      cargo: formData.cargo?.trim() || null,
      departamento_id: idNumerico,
      telefono: formData.telefono?.trim() || null,
      email: formData.email?.trim() || null,
    };

    try {
      if (personalAEditar) {
        await actualizarPersonal(personalAEditar.id, payload);
      } else {
        await agregarPersonal(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error guardando personal:', error);
      
      // Si el servidor devuelve errores de validación estructurados (Ej: Laravel / status 422)
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validacionesBackend = error.response.data.errors;
        const nuevosErrores = {};

        // Si el backend se queja de la cédula, lo pasamos al estado de errores del input
        if (validacionesBackend.cedula) {
          nuevosErrores.cedula = validacionesBackend.cedula[0]; // Ej: "La cédula ya ha sido registrada."
        }
        // Lo mismo para el email por si también es UNIQUE
        if (validacionesBackend.email) {
          nuevosErrores.email = validacionesBackend.email[0];
        }

        setErrors(prev => ({ ...prev, ...nuevosErrores }));
        setErrorMsg('Por favor, corrija los errores marcados en rojo.');
      } else {
        // Fallback: Mostrar el mensaje de error general en el banner inferior
        setErrorMsg(error.response?.data?.message || 'Error al guardar el personal. Revise los datos.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {personalAEditar ? 'Editar Personal' : 'Nuevo Personal'}
              </h2>
              <p className="text-xs text-slate-500">Empleados y colaboradores de la empresa</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Nombre Completo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre Completo *</label>
            <input
              type="text"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              placeholder="Ej: Jonathan Morillo"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.nombre_completo ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.nombre_completo && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.nombre_completo}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cédula - AHORA OPCIONAL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <IdCard size={12} /> Cédula
              </label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleCedulaChange}
                placeholder="V-33.158.392"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  errors.cedula ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
                maxLength={14}
              />
              {errors.cedula && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.cedula}
                </p>
              )}
            </div>

            {/* Cargo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Cargo</label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                placeholder="Ej: Analista de Soporte"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Departamentos Estructurales */}
          <div className="space-y-2 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <GitMerge size={12} /> Estructura Organizativa *
            </label>
            
            {nivelesDeDepartamentos.map((nivel, index) => (
              <div key={`nivel-${index}`} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-300 text-sm ml-2">↳</span>}
                <select
                  value={nivel.value}
                  onChange={(e) => handleNivelChange(index, e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm ${
                    errors.departamentos && index === 0 ? 'border-rose-300' : 'border-slate-200'
                  }`}
                >
                  <option value="">
                    {index === 0 
                      ? '-- Seleccione Entidad Principal --' 
                      : '-- Seleccione Subdivisión (Opcional) --'}
                  </option>
                  {nivel.opciones.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
            ))}
            
            {errors.departamentos && (
              <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errors.departamentos}
              </p>
            )}
            <p className="text-[10px] text-slate-400 mt-2 leading-tight">
              Seleccione la jerarquía descendente a la que pertenece el personal. No es obligatorio alcanzar el último nivel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Teléfono */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Phone size={12} /> Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleTelefonoChange}
                placeholder="Ej: 04121234567"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  errors.telefono ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
                maxLength={11}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {errors.telefono && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.telefono}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Mail size={12} /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@transmandu.com"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  errors.email ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle size={14} />
              {errorMsg}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
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
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Guardando...</>
              ) : (
                <><Save size={16} /> {personalAEditar ? 'Actualizar' : 'Guardar'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPersonal;
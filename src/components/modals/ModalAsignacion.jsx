// src/components/modals/ModalAsignacion.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, UserCheck, Loader2, Laptop, User, Briefcase, FileCheck, ClipboardList, Trash2, Layers, Search } from 'lucide-react';
import { useData } from '../../context/DataContext';
import api from '../../services/api';

const ModalAsignacion = ({ isOpen, onClose, asignacionAEditar = null }) => {
  const { 
    activos, 
    agregarAsignacion, 
    actualizarAsignacion, 
    personal = [], 
    departamentos = [],
    usuarios = [],
    usuarioLogueado
  } = useData();

  const isAdmin = usuarioLogueado?.rol === 'Administrador';

  const [formData, setFormData] = useState({
    activosSeleccionados: [],
    responsable_id: '',
    departamento_id: '',
    subdivision: '',
    fecha_hora: '',
    observaciones: ''
  });
  const [elaboradoPorId, setElaboradoPorId] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // ============================================================
  // 🔹 OBTENER PERSONAL DE SOPORTE (IT)
  // ============================================================
  const personalSoporte = useMemo(() => {
    if (!personal.length) return [];

    const palabrasClave = ['soporte', 'it', 'informática', 'tecnología', 'publicaciones'];
    const deptosIT = departamentos.filter(d => 
      d.nombre && palabrasClave.some(palabra => d.nombre.toLowerCase().includes(palabra))
    ).map(d => d.id);

    const idsDeptosIT = new Set(deptosIT);
    departamentos.forEach(d => {
      if (d.padre_id && deptosIT.includes(d.padre_id)) {
        idsDeptosIT.add(d.id);
      }
    });

    const filtrados = personal.filter(p => {
      const cargoStr = (p.cargo?.nombre || p.cargo || '').toString().toLowerCase();
      const deptoStr = (p.departamento?.nombre || p.departamento || '').toString().toLowerCase();
      const jefaturaStr = (p.jefatura?.nombre || p.jefatura || '').toString().toLowerCase();

      const esAnalistaSoporte = cargoStr.includes('analista de soporte') || cargoStr.includes('soporte técnico');
      const perteneceADeptoTexto = deptoStr.includes('it') || deptoStr.includes('publicaciones') || jefaturaStr.includes('soporte');
      
      const deptoId = p.departamento_id || p.departamento?.id;
      const perteneceADeptoID = deptoId && idsDeptosIT.has(deptoId);

      return esAnalistaSoporte || perteneceADeptoTexto || perteneceADeptoID;
    });

    if (filtrados.length === 0) {
      console.warn('⚠️ No se encontraron analistas de soporte. Usando todo el personal como fallback.');
      return personal;
    }

    return filtrados;
  }, [personal, departamentos]);

  // ============================================================
  // HANDLERS DE LOS SELECTORES
  // ============================================================
  const handleElaboradoChange = (e) => {
    const personalId = e.target.value;
    setElaboradoPorId(personalId);
    if (errors.elaboradoPor) setErrors(prev => ({ ...prev, elaboradoPor: null }));
  };

  const departamentosPrincipales = useMemo(() => {
    return departamentos.filter(d => d.padre_id === null);
  }, [departamentos]);

  const departamentoSeleccionado = useMemo(() => {
    if (!formData.departamento_id) return null;
    return departamentos.find(d => d.id === parseInt(formData.departamento_id));
  }, [departamentos, formData.departamento_id]);

  const subdivisionesDelDepto = useMemo(() => {
    if (!departamentoSeleccionado) return [];
    if (departamentoSeleccionado.hijos && departamentoSeleccionado.hijos.length > 0) {
      return departamentoSeleccionado.hijos;
    }
    return departamentos.filter(d => d.padre_id === departamentoSeleccionado.id);
  }, [departamentoSeleccionado, departamentos]);

  const personalFiltrado = useMemo(() => {
    if (!personal || personal.length === 0) return [];
    if (!formData.departamento_id) return [];

    let targetId = formData.departamento_id;

    if (formData.subdivision && subdivisionesDelDepto.length > 0) {
      const subSeleccionada = subdivisionesDelDepto.find(
        s => s.nombre === formData.subdivision
      );
      if (subSeleccionada) {
        targetId = subSeleccionada.id;
      }
    }

    return personal.filter(p => {
      const pDeptoId = p.departamento_id || p.departamento?.id;
      return String(pDeptoId) === String(targetId);
    });
  }, [personal, formData.departamento_id, formData.subdivision, subdivisionesDelDepto]);

  // ============================================================
  // EFECTO PARA CARGAR DATOS AL ABRIR MODAL
  // ============================================================
  useEffect(() => {
    if (asignacionAEditar) {
      setFormData({
        activosSeleccionados: asignacionAEditar.activos || [],
        responsable_id: asignacionAEditar.responsable_id || '',
        departamento_id: asignacionAEditar.departamento_id || '',
        subdivision: asignacionAEditar.subdivision || '',
        fecha_hora: asignacionAEditar.fecha_hora?.slice(0, 10) || '',
        observaciones: asignacionAEditar.observaciones || ''
      });

      // ✅ Cargar el elaborador desde la relación elaboradoPor
      if (asignacionAEditar.elaboradoPor) {
        setElaboradoPorId(String(asignacionAEditar.elaboradoPor.id));
      } else {
        setElaboradoPorId('');
      }
    } else {
      setFormData({
        activosSeleccionados: [],
        responsable_id: '',
        departamento_id: '',
        subdivision: '',
        fecha_hora: '',
        observaciones: ''
      });
      setElaboradoPorId('');
    }
    setErrors({});
    setSearchTerm('');
    setShowDropdown(false);
  }, [asignacionAEditar, isOpen]);

  if (!isOpen) return null;

  // ============================================================
  // FILTRO DE ACTIVOS DISPONIBLES
  // ============================================================
  const activosDisponibles = activos.filter(act => 
    act.estado !== 'Inactivo' && 
    act.estado !== 'Desincorporado'
  );
  
  const activosFiltrados = activosDisponibles.filter(act => {
    const codigo = (act.codigo || '').toLowerCase();
    const nombre = (act.nombre || '').toLowerCase();
    const serial = (act.serial || '').toLowerCase();
    const busqueda = searchTerm.toLowerCase();
    const coincide = codigo.includes(busqueda) || nombre.includes(busqueda) || serial.includes(busqueda);
    const yaAgregado = formData.activosSeleccionados.some(sel => sel.id === act.id);
    return coincide && !yaAgregado;
  });

  // ============================================================
  // FUNCIONES DE MANEJO DE ACTIVOS
  // ============================================================
  const handleAddActivo = (activo) => {
    if (activo.estado === 'Asignado') {
      alert(`⚠️ El activo ${activo.codigo} - ${activo.nombre} ya está asignado a otra persona.\nNo se puede seleccionar.`);
      return;
    }
    
    if (!formData.activosSeleccionados.some(a => a.id === activo.id)) {
      setFormData(prev => ({
        ...prev,
        activosSeleccionados: [...prev.activosSeleccionados, activo]
      }));
    }
    setSearchTerm('');
    setShowDropdown(false);
    if (errors.activos) setErrors(prev => ({ ...prev, activos: null }));
  };

  const handleRemoveActivo = (id) => {
    setFormData(prev => ({
      ...prev,
      activosSeleccionados: prev.activosSeleccionados.filter(a => a.id !== id)
    }));
  };

  // ============================================================
  // MANEJO DE CAMBIOS EN DEPARTAMENTO, SUBDIVISIÓN Y RESPONSABLE
  // ============================================================
  const handleDepartamentoChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      departamento_id: value,
      subdivision: '',
      responsable_id: ''
    }));
    if (errors.departamento_id) setErrors(prev => ({ ...prev, departamento_id: null }));
    if (errors.subdivision) setErrors(prev => ({ ...prev, subdivision: null }));
  };

  const handleSubdivisionChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      subdivision: value,
      responsable_id: ''
    }));
    if (errors.subdivision) setErrors(prev => ({ ...prev, subdivision: null }));
  };

  const handleResponsableChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      responsable_id: value
    }));
    if (errors.responsable_id) setErrors(prev => ({ ...prev, responsable_id: null }));
  };

  // ============================================================
  // VALIDACIÓN DEL FORMULARIO
  // ============================================================
  const validate = () => {
    let err = {};
    if (!formData.departamento_id) {
      err.departamento_id = 'Debe seleccionar un departamento.';
    }
    if (subdivisionesDelDepto.length > 0 && !formData.subdivision) {
      err.subdivision = 'Debe seleccionar una subdivisión.';
    }
    if (!formData.responsable_id) {
      err.responsable_id = 'Debe seleccionar un responsable.';
    }
    if (!formData.fecha_hora) {
      err.fecha_hora = 'Indique la fecha de emisión.';
    }
    if (formData.activosSeleccionados.length === 0) {
      err.activos = 'Seleccione al menos un activo.';
    }
    if (!elaboradoPorId) {
      err.elaboradoPor = 'Seleccione quién elaboró el acta.';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ============================================================
  // ENVÍO DEL FORMULARIO
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const personalElaborador = personalSoporte.find(p => String(p.id) === String(elaboradoPorId));
      if (!personalElaborador) {
        throw new Error('El elaborador seleccionado no es válido.');
      }

      let userElaborador = usuarios.find(u => u.email && u.email === personalElaborador.email);
      
      if (!userElaborador) {
        console.warn(`No se encontró usuario para ${personalElaborador.nombre_completo || 'el elaborador seleccionado'}. Usando usuario en sesión.`);
        userElaborador = usuarioLogueado;
      }

      if (!userElaborador || !userElaborador.id) {
        throw new Error('No se pudo determinar un usuario válido para registrar la asignación.');
      }
      
      const creadoPorId = userElaborador.id;

      const responsableIdNum = Number(formData.responsable_id);
      if (!Number.isInteger(responsableIdNum) || responsableIdNum <= 0) {
        throw new Error('El responsable seleccionado no es válido.');
      }
      const responsable = personal.find(p => p.id === responsableIdNum);
      if (!responsable) {
        throw new Error('El responsable seleccionado no existe.');
      }

      const departamentoIdNum = Number(formData.departamento_id);
      if (!Number.isInteger(departamentoIdNum) || departamentoIdNum <= 0) {
        throw new Error('El departamento seleccionado no es válido.');
      }
      const departamento = departamentos.find(d => d.id === departamentoIdNum);
      if (!departamento) {
        throw new Error('El departamento seleccionado no existe.');
      }

      const activosIds = formData.activosSeleccionados.map(a => {
        const id = Number(a.id);
        if (!Number.isInteger(id) || id <= 0) {
          throw new Error(`El activo "${a.nombre}" tiene un ID inválido.`);
        }
        return id;
      });

      let fechaHora = formData.fecha_hora;
      if (!fechaHora) {
        throw new Error('La fecha es obligatoria.');
      }
      
      if (fechaHora.length === 10) {
        fechaHora = `${fechaHora} 00:00:00`;
      } else if (fechaHora.includes('T')) {
        fechaHora = fechaHora.replace('T', ' ') + ':00';
      }

      const estadoActa = isAdmin ? 'Firmada' : 'Pendiente por Firma';

      const payload = {
        responsable_id: responsableIdNum,
        departamento_id: departamentoIdNum,
        subdivision: formData.subdivision || null,
        fecha_hora: fechaHora,
        observaciones: formData.observaciones || null,
        activos: activosIds,
        estado_acta: estadoActa,
        creado_por_id: creadoPorId,
        elaborado_por_id: Number(elaboradoPorId), // NUEVO: ID del personal seleccionado
      };


      if (asignacionAEditar) {
        await actualizarAsignacion(asignacionAEditar.id, payload);
      } else {
        await agregarAsignacion(payload);
      }

      if (isAdmin) {
        alert('Asignación creada y autorizada automáticamente.');
      } else {
        alert('Solicitud de asignación enviada al administrador. Quedará en estado "Pendiente por Firma".');
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar asignación:', error);
      console.log('Respuesta del servidor:', error.response);

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        let msg = 'Errores de validación del servidor:\n\n';
        for (const [campo, mensajes] of Object.entries(backendErrors)) {
          msg += `• ${campo}: ${mensajes.join(', ')}\n`;
        }
        alert(msg);
      } else if (error.response?.data?.message) {
        alert(`${error.response.data.message}`);
      } else {
        alert(error.message || 'Error desconocido al guardar la asignación.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const tieneSubdivisiones = subdivisionesDelDepto.length > 0;
  const responsableHabilitado = formData.departamento_id && (!tieneSubdivisiones || formData.subdivision);

  // ============================================================
  // RENDERIZADO
  // ============================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              <ClipboardList size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {asignacionAEditar ? 'Editar asignación' : 'Nueva asignación'}
              </h2>
              <p className="text-xs text-slate-500">Asigne equipos a un responsable y departamento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-slate-50/30">
          {/* Sección 1: Activos */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-blue-700 border-b border-blue-100 pb-2">
              <Laptop size={18} />
              <h3 className="text-sm font-bold uppercase">1. Equipos a Asignar</h3>
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-slate-600 mb-1">Buscar y añadir activos</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Laptop size={14} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Escribe código, nombre o serial del activo..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              {showDropdown && searchTerm.trim() !== '' && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto font-sans">
                  {activosFiltrados.length > 0 ? (
                    activosFiltrados.map((act) => {
                      const estaAsignado = act.estado === 'Asignado';
                      return (
                        <div
                          key={act.id}
                          onClick={() => !estaAsignado && handleAddActivo(act)}
                          className={`px-4 py-2 hover:bg-blue-50/80 cursor-pointer text-left border-b border-slate-100 last:border-0 flex items-center justify-between ${
                            estaAsignado ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-800 font-mono">{act.codigo}</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{act.nombre} — <span className="font-mono text-[9px]">{act.serial}</span></p>
                          </div>
                          {estaAsignado ? (
                            <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">
                              Asignado
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">
                              + Añadir
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-400 italic text-center">No se encontraron activos disponibles.</div>
                  )}
                </div>
              )}
              {errors.activos && <p className="text-rose-500 text-xs mt-1">{errors.activos}</p>}
            </div>

            {formData.activosSeleccionados.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">Seleccionados ({formData.activosSeleccionados.length})</div>
                <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {formData.activosSeleccionados.map(act => (
                    <div key={act.id} className="flex justify-between items-center px-3 py-2 text-sm">
                      <div><span className="font-mono font-bold">{act.codigo}</span> - {act.nombre}</div>
                      <button type="button" onClick={() => handleRemoveActivo(act.id)} className="text-rose-500 hover:text-rose-700"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sección 2: Ubicación y Responsable */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 border-b border-emerald-100 pb-2">
              <User size={18} />
              <h3 className="text-sm font-bold uppercase">2. Ubicación y Responsable</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Departamento / Dirección *</label>
                <select
                  value={formData.departamento_id}
                  onChange={handleDepartamentoChange}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                    errors.departamento_id ? 'border-rose-300' : 'border-slate-200'
                  }`}
                >
                  <option value="">-- Seleccione un departamento --</option>
                  {departamentosPrincipales.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
                {errors.departamento_id && <p className="text-rose-500 text-xs mt-1">{errors.departamento_id}</p>}
              </div>

              {tieneSubdivisiones && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Subdivisión / Área *</label>
                  <select
                    value={formData.subdivision}
                    onChange={handleSubdivisionChange}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.subdivision ? 'border-rose-300' : 'border-slate-200'
                    }`}
                  >
                    <option value="">-- Seleccione una subdivisión --</option>
                    {subdivisionesDelDepto.map(sub => (
                      <option key={sub.id} value={sub.nombre}>{sub.nombre}</option>
                    ))}
                  </select>
                  {errors.subdivision && <p className="text-rose-500 text-xs mt-1">{errors.subdivision}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Responsable (Custodio) *</label>
                <select
                  value={formData.responsable_id}
                  onChange={handleResponsableChange}
                  disabled={!responsableHabilitado}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                    errors.responsable_id ? 'border-rose-300' : 'border-slate-200'
                  } ${!responsableHabilitado ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {!responsableHabilitado 
                      ? (formData.departamento_id && tieneSubdivisiones && !formData.subdivision 
                          ? 'Seleccione una subdivisión primero' 
                          : 'Seleccione un departamento primero')
                      : '-- Seleccione un responsable --'}
                  </option>
                  {personalFiltrado.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                  ))}
                </select>
                {errors.responsable_id && <p className="text-rose-500 text-xs mt-1">{errors.responsable_id}</p>}
                {responsableHabilitado && personalFiltrado.length === 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">⚠️ No hay personal registrado en esta ubicación.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sección 3: Fecha, Observaciones y Elaborado por */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-purple-700 border-b border-purple-100 pb-2">
              <UserCheck size={18} />
              <h3 className="text-sm font-bold uppercase">3. Fecha, Observaciones y Elaborado por</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Fecha de Emisión *</label>
                <input
                  type="date"
                  value={formData.fecha_hora}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_hora: e.target.value }))}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                    errors.fecha_hora ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
                {errors.fecha_hora && <p className="text-rose-500 text-xs mt-1">{errors.fecha_hora}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Elaborado por *</label>
                <select
                  value={elaboradoPorId}
                  onChange={handleElaboradoChange}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                    errors.elaboradoPor ? 'border-rose-300' : 'border-slate-200'
                  }`}
                >
                  <option value="">-- Seleccione el analista que elaboró --</option>
                  {personalSoporte.map(p => (
                    <option key={p.id} value={String(p.id)}>{p.nombre_completo}</option>
                  ))}
                </select>
                {errors.elaboradoPor && <p className="text-rose-500 text-xs mt-1">{errors.elaboradoPor}</p>}
                {personalSoporte.length === 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">⚠️ No hay personal de soporte registrado.</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Observaciones</label>
              <textarea
                rows="2"
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Detalles adicionales..."
              />
            </div>
            {!isAdmin && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                ℹ️ Como no eres administrador, esta asignación quedará en estado <strong>"Pendiente"</strong> hasta que un administrador la autorice.
              </div>
            )}
          </div>
        </form>

        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Cancelar</button>
          <button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md flex items-center gap-2">
            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Procesando</> : <><UserCheck size={16} /> {asignacionAEditar ? 'Actualizar' : 'Crear Asignación'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAsignacion;
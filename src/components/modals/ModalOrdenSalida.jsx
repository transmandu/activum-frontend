// src/components/modals/ModalOrdenSalida.jsx
import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, MapPin, User, AlertCircle, HardDrive, Loader2, Laptop, Plus, Trash2, IdCard, Briefcase } from 'lucide-react';
import { useData } from '../../context/DataContext';
import api from '../../services/api';

const ModalOrdenSalida = ({ isOpen, onClose, ordenAEditar = null }) => {
  const { 
    agregarOrdenSalida, 
    actualizarOrdenSalida, 
    activos, 
    destinos, 
    agregarDestino,
    personal = []
  } = useData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [listaActivosSeleccionados, setListaActivosSeleccionados] = useState([]);
  
  // Estados para el selector de destino
  const [destinoSeleccionado, setDestinoSeleccionado] = useState('');
  const [mostrarOtroDestino, setMostrarOtroDestino] = useState(false);
  const [nuevoDestino, setNuevoDestino] = useState('');

  // Estado para solicitante (selector)
  const [solicitanteId, setSolicitanteId] = useState('');

  const [formData, setFormData] = useState({
    motivo: '',
    fechaSalida: ''
  });
  const [errors, setErrors] = useState({});

  // Rellenar formulario si es edición
  useEffect(() => {
    if (ordenAEditar) {
      setFormData({
        motivo: ordenAEditar.motivo || '',
        fechaSalida: ordenAEditar.fecha_salida || ''
      });
      setListaActivosSeleccionados(ordenAEditar.activos || []);
      
      // Solicitante (ID)
      setSolicitanteId(ordenAEditar.solicitante_id || '');

      // Destino
      if (ordenAEditar.destino_id) {
        setDestinoSeleccionado(ordenAEditar.destino_id.toString());
        setMostrarOtroDestino(false);
      } else if (ordenAEditar.destino) {
        const encontrado = destinos?.find(d => d.nombre === ordenAEditar.destino);
        if (encontrado) {
          setDestinoSeleccionado(encontrado.id.toString());
          setMostrarOtroDestino(false);
        } else {
          setDestinoSeleccionado('otro');
          setMostrarOtroDestino(true);
          setNuevoDestino(ordenAEditar.destino || '');
        }
      } else {
        setDestinoSeleccionado('');
        setMostrarOtroDestino(false);
      }
    } else {
      setFormData({
        motivo: '',
        fechaSalida: ''
      });
      setListaActivosSeleccionados([]);
      setSolicitanteId('');
      setDestinoSeleccionado('');
      setMostrarOtroDestino(false);
      setNuevoDestino('');
    }
    setErrors({});
  }, [ordenAEditar, isOpen, personal, destinos]);

  if (!isOpen) return null;

  // ✅ ELIMINADA la función generarCodigoOrden() - el backend lo genera

  const activosDisponibles = (activos || []).filter(act => act.estado !== 'Inactivo');
  const activosFiltrados = activosDisponibles.filter(act => {
    const codigo = (act.codigo || act.etiqueta || '').toLowerCase();
    const nombre = (act.nombre || '').toLowerCase();
    const serial = (act.serial || '').toLowerCase();
    const busqueda = searchTerm.toLowerCase();
    const coincide = codigo.includes(busqueda) || nombre.includes(busqueda) || serial.includes(busqueda);
    const yaAgregado = listaActivosSeleccionados.some(sel => (sel.codigo || sel.etiqueta) === (act.codigo || act.etiqueta));
    return coincide && !yaAgregado;
  });

  const handleAgregarActivo = (activo) => {
    setListaActivosSeleccionados([...listaActivosSeleccionados, activo]);
    setSearchTerm('');
    setShowDropdown(false);
    if (errors.activos) setErrors(prev => ({ ...prev, activos: null }));
  };

  const handleRemoveActivo = (index) => {
    setListaActivosSeleccionados(listaActivosSeleccionados.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleDestinoChange = (e) => {
    const value = e.target.value;
    setDestinoSeleccionado(value);
    if (value === 'otro') {
      setMostrarOtroDestino(true);
    } else {
      setMostrarOtroDestino(false);
      setNuevoDestino('');
    }
    if (errors.destino) setErrors(prev => ({ ...prev, destino: null }));
  };

  const validarExistencia = (id, lista, tipo) => {
    if (!id) return null;
    const existente = lista.find(item => item.id === parseInt(id));
    if (!existente) {
      throw new Error(`El ${tipo} seleccionado no existe.`);
    }
    return existente;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.motivo.trim()) newErrors.motivo = 'El motivo técnico de la orden es obligatorio.';
    if (!solicitanteId) newErrors.solicitante = 'Debe seleccionar un solicitante.';
    if (!formData.fechaSalida) newErrors.fechaSalida = 'Indique la fecha programada de salida.';
    if (listaActivosSeleccionados.length === 0) newErrors.activos = 'Debe vincular al menos un activo.';
    
    if (destinoSeleccionado === 'otro') {
      if (!nuevoDestino.trim()) {
        newErrors.destino = 'Debe escribir el nombre del nuevo destino.';
      }
    } else if (!destinoSeleccionado) {
      newErrors.destino = 'Debe seleccionar un destino o elegir "Otro".';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const solicitante = validarExistencia(solicitanteId, personal, 'solicitante');

      let destinoId = null;
      let destinoNombre = null;

      if (destinoSeleccionado === 'otro') {
        if (nuevoDestino.trim()) {
          const nuevoDestinoObj = await agregarDestino({ nombre: nuevoDestino.trim() });
          destinoId = nuevoDestinoObj.id;
          destinoNombre = nuevoDestinoObj.nombre;
        }
      } else if (destinoSeleccionado) {
        destinoId = parseInt(destinoSeleccionado);
        const destinoExistente = destinos?.find(d => d.id === destinoId);
        destinoNombre = destinoExistente ? destinoExistente.nombre : '';
      }

      // ✅ Información de activos para el JSON
      const informacionActivos = listaActivosSeleccionados.map((act, idx) => ({
        item: idx + 1,
        descripcion: `${act.nombre}${act.marca ? ` (${act.marca})` : ''}`,
        serial: act.serial || 'N/S',
        cantidad: 1
      }));

      // ✅ PAYLOAD: SIN 'codigo' para nuevas órdenes (el backend lo genera)
      const payload = {
        motivo: formData.motivo,
        destino: destinoNombre || 'Sin destino',
        destino_id: destinoId,
        solicitante_id: parseInt(solicitanteId),
        fecha_salida: formData.fechaSalida,
        estado: ordenAEditar ? ordenAEditar.estado : 'Pendiente',
        activos: listaActivosSeleccionados.map(a => a.id),
        activos_incluidos: informacionActivos,
        solicitante: solicitante?.nombre_completo || '',
        cedula: solicitante?.cedula || '',
        cargo: solicitante?.cargo || '',
      };

      // ✅ Si es edición, incluir el código existente
      if (ordenAEditar) {
        payload.codigo = ordenAEditar.codigo;
      }

      if (ordenAEditar) {
        await actualizarOrdenSalida(ordenAEditar.id, payload);
      } else {
        await agregarOrdenSalida(payload);
      }

      setListaActivosSeleccionados([]);
      setFormData({ motivo: '', fechaSalida: '' });
      setSolicitanteId('');
      setDestinoSeleccionado('');
      setMostrarOtroDestino(false);
      setNuevoDestino('');
      onClose();
    } catch (error) {
      console.error('❌ Error al guardar orden:', error);
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        let msg = 'Errores de validación:\n';
        Object.keys(backendErrors).forEach(key => {
          msg += `• ${key}: ${backendErrors[key].join(', ')}\n`;
        });
        alert(msg);
      } else {
        alert(error.message || 'Ocurrió un error al guardar la orden.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 text-left">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {ordenAEditar ? 'Editar Pase de Salida' : 'Emitir Pase de Salida de Material'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Formato de control de activos en tránsito de TRANSMANDU C.A.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-left bg-white flex-1 max-h-[75vh]">
          
          {/* SECCIÓN: Activos */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3 relative">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              1. Buscar y Añadir Componentes I.T. al Pase *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Laptop size={14} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Escribe Etiqueta, Modelo Comercial o Serial..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              />
              {showDropdown && searchTerm.trim() !== '' && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto font-sans">
                  {activosFiltrados.length > 0 ? (
                    activosFiltrados.map((act, idx) => (
                      <div key={idx} onClick={() => handleAgregarActivo(act)} className="px-4 py-2 hover:bg-blue-50/80 cursor-pointer text-left border-b border-slate-100 last:border-0 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800 font-mono">{act.codigo || act.etiqueta}</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{act.nombre} — <span className="font-mono text-[9px]">{act.serial}</span></p>
                        </div>
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-0.5">
                          <Plus size={10} /> Incluir
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-400 italic text-center">No se encontraron activos disponibles o ya están añadidos al lote.</div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Lote de Activos en esta Orden:</span>
              {listaActivosSeleccionados.length > 0 ? (
                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden divide-y divide-slate-100 shadow-xs">
                  {listaActivosSeleccionados.map((activo, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3.5 py-2 animate-fade-in hover:bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {activo.codigo || activo.etiqueta}
                        </span>
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800 block leading-tight">{activo.nombre}</span>
                          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">S/N: {activo.serial}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleRemoveActivo(idx)} className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Quitar este activo del pase">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-slate-200 bg-white rounded-xl text-center text-xs text-slate-400 italic">
                  Ningún componente seleccionado. Use el buscador superior para armar el lote de salida.
                </div>
              )}
            </div>
            {errors.activos && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1"><AlertCircle size={11} /> {errors.activos}</p>}
          </div>

          {/* SECCIÓN: Datos del traslado */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-1">
              2. Datos del Traslado
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Solicitante (SELECTOR) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <User size={12} /> Solicitante *
                </label>
                <select
                  value={solicitanteId}
                  onChange={(e) => setSolicitanteId(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border border-solid rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                    errors.solicitante ? 'border-rose-300' : 'border-slate-200'
                  }`}
                >
                  <option value="">-- Seleccione un solicitante --</option>
                  {personal.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                  ))}
                </select>
                {errors.solicitante && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1"><AlertCircle size={11} /> {errors.solicitante}</p>}
              </div>

              {/* Fecha de salida */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Calendar size={12} /> Fecha de Despacho *
                </label>
                <input
                  type="date"
                  name="fechaSalida"
                  value={formData.fechaSalida}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border border-solid rounded-lg font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer ${errors.fechaSalida ? 'border-rose-300' : 'border-slate-200'}`}
                />
                {errors.fechaSalida && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1"><AlertCircle size={11} /> {errors.fechaSalida}</p>}
              </div>

              {/* Destino (selector con opción "Otro") */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <MapPin size={12} /> Destino / Ubicación de Entrega *
                </label>
                <select
                  value={destinoSeleccionado}
                  onChange={handleDestinoChange}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border border-solid rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.destino ? 'border-rose-300' : 'border-slate-200'}`}
                >
                  <option value="">-- Seleccione un destino --</option>
                  {destinos?.map(d => (
                    <option key={d.id} value={d.id.toString()}>{d.nombre}</option>
                  ))}
                  <option value="otro">➕ Otro (escribir nuevo destino)</option>
                </select>
                {errors.destino && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1"><AlertCircle size={11} /> {errors.destino}</p>}
              </div>

              {/* Campo para nuevo destino */}
              {mostrarOtroDestino && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <MapPin size={12} /> Nuevo Destino *
                  </label>
                  <input
                    type="text"
                    value={nuevoDestino}
                    onChange={(e) => setNuevoDestino(e.target.value)}
                    placeholder="Ej: Taller Central, Hangar 74..."
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border border-solid rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.destino ? 'border-rose-300' : 'border-slate-200'}`}
                  />
                  <p className="text-[9px] text-slate-400">Este destino se guardará automáticamente para futuras órdenes.</p>
                </div>
              )}

              {/* Motivo (textarea) */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <AlertCircle size={12} /> Motivo Técnico del Movimiento *
                </label>
                <textarea
                  name="motivo"
                  rows="3"
                  value={formData.motivo}
                  onChange={handleInputChange}
                  placeholder="Describa detalladamente la justificación de la salida (Ej: Reparación de tarjeta lógica por garantía, reubicación física de servidores...)"
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border border-solid rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none ${errors.motivo ? 'border-rose-300' : 'border-slate-200'}`}
                />
                {errors.motivo && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1"><AlertCircle size={11} /> {errors.motivo}</p>}
              </div>
            </div>
          </div>
        </form>

        {/* Botones */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0 rounded-b-xl">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-bold border border-slate-200 cursor-pointer transition-colors disabled:opacity-50">Cancelar</button>
          <button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="w-36 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold border-0 cursor-pointer transition-colors shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5 disabled:bg-blue-400">
            {isSubmitting ? <><Loader2 size={13} className="animate-spin" /> <span>Guardando...</span></> : <><FileText size={13} /> <span>{ordenAEditar ? 'Actualizar' : 'Generar Pase'}</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalOrdenSalida;
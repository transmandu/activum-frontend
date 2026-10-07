// src/components/modals/ModalDesincorporacion.jsx
import React, { useState, useEffect } from 'react';
import { X, Trash2, HardDrive, AlertCircle, FileText, Calendar, Plus } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalDesincorporacion = ({ isOpen, onClose }) => {
  const { confirmarBajaDefinitiva, activos, desincorporaciones } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [listaActivosBaja, setListaActivosBaja] = useState([]);
  const [formData, setFormData] = useState({
    motivo: '',
    fechaBaja: new Date().toISOString().split('T')[0],
    destino: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codigoInforme, setCodigoInforme] = useState('');

  // Generar código correlativo para el informe
  const generarSiguienteInforme = () => {
    const desincs = desincorporaciones || [];
    let maxNum = 0;
    desincs.forEach(des => {
      const match = des.codigo_acta?.match(/TMD-DIP-DS-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const siguiente = maxNum + 1;
    return `TMD-DIP-DS-${String(siguiente).padStart(5, '0')}`;
  };

  // Actualizar código al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const nuevoCodigo = generarSiguienteInforme();
      setCodigoInforme(nuevoCodigo);
    }
  }, [isOpen, desincorporaciones]);

  // Resetear formulario al cerrar
  useEffect(() => {
    if (!isOpen) {
      setListaActivosBaja([]);
      setFormData({
        motivo: '',
        fechaBaja: new Date().toISOString().split('T')[0],
        destino: ''
      });
      setErrors({});
      setSearchTerm('');
      setShowDropdown(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtrar activos disponibles
  const activosDisponibles = (activos || []).filter(act => 
    act.estado !== 'Inactivo' && 
    act.estado !== 'Desincorporado' &&
    act.estado !== 'Desincorporado'
  );

  const activosFiltrados = activosDisponibles.filter(act => {
    const codigo = (act.codigo || act.etiqueta || '').toLowerCase();
    const nombre = (act.nombre || '').toLowerCase();
    const busqueda = searchTerm.toLowerCase().trim();
    const coincide = codigo.includes(busqueda) || nombre.includes(busqueda);
    const yaAgregado = listaActivosBaja.some(item => 
      (item.codigo || item.etiqueta) === (act.codigo || act.etiqueta)
    );
    return coincide && !yaAgregado;
  });

  // Handlers
  const handleAgregarActivo = (act) => {
    setListaActivosBaja([...listaActivosBaja, act]);
    setSearchTerm('');
    setShowDropdown(false);
    if (errors.activos) setErrors(prev => ({ ...prev, activos: null }));
  };

  const handleRemoverActivo = (codigo) => {
    setListaActivosBaja(listaActivosBaja.filter(act => 
      (act.codigo || act.etiqueta) !== codigo
    ));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // Validación
  const validarFormulario = () => {
    let erroresTemporales = {};
    if (listaActivosBaja.length === 0) {
      erroresTemporales.activos = "Debe añadir al menos un activo.";
    }
    if (!formData.motivo.trim()) {
      erroresTemporales.motivo = "El diagnóstico es requerido.";
    }
    if (!formData.fechaBaja.trim()) {
      erroresTemporales.fechaBaja = "La fecha es requerida.";
    }
    if (!formData.destino.trim()) {
      erroresTemporales.destino = "Debe especificar el destino final de los equipos.";
    }
    setErrors(erroresTemporales);
    return Object.keys(erroresTemporales).length === 0;
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setIsSubmitting(true);

    try {
      const totalActivos = listaActivosBaja.length;
      
      // Construir descripción del activo/lote
      let stringActivoMuestra = "";
      if (totalActivos === 1) {
        stringActivoMuestra = `${listaActivosBaja[0].nombre} (1 Activo Único)`;
      } else if (totalActivos === 2) {
        stringActivoMuestra = `${listaActivosBaja[0].nombre} y 1 más (Lote de 2 Activos)`;
      } else {
        stringActivoMuestra = `${listaActivosBaja[0].nombre} y ${totalActivos - 1} más (Lote de ${totalActivos} Activos)`;
      }

      // Activos incluidos para el JSON
      const activosIncluidos = listaActivosBaja.map(a => ({
        codigo: a.codigo || a.etiqueta,
        nombre: a.nombre
      }));

      // IDs de activos para la relación muchos a muchos
      const activosIds = listaActivosBaja.map(a => a.id);

      // ✅ PAYLOAD CORRECTO para el backend
      const payload = {
        codigo_acta: codigoInforme,
        activo: stringActivoMuestra,
        codigo: totalActivos === 1 
          ? (listaActivosBaja[0].codigo || listaActivosBaja[0].etiqueta) 
          : `LOTE-${totalActivos}ACT`,
        motivo: formData.motivo,
        informe: codigoInforme,
        autorizado_por_id: null, // ⬅️ IMPORTANTE: null para quedar pendiente
        fecha_baja: formData.fechaBaja,
        destino: formData.destino,
        activos_incluidos: activosIncluidos,
        activos: activosIds, // ⬅️ Array de IDs
      };

      // Enviar al backend
      await confirmarBajaDefinitiva(payload);

      // Resetear formulario
      setListaActivosBaja([]);
      setFormData({
        motivo: '',
        fechaBaja: new Date().toISOString().split('T')[0],
        destino: ''
      });
      setSearchTerm('');
      setErrors({});
      
      alert('✅ Desincorporación registrada correctamente. Quedará en estado "Pendiente" hasta que el administrador la autorice.');
      onClose();
      
    } catch (error) {
      console.error('❌ Error al registrar desincorporación:', error);
      
      // Mostrar el error detallado del backend si existe
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        let msg = 'Errores de validación:\n';
        Object.keys(backendErrors).forEach(key => {
          msg += `• ${key}: ${backendErrors[key].join(', ')}\n`;
        });
        alert(msg);
      } else if (error.response?.data?.message) {
        alert(`❌ ${error.response.data.message}`);
      } else {
        alert('Error al registrar desincorporación. Revisa la consola.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 w-full max-w-xl shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-800">
            <Trash2 size={18} className="text-rose-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider">Registrar Desincorporación</h4>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Buscador de activos */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <HardDrive size={12} /> Añadir Activos al Lote de Baja
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Busque por código o nombre para anexar..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                className={`w-full p-2.5 border rounded-lg text-xs bg-white text-slate-700 font-medium focus:outline-none transition-all ${
                  errors.activos ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200 focus:border-slate-800'
                }`}
              />
              {showDropdown && searchTerm.trim() !== '' && (
                <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  {activosFiltrados.length > 0 ? (
                    activosFiltrados.map(act => {
                      const codigo = act.codigo || act.etiqueta;
                      return (
                        <div
                          key={codigo}
                          onClick={() => handleAgregarActivo(act)}
                          className="px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0 text-left flex justify-between items-center"
                        >
                          <div>
                            <span className="font-mono font-bold text-rose-600 mr-2">{codigo}</span>
                            <span className="text-slate-500 font-medium">{act.nombre}</span>
                          </div>
                          <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-bold flex items-center gap-0.5">
                            <Plus size={10}/> Añadir
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-2 text-xs text-slate-400 italic text-left">
                      No se encontraron activos disponibles o ya están en la lista
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lista de activos seleccionados */}
            {listaActivosBaja.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-slate-50/50 shadow-inner">
                {listaActivosBaja.map(act => {
                  const cod = act.codigo || act.etiqueta;
                  return (
                    <div key={cod} className="flex items-center justify-between px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">{cod}</span>
                        <span className="text-slate-700 font-medium">{act.nombre}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoverActivo(cod)} 
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remover"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.activos && (
              <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                <AlertCircle size={10} /> {errors.activos}
              </span>
            )}
          </div>

          {/* Motivo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <FileText size={12} /> Causa / Diagnóstico Final
            </label>
            <textarea
              rows="2"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              placeholder="Ej: Falla Crítica en Tarjeta Madre o Inviabilidad económica de reparación..."
              className={`p-2.5 border rounded-lg text-xs text-slate-700 font-medium focus:outline-none resize-none bg-white ${
                errors.motivo ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200'
              }`}
            />
            {errors.motivo && (
              <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                <AlertCircle size={10} /> {errors.motivo}
              </span>
            )}
          </div>

          {/* Informe Técnico */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <FileText size={12} /> Informe Técnico (Código de Acta)
            </label>
            <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-700">
              {codigoInforme}
            </div>
            <p className="text-[10px] text-slate-400">Este código se genera automáticamente y es correlativo.</p>
          </div>

          {/* Fecha y Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Calendar size={12} /> Fecha Efectiva
              </label>
              <input
                type="date"
                name="fechaBaja"
                value={formData.fechaBaja}
                onChange={handleChange}
                className={`p-2.5 border rounded-lg text-xs text-slate-700 font-medium focus:outline-none ${
                  errors.fechaBaja ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200'
                }`}
              />
              {errors.fechaBaja && (
                <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                  <AlertCircle size={10} /> {errors.fechaBaja}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Destino Final / Disposición</label>
              <input
                type="text"
                name="destino"
                value={formData.destino}
                onChange={handleChange}
                placeholder="Ej: Reciclaje, Donación, Almacén, etc."
                autoComplete="off"
                className={`p-2.5 border rounded-lg text-xs text-slate-700 font-medium focus:outline-none bg-white ${
                  errors.destino ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200'
                }`}
              />
              {errors.destino && (
                <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                  <AlertCircle size={10} /> {errors.destino}
                </span>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting} 
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-4 py-2 bg-slate-800 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar Desincorporación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalDesincorporacion;
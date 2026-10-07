// src/components/modals/ModalIncidencia.jsx
import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, HardDrive, User, Wrench, AlertCircle, FileText, Search, Plus } from 'lucide-react';
import { useData } from '../../context/DataContext';

const ModalIncidencia = ({ isOpen, onClose }) => {
  const { activos, incidencias, agregarIncidencia } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: '',
    reportadoPor: ''
  });
  const [errors, setErrors] = useState({});

  // Resetear formulario al abrir/cerrar
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        titulo: '',
        descripcion: '',
        prioridad: '',
        reportadoPor: ''
      });
      setActivoSeleccionado(null);
      setSearchTerm('');
      setShowDropdown(false);
      setErrors({});
    }
  }, [isOpen]);

  // Generar ID de ticket correlativo
  const proximoTicketNum = 92 + incidencias.length;
  const ticketIdAutomatico = `TKT-0${proximoTicketNum}`;

  if (!isOpen) return null;

  // Filtrar activos disponibles
  const activosFiltrados = (activos || []).filter(act => {
    const codigo = (act.codigo || '').toLowerCase();
    const nombre = (act.nombre || '').toLowerCase();
    const serial = (act.serial || '').toLowerCase();
    const busqueda = searchTerm.toLowerCase();
    const coincide = codigo.includes(busqueda) || nombre.includes(busqueda) || serial.includes(busqueda);
    const yaSeleccionado = activoSeleccionado && activoSeleccionado.id === act.id;
    return coincide && !yaSeleccionado;
  });

  const handleSelectActivo = (activo) => {
    setActivoSeleccionado(activo);
    setSearchTerm('');
    setShowDropdown(false);
    if (errors.activoId) setErrors(prev => ({ ...prev, activoId: null }));
  };

  const handleRemoveActivo = () => {
    setActivoSeleccionado(null);
    setSearchTerm('');
  };

  const validarFormulario = () => {
    let erroresTemporales = {};
    if (!activoSeleccionado) erroresTemporales.activoId = "Debe seleccionar el equipo afectado.";
    if (!formData.titulo.trim()) erroresTemporales.titulo = "El título resumido de la falla es obligatorio.";
    if (!formData.descripcion.trim()) erroresTemporales.descripcion = "Debe describir detalladamente los síntomas de la avería.";
    if (!formData.prioridad) erroresTemporales.prioridad = "Debe asignar un nivel de prioridad/criticidad.";
    if (!formData.reportadoPor.trim()) erroresTemporales.reportadoPor = "El nombre del reportante es requerido.";

    setErrors(erroresTemporales);
    return Object.keys(erroresTemporales).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      const nuevaIncidencia = {
        id: ticketIdAutomatico,
        activo: activoSeleccionado.nombre,
        codigoActivo: activoSeleccionado.codigo,
        descripcion: `${formData.titulo} - ${formData.descripcion}`,
        reportadoPor: formData.reportadoPor,
        fechaHora: `${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        prioridad: formData.prioridad,
        estado: 'Abierto',
        tipoActivo: activoSeleccionado.categoria?.nombre || 'equipo'
      };

      agregarIncidencia(nuevaIncidencia);
      
      setFormData({ titulo: '', descripcion: '', prioridad: '', reportadoPor: '' });
      setActivoSeleccionado(null);
      setSearchTerm('');
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-solid border-slate-200 w-full max-w-xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-0 border-b border-solid border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-800">
            <AlertTriangle size={18} className="text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider m-0 text-slate-700">
              Reportar Incidencia / Falla Técnica ({ticketIdAutomatico})
            </h4>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 m-0 bg-white overflow-y-auto max-h-[70vh]">
          
          {/* Buscador de Activo */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <HardDrive size={13} className="text-slate-400" /> Activo Afectado *
            </label>
            
            {activoSeleccionado ? (
              <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <span className="font-mono font-bold text-blue-600">{activoSeleccionado.codigo}</span>
                  <span className="ml-2 text-sm font-medium text-slate-700">{activoSeleccionado.nombre}</span>
                  <span className="ml-2 text-xs text-slate-400">({activoSeleccionado.estado})</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveActivo}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={14} />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Buscar por código, nombre o serial..."
                    className={`w-full pl-9 pr-4 py-2.5 text-sm border border-solid rounded-lg bg-white text-slate-700 focus:outline-none transition-all ${
                      errors.activoId 
                        ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500' 
                        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
                    }`}
                  />
                </div>
                {showDropdown && searchTerm.trim() !== '' && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto font-sans">
                    {activosFiltrados.length > 0 ? (
                      activosFiltrados.map((act) => (
                        <div
                          key={act.id}
                          onClick={() => handleSelectActivo(act)}
                          className="px-4 py-2 hover:bg-blue-50/80 cursor-pointer text-left border-b border-slate-100 last:border-0 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-800 font-mono">{act.codigo}</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{act.nombre} — <span className="font-mono text-[9px]">{act.serial}</span></p>
                          </div>
                          <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">Seleccionar</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-slate-400 italic text-center">No se encontraron activos disponibles.</div>
                    )}
                  </div>
                )}
              </div>
            )}
            {errors.activoId && (
              <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5 animate-in fade-in duration-200">
                <AlertCircle size={11} /> {errors.activoId}
              </span>
            )}
          </div>

          {/* Título de la Falla */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" /> Título Corto de la Falla *
            </label>
            <input 
              type="text" 
              value={formData.titulo} 
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} 
              placeholder="Ej: Caída constante de interfaz / No enciende" 
              className={`p-2.5 border border-solid rounded-lg text-xs font-medium text-slate-700 focus:outline-none transition-all ${
                errors.titulo 
                  ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500' 
                  : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
              }`} 
            />
            {errors.titulo && (
              <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5 animate-in fade-in duration-200">
                <AlertCircle size={11} /> {errors.titulo}
              </span>
            )}
          </div>

          {/* Descripción del Problema */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <AlertCircle size={13} className="text-slate-400" /> Análisis y Descripción del Problema *
            </label>
            <textarea 
              rows="3" 
              value={formData.descripcion} 
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
              placeholder="Describa el comportamiento errático, códigos de error en pantalla o ruidos extraños..." 
              className={`p-2.5 border border-solid rounded-lg text-xs font-medium text-slate-700 focus:outline-none resize-none transition-all ${
                errors.descripcion 
                  ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500' 
                  : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
              }`} 
            />
            {errors.descripcion && (
              <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5 animate-in fade-in duration-200">
                <AlertCircle size={11} /> {errors.descripcion}
              </span>
            )}
          </div>

          {/* Fila de Prioridad y Reportante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nivel de Prioridad */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <Wrench size={13} className="text-slate-400" /> Nivel de Prioridad *
              </label>
              <select 
                value={formData.prioridad} 
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })} 
                className={`p-2.5 border border-solid rounded-lg text-xs bg-white font-medium text-slate-700 focus:outline-none transition-all ${
                  errors.prioridad 
                    ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500' 
                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
                }`}
              >
                <option value="">Seleccione criticidad...</option>
                <option value="Baja">Baja (Operativo con detalles)</option>
                <option value="Media">Media (Falla parcial interna)</option>
                <option value="Alta">Alta (Equipo Inoperativo)</option>
                <option value="Crítica">Crítica (Afecta Infraestructura / Servidor)</option>
              </select>
              {errors.prioridad && (
                <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5 animate-in fade-in duration-200">
                  <AlertCircle size={11} /> {errors.prioridad}
                </span>
              )}
            </div>

            {/* Reportado Por */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <User size={13} className="text-slate-400" /> Reportado Por *
              </label>
              <input 
                type="text" 
                value={formData.reportadoPor} 
                onChange={(e) => setFormData({ ...formData, reportadoPor: e.target.value })} 
                placeholder="Ej: Jesús Abraham / Operador" 
                className={`p-2.5 border border-solid rounded-lg text-xs font-medium text-slate-700 focus:outline-none transition-all ${
                  errors.reportadoPor 
                    ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500' 
                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
                }`} 
              />
              {errors.reportadoPor && (
                <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5 animate-in fade-in duration-200">
                  <AlertCircle size={11} /> {errors.reportadoPor}
                </span>
              )}
            </div>
          </div>

          {/* Acciones del Formulario */}
          <div className="flex justify-end gap-3 pt-4 border-0 border-t border-solid border-slate-100 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold border-0 cursor-pointer shadow-md shadow-blue-600/10 transition-colors"
            >
              Registrar Reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalIncidencia;
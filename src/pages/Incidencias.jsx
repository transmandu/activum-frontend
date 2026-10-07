// src/pages/Incidencias.jsx
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, Clock, ShieldAlert, CheckCircle2, 
  Laptop, Monitor, Wrench, AlertTriangle, Eye, Edit2 
} from 'lucide-react';
import ModalIncidencia from '../components/modals/ModalIncidencia';
import { useData } from '../context/DataContext';

// Función auxiliar para renderizar el icono adecuado por tipo de hardware
const getActivoIcon = (tipo) => {
  switch (tipo?.toLowerCase()) {
    case 'laptop': return <Laptop size={14} />;
    case 'servidor': return <Wrench size={14} />;
    case 'monitor': return <Monitor size={14} />;
    default: return <Laptop size={14} />;
  }
};

const getBadgeEstado = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'abierto': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'en proceso': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'resuelto': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getBadgePrioridad = (prioridad) => {
  switch (prioridad?.toLowerCase()) {
    case 'crítica': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'alta': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'media': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'baja': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const Incidencias = () => {
  // Consumimos los datos globales
  const { incidencias, agregarIncidencia, activos } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para controlar los filtros reactivos
  const [busqueda, setBusqueda] = useState('');
  const [prioridadSeleccionada, setPrioridadSeleccionada] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');

  // =========================================================================
  //  CÁLCULOS DINÁMICOS PARA LAS MINI-TARJETAS (KPIs de Soporte del Contexto)
  // =========================================================================
  const totalAbiertos = incidencias.filter(inc => inc.estado === 'Abierto').length;
  const totalEnProceso = incidencias.filter(inc => inc.estado === 'En Proceso').length;
  const totalResueltos = incidencias.filter(inc => inc.estado === 'Resuelto').length;

  // Lógica de filtrado combinada para la mesa de soporte usando los datos reales globales
  const incidenciasFiltradas = useMemo(() => {
    return incidencias.filter((inc) => {
      const cumpleBusqueda = 
        inc.id?.toLowerCase().includes(busqueda.toLowerCase()) ||
        inc.activo?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        inc.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        inc.reportado_por?.toLowerCase().includes(busqueda.toLowerCase()) ||
        inc.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

      const cumplePrioridad = 
        prioridadSeleccionada === '' || inc.prioridad === prioridadSeleccionada;

      const cumpleEstado = 
        estadoSeleccionado === '' || inc.estado === estadoSeleccionado;

      return cumpleBusqueda && cumplePrioridad && cumpleEstado;
    });
  }, [incidencias, busqueda, prioridadSeleccionada, estadoSeleccionado]);

  return (
    <div className="space-y-6">
      
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 m-0">Mesa de Soporte e Incidencias</h3>
          <p className="text-xs text-slate-400 m-0 mt-0.5">Gestión de fallas, reportes técnicos y mantenimiento de activos</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md shadow-blue-600/10 transition-all border-0 cursor-pointer"
        >
          <Plus size={18} />
          Reportar Falla
        </button>
      </div>

      {/* Mini-Tarjetas de Conteo Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-solid border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-solid border-rose-100">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Tickets Abiertos</span>
            <span className="text-xl font-black text-slate-800">
              {totalAbiertos} {totalAbiertos === 1 ? 'Reporte' : 'Reportes'}
            </span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-solid border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-solid border-amber-100">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block">En Curso</span>
            <span className="text-xl font-black text-slate-800">
              {totalEnProceso} {totalEnProceso === 1 ? 'Incidencia' : 'Incidencias'}
            </span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-solid border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-solid border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Resueltos</span>
            <span className="text-xl font-black text-slate-800">{totalResueltos} Casos</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-solid border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por ticket, activo o descripción de falla..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-solid border-slate-200 px-3 py-2 rounded-lg">
            <Filter size={14} />
            <span>Filtrar por:</span>
          </div>
          
          <select 
            value={prioridadSeleccionada}
            onChange={(e) => setPrioridadSeleccionada(e.target.value)}
            className="bg-white border border-solid border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">Todas las Prioridades</option>
            <option value="Crítica">Crítica</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>

          <select 
            value={estadoSeleccionado}
            onChange={(e) => setEstadoSeleccionado(e.target.value)}
            className="bg-white border border-solid border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">Todos los Estados</option>
            <option value="Abierto">Abierto</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Resuelto">Resuelto</option>
          </select>
        </div>
      </div>

      {/* Tabla de Tickets */}
      <div className="bg-white rounded-xl shadow-sm border border-solid border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-solid border-slate-100">
                <th className="p-4 pl-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Ticket</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Activo Tecnológico</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Detalle del Reporte / Falla</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha / Hora</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-28">Prioridad</th>
                <th className="p-4 pr-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-28">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-solid divide-slate-100">
              {incidenciasFiltradas.length > 0 ? (
                incidenciasFiltradas.map((inc, index) => (
                  <tr key={inc.id || index} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6 text-xs font-mono font-bold text-blue-600 whitespace-nowrap">
                      {inc.codigo || inc.id}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg border border-solid border-slate-200 group-hover:bg-white group-hover:border-blue-200 transition-colors">
                          {getActivoIcon(inc.tipo_activo || inc.activo?.categoria?.nombre)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 tracking-tight">
                            {inc.activo?.nombre || inc.activo || 'Activo no especificado'}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 mt-0.5">
                            {inc.activo?.codigo || inc.codigoActivo || 'Código no disponible'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs md:max-w-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-slate-700 font-bold tracking-tight line-clamp-1 leading-tight">
                          {inc.titulo || inc.descripcion}
                        </span>
                        <span className="text-xs text-slate-400">
                          Reportado por: <span className="font-semibold text-slate-500">{inc.reportado_por || inc.reportadoPor}</span>
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400" />
                        {inc.fecha_hora ? new Date(inc.fecha_hora).toLocaleString() : inc.fechaHora}
                      </div>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border border-solid ${getBadgePrioridad(inc.prioridad)}`}>
                        {inc.prioridad}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border border-solid ${getBadgeEstado(inc.estado)}`}>
                        {inc.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-sm text-slate-400 font-medium bg-slate-50/50">
                    No se encontraron tickets con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ModalIncidencia 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Incidencias;
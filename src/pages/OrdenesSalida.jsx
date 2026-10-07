// src/pages/OrdenesSalida.jsx
import React, { useState } from 'react';
import { Plus, FileText, Calendar, CheckCircle, AlertTriangle, Search, Download, Eye, Filter } from 'lucide-react';
import ModalOrdenSalida from '../components/modals/ModalOrdenSalida';
import ModalActaEntrega from '../components/modals/ModalActaEntrega';
import { useData } from '../context/DataContext';
import api from '../services/api'; // Importamos api para la descarga

const OrdenesSalida = () => {
  const {
    ordenesSalida,
    setOrdenesSalida, // Necesario para actualizar manualmente
    cargarOrdenesSalida,
    cambiarEstadoOrdenSalida,
    usuarioLogueado
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActaOpen, setIsActaOpen] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = usuarioLogueado?.rol === 'Administrador';
  const dataOrdenes = Array.isArray(ordenesSalida) ? ordenesSalida : [];

  const ordenesFiltradas = dataOrdenes.filter((orden) => {
    const term = searchTerm.toLowerCase().trim();
    
    // Corrección: Se busca dentro del array de activos correctamente
    const matchSearch =
      (orden.codigo || '').toLowerCase().includes(term) ||
      (orden.solicitante?.nombre_completo || orden.solicitante || '').toLowerCase().includes(term) ||
      (orden.destino?.nombre || orden.destino || '').toLowerCase().includes(term) ||
      (orden.motivo || '').toLowerCase().includes(term) ||
      (orden.activos && orden.activos.some(a => 
        (a.nombre || '').toLowerCase().includes(term) || 
        (a.serial || '').toLowerCase().includes(term)
      ));

    if (!matchSearch) return false;

    if (selectedEstado === 'procesada') return orden.estado === 'Procesada';
    if (selectedEstado === 'pendiente') return orden.estado === 'Pendiente';
    return true;
  });

  const totalOrdenes = dataOrdenes.length;
  const procesadas = dataOrdenes.filter((o) => o.estado === 'Procesada').length;
  const pendientes = dataOrdenes.filter((o) => o.estado === 'Pendiente').length;

  const handleToggleEstado = async (id, estadoActual) => {
    if (!isAdmin) {
      alert('Solo los administradores pueden cambiar el estado.');
      return;
    }
    setIsLoading(true);
    try {
      const nuevoEstado = estadoActual === 'Pendiente' ? 'Procesada' : 'Pendiente';
      
      // Llamar al backend para cambiar el estado
      const ordenActualizada = await cambiarEstadoOrdenSalida(id, nuevoEstado);
      
      // ACTUALIZAR MANUALMENTE EL ESTADO LOCAL (para reflejo inmediato)
      setOrdenesSalida(prev => prev.map(o => 
        o.id === id ? { ...o, estado: nuevoEstado } : o
      ));

      // Recargar desde el backend para asegurar consistencia
      await cargarOrdenesSalida();
      
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditar = (orden) => {
    if (!isAdmin) {
      alert('Solo administradores pueden editar órdenes.');
      return;
    }
    setOrdenSeleccionada(orden);
    setIsModalOpen(true);
  };

  const handleVerActa = (orden) => {
    setOrdenSeleccionada(orden);
    setIsActaOpen(true);
  };

  const cerrarActa = () => {
    setIsActaOpen(false);
    setOrdenSeleccionada(null);
  };

  // NUEVA FUNCIÓN: Descarga el PDF generado por el backend (Laravel DomPDF)
  const handleDescargarPDF = async (orden) => {
    if (orden.estado !== 'Procesada') {
      alert('Esta orden no está procesada. No se puede descargar el PDF.');
      return;
    }

    try {
      const response = await api.get(`/ordenes-salida/${orden.id}/exportar-pdf`, {
        responseType: 'blob' // Indica que recibimos un archivo binario
      });

      // Crear un blob del tipo PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Crear enlace y forzar descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `Orden_Salida_${orden.codigo || orden.id}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando orden de salida:', error);
      alert('No se pudo descargar la orden. Intente de nuevo.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 m-0">Órdenes de Salida (Pases de Hardware)</h3>
          <p className="text-xs text-slate-400 m-0 mt-0.5">Control de equipos e infraestructura que se movilizan fuera de la empresa.</p>
        </div>
        <button
          onClick={() => { setOrdenSeleccionada(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md border-0 cursor-pointer transition-all"
        >
          <Plus size={18} /> Nueva Orden de Salida
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText size={22} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Órdenes</span>
            <span className="text-xl font-extrabold text-slate-800">{totalOrdenes} Pases</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={22} /></div>
          <div>
            <span className="text-xl font-extrabold text-slate-800">{procesadas} Listas</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Procesadas</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={22} /></div>
          <div>
            <span className="text-xl font-extrabold text-slate-800">{pendientes} En Espera</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pendientes</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por código, activo, solicitante, destino o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={16} className="text-slate-400" />
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="">Todos</option>
            <option value="procesada">Procesadas</option>
            <option value="pendiente">Pendientes</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">N° Acta</th>
                <th className="py-4 px-5">Solicitante</th>
                <th className="py-4 px-5">Destino</th>
                <th className="py-4 px-5">Fecha Movilización</th>
                <th className="py-4 px-5 text-center">Estado</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordenesFiltradas.length > 0 ? (
                ordenesFiltradas.map((orden, index) => {
                  const esProcesada = orden.estado === 'Procesada';
                  const solicitanteNombre = orden.solicitante?.nombre_completo || orden.solicitante || 'N/A';
                  const destinoNombre = orden.destino?.nombre || orden.destino || 'N/A';
                  const cedula = orden.cedula || orden.solicitante?.cedula || '';

                  const uniqueKey = orden.id || orden.codigo || `orden-${index}`;

                  return (
                    <tr key={uniqueKey} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-slate-600">{orden.codigo}</td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-800">{solicitanteNombre}</div>
                        {cedula && <div className="text-xs text-slate-500">C.I.: {cedula}</div>}
                      </td>
                      <td className="py-4 px-5 text-slate-500 font-medium">{destinoNombre}</td>
                      <td className="py-4 px-5 text-slate-500 font-medium">{orden.fecha_salida}</td>
                      <td className="py-4 px-5 text-center">
                        {!esProcesada ? (
                          <button
                            onClick={() => handleToggleEstado(orden.id, orden.estado)}
                            disabled={!isAdmin || isLoading}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              !isAdmin || isLoading
                                ? 'bg-amber-100 text-amber-700 border-amber-200 cursor-not-allowed'
                                : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 hover:text-amber-800 cursor-pointer'
                            }`}
                            title={isAdmin ? 'Haz clic para procesar' : 'Solo administradores pueden procesar'}
                          >
                            <AlertTriangle size={12} className="inline mr-1" />
                            {isLoading ? '...' : 'Pendiente'}
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle size={12} /> Procesada
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleVerActa(orden)}
                            className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors"
                            title="Ver acta"
                          >
                            <Eye size={15} />
                          </button>

                          {esProcesada && (
                            <button
                              onClick={() => handleDescargarPDF(orden)}
                              className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors"
                              title="Descargar PDF"
                            >
                              <Download size={15} />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => handleEditar(orden)}
                              className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-600 rounded-lg transition-colors"
                              title="Editar orden"
                            >
                              <FileText size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-xs text-slate-400 italic">
                    No se encontraron órdenes de salida.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/50 border-t border-slate-200 text-right text-[10px] text-slate-400">
          Total: {ordenesFiltradas.length} registros
        </div>
      </div>

      <ModalOrdenSalida
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setOrdenSeleccionada(null); }}
        ordenAEditar={ordenSeleccionada}
      />

      <ModalActaEntrega
        isOpen={isActaOpen}
        onClose={cerrarActa}
        datos={ordenSeleccionada}
        puedeImprimir={ordenSeleccionada ? ordenSeleccionada.estado === 'Procesada' : false}
        tipo="orden_salida"
      />
    </div>
  );
};

export default OrdenesSalida;
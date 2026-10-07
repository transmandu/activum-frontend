// src/pages/Desincorporaciones.jsx
import React, { useState } from 'react';
import { Plus, Trash2, FileText, Calendar, Search, Download, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import ModalDesincorporacion from '../components/modals/ModalDesincorporacion';
import ModalActaEntrega from '../components/modals/ModalActaEntrega';
import { useData } from '../context/DataContext';
import api from '../services/api';

const Desincorporaciones = () => {
  const { 
    desincorporaciones, 
    cargarDatosIniciales, 
    usuarioLogueado,
    autorizarDesincorporacion,
    personal = [],
    userPermissions
  } = useData();

  // VERIFICAR PERMISOS
  const puedeCrear = userPermissions?.includes('crear_desincorporaciones');
  const puedeAutorizar = userPermissions?.includes('autorizar_desincorporaciones');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActaOpen, setIsActaOpen] = useState(false);
  const [desincorporacionSeleccionada, setDesincorporacionSeleccionada] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState(''); // '' = Todos
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================
  //  OBTENER PERSONAL DEL ADMINISTRADOR
  //  Si no existe en Personal, devuelve el ID del usuario logueado
  //  (el backend lo creará automáticamente si es necesario)
  // ============================================================
  const obtenerPersonalAutorizado = () => {
    // 1. Buscar por email exacto del administrador
    let adminPersonal = personal.find(
      (p) => p.email?.toLowerCase().trim() === 'it@transmandu.com'
    );

    // 2. Si no, buscar por nombre completo "Jonathan Morillo"
    if (!adminPersonal) {
      adminPersonal = personal.find(
        (p) => p.nombre_completo?.toLowerCase().trim() === 'jonathan morillo'
      );
    }

    // 3. Si se encuentra en Personal, retornarlo
    if (adminPersonal) {
      console.log('✅ Administrador encontrado en Personal:', adminPersonal.nombre_completo, '(ID:', adminPersonal.id, ')');
      return adminPersonal;
    }

    // 4. Si el usuario logueado es Administrador pero no está en Personal,
    //    retornar un objeto con el ID del usuario (el backend lo creará)
    if (usuarioLogueado?.rol === 'Administrador') {
      console.warn('⚠️ Administrador no está en Personal. Se creará automáticamente al autorizar.');
      return {
        id: usuarioLogueado.id, // ID de User (será convertido a Personal en el backend)
        nombre_completo: usuarioLogueado.name || 'Jonathan Morillo',
        email: usuarioLogueado.email || 'it@transmandu.com',
        cargo: 'Administrador'
      };
    }

    // 5. Si no es administrador, retornar null
    console.error('❌ No se encontró un administrador válido.');
    return null;
  };

  // ============================================================
  //  FILTRADO COMBINADO: Búsqueda + Estado
  // ============================================================
  const equiposFiltrados = (desincorporaciones || []).filter((equipo) => {
    const term = searchTerm.toLowerCase().trim();
    const matchSearch = 
      (equipo.codigo_acta?.toLowerCase() || '').includes(term) ||
      (equipo.activo?.toLowerCase() || '').includes(term) ||
      (equipo.codigo?.toLowerCase() || '').includes(term) ||
      (equipo.motivo?.toLowerCase() || '').includes(term) ||
      (equipo.informe?.toLowerCase() || '').includes(term) ||
      (equipo.destino?.toLowerCase() || '').includes(term) ||
      (equipo.autorizado_por?.nombre_completo?.toLowerCase() || '').includes(term);

    const autorizado = equipo.autorizado_por !== null && equipo.autorizado_por !== undefined;
    let matchEstado = true;
    if (selectedEstado === 'autorizado') {
      matchEstado = autorizado;
    } else if (selectedEstado === 'pendiente') {
      matchEstado = !autorizado;
    }

    return matchSearch && matchEstado;
  });

  const totalBajas = (desincorporaciones || []).length;

  const estaAutorizada = (equipo) => {
    return equipo.autorizado_por !== null && equipo.autorizado_por !== undefined;
  };

  // ============================================================
  //  AUTORIZAR DESINCORPORACIÓN (el backend creará Personal si es necesario)
  // ============================================================
  const handleAutorizar = async (id) => {
    // 1. Verificar permisos del usuario logueado
    if (!puedeAutorizar) {
      alert('No tienes permiso para autorizar desincorporaciones.');
      return;
    }

    // 2. Verificar que el usuario logueado sea administrador
    if (usuarioLogueado?.rol !== 'Administrador') {
      alert('Solo el administrador puede autorizar desincorporaciones.');
      return;
    }

    // 3. Obtener el personal (puede ser el ID de usuario si no está en Personal)
    const adminPersonal = obtenerPersonalAutorizado();
    if (!adminPersonal) {
      alert('No se pudo identificar al administrador.');
      return;
    }

    // 4. Confirmación
    if (!window.confirm(`¿Está seguro de autorizar esta desincorporación como ${adminPersonal.nombre_completo}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      // ✅ El backend creará el registro en Personal si es necesario
      await autorizarDesincorporacion(id, adminPersonal.id);
      alert('✅ Desincorporación autorizada correctamente.');
      await cargarDatosIniciales();
    } catch (error) {
      console.error('❌ Error al autorizar:', error);
      alert('Error al autorizar la desincorporación. Revisa la consola.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  //  VER ACTA (abre modal)
  // ============================================================
  const handleVerActa = (equipo) => {
    setDesincorporacionSeleccionada(equipo);
    setIsActaOpen(true);
  };

  // ============================================================
  //  CERRAR ACTA
  // ============================================================
  const cerrarActa = () => {
    setIsActaOpen(false);
    setDesincorporacionSeleccionada(null);
  };

  // ✅ Descarga el PDF generado por el backend
  const descargarActaPDF = async (equipo) => {
    try {
      const response = await api.get(`/desincorporaciones/${equipo.id}/exportar-pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Acta_Desincorporacion_${equipo.codigo_acta || equipo.id}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando acta de desincorporación:', error);
      alert('No se pudo descargar el acta. Intente de nuevo.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 m-0">Desincorporaciones de Activos</h3>
          <p className="text-xs text-slate-400 m-0 mt-0.5">Historial y control de hardware dado de baja definitivamente del inventario institucional.</p>
        </div>
        {puedeCrear && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-rose-700 text-white font-semibold text-sm rounded-lg shadow-sm border-0 cursor-pointer transition-all active:scale-95"
          >
            <Plus size={16} />
            Registrar Desincorporación
          </button>
        )}
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg"><Trash2 size={22} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Actas de Egreso Emitidas</span>
            <span className="text-xl font-extrabold text-slate-800">{totalBajas} Registros</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={22} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Autorizadas</span>
            <span className="text-xl font-extrabold text-slate-800">
              {desincorporaciones.filter(e => estaAutorizada(e)).length}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><XCircle size={22} /></div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pendientes</span>
            <span className="text-xl font-extrabold text-slate-800">
              {desincorporaciones.filter(e => !estaAutorizada(e)).length}
            </span>
          </div>
        </div>
      </div>

      {/* Buscador + Filtro de Estado */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-2/3">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por activo, código de acta, informe, causa o firma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 w-full sm:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none w-full sm:w-auto"
          >
            <option value="">Todos los estados</option>
            <option value="autorizado">Autorizado</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse m-0 min-w-225">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">ID Control</th>
                <th className="py-4 px-5">Activo Detalle</th>
                <th className="py-4 px-5">Causa / Diagnóstico</th>
                <th className="py-4 px-5">Ref. Informe</th>
                <th className="py-4 px-5">Autorizado Por</th>
                <th className="py-4 px-5">Fecha Efectiva</th>
                <th className="py-4 px-5">Disposición Final</th>
                <th className="py-4 px-5 text-center">Estado</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm bg-white">
              {equiposFiltrados.length > 0 ? (
                equiposFiltrados.map((equipo) => {
                  const autorizado = estaAutorizada(equipo);
                  const autorizadoNombre = equipo.autorizado_por?.nombre_completo || 'Pendiente';

                  return (
                    <tr key={equipo.codigo_acta || equipo.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-slate-500">{equipo.codigo_acta || equipo.id}</td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-800">{equipo.activo}</div>
                        <div className="text-xs text-rose-600 font-mono font-bold mt-0.5">{equipo.codigo}</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-slate-100 text-slate-700 border-slate-200">
                          {equipo.motivo}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-slate-600 text-xs">
                        <div className="flex items-center gap-1">
                          <FileText size={12} className="text-slate-400" />
                          {equipo.informe}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-700">
                        {autorizadoNombre}
                      </td>
                      <td className="py-4 px-5 text-slate-500 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          {equipo.fecha_baja}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100/80 border border-slate-200 px-2.5 py-1 rounded-lg">
                          {equipo.destino}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        {!autorizado ? (
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => handleAutorizar(equipo.id)}
                              disabled={!puedeAutorizar || isLoading}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                !puedeAutorizar || isLoading
                                  ? 'bg-amber-100 text-amber-700 border-amber-200 cursor-not-allowed'
                                  : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 hover:text-amber-800 cursor-pointer'
                              }`}
                              title={puedeAutorizar ? 'Haz clic para autorizar' : 'No tienes permiso para autorizar'}
                            >
                              <XCircle size={12} className="inline mr-1" /> 
                              {isLoading ? '...' : 'Pendiente'}
                            </button>
                            {!puedeAutorizar && (
                              <span className="text-[8px] text-slate-400">(sin permiso)</span>
                            )}
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle size={12} /> Autorizado
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleVerActa(equipo)}
                            className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors"
                            title="Ver acta"
                          >
                            <Eye size={15} />
                          </button>

                          {autorizado && (
                            <button
                              onClick={() => descargarActaPDF(equipo)}
                              className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors"
                              title="Descargar Acta de Baja (.pdf)"
                            >
                              <Download size={15} className="text-rose-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-xs text-slate-400 italic bg-white">
                    No se encontraron desincorporaciones con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/50 border-t border-slate-200 text-right text-[10px] text-slate-400">
          Total: {equiposFiltrados.length} registros
        </div>
      </div>

      <ModalDesincorporacion isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <ModalActaEntrega
        isOpen={isActaOpen}
        onClose={cerrarActa}
        datos={desincorporacionSeleccionada}
        puedeImprimir={desincorporacionSeleccionada ? estaAutorizada(desincorporacionSeleccionada) : false}
        tipo="desincorporacion"
      />
    </div>
  );
};

export default Desincorporaciones;
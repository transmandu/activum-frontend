import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, Laptop, Server, Monitor, Network, Cpu,
  Package, ShieldCheck, AlertTriangle, Eye, Edit2, HardDrive, Printer, Radio, BatteryCharging, Key,
  Info, AlertCircle
} from 'lucide-react';
import ModalActivo from '../components/modals/ModalActivo';
import ModalSoftware from '../components/modals/ModalSoftware';
import { useData } from '../context/DataContext';
import TablaActivos from '../components/tables/TablaActivos';

// ============================================================
// FUNCIONES AUXILIARES DE FORMATEO
// ============================================================
const extraerNombre = (valor) => {
  if (!valor) return '';
  if (typeof valor === 'string') return valor.trim();
  if (typeof valor === 'object' && valor !== null) {
    if (valor.nombre_completo) return valor.nombre_completo.trim();
    if (valor.nombres && valor.apellidos) return `${valor.nombres} ${valor.apellidos}`.trim();
    if (valor.nombres) return valor.nombres.trim();
    if (valor.nombre) return valor.nombre.trim();
    if (valor.name) return valor.name.trim();
    if (valor.apellidos) return valor.apellidos.trim();
    if (valor.apellido) return valor.apellido.trim();
    return '';
  }
  return String(valor).trim();
};

const formatearCapacidad = (cap) => {
  if (!cap && cap !== 0) return '';
  const str = String(cap).trim();
  if (/gb|tb|mb|kb|pb/i.test(str)) {
    return str;
  }
  return `${str} GB`;
};

const extraerInterfacesRed = (activo) => {
  if (!activo) return [];

  const candidatos = [
    activo.interfacesRed,
    activo.interfaces_red,
    activo.interfaces,
    activo.interfacesDeRed,
    activo.red_interfaces,
    activo.red?.interfaces,
    activo.red?.interfaces_red,
    activo.red?.interfacesRed,
    activo.red?.detalles,
    activo.red?.lista_interfaces,
    activo.red?.red_interfaces
  ];

  for (const cand of candidatos) {
    if (Array.isArray(cand) && cand.length > 0) {
      return cand;
    }
  }

  if (activo.red && (activo.red.mac || activo.red.ip || activo.red.interfaz || activo.red.direccion_mac || activo.red.direccion_ip)) {
    return [{
      interfaz: activo.red.interfaz || activo.red.nombre_interfaz || activo.red.tipo || 'Red',
      mac: activo.red.mac || activo.red.direccion_mac || '',
      ips: activo.red.ip || activo.red.ips || activo.red.direccion_ip || ''
    }];
  }

  return [];
};

// ============================================================
// ICONOS POR CATEGORÍA Y BADGE DE ESTADO
// ============================================================
const getIconoCategoria = (nombreCategoria) => {
  const cat = nombreCategoria?.toLowerCase() || '';
  if (cat.includes('servidor')) return <Server size={18} className="text-indigo-500" />;
  if (cat.includes('laptop')) return <Laptop size={18} className="text-cyan-500" />;
  if (cat.includes('pc') || cat.includes('escritorio')) return <Monitor size={18} className="text-blue-500" />;
  if (cat.includes('monitor')) return <Monitor size={18} className="text-emerald-500" />;
  if (cat.includes('impresora') || cat.includes('escaner')) return <Printer size={18} className="text-slate-500" />;
  if (cat.includes('regulador') || cat.includes('ups')) return <BatteryCharging size={18} className="text-amber-500" />;
  if (cat.includes('periferico')) return <Radio size={18} className="text-orange-500" />;
  if (cat.includes('red')) return <Network size={18} className="text-purple-500" />;
  if (cat.includes('radio')) return <Radio size={18} className="text-rose-500" />;
  if (cat.includes('almacenamiento')) return <HardDrive size={18} className="text-teal-500" />;
  if (cat.includes('software') || cat.includes('licencia')) return <Key size={18} className="text-purple-500" />;
  return <Package size={18} className="text-slate-400" />;
};

const getBadgeEstado = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'operativo': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'crítico': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'mantenimiento': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'asignado': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'inactivo': return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'desincorporado': return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'salida': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const Activos = () => {
  const { 
    activos, 
    agregarActivo, 
    actualizarActivo, 
    categorias, 
    estados = [], 
    obtenerActivoCompleto,
    userPermissions = []
  } = useData();

  const puedeCrear = (userPermissions || []).some(
    permiso => permiso === 'crear_activos' || permiso?.name === 'crear_activos'
  );

  const puedeEditar = (userPermissions || []).some(
    permiso => permiso === 'editar_activos' || permiso?.name === 'editar_activos'
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [inacFilter, setInacFilter] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activoAEditar, setActivoAEditar] = useState(null);
  const [activoADetalle, setActivoADetalle] = useState(null);

  const [isModalSoftwareOpen, setIsModalSoftwareOpen] = useState(false);
  const [softwareAEditar, setSoftwareAEditar] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'etiqueta', direction: 'asc' });
  const [activoEstadoRapido, setActivoEstadoRapido] = useState(null);

  const handleCambiarEstadoRapido = (activo, e) => {
    setActivoEstadoRapido(activo);
  };


  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const opcionesCategorias = useMemo(() => {
    if (!categorias || categorias.length === 0) return [];
    return categorias.map(c => c.nombre);
  }, [categorias]);

  const opcionesEstados = useMemo(() => {
    if (!estados || estados.length === 0) return [];
    return estados.map(e => e.nombre);
  }, [estados]);


  const ModalCambioEstado = ({ activo, estadosDisponibles, onClose, onGuardar }) => {
    const [nuevoEstadoId, setNuevoEstadoId] = useState(activo.estado_id);
    const estadosPermitidos = ['por asignar', 'sin uso', 'ubicado'];

    // Filtramos solo los estados que tienen sentido cuando no hay responsable
    const opciones = estadosDisponibles.filter(e => 
      estadosPermitidos.includes(e.nombre.toLowerCase())
    );

    const handleSubmit = () => {
      // Aquí llamas a tu API: api.patch(`/activos/${activo.id}/estado`, { estado_id: nuevoEstadoId })
      onGuardar(activo.id, nuevoEstadoId);
      onClose();
    };

    if (!activo) return null;

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center">
        <div className="bg-white p-5 rounded-xl shadow-lg w-80">
          <h3 className="font-bold text-slate-800 mb-4">Actualizar estado de {activo.etiqueta}</h3>
          
          <div className="space-y-3 mb-5">
            {opciones.map(estado => (
              <label key={estado.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                <input
                  type="radio"
                  name="estado_rapido"
                  value={estado.id}
                  checked={nuevoEstadoId === estado.id}
                  onChange={() => setNuevoEstadoId(estado.id)}
                  disabled={estado.nombre.toLowerCase() === 'ubicado' && !activo.ubicacion_id}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${estado.nombre.toLowerCase() === 'ubicado' && !activo.ubicacion_id ? 'text-slate-400' : 'text-slate-700'}`}>
                  {estado.nombre} {estado.nombre.toLowerCase() === 'ubicado' && !activo.ubicacion_id && '(Falta ubicación)'}
                </span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg">Cancelar</button>
            <button onClick={handleSubmit} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  const handleGuardarEstado = async (activoId, nuevoEstadoId) => {
    try {
      const payload = {
        ...activoEstadoRapido,
        codigo: activoEstadoRapido.etiqueta || activoEstadoRapido.codigo, 
        estado_id: nuevoEstadoId
      };

      await actualizarActivo(activoId, payload);
      
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar el estado.');
    } finally {
      setActivoEstadoRapido(null);
    }
  };

  const modulosDetalle = useMemo(() => {
    if (!activoADetalle) return { hardware: true, almacenamiento: true, red: true, software: true };
    
    const catId = activoADetalle.categoria_id || activoADetalle.categoria?.id;
    const categoriaObj = categorias.find(c => String(c.id) === String(catId));
    
    return categoriaObj?.modulos || {
      hardware: true,
      almacenamiento: true,
      red: true,
      software: true
    };
  }, [activoADetalle, categorias]);

  // ============================================================
  // FUNCIÓN PARA PARSEAR OBSERVACIONES Y EXTRAER VERSIÓN, LICENCIA, OBS
  // ============================================================
  const parsearObservaciones = (activo) => {
    const result = {
      version: '',
      licencia: '',
      observaciones_texto: '',
    };
    if (activo.observaciones && typeof activo.observaciones === 'string') {
      try {
        const parsed = JSON.parse(activo.observaciones);
        result.version = parsed.version || '';
        result.licencia = parsed.licencia || '';
        result.observaciones_texto = parsed.observaciones || '';
      } catch (e) {
        result.observaciones_texto = activo.observaciones;
      }
    }
    return result;
  };

  // ============================================================
  // MAPEO DE ACTIVOS (incluye parseo de observaciones para software)
  // ============================================================
  const activosMapeados = useMemo(() => {
    if (!activos) return [];
    return activos.map(act => {
      const respStr = extraerNombre(act.responsable);
      const esSoftware = act.codigo?.startsWith('SW-') || extraerNombre(act.categoria)?.toLowerCase() === 'software';
      const swList = act.software || [];

      const obsParsed = parsearObservaciones(act);

      return {
        ...act,
        etiqueta: act.codigo,
        categoriaNombre: extraerNombre(act.categoria) || 'Sin categoría',
        marcaNombre: extraerNombre(act.marca) || 'Sin marca',
        responsableNombre: respStr || 'No asignado',
        departamentoNombre: extraerNombre(act.departamento) || 'Sin departamento',
        ubicacionNombre: extraerNombre(act.ubicacion) || 'No especificada',
        software: swList,
        tieneHardware: act.hardware !== null && act.hardware !== undefined,
        tieneSoftware: swList.length > 0 || esSoftware,
        esSoftware: esSoftware,
        estadoNombre: extraerNombre(act.estado) || act.estado || 'Sin estado',
        version: obsParsed.version,
        licencia: obsParsed.licencia,
        observaciones_texto: obsParsed.observaciones_texto,
      };
    });
  }, [activos]);

  const handleGuardarSoftware = async (payload) => {
    if (softwareAEditar) {
      await actualizarActivo(softwareAEditar.id, payload);
    } else {
      await agregarActivo(payload);
    }
    setIsModalSoftwareOpen(false);
    setSoftwareAEditar(null);
  };

  const abrirEditar = async (activo, e) => {
    e.stopPropagation();
    try {
      const activoCompleto = await obtenerActivoCompleto(activo.id);
      const esSoftware = activoCompleto.codigo?.startsWith('SW-') || 
                         extraerNombre(activoCompleto.categoria)?.toLowerCase() === 'software';
      
      if (esSoftware) {
        setSoftwareAEditar(activoCompleto);
        setIsModalSoftwareOpen(true);
      } else {
        setActivoAEditar(activoCompleto);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error cargando activo para editar:', error);
      alert('Error al cargar los datos del activo.');
    }
  };

  const handleGuardarActivo = async (nuevoActivo) => {
    if (activoAEditar) {
      await actualizarActivo(activoAEditar.id, nuevoActivo);
    } else {
      await agregarActivo(nuevoActivo);
    }
    setIsModalOpen(false);
    setActivoAEditar(null);
  };

  const abrirNuevoModal = () => {
    setActivoAEditar(null);
    setIsModalOpen(true);
  };

  const handleVerDetalle = async (activo, e) => {
    if (e) e.stopPropagation();
    try {
      const activoCompleto = await obtenerActivoCompleto(activo.id);
      
      // Parsear observaciones para mostrar en detalle
      const obsParsed = parsearObservaciones(activoCompleto);
      activoCompleto.version = obsParsed.version;
      activoCompleto.licencia = obsParsed.licencia;
      activoCompleto.observaciones_texto = obsParsed.observaciones_texto;
      
      setActivoADetalle(activoCompleto);
    } catch (error) {
      console.error('Error cargando detalle:', error);
      alert('Error al cargar los detalles del activo.');
    }
  };

  const cerrarDetalle = () => {
    setActivoADetalle(null);
  };

  const activosFiltrados = useMemo(() => {
    const filtrados = activosMapeados.filter(activo => {
      const matchSearch =
        (activo.etiqueta || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activo.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activo.serial || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activo.responsableNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activo.departamentoNombre || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = categoriaFilter === '' || (activo.categoriaNombre || '').toLowerCase() === categoriaFilter.toLowerCase();
      const matchEst = estadoFilter === '' || (activo.estadoNombre || '').toLowerCase() === estadoFilter.toLowerCase();
      const matchInac = inacFilter === '' || (activo.inac || '').toLowerCase() === inacFilter.toLowerCase();
      const matchTipo = tipoFiltro === 'todos' ||
                         (tipoFiltro === 'hardware' && !activo.esSoftware) ||
                         (tipoFiltro === 'software' && activo.esSoftware);

      return matchSearch && matchCat && matchEst && matchInac && matchTipo;
    });

    return filtrados.sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const valA = a[sortConfig.key] ? String(a[sortConfig.key]).toLowerCase() : '';
      const valB = b[sortConfig.key] ? String(b[sortConfig.key]).toLowerCase() : '';

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [activosMapeados, searchTerm, categoriaFilter, estadoFilter, inacFilter, tipoFiltro, sortConfig]);

  return (
    <div className="p-6 space-y-6 bg-linear-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-md border border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-inner"><Package size={22} /></div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Inventario de Activos</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium ml-10">Control de hardware institucional, hojas de especificaciones técnicas, direccionamiento IP y licenciamiento.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {puedeCrear && (
            <button onClick={abrirNuevoModal} className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/10">
              <Plus size={16} /> Registrar Activo Físico
            </button>
          )}
          {puedeCrear && (
            <button 
              onClick={() => { setSoftwareAEditar(null); setIsModalSoftwareOpen(true); }} 
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/10"
            >
              <Plus size={16} /> Registrar Software
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {['todos', 'hardware', 'software'].map(tipo => (
              <button
                key={tipo}
                onClick={() => setTipoFiltro(tipo)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${
                  tipoFiltro === tipo ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>

          <select value={categoriaFilter} onChange={(e) => setCategoriaFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
            <option value="">Todas las categorías</option>
            {opcionesCategorias.map(cat => <option key={cat} value={cat.toLowerCase()}>{cat}</option>)}
          </select>

          <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
            <option value="">Todos los estados</option>
            {opcionesEstados.map(est => <option key={est} value={est.toLowerCase()}>{est}</option>)}
          </select>

          <select value={inacFilter} onChange={(e) => setInacFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
            <option value="">Estatus INAC (Todos)</option>
            <option value="declarado">Declarado</option>
            <option value="no declarado">No Declarado</option>
          </select>
        </div>
      </div>

      {/* Tabla + Detalle */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 items-start">
        <div className="flex-1 w-full bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <TablaActivos 
              datos={activosFiltrados}
              sortConfig={sortConfig}
              onSort={handleSort}
              activoADetalle={activoADetalle}
              onVerDetalle={handleVerDetalle}
              onEditar={abrirEditar}
              puedeEditar={puedeEditar}
              onCambiarEstadoRapido={handleCambiarEstadoRapido}
            />
          </div>
        </div>

        {/* SIDEBAR DE DETALLE*/}
        {activoADetalle && (
          <div className="w-full lg:w-[28rem] bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-2xl border border-slate-700 space-y-6 lg:sticky lg:top-6 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
            
            {/* Header del Sidebar */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Ficha de Especificaciones</span>
                  {activoADetalle.estado && (
                    <span
                      className="px-2 py-0.5 text-[9px] uppercase font-bold rounded-full border"
                      style={{
                        backgroundColor: activoADetalle.estadoColor ? `${activoADetalle.estadoColor}22` : undefined,
                        borderColor: activoADetalle.estadoColor || undefined,
                        color: activoADetalle.estadoColor || undefined,
                      }}
                    >
                      {extraerNombre(activoADetalle.estado) || activoADetalle.estado}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">{activoADetalle.codigo}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                    {extraerNombre(activoADetalle.categoria) || 'Sin categoría'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {(activoADetalle.software?.length > 0 || activoADetalle.codigo?.startsWith('SW-') || extraerNombre(activoADetalle.categoria)?.toLowerCase() === 'software') ? 'Software / Licencia' : 'Hardware Físico'}
                  </span>
                </div>
              </div>
              <button onClick={cerrarDetalle} className="p-2 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all border border-transparent hover:border-slate-600">
                ✕
              </button>
            </div>

            {/* 1. Identificación */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Info size={14} className="text-blue-400" /> Identificación
              </div>
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-3 text-sm">
                <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Equipo / Modelo:</span> <span className="font-semibold text-white text-right">{activoADetalle.nombre || 'N/A'}</span></div>
                <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Marca:</span> <span className="font-medium text-slate-200 text-right">{extraerNombre(activoADetalle.marca) || activoADetalle.proveedor || 'N/A'}</span></div>
                {activoADetalle.modelo && <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Modelo Detallado:</span> <span className="font-medium text-slate-200 text-right">{extraerNombre(activoADetalle.modelo)}</span></div>}
                {activoADetalle.serial && <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Serial:</span> <span className="font-mono text-xs text-amber-300 text-right bg-amber-400/10 px-1.5 py-0.5 rounded">{activoADetalle.serial}</span></div>}
                <div className="h-px w-full bg-slate-700/50 my-2"></div>
                <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Responsable:</span> <span className="font-medium text-slate-200 text-right">{extraerNombre(activoADetalle.responsable) || 'No asignado'}</span></div>
                <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Departamento:</span> <span className="font-medium text-slate-200 text-right">{extraerNombre(activoADetalle.departamento) || 'Sin departamento'}</span></div>
                <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Ubicación Física:</span> <span className="font-medium text-cyan-300 text-right">{extraerNombre(activoADetalle.ubicacion) || 'No especificada'}</span></div>
                {activoADetalle.inac && <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Estatus INAC:</span> <span className={`font-medium text-right ${activoADetalle.inac === 'Declarado' ? 'text-purple-400' : 'text-slate-500'}`}>{activoADetalle.inac}</span></div>}
              </div>
            </div>

            {/* 2. Licencias Standalone */}
            {modulosDetalle.software && (activoADetalle.codigo?.startsWith('SW-') || 
              extraerNombre(activoADetalle.categoria)?.toLowerCase() === 'software' || 
              activoADetalle.licencia || activoADetalle.version || activoADetalle.cant_licencias) && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Key size={14} className="text-purple-400" /> Detalles de Licencia
                </div>
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-3 text-sm">
                  {activoADetalle.version && <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Versión:</span> <span className="font-medium text-white text-right">{activoADetalle.version}</span></div>}
                  {activoADetalle.licencia && <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Licencia Asignada:</span> <span className="font-medium text-white text-right">{activoADetalle.licencia}</span></div>}
                  {(activoADetalle.tipo_licencia || activoADetalle.tipo || activoADetalle.licencia?.tipo) && <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Tipo de Licencia:</span> <span className="font-medium text-slate-200 text-right">{activoADetalle.tipo_licencia || activoADetalle.tipo || activoADetalle.licencia?.tipo}</span></div>}
                  {(activoADetalle.clave || activoADetalle.licencia_key || activoADetalle.licencia?.key) && <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Clave / Serial:</span> <span className="font-mono text-xs text-amber-300 text-right break-all">{activoADetalle.clave || activoADetalle.licencia_key || activoADetalle.licencia?.key}</span></div>}
                  
                  {((activoADetalle.cant_licencias !== undefined || activoADetalle.cantidad !== undefined) || (activoADetalle.licencias_usadas !== undefined || activoADetalle.usadas !== undefined)) && (
                    <div className="h-px w-full bg-slate-700/50 my-2"></div>
                  )}
                  
                  {(activoADetalle.cant_licencias !== undefined || activoADetalle.cantidad !== undefined) && <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Cantidad Total:</span> <span className="font-medium text-slate-200 text-right">{activoADetalle.cant_licencias ?? activoADetalle.cantidad}</span></div>}
                  {(activoADetalle.licencias_usadas !== undefined || activoADetalle.usadas !== undefined) && <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">En Uso:</span> <span className="font-medium text-slate-200 text-right">{activoADetalle.licencias_usadas ?? activoADetalle.usadas}</span></div>}
                  
                  {(() => {
                    const fechaExp = activoADetalle.fecha_expiracion || activoADetalle.fecha_vencimiento || activoADetalle.licencia?.fecha_expiracion;
                    if (fechaExp) {
                      const fechaObj = new Date(fechaExp);
                      const esExpirada = fechaObj < new Date();
                      return (
                        <div className="flex justify-between items-start gap-4 pt-2 border-t border-slate-700/50">
                          <span className="text-slate-400 shrink-0">Vencimiento:</span> 
                          <span className={`font-bold text-right ${esExpirada ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {fechaObj.toLocaleDateString('es-ES')} {esExpirada && '(Expirada)'}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            )}

            {/* 3. Hardware */}
            {modulosDetalle.hardware && activoADetalle.hardware && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Cpu size={14} className="text-indigo-400" /> Especificaciones de Hardware
                </div>
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-3 text-sm">
                  <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Tarjeta Madre:</span> <span className="font-medium text-slate-200 text-right">{activoADetalle.hardware.tarjeta_madre || 'N/A'}</span></div>
                  <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Procesador:</span> <span className="font-medium text-slate-200 text-right">{activoADetalle.hardware.procesador || 'N/A'}</span></div>
                  <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Memoria RAM:</span> <span className="font-medium text-slate-200 text-right">{activoADetalle.hardware.ram || 'N/A'}</span></div>
                  {activoADetalle.hardware.config_raid && <div className="flex justify-between items-start gap-4 pt-2 border-t border-slate-700/50"><span className="text-slate-400 shrink-0">Configuración RAID:</span> <span className="font-bold text-indigo-300 text-right">{activoADetalle.hardware.config_raid}</span></div>}
                </div>
              </div>
            )}

            {/* 4. Discos */}
            {modulosDetalle.almacenamiento && activoADetalle.discos && activoADetalle.discos.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive size={14} className="text-teal-400" /> Almacenamiento
                </div>
                <div className="space-y-2">
                  {activoADetalle.discos.map((disco, idx) => {
                    const tipoNombre = extraerNombre(disco.tipoDisco || disco.tipo_disco || disco.tipo);
                    const interfazNombre = extraerNombre(disco.interfazDisco || disco.interfaz_disco || disco.interfaz);
                    return (
                      <div key={idx} className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50 space-y-2 text-sm">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
                          <span className="font-bold text-teal-300">Unidad {idx + 1}</span>
                          <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-300">{tipoNombre || 'Tipo N/A'}</span>
                        </div>
                        <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Interfaz:</span> <span className="font-medium text-slate-200 text-right">{interfazNombre || 'N/A'}</span></div>
                        {disco.tamano && <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Tamaño Físico:</span> <span className="font-medium text-slate-200 text-right">{disco.tamano}"</span></div>}
                        {disco.capacidad && <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Capacidad:</span> <span className="font-bold text-white text-right">{formatearCapacidad(disco.capacidad)}</span></div>}
                        {disco.particiones && <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Particiones:</span> <span className="font-medium text-slate-200 text-right">{disco.particiones}</span></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Red y Conectividad */}
            {modulosDetalle.red && (() => {
              const interfacesList = extraerInterfacesRed(activoADetalle);
              const tieneRed = activoADetalle.red || interfacesList.length > 0;
              
              if (!tieneRed) return null;

              return (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Network size={14} className="text-cyan-400" /> Red y Conectividad
                  </div>
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-4 text-sm">
                    {activoADetalle.red && (
                      <div className="space-y-2 pb-3 border-b border-slate-700/50">
                        <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Hostname:</span> <span className="font-bold text-white text-right">{activoADetalle.red.nombre_red || activoADetalle.red.hostname || 'N/A'}</span></div>
                        <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Dominio:</span> <span className="font-medium text-slate-200 text-right">{activoADetalle.red.dominio || 'N/A'}</span></div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {interfacesList.map((iface, idx) => {
                        const interfazNombre = extraerNombre(iface.interfaz || iface.nombre || iface.tipo || iface.nombre_interfaz);
                        const mac = iface.mac || iface.direccion_mac || iface.mac_address || iface.direccionMac;
                        const ip = iface.ips || iface.ip || iface.direccion_ip || iface.ip_address || iface.direccionIp;

                        return (
                          <div key={idx} className="space-y-2">
                            <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">{interfazNombre || `Interfaz ${idx + 1}`}</div>
                            <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Dir. MAC:</span> <span className="font-mono text-xs text-amber-300 text-right bg-amber-400/10 px-1.5 py-0.5 rounded">{mac || 'N/A'}</span></div>
                            <div className="flex justify-between items-start gap-4"><span className="text-slate-400 shrink-0">Dir. IP:</span> <span className="font-mono text-xs text-emerald-300 text-right whitespace-pre-line">{ip || 'N/A'}</span></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 6. Software e Instalaciones */}
            {modulosDetalle.software && activoADetalle.software && activoADetalle.software.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Key size={14} className="text-indigo-400" /> Software Instalado
                </div>
                <div className="space-y-2.5">
                  {activoADetalle.software.map((sw, i) => (
                    <div key={i} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 text-sm">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <span className="font-bold text-white leading-tight">{sw.nombre_software}</span>
                        {sw.fecha_instalacion && <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(sw.fecha_instalacion).toLocaleDateString('es-ES')}</span>}
                      </div>
                      
                      <div className="space-y-1.5 mt-2">
                        {sw.licencia_key && <div className="flex justify-between items-start gap-4"><span className="text-xs text-slate-400 shrink-0">Clave Local:</span> <span className="font-mono text-xs text-amber-300 break-all text-right">{sw.licencia_key}</span></div>}
                        
                        {sw.licencia && (
                          <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-1">
                              <Key size={12} /> Licencia Vinculada
                            </div>
                            <div className="flex justify-between items-start gap-4"><span className="text-xs text-slate-400 shrink-0">Nombre:</span> <span className="text-xs text-slate-200 font-medium text-right">{extraerNombre(sw.licencia)}</span></div>
                            {sw.licencia.tipo && <div className="flex justify-between items-start gap-4"><span className="text-xs text-slate-400 shrink-0">Tipo:</span> <span className="text-xs text-slate-300 text-right">{sw.licencia.tipo}</span></div>}
                            {sw.licencia.fecha_expiracion && (
                              <div className="flex justify-between items-start gap-4 mt-1">
                                <span className="text-xs text-slate-400 shrink-0">Estado:</span> 
                                <span className={`text-xs font-bold text-right ${new Date(sw.licencia.fecha_expiracion) < new Date() ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {new Date(sw.licencia.fecha_expiracion) < new Date() ? 'Expirada' : `Válida hasta ${new Date(sw.licencia.fecha_expiracion).toLocaleDateString('es-ES')}`}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {sw.observaciones && (
                          <div className="mt-3 pt-2 border-t border-slate-700/30">
                            <span className="text-xs font-medium text-slate-400 block mb-1">Notas:</span>
                            <p className="text-xs text-slate-300 leading-relaxed">{sw.observaciones}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Observaciones Generales (Destacadas) */}
            {((activoADetalle.observaciones_texto && typeof activoADetalle.observaciones_texto === 'string') || 
              (activoADetalle.observaciones && typeof activoADetalle.observaciones === 'string' && !activoADetalle.observaciones.startsWith('{'))) && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-amber-500" />
                  <strong className="text-xs font-bold text-amber-500 uppercase tracking-wider">Observaciones Generales</strong>
                </div>
                <p className="text-sm text-amber-200/90 leading-relaxed whitespace-pre-line">
                  {activoADetalle.observaciones_texto || activoADetalle.observaciones}
                </p>
              </div>
            )}

          </div>
        )}
      </div>

      {activoEstadoRapido && (
        <ModalCambioEstado
          activo={activoEstadoRapido}
          estadosDisponibles={estados}
          onClose={() => setActivoEstadoRapido(null)}
          onGuardar={handleGuardarEstado}
        />
      )}

      <ModalActivo
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setActivoAEditar(null); }}
        onAgregarActivo={handleGuardarActivo}
        activoAEditar={activoAEditar}
      />

      <ModalSoftware
        isOpen={isModalSoftwareOpen}
        onClose={() => { setIsModalSoftwareOpen(false); setSoftwareAEditar(null); }}
        onGuardar={handleGuardarSoftware}
        softwareAEditar={softwareAEditar}
      />
    </div>
  );
};

export default Activos;
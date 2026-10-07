import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Calendar, Clock, Plus, Edit2, Trash2, X } from 'lucide-react';
import ModalTarea from '../components/modals/ModalTarea';
import ModalAgregarItem from '../components/modals/ModalAgregarItem';
import logoEmpresa from '../assets/logo-empresa.png'; // LOGO IMPORTADO

// IDs de las secciones fijas (solo para referencia)
const IDS_FIJOS = [
  'conexion_servidores',
  'espacio_disco',
  'sistema_camaras',
  'test_velocidad',
  'respaldo_correos_avpro'
];

// Constante de configuración con nombres exactos de dispositivos
const SECCIONES_BITACORA_INICIAL = [
  {
    id: 'conexion_servidores',
    titulo: '1. Revisión de Conexión de Servidores (08:00 A.M.)',
    tipoContenido: 'status_check',
    items: [
      { id: 'sv-0001-orion', nombre: 'SV-0001 ORION' },
      { id: 'sv-0002-cetus', nombre: 'SV-0002 CETUS' },
      { id: 'sv-0003-vpn-0001', nombre: 'SV-0003-VPN-0001' },
      { id: 'sv-0004-sec-0001', nombre: 'SV-0004-SEC-0001' },
      { id: 'revision-sai', nombre: 'Revisión de Estado del SAI' }
    ]
  },
  {
    id: 'espacio_disco',
    titulo: '2. Revisión de Espacio en Disco (09:00 A.M.)',
    tipoContenido: 'disk_space',
    items: [
      { id: 'sv-0001-orion-disk', nombre: 'SV-0001 ORION', discos: ['C', 'D', 'E'] },
      { id: 'sv-0002-cetus-disk', nombre: 'SV-0002 CETUS', discos: ['C', 'D', 'E'] },
      { id: 'nb-0001-nas-synology', nombre: 'NB-0001 NAS SYNOLOGY', discos: ['VOL 1'] },
      { id: 'nvr-0001-ds-7616ni-q2-disk', nombre: 'NVR-0001-DS-7616NI-Q2', discos: ['HDD1', 'HDD2'] },
      { id: 'dvr-0001-ds-7116hghi-f1n-disk', nombre: 'DVR-0001-DS-7116HGHI-F1/N', discos: ['HDD1'] },
      { id: 'dske-0001', nombre: 'DSKE-0001', discos: ['HDD1'] },
      { id: 'dske-0002', nombre: 'DSKE-0002', discos: ['HDD1'] }
    ]
  },
  {
    id: 'sistema_camaras',
    titulo: '3. Revisión de Sistema de Cámaras (09:30 A.M.)',
    tipoContenido: 'status_check',
    items: [
      { id: 'nvr-0001-ds-7616ni-q2-cam', nombre: 'NVR-0001-DS-7616NI-Q2' },
      { id: 'dvr-0001-ds-7116hghi-f1n-cam', nombre: 'DVR-0001-DS-7116HGHI-F1/N' }
    ]
  },
  {
    id: 'test_velocidad',
    titulo: '4. Test de Velocidad Internet (08:30 A.M.)',
    tipoContenido: 'speed_test',
    items: [
      { id: 'ont-tv-zamora', nombre: 'ONT TV ZAMORA' },
      { id: 'ont-cantv', nombre: 'ONT CANTV' },
      { id: 'ont-starlink', nombre: 'ONT STARLINK' },
      { id: 'nodo-eth-compras', nombre: 'NODO ETH H13BE1N2 (COMPRAS)' },
      { id: 'nodo-eth-almacen', nombre: 'NODO ETH H1718CE1N1 (ALMACÉN)' },
      { id: 'nodo-eth-hidraulica', nombre: 'NODO ETH H1718CE2N1 (HIDRAULICA)' },
      { id: 'nodo-eth-it', nombre: 'NODO ETH H1718CE2N3 (IT)' },
      { id: 'ssid-tmdh7413b', nombre: 'SSID TMDH7413B' },
      { id: 'ssid-tmdh741718c', nombre: 'SSID TMDH741718C' },
      { id: 'ssid-starlink', nombre: 'SSID STARLINK' }
    ]
  },
  {
    id: 'respaldo_correos_avpro',
    titulo: '5. Respaldo de Correos Corporativo (04:30 P.M.) y Respaldo de Sistema Avpro',
    tipoContenido: 'mixed_backups',
    subtablas: [
      {
        id: 'correos_corp',
        tituloSub: 'RESPALDO DE CORREOS CORPORATIVO',
        tipo: 'status_check',
        items: [
          { id: 'backup-transmandu', nombre: 'TRANSMANDU' },
          { id: 'backup-hangar74', nombre: 'HANGAR 74' }
        ]
      },
      {
        id: 'sistema_avpro_sub',
        tituloSub: 'RESPALDO DE SISTEMA AVPRO',
        tipo: 'avpro_check',
        items: [
          { id: 'backup-avipro-sys', nombre: 'AVPRO' }
        ]
      }
    ]
  }
];

const DIAS_SEMANA = [
  { clave: 'lunes', nombre: 'LUNES' },
  { clave: 'martes', nombre: 'MARTES' },
  { clave: 'miercoles', nombre: 'MIÉRCOLES' },
  { clave: 'jueves', nombre: 'JUEVES' },
  { clave: 'viernes', nombre: 'VIERNES' },
  { clave: 'sabado', nombre: 'SÁBADO' },
  { clave: 'domingo', nombre: 'DOMINGO' }
];

const ChevronDownIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const STORAGE_KEY_VALORES = 'tareas_valores_rutinarias';

export default function Tareas() {
  const { 
    configuracion, 
    cargarConfiguracion, 
    tareas, 
    agregarTarea, 
    eliminarTarea, 
    personal,
    userPermissions
  } = useData();

  const puedeCrear = userPermissions.includes('crear_tareas');
  const puedeEliminar = userPermissions.includes('eliminar_tareas');

  const [tabActiva, setTabActiva] = useState('rutinarias');
  const [valores, setValores] = useState(() => {
    const guardado = localStorage.getItem(STORAGE_KEY_VALORES);
    return guardado ? JSON.parse(guardado) : {};
  });
  const [loading, setLoading] = useState(false);
  const [historicoReportes, setHistoricoReportes] = useState(() => {
    const guardado = localStorage.getItem('tareas_historico_reportes');
    return guardado ? JSON.parse(guardado) : [];
  });
  const [reporteParaImprimir, setReporteParaImprimir] = useState(null);
  const [nodosDesplegados, setNodosDesplegados] = useState({});
  const [tareasNoRutinarias, setTareasNoRutinarias] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState({
    descripcion: '',
    diaAsignado: 'lunes',
    fechaInicio: '',
    fechaFin: '',
    prioridad: 'media',
    responsables: []
  });
  const [responsableSeleccionado, setResponsableSeleccionado] = useState('');

  const [seccionesRutinarias, setSeccionesRutinarias] = useState(() => {
    const guardado = localStorage.getItem('tareas_secciones_rutinarias');
    if (guardado) {
      try {
        const parsed = JSON.parse(guardado);
        return parsed;
      } catch {
        return SECCIONES_BITACORA_INICIAL;
      }
    }
    return SECCIONES_BITACORA_INICIAL;
  });

  const [modalTareaOpen, setModalTareaOpen] = useState(false);
  const [tareaAEditar, setTareaAEditar] = useState(null);
  const [modalTareaSoloRutinaria, setModalTareaSoloRutinaria] = useState(false);

  const [modalAgregar, setModalAgregar] = useState({
    isOpen: false,
    seccionId: null,
    nombre: '',
    modo: 'agregar',
    itemId: null
  });

  const [modalEditarTitulo, setModalEditarTitulo] = useState({
    isOpen: false,
    seccionId: null,
    tituloActual: ''
  });

  const plataforma1 = configuracion?.test_plataforma_1 || 'speedtest';
  const plataforma2 = configuracion?.test_plataforma_2 || 'gfiber';
  const plataforma3 = configuracion?.test_plataforma_3 || 'nperf';

  const analistasSoporte = useMemo(() => {
    if (!personal || personal.length === 0) return [];
    const normalize = (str) => {
      if (!str) return '';
      return str.toUpperCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    return personal.filter(p => {
      const cargo = normalize(p.cargo || '');
      const esAnalista = cargo.includes('ANALISTA DE SOPORTE') && 
                         (cargo.includes('TECNICO') || cargo.includes('TECNICO')); 
      let deptoNombre = '';
      if (p.departamento) {
        if (typeof p.departamento === 'object') deptoNombre = p.departamento.nombre || '';
        else deptoNombre = p.departamento;
      }
      const depto = normalize(deptoNombre);
      const esJefatura = depto.includes('JEFATURA') && depto.includes('SOPORTE');

      if (!esJefatura && p.jefatura) {
        let jefaturaNombre = '';
        if (typeof p.jefatura === 'object') jefaturaNombre = p.jefatura.nombre || '';
        else jefaturaNombre = p.jefatura;
        const jefatura = normalize(jefaturaNombre);
        if (jefatura.includes('JEFATURA') && jefatura.includes('SOPORTE')) return esAnalista;
      }
      return esAnalista && esJefatura;
    });
  }, [personal]);

  const personalResponsable = analistasSoporte;

  useEffect(() => {
    if (cargarConfiguracion) cargarConfiguracion();
  }, []);

  useEffect(() => {
    if (tareas && tareas.length > 0) {
      const noRutinarias = tareas.filter(t => t.tipo === 'no-rutinaria' && !t.completada);
      setTareasNoRutinarias(noRutinarias);
    }
  }, [tareas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VALORES, JSON.stringify(valores));
  }, [valores]);

  useEffect(() => {
    localStorage.setItem('tareas_secciones_rutinarias', JSON.stringify(seccionesRutinarias));
  }, [seccionesRutinarias]);

  useEffect(() => {
    localStorage.setItem('tareas_historico_reportes', JSON.stringify(historicoReportes));
  }, [historicoReportes]);

  const obtenerRangoSemana = () => {
    const hoy = new Date();
    const diaActual = hoy.getDay();
    const distanciaAlLunes = diaActual === 0 ? -6 : 1 - diaActual;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + distanciaAlLunes);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    const fFmt = (d) => d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `Semana del ${fFmt(lunes)} al ${fFmt(domingo)}`;
  };

  const toggleNodo = (id) => {
    setNodosDesplegados(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStatus = (itemId, dia, campo, valor) => {
    const key = `${itemId}_${dia}_${campo}`;
    const current = valores[key] || '';
    const nuevoValor = current === valor ? '' : valor;
    setValores(prev => ({ ...prev, [key]: nuevoValor }));
  };

  const handleInputChange = (itemId, dia, campo, valor) => {
    setValores(prev => ({ ...prev, [`${itemId}_${dia}_${campo}`]: valor }));
  };

  const handleResponsableChange = (seccionId, dia, nombre) => {
    setValores(prev => ({ ...prev, [`responsable_${seccionId}_${dia}_nombre`]: nombre }));
  };

  const agregarItemASeccion = (seccionId, nombreItem) => {
    if (!nombreItem || !nombreItem.trim()) { alert('El nombre no puede estar vacío.'); return; }
    setSeccionesRutinarias(prev => prev.map(seccion => {
      if (seccion.id !== seccionId) return seccion;
      const nuevoId = `${seccion.id}-${Date.now()}`;
      if (seccion.tipoContenido === 'mixed_backups') {
        const nuevasSubtablas = seccion.subtablas.map((sub, idx) => {
          if (idx === 0) return { ...sub, items: [...sub.items, { id: `${sub.id}-${Date.now()}`, nombre: nombreItem.trim() }] };
          return sub;
        });
        return { ...seccion, subtablas: nuevasSubtablas };
      } else {
        return { ...seccion, items: [...seccion.items, { id: nuevoId, nombre: nombreItem.trim() }] };
      }
    }));
  };

  const editarItem = (seccionId, itemId, nuevoNombre) => {
    if (!nuevoNombre || !nuevoNombre.trim()) { alert('El nombre no puede estar vacío.'); return; }
    setSeccionesRutinarias(prev => prev.map(seccion => {
      if (seccion.id !== seccionId) return seccion;
      if (seccion.tipoContenido === 'mixed_backups') {
        const nuevasSubtablas = seccion.subtablas.map(sub => ({
          ...sub,
          items: sub.items.map(item => item.id === itemId ? { ...item, nombre: nuevoNombre.trim() } : item)
        }));
        return { ...seccion, subtablas: nuevasSubtablas };
      } else {
        return {
          ...seccion,
          items: seccion.items.map(item => item.id === itemId ? { ...item, nombre: nuevoNombre.trim() } : item)
        };
      }
    }));
  };

  const eliminarItem = (seccionId, itemId) => {
    if (!window.confirm('¿Está seguro de eliminar este elemento?')) return;
    setSeccionesRutinarias(prev => prev.map(seccion => {
      if (seccion.id !== seccionId) return seccion;
      if (seccion.tipoContenido === 'mixed_backups') {
        const nuevasSubtablas = seccion.subtablas.map(sub => ({
          ...sub,
          items: sub.items.filter(item => item.id !== itemId)
        }));
        return { ...seccion, subtablas: nuevasSubtablas };
      } else {
        return { ...seccion, items: seccion.items.filter(item => item.id !== itemId) };
      }
    }));
  };

  const abrirModalAgregar = (seccionId) => {
    setModalAgregar({ isOpen: true, seccionId, nombre: '', modo: 'agregar', itemId: null });
  };

  const abrirModalEditar = (seccionId, itemId, nombreActual) => {
    setModalAgregar({ isOpen: true, seccionId, nombre: nombreActual, modo: 'editar', itemId });
  };

  const confirmarAccionItem = (nombre) => {
    const { seccionId, modo, itemId } = modalAgregar;
    if (modo === 'agregar') agregarItemASeccion(seccionId, nombre);
    else if (modo === 'editar' && itemId) editarItem(seccionId, itemId, nombre);
  };

  const abrirModalEditarTitulo = (seccionId, tituloActual) => {
    setModalEditarTitulo({ isOpen: true, seccionId, tituloActual });
  };

  const confirmarEditarTitulo = (nuevoTitulo) => {
    const { seccionId } = modalEditarTitulo;
    if (!nuevoTitulo || !nuevoTitulo.trim()) { alert('El título no puede estar vacío.'); return; }
    setSeccionesRutinarias(prev => prev.map(seccion => {
      if (seccion.id !== seccionId) return seccion;
      return { ...seccion, titulo: nuevoTitulo.trim() };
    }));
  };

  const eliminarSeccion = (seccionId) => {
    if (!window.confirm('¿Está seguro de eliminar esta tarea y todos sus elementos?')) return;
    setSeccionesRutinarias(prev => prev.filter(seccion => seccion.id !== seccionId));
    setValores(prev => {
      const nuevosValores = {};
      Object.keys(prev).forEach(key => { if (!key.includes(seccionId)) nuevosValores[key] = prev[key]; });
      return nuevosValores;
    });
  };

  const handleGuardarTarea = async (payload) => {
    try {
      await agregarTarea(payload);
      if (payload.tipo === 'rutinaria') agregarNuevaSeccion(payload);
      setModalTareaOpen(false);
      setTareaAEditar(null);
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      alert('Error al guardar la tarea.');
    }
  };

  const agregarNuevaSeccion = (tareaData) => {
    const nuevoId = `seccion-${Date.now()}`;
    const nuevaSeccion = { id: nuevoId, titulo: tareaData.descripcion || 'Nueva Tarea', tipoContenido: 'solo_observacion', items: [] };
    setSeccionesRutinarias(prev => [...prev, nuevaSeccion]);
  };

  const abrirModalNuevaTareaRutinaria = () => {
    setTareaAEditar(null);
    setModalTareaSoloRutinaria(true);
    setModalTareaOpen(true);
  };

  const agregarResponsable = () => {
    if (!responsableSeleccionado) { alert('Seleccione un responsable de la lista.'); return; }
    const responsable = analistasSoporte.find(p => p.id === parseInt(responsableSeleccionado));
    if (!responsable) return;
    if (nuevaTarea.responsables.some(r => r.id === responsable.id)) { alert('Este responsable ya está agregado.'); return; }
    setNuevaTarea(prev => ({
      ...prev,
      responsables: [...prev.responsables, { id: responsable.id, nombre: responsable.nombre_completo }]
    }));
    setResponsableSeleccionado('');
  };

  const eliminarResponsable = (id) => {
    setNuevaTarea(prev => ({ ...prev, responsables: prev.responsables.filter(r => r.id !== id) }));
  };

  const handleAgregarTareaNoRutinaria = async (e) => {
    e.preventDefault();
    if (!nuevaTarea.descripcion.trim()) { alert("Por favor, ingrese la descripción de la tarea."); return; }
    if (nuevaTarea.responsables.length === 0) { alert("Debe agregar al menos un responsable."); return; }
    try {
      const responsablesStr = nuevaTarea.responsables.map(r => r.nombre).join(', ');
      const payload = {
        codigo: `TAR-${Date.now()}`,
        descripcion: nuevaTarea.descripcion,
        proyecto: 'No Rutinaria',
        clasificacion: 'no-rutinaria',
        prioridad: nuevaTarea.prioridad,
        dia_asignado: nuevaTarea.diaAsignado,
        fecha_inicio: nuevaTarea.fechaInicio || new Date().toISOString().split('T')[0],
        fecha_fin: nuevaTarea.fechaFin || null,
        responsables: responsablesStr,
        personal: 'SOPORTE IT',
        tipo: 'no-rutinaria',
        completada: false,
        categoria: 'Mantenimiento'
      };
      const nuevaTareaCreada = await agregarTarea(payload);
      setTareasNoRutinarias(prev => [...prev, nuevaTareaCreada]);
      setNuevaTarea({ descripcion: '', diaAsignado: 'lunes', fechaInicio: '', fechaFin: '', prioridad: 'media', responsables: [] });
      setResponsableSeleccionado('');
    } catch (error) {
      console.error('Error al agregar tarea no rutinaria:', error);
      alert('Error al guardar la tarea. Intente de nuevo.');
    }
  };

  const handleEliminarTareaNoRutinaria = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta tarea?')) return;
    try {
      await eliminarTarea(id);
      setTareasNoRutinarias(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar la tarea.');
    }
  };

  // ============================================================
  // FUNCIÓN PARA GENERAR CÓDIGO CORRELATIVO
  // ============================================================
  const generarCodigoCronograma = (tipo) => {
    const reportesDelTipo = historicoReportes.filter(r => r.tipoReporte === tipo);
    const siguienteNumero = reportesDelTipo.length + 1;
    return `TMD-DIP-CRO-${String(siguienteNumero).padStart(5, '0')}`;
  };

  // ============================================================
  // GUARDAR REPORTE RUTINARIO
  // ============================================================
  const handleGuardarRutinarias = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const codigo = generarCodigoCronograma('rutinarias');
      const nuevoReporte = {
        id: Date.now(),
        tipoReporte: 'rutinarias',
        semanaTexto: obtenerRangoSemana(),
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codigo: codigo,
        datos: { ...valores },
        seccionesSnapshot: JSON.parse(JSON.stringify(seccionesRutinarias)),
        tareasNoRutinarias: []
      };
      setHistoricoReportes(prev => [nuevoReporte, ...prev]);
      setValores({});
      localStorage.removeItem(STORAGE_KEY_VALORES);
      setLoading(false);
      alert("¡Reporte de Tareas Rutinarias guardado con éxito! Los valores se han reiniciado para la nueva semana.");
    }, 600);
  };

  // ============================================================
  // GUARDAR REPORTE NO RUTINARIO
  // ============================================================
  const handleGuardarNoRutinarias = (e) => {
    e.preventDefault();
    if (tareasNoRutinarias.length === 0) { alert("Debe agregar al menos una tarea no rutinaria antes de guardar el reporte."); return; }
    setLoading(true);
    setTimeout(() => {
      const codigo = generarCodigoCronograma('no_rutinarias');
      const nuevoReporte = {
        id: Date.now(),
        tipoReporte: 'no_rutinarias',
        semanaTexto: obtenerRangoSemana(),
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codigo: codigo,
        datos: {},
        tareasNoRutinarias: [...tareasNoRutinarias]
      };
      setHistoricoReportes(prev => [nuevoReporte, ...prev]);
      alert("¡Reporte de Tareas No Rutinarias guardado con éxito!");
      setLoading(false);
    }, 600);
  };

  const lanzarDescargaPDF = (reporte) => {
    setReporteParaImprimir(reporte);
    setTimeout(() => window.print(), 200);
  };

  const semanaActual = obtenerRangoSemana();

  // Función auxiliar para renderizar los datos correctos en la vista de impresión
  const renderDataImpresion = (seccion, item, dia, sub, reporteDatos) => {
    const baseKey = `${item.id}_${dia.clave}`;
    const tipo = sub ? sub.tipo : seccion.tipoContenido;
    const s = reporteDatos[`${baseKey}_status`];
    const o = reporteDatos[`${baseKey}_obs`];

    if (tipo === 'solo_observacion') {
      return o || '';
    }
    if (tipo === 'status_check') {
      let res = s === 'linea' ? 'LÍNEA' : s === 'offline' ? 'OFFLINE' : '';
      if (o) res += res ? `\n(Obs: ${o})` : `(Obs: ${o})`;
      return res;
    }
    if (tipo === 'avpro_check') {
      let res = s === 'correcto' ? 'CORRECTO' : s === 'fallido' ? 'FALLIDO' : '';
      if (o) res += res ? `\n(Obs: ${o})` : `(Obs: ${o})`;
      return res;
    }
    if (tipo === 'disk_space') {
      return item.discos.map(d => {
        const val = reporteDatos[`${baseKey}_disk_${d}`];
        return val ? `${d}: ${val}` : '';
      }).filter(Boolean).join('\n');
    }
    if (tipo === 'speed_test') {
      const p1b = reporteDatos[`${baseKey}_${plataforma1}_bajada`] || '';
      const p1s = reporteDatos[`${baseKey}_${plataforma1}_subida`] || '';
      const p1p = reporteDatos[`${baseKey}_${plataforma1}_ping`] || '';
      const p2b = reporteDatos[`${baseKey}_${plataforma2}_bajada`] || '';
      const p2s = reporteDatos[`${baseKey}_${plataforma2}_subida`] || '';
      const p2p = reporteDatos[`${baseKey}_${plataforma2}_ping`] || '';
      const p3b = reporteDatos[`${baseKey}_${plataforma3}_bajada`] || '';
      const p3s = reporteDatos[`${baseKey}_${plataforma3}_subida`] || '';
      const p3p = reporteDatos[`${baseKey}_${plataforma3}_ping`] || '';

      let out = '';
      if (p1b || p1s || p1p) {
        out += `${plataforma1.toUpperCase()}:\n↓${p1b||0} ↑${p1s||0} ${p1p ? 'ms '+p1p : ''}`;
      }
      if (p2b || p2s || p2p) {
        if (out) out += '\n';
        out += `${plataforma2.toUpperCase()}:\n↓${p2b||0} ↑${p2s||0} ${p2p ? 'ms '+p2p : ''}`;
      }
      if (p3b || p3s || p3p) {
        if (out) out += '\n';
        out += `${plataforma3.toUpperCase()}:\n↓${p3b||0} ↑${p3s||0} ${p3p ? 'ms '+p3p : ''}`;
      }
      return out;
    }
    return '';
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="block print:hidden">
        {/* Encabezado */}
        <div className="bg-white p-5 border border-slate-200 rounded-t-xl shadow-sm text-center relative">
          <div className="absolute top-2 right-4 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 shadow-sm">
            <Calendar size={14} className="text-blue-500" />
            <span className="text-xs font-bold text-blue-700">{semanaActual}</span>
          </div>
          <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Transmandu, C.A.</h2>
          <h1 className="text-xl font-extrabold text-slate-800 mt-1.5">REGISTRO DE CONTROL DE TAREAS</h1>
          <p className="text-sm font-semibold text-slate-500 mt-0.5 tracking-tight">JEFATURA DE SOPORTE TÉCNICO - CONTROL OPERATIVO SEMANAL</p>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex border-x border-slate-200 bg-slate-100 p-2 space-x-2">
          <button
            type="button"
            onClick={() => setTabActiva('rutinarias')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg tracking-wider transition-all ${
              tabActiva === 'rutinarias'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            I. Tareas Rutinarias
          </button>
          <button
            type="button"
            onClick={() => setTabActiva('no_rutinarias')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg tracking-wider transition-all ${
              tabActiva === 'no_rutinarias'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            II. Tareas No Rutinarias
          </button>
        </div>

        {/* TAREAS RUTINARIAS */}
        {tabActiva === 'rutinarias' && (
          <form onSubmit={handleGuardarRutinarias} className="bg-white border-x border-b border-slate-200 rounded-b-xl shadow-sm p-5 space-y-10">
            <div className="space-y-10">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-sm font-extrabold text-blue-600 tracking-wider uppercase">I. CONTROL DE TAREAS RUTINARIAS</h2>
                {puedeCrear && (
                  <button
                    type="button"
                    onClick={abrirModalNuevaTareaRutinaria}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all"
                  >
                    <Plus size={16} /> Registrar Nueva Tarea
                  </button>
                )}
              </div>

              {seccionesRutinarias.map((seccion) => {
                const esSoloObservacion = seccion.tipoContenido === 'solo_observacion';
                return (
                  <div key={seccion.id} className="overflow-x-auto border border-slate-200 rounded-lg shadow-inner bg-white">
                    <table className="w-full text-left border-collapse min-w-212.5">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200">
                          <th colSpan={DIAS_SEMANA.length + 1} className="p-4 text-sm font-bold text-slate-700 uppercase tracking-wider">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>{seccion.titulo}</span>
                                {puedeCrear && (
                                  <button type="button" onClick={() => abrirModalEditarTitulo(seccion.id, seccion.titulo)} className="text-slate-400 hover:text-amber-600 transition-colors p-1 rounded hover:bg-amber-50" title="Editar título de la tarea">
                                    <Edit2 size={14} />
                                  </button>
                                )}
                                {puedeEliminar && (
                                  <button type="button" onClick={() => eliminarSeccion(seccion.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50" title="Eliminar esta tarea">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                              {puedeCrear && (
                                <button type="button" onClick={() => abrirModalAgregar(seccion.id)} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                                  <Plus size={14} /> Agregar
                                </button>
                              )}
                            </div>
                          </th>
                        </tr>
                        <tr className="bg-slate-50 border-b border-slate-200 text-center text-xs font-bold text-slate-500 uppercase">
                          <th className="p-3 text-left w-64 border-r border-slate-200">SISTEMA / DISPOSITIVO / INDICADOR</th>
                          {DIAS_SEMANA.map(dia => (
                            <th key={dia.clave} className="p-2 border-r last:border-r-0 border-slate-200 w-36">{dia.nombre}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-xs">
                        {seccion.tipoContenido !== 'mixed_backups' ? (
                          seccion.items.map((item) => {
                            const estaAbierto = !!nodosDesplegados[item.id];
                            return (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-3 font-semibold text-slate-700 bg-slate-50/20 border-r border-slate-200 uppercase">
                                  <div className="flex items-center justify-between">
                                    <span>{item.nombre}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {puedeCrear && (
                                        <button type="button" onClick={() => abrirModalEditar(seccion.id, item.id, item.nombre)} className="p-1 text-slate-400 hover:text-amber-600 rounded" title="Editar"><Edit2 size={12} /></button>
                                      )}
                                      {puedeEliminar && (
                                        <button type="button" onClick={() => eliminarItem(seccion.id, item.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded" title="Eliminar"><Trash2 size={12} /></button>
                                      )}
                                    </div>
                                  </div>
                                  {seccion.tipoContenido === 'speed_test' && (
                                    <button type="button" onClick={() => toggleNodo(item.id)} className="mt-1 text-[10px] text-blue-600 hover:underline flex items-center gap-1">
                                      {estaAbierto ? 'Ocultar tests' : 'Mostrar tests'}
                                      <ChevronDownIcon className={`w-3 h-3 transition-transform ${estaAbierto ? 'rotate-180' : ''}`} />
                                    </button>
                                  )}
                                </td>
                                {DIAS_SEMANA.map((dia) => {
                                  const cellKey = `${item.id}_${dia.clave}`;
                                  return (
                                    <td key={dia.clave} className="p-2 border-r last:border-r-0 border-slate-200 align-middle">
                                      {esSoloObservacion ? (
                                        <input type="text" placeholder="Obs..." className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[10px] focus:outline-none focus:border-blue-400 bg-white" value={valores[`${cellKey}_obs`] || ''} onChange={(e) => handleInputChange(item.id, dia.clave, 'obs', e.target.value)} />
                                      ) : seccion.tipoContenido === 'status_check' ? (
                                        <div className="flex flex-col space-y-1 py-1 text-left font-medium text-[11px]">
                                          <label className="flex items-center space-x-2 text-emerald-800 cursor-pointer">
                                            <input type="radio" name={cellKey} className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500" checked={valores[`${cellKey}_status`] === 'linea'} onChange={() => toggleStatus(item.id, dia.clave, 'status', 'linea')} />
                                            <span>Línea</span>
                                          </label>
                                          <label className="flex items-center space-x-2 text-rose-800 cursor-pointer">
                                            <input type="radio" name={cellKey} className="w-3.5 h-3.5 text-rose-600 focus:ring-rose-500" checked={valores[`${cellKey}_status`] === 'offline'} onChange={() => toggleStatus(item.id, dia.clave, 'status', 'offline')} />
                                            <span>Offline</span>
                                          </label>
                                          <input type="text" placeholder="Obs..." className="w-full mt-1 px-1.5 py-0.5 border border-slate-200 rounded text-[10px] focus:outline-none focus:border-blue-400 bg-white" value={valores[`${cellKey}_obs`] || ''} onChange={(e) => handleInputChange(item.id, dia.clave, 'obs', e.target.value)} />
                                        </div>
                                      ) : seccion.tipoContenido === 'disk_space' ? (
                                        <div className="space-y-1 text-[11px]">
                                          {item.discos.map(disco => (
                                            <div key={disco} className="flex items-center space-x-1">
                                              <span className="font-bold text-slate-400 w-9 text-right select-none uppercase">{disco}:</span>
                                              <input type="text" placeholder="GB/TB" className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-center focus:outline-none focus:border-blue-400 bg-white" value={valores[`${cellKey}_disk_${disco}`] || ''} onChange={(e) => handleInputChange(item.id, dia.clave, `disk_${disco}`, e.target.value)} />
                                            </div>
                                          ))}
                                        </div>
                                      ) : seccion.tipoContenido === 'speed_test' ? (
                                        <div className="transition-all duration-200">
                                          {!estaAbierto ? (
                                            <div className="text-[10px] font-bold text-slate-400 text-center py-2 bg-slate-50 border border-dashed border-slate-200 rounded cursor-pointer hover:bg-slate-100" onClick={() => toggleNodo(item.id)}>Haz clic para desplegar los 3 tests</div>
                                          ) : (
                                            <div className="space-y-2">
                                              {[plataforma1, plataforma2, plataforma3].map(plat => (
                                                <div key={plat} className="p-1.5 bg-slate-50 border border-slate-200 rounded shadow-sm">
                                                  <div className="text-[8px] font-extrabold text-slate-500 tracking-wider uppercase border-b border-slate-200 pb-0.5 mb-1 text-left">{plat.toUpperCase()}</div>
                                                  <div className="grid grid-cols-3 gap-1">
                                                    <div className="flex flex-col items-center">
                                                      <span className="text-[7px] font-bold text-blue-600 mb-0.5">Baj. (↓)</span>
                                                      <input type="text" placeholder="Mbps" className="w-full text-[9px] px-1 py-0.5 border border-slate-300 rounded text-center focus:outline-none focus:border-blue-500 bg-white" value={valores[`${cellKey}_${plat}_bajada`] || ''} onChange={(e) => handleInputChange(item.id, dia.clave, `${plat}_bajada`, e.target.value)} />
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                      <span className="text-[7px] font-bold text-emerald-600 mb-0.5">Sub. (↑)</span>
                                                      <input type="text" placeholder="Mbps" className="w-full text-[9px] px-1 py-0.5 border border-slate-300 rounded text-center focus:outline-none focus:border-blue-500 bg-white" value={valores[`${cellKey}_${plat}_subida`] || ''} onChange={(e) => handleInputChange(item.id, dia.clave, `${plat}_subida`, e.target.value)} />
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                      <span className="text-[7px] font-bold text-amber-600 mb-0.5">Lat. (ms)</span>
                                                      <input type="text" placeholder="Ping" className="w-full text-[9px] px-1 py-0.5 border border-slate-300 rounded text-center focus:outline-none focus:border-blue-500 bg-white" value={valores[`${cellKey}_${plat}_ping`] || ''} onChange={(e) => handleInputChange(item.id, dia.clave, `${plat}_ping`, e.target.value)} />
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ) : null}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })
                        ) : (
                          // SECCIÓN MIXED_BACKUPS: subtablas + fila de responsable (corregido)
                          <>
                            {seccion.subtablas.map((sub) => (
                              <React.Fragment key={sub.id}>
                                <tr className="bg-slate-50/80 font-bold text-slate-600 text-[10px]">
                                  <td colSpan={DIAS_SEMANA.length + 1} className="p-2 pl-4 border-y border-slate-200 tracking-wider bg-slate-100/50">{sub.tituloSub}</td>
                                </tr>
                                {sub.items.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-3 font-semibold text-slate-700 bg-slate-50/20 border-r border-slate-200 uppercase pl-6">
                                      <div className="flex items-center justify-between">
                                        <span>{item.nombre}</span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          {puedeCrear && <button type="button" onClick={() => abrirModalEditar(seccion.id, item.id, item.nombre)} className="p-1 text-slate-400 hover:text-amber-600 rounded" title="Editar"><Edit2 size={12} /></button>}
                                          {puedeEliminar && <button type="button" onClick={() => eliminarItem(seccion.id, item.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded" title="Eliminar"><Trash2 size={12} /></button>}
                                        </div>
                                      </div>
                                    </td>
                                    {DIAS_SEMANA.map((dia) => {
                                      const cellKey = `${item.id}_${dia.clave}`;
                                      return (
                                        <td key={dia.clave} className="p-2 border-r last:border-r-0 border-slate-200 align-middle">
                                          {sub.tipo === 'status_check' ? (
                                            <div className="flex flex-col space-y-1 py-1 text-left font-medium text-[11px]">
                                              <label className="flex items-center space-x-2 text-emerald-800 cursor-pointer">
                                                <input type="radio" name={cellKey} className="w-3.5 h-3.5 text-emerald-600" checked={valores[`${cellKey}_status`] === 'linea'} onChange={() => toggleStatus(item.id, dia.clave, 'status', 'linea')} />
                                                <span>Línea</span>
                                              </label>
                                              <label className="flex items-center space-x-2 text-rose-800 cursor-pointer">
                                                <input type="radio" name={cellKey} className="w-3.5 h-3.5 text-rose-600" checked={valores[`${cellKey}_status`] === 'offline'} onChange={() => toggleStatus(item.id, dia.clave, 'status', 'offline')} />
                                                <span>Offline</span>
                                              </label>
                                              <input type="text" placeholder="Obs..." className="w-full mt-1 px-1.5 py-0.5 border border-slate-200 rounded text-[10px] focus:outline-none bg-white" value={valores[`${cellKey}_obs`] || ''} onChange={(e) => handleInputChange(item.id, dia.clave, 'obs', e.target.value)} />
                                            </div>
                                          ) : sub.tipo === 'avpro_check' ? (
                                            <div className="flex flex-col space-y-1 py-1 text-left font-medium text-[11px]">
                                              <label className="flex items-center space-x-2 text-emerald-800 cursor-pointer">
                                                <input type="radio" name={cellKey} className="w-3.5 h-3.5 text-emerald-600" checked={valores[`${cellKey}_status`] === 'correcto'} onChange={() => toggleStatus(item.id, dia.clave, 'status', 'correcto')} />
                                                <span className="text-[10px]">Resp. Correcto</span>
                                              </label>
                                              <label className="flex items-center space-x-2 text-rose-800 cursor-pointer">
                                                <input type="radio" name={cellKey} className="w-3.5 h-3.5 text-rose-600" checked={valores[`${cellKey}_status`] === 'fallido'} onChange={() => toggleStatus(item.id, dia.clave, 'status', 'fallido')} />
                                                <span className="text-[10px]">Resp. Fallido</span>
                                              </label>
                                              <input type="text" placeholder="Obs..." className="w-full mt-1 px-1.5 py-0.5 border border-slate-200 rounded text-[10px] focus:outline-none bg-white" value={valores[`${cellKey}_obs`] || ''} onChange={(e) => handleInputChange(item.id, dia.clave, 'obs', e.target.value)} />
                                            </div>
                                          ) : null}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))}
                            {/* FILA DE RESPONSABLE para mixed_backups */}
                            <tr className="bg-slate-50/60 font-medium">
                              <td className="p-3 font-bold text-slate-500 bg-slate-100/30 border-r border-slate-200 text-center tracking-wide text-[10px]">RESPONSABLE</td>
                              {DIAS_SEMANA.map((dia) => {
                                const valorActual = valores[`responsable_${seccion.id}_${dia.clave}_nombre`] || '';
                                return (
                                  <td key={dia.clave} className="p-2 border-r last:border-r-0 border-slate-200">
                                    <select className="w-full px-1.5 py-1 border border-slate-200 rounded text-[10px] font-semibold text-center uppercase focus:outline-none focus:border-blue-500 bg-white shadow-sm" value={valorActual} onChange={(e) => handleResponsableChange(seccion.id, dia.clave, e.target.value)}>
                                      <option value="">-- Seleccionar --</option>
                                      {analistasSoporte.map((p) => (
                                        <option key={p.id} value={p.nombre_completo}>{p.nombre_completo}</option>
                                      ))}
                                    </select>
                                  </td>
                                );
                              })}
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end pt-3">
              <button type="submit" disabled={loading} className={`text-white text-sm font-semibold px-6 py-2.5 rounded-lg shadow-md transition-all flex items-center space-x-2 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}>
                {loading ? <span>Guardando...</span> : <span>Guardar Reporte Rutinario</span>}
              </button>
            </div>
          </form>
        )}

        {/* TAREAS NO RUTINARIAS */}
        {tabActiva === 'no_rutinarias' && (
          <form onSubmit={handleGuardarNoRutinarias} className="bg-white border-x border-b border-slate-200 rounded-b-xl shadow-sm p-5 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-sm font-extrabold text-amber-600 tracking-wider uppercase">II. REGISTRO DE TAREAS NO RUTINARIAS</h2>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-bold">{tareasNoRutinarias.length} registradas</span>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Descripción de la Tarea No Rutinaria</label>
                <input type="text" placeholder="Ej: Mantenimiento preventivo rack de compras o cambio de cableado estructurado..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500 bg-white" value={nuevaTarea.descripcion} onChange={(e) => setNuevaTarea(prev => ({ ...prev, descripcion: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Día de Ejecución Primaria</label>
                <select className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white uppercase font-semibold" value={nuevaTarea.diaAsignado} onChange={(e) => setNuevaTarea(prev => ({ ...prev, diaAsignado: e.target.value }))}>
                  {DIAS_SEMANA.map(d => <option key={d.clave} value={d.clave}>{d.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Fecha de Inicio</label>
                <input type="date" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white" value={nuevaTarea.fechaInicio} onChange={(e) => setNuevaTarea(prev => ({ ...prev, fechaInicio: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Fecha de Fin (Varianza de días)</label>
                <input type="date" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white" value={nuevaTarea.fechaFin} onChange={(e) => setNuevaTarea(prev => ({ ...prev, fechaFin: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Prioridad asignada</label>
                <div className="flex space-x-4 mt-1.5">
                  {['baja', 'media', 'alta'].map(p => (
                    <label key={p} className="flex items-center space-x-1 cursor-pointer capitalize font-medium">
                      <input type="radio" name="prioridad_nr" checked={nuevaTarea.prioridad === p} onChange={() => setNuevaTarea(prev => ({ ...prev, prioridad: p }))} className="text-amber-600" />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Personal Asignado</label>
                <input type="text" disabled className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-200 font-bold text-slate-500" value="SOPORTE IT" />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Responsable(s) específico(s)</label>
                <div className="flex gap-2 items-center">
                  <select value={responsableSeleccionado} onChange={(e) => setResponsableSeleccionado(e.target.value)} className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-amber-500 font-semibold">
                    <option value="">-- Seleccione un responsable --</option>
                    {analistasSoporte.map(p => <option key={p.id} value={p.id}>{p.nombre_completo}</option>)}
                  </select>
                  {puedeCrear && (
                    <button type="button" onClick={agregarResponsable} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap"><Plus size={14} /> Agregar</button>
                  )}
                </div>
                {analistasSoporte.length === 0 && <p className="text-[10px] text-amber-500 mt-1">⚠️ No hay analistas de soporte registrados en la Jefatura de Soporte.</p>}
                {nuevaTarea.responsables.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    {nuevaTarea.responsables.map((r) => (
                      <span key={r.id} className="inline-flex items-center justify-between px-3 py-1.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-xs font-medium w-full max-w-xs">
                        <span>{r.nombre}</span>
                        <button type="button" onClick={() => eliminarResponsable(r.id)} className="text-amber-500 hover:text-amber-700 transition-colors ml-2"><X size={14} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-3 flex justify-end pt-2">
                {puedeCrear && (
                  <button type="button" onClick={handleAgregarTareaNoRutinaria} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg shadow transition-all text-xs">+ Agregar Tarea No Rutinaria</button>
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="p-2.5">Descripción</th>
                    <th className="p-2.5 text-center">Día base</th>
                    <th className="p-2.5 text-center">Duración/Fechas</th>
                    <th className="p-2.5 text-center">Prioridad</th>
                    <th className="p-2.5 text-center">Responsables</th>
                    <th className="p-2.5 text-center w-20">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tareasNoRutinarias.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-slate-400 italic">No se han registrado tareas no rutinarias para esta semana.</td>
                    </tr>
                  ) : (
                    tareasNoRutinarias.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors font-medium">
                        <td className="p-2.5 text-slate-800 uppercase">{t.descripcion}</td>
                        <td className="p-2.5 text-center uppercase text-slate-500 font-bold">{t.dia_asignado ? t.dia_asignado.charAt(0).toUpperCase() + t.dia_asignado.slice(1) : 'N/R'}</td>
                        <td className="p-2.5 text-center text-slate-600">
                          {t.fecha_inicio ? new Date(t.fecha_inicio).toLocaleDateString('es-ES') : 'N/R'} 
                          al {t.fecha_fin ? new Date(t.fecha_fin).toLocaleDateString('es-ES') : 'N/R'}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.prioridad === 'alta' ? 'bg-rose-100 text-rose-800' : t.prioridad === 'media' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>{t.prioridad}</span>
                        </td>
                        <td className="p-2.5 text-center uppercase text-slate-700 font-bold">
                          {t.responsables ? t.responsables.split(',').map((r, i) => (
                            <span key={i} className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-medium border border-amber-200 mr-1 mb-0.5">{r.trim()}</span>
                          )) : '-'}
                        </td>
                        <td className="p-2.5 text-center">
                          {puedeEliminar && <button type="button" onClick={() => handleEliminarTareaNoRutinaria(t.id)} className="text-rose-600 hover:text-rose-800 font-bold">Quitar</button>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3">
              <button type="submit" disabled={loading} className={`text-white text-sm font-semibold px-6 py-2.5 rounded-lg shadow-md transition-all flex items-center space-x-2 ${loading ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 active:scale-[0.98]'}`}>
                {loading ? <span>Guardando...</span> : <span>Guardar Reporte No Rutinario</span>}
              </button>
            </div>
          </form>
        )}

        {/* Historial */}
        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Historial de Reportes Semanales</h3>
          {historicoReportes.length === 0 ? (
            <div className="text-sm text-slate-400 bg-slate-50 border border-dashed border-slate-200 p-8 rounded-xl text-center">No hay registros completados guardados en esta sesión.</div>
          ) : (
            <div className="space-y-3">
              {historicoReportes.map((reporte) => {
                const esSemanaActual = reporte.semanaTexto === semanaActual;
                return (
                  <div key={reporte.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl transition-colors gap-4 ${esSemanaActual ? 'bg-blue-50 border-blue-300 shadow-md' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'}`}>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm font-bold ${esSemanaActual ? 'text-blue-700' : 'text-slate-700'}`}>{reporte.semanaTexto}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${reporte.tipoReporte === 'rutinarias' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                          {reporte.tipoReporte === 'rutinarias' ? 'Rutinario' : 'No Rutinario'}
                        </span>
                        {esSemanaActual && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Semana Actual</span>}
                      </div>
                      <p className="text-xs text-slate-400">Procesado a las {reporte.hora}</p>
                      {reporte.tipoReporte === 'no_rutinarias' && (
                        <div className="mt-2 bg-amber-50/50 border border-amber-100 p-2 rounded-lg max-w-xl">
                          <ul className="list-disc pl-4 text-[11px] text-slate-600 uppercase space-y-0.5">
                            {reporte.tareasNoRutinarias.map((tnr, idx) => (
                              <li key={idx}><strong>[{tnr.prioridad}]</strong> {tnr.descripcion} - {tnr.dia_asignado} ({tnr.responsables || 'Soporte IT'})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => lanzarDescargaPDF(reporte)} className="text-xs font-semibold text-white bg-emerald-600 px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors self-start md:self-center">
                      Descargar PDF
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* VISTA DE IMPRESIÓN - SOLO EL CONTENIDO, SIN HEADER NI SIDEBAR */}
      {/* ============================================================ */}
      {reporteParaImprimir && (
        <div className="print-content hidden print:block bg-white text-black p-0 font-sans">
          <style>{`
            @media print {
              /* Ocultar todo excepto el contenido de impresión */
              body * {
                visibility: hidden !important;
              }
              .print-content, .print-content * {
                visibility: visible !important;
              }
              .print-content {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
                padding: 1cm !important;
                margin: 0 !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                min-height: 100vh !important;
              }
              @page {
                size: landscape;
                margin: 0;
              }
              body {
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              table {
                width: 100% !important;
                border-collapse: collapse;
                margin-top: 6px;
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              th, td {
                border: 1px solid #000 !important;
                padding: 2px 4px !important;
                text-align: center;
                font-size: 7px !important;
                text-transform: uppercase;
                line-height: 1.3;
              }
              th {
                background-color: #e5e7eb !important;
                font-weight: bold;
              }
              .text-left-print {
                text-align: left !important;
              }
              .bg-gray-50 {
                background-color: #f9fafb !important;
              }
              .bg-gray-200 {
                background-color: #e5e7eb !important;
              }
              .bg-gray-100 {
                background-color: #f3f4f6 !important;
              }
              .print-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 2px solid #000;
                padding-bottom: 6px;
                margin-bottom: 10px;
              }
              .print-header-left {
                width: 20%;
                display: flex;
                justify-content: flex-start;
              }
              .print-header-center {
                width: 60%;
                text-align: center;
              }
              .print-header-right {
                width: 20%;
                text-align: right;
                font-weight: bold;
                font-size: 9px;
              }
              .print-header-center h1 {
                font-size: 12px;
                font-weight: bold;
                margin: 0;
                line-height: 1.2;
                text-transform: uppercase;
              }
              .print-header-center h2 {
                font-size: 10px;
                font-weight: bold;
                margin: 0;
                line-height: 1.2;
                text-transform: uppercase;
              }
              .print-header-center h3 {
                font-size: 9px;
                font-weight: bold;
                margin: 0;
                line-height: 1.2;
                text-transform: uppercase;
              }
              .print-section-title {
                text-align: left;
                font-weight: bold;
                font-size: 8px;
                background-color: #e5e7eb;
                padding: 3px 6px;
                border: 1px solid #000;
                text-transform: uppercase;
              }
              .print-content-main {
                flex: 1;
              }
              .print-footer {
                margin-top: auto !important;
                padding-top: 8px;
                display: flex;
                justify-content: center;
                border-top: 1px solid #000;
                page-break-inside: avoid;
              }
              .print-footer div {
                width: 33.33%;
                text-align: center;
              }
              .print-footer .firma-nombre {
                font-weight: bold;
                font-size: 10px;
                text-transform: uppercase;
              }
              .print-footer .firma-cargo {
                font-size: 8px;
                font-weight: bold;
                text-transform: uppercase;
              }
              td {
                word-break: break-word;
                white-space: normal;
              }
              th:first-child, td:first-child {
                width: 28% !important;
                text-align: left !important;
                padding-left: 6px !important;
              }
            }
          `}</style>

          {/* ENCABEZADO CON LOGO Y CÓDIGO DINÁMICO */}
          <div className="print-header">
            <div className="print-header-left">
              <img src={logoEmpresa} alt="Transmandu" className="max-h-10 object-contain" />
            </div>
            <div className="print-header-center">
              <h1>
                {reporteParaImprimir.tipoReporte === 'rutinarias' 
                  ? 'CRONOGRAMA DE ACTIVIDADES RUTINARIAS' 
                  : 'CRONOGRAMA DE ACTIVIDADES NO RUTINARIAS'}
              </h1>
              <h2>JEFATURA DE SOPORTE TÉCNICO</h2>
              <h3>{reporteParaImprimir.semanaTexto}</h3>
            </div>
            <div className="print-header-right">
              {reporteParaImprimir.codigo || 'TMD-DIP-CRO-00001'}
            </div>
          </div>

          <div className="print-content-main">
            {reporteParaImprimir.tipoReporte === 'rutinarias' ? (
              <div className="space-y-3">
                {(reporteParaImprimir.seccionesSnapshot || seccionesRutinarias).map((seccion) => (
                  <div key={seccion.id} style={{ pageBreakInside: 'avoid', marginBottom: '12px' }}>
                    <div className="print-section-title">{seccion.titulo}</div>
                    <table className="w-full border-collapse border border-black">
                      <thead>
                        <tr>
                          <th className="border border-black p-1 text-left font-bold">SISTEMA / DISPOSITIVO</th>
                          {DIAS_SEMANA.map(d => <th key={d.clave} className="border border-black p-1 font-bold">{d.nombre}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {seccion.tipoContenido !== 'mixed_backups' ? (
                          seccion.items.map((item) => (
                            <tr key={item.id}>
                              <td className="border border-black p-1 font-bold text-left-print bg-gray-50">{item.nombre}</td>
                              {DIAS_SEMANA.map(dia => (
                                <td key={dia.clave} className="border border-black p-1 whitespace-pre-wrap">
                                  {renderDataImpresion(seccion, item, dia, null, reporteParaImprimir.datos)}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          // 🔹 SECCIÓN MIXED_BACKUPS en la vista de impresión: subtablas + responsable
                          <>
                            {seccion.subtablas.map((sub) => (
                              <React.Fragment key={sub.id}>
                                <tr className="bg-gray-100 font-bold">
                                  <td colSpan={DIAS_SEMANA.length + 1} className="border border-black p-1 text-left-print">{sub.tituloSub}</td>
                                </tr>
                                {sub.items.map((item) => (
                                  <tr key={item.id}>
                                    <td className="border border-black p-1 font-bold text-left-print bg-gray-50 pl-4">{item.nombre}</td>
                                    {DIAS_SEMANA.map(dia => (
                                      <td key={dia.clave} className="border border-black p-1 whitespace-pre-wrap">
                                        {renderDataImpresion(seccion, item, dia, sub, reporteParaImprimir.datos)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))}
                            {/* FILA DE RESPONSABLE para mixed_backups en PDF */}
                            <tr className="bg-gray-50">
                              <td className="border border-black p-1 font-bold text-right pr-2">RESPONSABLE:</td>
                              {DIAS_SEMANA.map((dia) => (
                                <td key={dia.clave} className="border border-black p-1 font-bold italic text-[7px]">
                                  {reporteParaImprimir.datos[`responsable_${seccion.id}_${dia.clave}_nombre`] || '-'}
                                </td>
                              ))}
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ pageBreakInside: 'avoid' }}>
                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-1">Descripción</th>
                      <th className="border border-black p-1">Día Base</th>
                      <th className="border border-black p-1">Fechas</th>
                      <th className="border border-black p-1">Prioridad</th>
                      <th className="border border-black p-1">Responsables</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporteParaImprimir.tareasNoRutinarias.map((t, i) => (
                      <tr key={i}>
                        <td className="border border-black p-1 text-left-print">{t.descripcion}</td>
                        <td className="border border-black p-1">{t.dia_asignado}</td>
                        <td className="border border-black p-1">
                          {t.fecha_inicio ? new Date(t.fecha_inicio).toLocaleDateString('es-ES') : 'N/R'} 
                          {' '}al{' '} 
                          {t.fecha_fin ? new Date(t.fecha_fin).toLocaleDateString('es-ES') : 'N/R'}
                        </td>
                        <td className="border border-black p-1">{t.prioridad}</td>
                        <td className="border border-black p-1">{t.responsables}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="print-footer">
            <div>
              <div className="firma-nombre">JONATHAN MORILLO</div>
              <div className="firma-cargo">AUTORIZADO POR</div>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      <ModalAgregarItem isOpen={modalAgregar.isOpen} onClose={() => setModalAgregar(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmarAccionItem} titulo={modalAgregar.modo === 'agregar' ? 'Nuevo Sistema/Dispositivo' : 'Editar Sistema/Dispositivo'} valorInicial={modalAgregar.nombre} placeholder="Ej: Servidor NAS-02" />
      <ModalAgregarItem isOpen={modalEditarTitulo.isOpen} onClose={() => setModalEditarTitulo(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmarEditarTitulo} titulo="Editar Título de la Tarea" valorInicial={modalEditarTitulo.tituloActual} placeholder="Nuevo título de la tarea..." />
      <ModalTarea isOpen={modalTareaOpen} onClose={() => { setModalTareaOpen(false); setTareaAEditar(null); setModalTareaSoloRutinaria(false); }} tareaAEditar={tareaAEditar} onGuardar={handleGuardarTarea} soloRutinaria={modalTareaSoloRutinaria} />
    </div>
  );
}
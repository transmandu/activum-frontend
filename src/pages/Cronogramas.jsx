// src/pages/Cronogramas.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Calendar, Clock, ChevronRight, Search,
  CheckCircle2, ChevronDown, FileText, AlertCircle,
  ClipboardList, X, CalendarDays, Filter, BarChart3, ListChecks,
  Edit2, Trash2
} from 'lucide-react';
import ModalCronograma from '../components/modals/ModalCronograma';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useData } from '../context/DataContext';
import api from '../services/api';
import logoEmpresa from '../assets/logo-empresa.png';

// ============================================================
// AUXILIARES
// ============================================================
const horasOpciones = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutosOpciones = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const ampmOpciones = ['AM', 'PM'];

const parseHoraParaSelect = (horaStr) => {
  if (!horaStr) return { hora: '12', minuto: '00', ampm: 'AM' };
  const match = horaStr.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
  if (match) {
    const hora = parseInt(match[1], 10);
    const minuto = match[2];
    const ampm = match[3].toUpperCase();
    return { hora: hora.toString().padStart(2, '0'), minuto, ampm };
  }
  return { hora: '12', minuto: '00', ampm: 'AM' };
};

const formatearHoraDesdeSelect = (hora, minuto, ampm) => `${hora}:${minuto} ${ampm}`;

const MESES_ANIO = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const FRECUENCIAS_CICLO = [
  { id: 'mensual', nombre: 'Mensual', dias: 30 },
  { id: 'trimestral', nombre: 'Trimestral', dias: 90 },
  { id: 'semestral', nombre: 'Semestral', dias: 180 },
  { id: 'anual', nombre: 'Anual', dias: 365 },
  { id: 'personalizado', nombre: 'Personalizado', dias: null }
];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Función segura para parsear fechas "YYYY-MM-DD" sin desfases de zona horaria
const parseFechaSegura = (fecha) => {
  if (!fecha) return new Date();
  if (typeof fecha === 'string') {
    const cleanDate = fecha.split('T')[0];
    const [y, m, d] = cleanDate.split('-');
    if (y && m && d) {
      return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    }
  }
  return fecha instanceof Date ? fecha : new Date(fecha);
};

const obtenerSemanasDelMes = (anio, mes) => {
  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0);
  const semanas = [];
  let semanaActual = [];
  let diaSemana = primerDia.getDay();
  const startOffset = diaSemana === 0 ? 6 : diaSemana - 1;
  let fechaInicio = new Date(anio, mes, 1 - startOffset);
  
  while (fechaInicio <= ultimoDia || semanaActual.length > 0) {
    if (semanaActual.length === 7) {
      semanas.push([...semanaActual]);
      semanaActual = [];
    }
    if (fechaInicio.getMonth() === mes || (fechaInicio < primerDia && semanaActual.length === 0)) {
      semanaActual.push({
        fecha: new Date(fechaInicio),
        dia: fechaInicio.getDate(),
        mes: fechaInicio.getMonth(),
        esMesActual: fechaInicio.getMonth() === mes,
        esDiaHoy: fechaInicio.toDateString() === new Date().toDateString()
      });
    } else if (semanaActual.length > 0) {
      semanaActual.push({
        fecha: new Date(fechaInicio),
        dia: fechaInicio.getDate(),
        mes: fechaInicio.getMonth(),
        esMesActual: false,
        esDiaHoy: false
      });
    }
    fechaInicio.setDate(fechaInicio.getDate() + 1);
  }
  return semanas;
};

const calcularProximaFecha = (fechaBase, dias) => {
  const nuevaFecha = new Date(fechaBase);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);
  return nuevaFecha;
};

const formatearFecha = (fecha) => {
  if (!fecha) return 'No programado';
  const fechaObj = parseFechaSegura(fecha);
  return fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

const obtenerSemanaDelMes = (fecha) => {
  const fechaObj = parseFechaSegura(fecha);
  const primerDia = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), 1);
  const diaSemanaPrimero = primerDia.getDay();
  const diaMes = fechaObj.getDate();
  const semana = Math.ceil((diaMes + (diaSemanaPrimero === 0 ? 6 : diaSemanaPrimero - 1)) / 7);
  return `Semana ${semana}`;
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const Cronogramas = () => {
  const {
    cronogramas = [],
    activos = [],
    asignaciones = [],
    departamentos = [],
    agregarCronograma,
    actualizarCronograma,
    eliminarCronograma,
    cargarCronogramas,
    userPermissions
  } = useData();

  const puedeCrear = userPermissions.includes('crear_cronogramas');
  const puedeEditar = userPermissions.includes('editar_cronogramas');
  const puedeEliminar = userPermissions.includes('eliminar_cronogramas');

  const [mantenimientosBD, setMantenimientosBD] = useState({});

  const departamentosJerarquicos = useMemo(() => {
    if (!departamentos || departamentos.length === 0) return [];
    const deptosMap = {};
    departamentos.forEach(d => {
      deptosMap[d.id] = { ...d, hijos: [] };
    });
    const raices = [];
    Object.values(deptosMap).forEach(depto => {
      if (depto.padre_id && deptosMap[depto.padre_id]) {
        deptosMap[depto.padre_id].hijos.push(depto);
      } else {
        raices.push(depto);
      }
    });
    const anidar = (nodo) => {
      if (nodo.hijos && nodo.hijos.length > 0) {
        nodo.hijos = nodo.hijos.map(h => anidar(h));
      }
      return nodo;
    };
    return raices.map(r => anidar(r));
  }, [departamentos]);

  // ===== ESTADOS =====
  const [vistaActual, setVistaActual] = useState('departamental');
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [semanasDelMes, setSemanasDelMes] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [mostrarDetalleEvento, setMostrarDetalleEvento] = useState(false);
  const [filtroDepartamentoSemanal, setFiltroDepartamentoSemanal] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cronogramaAEditar, setCronogramaAEditar] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMes, setSelectedMes] = useState('mayo');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [expandedCronogramas, setExpandedCronogramas] = useState({});
  const [programacionDeptos, setProgramacionDeptos] = useState({});
  const [expandedAssets, setExpandedAssets] = useState({});
  const [expandedSubs, setExpandedSubs] = useState({});

  const [historialMantenimientos, setHistorialMantenimientos] = useState([]);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyFilterEstado, setHistoryFilterEstado] = useState('todos');

  const [modalRegistro, setModalRegistro] = useState({
    isOpen: false, cronogramaId: null, deptoId: '', subId: '', activoId: null,
    activoNombre: '', nombreDepto: '', esDetector: false,
    frecuenciaId: '', diasPersonalizados: null,
    mes: '',
    semana: '',
    horario: '08:00 AM'
  });
  const [observacionDepto, setObservacionDepto] = useState('');

  const [modalCompletar, setModalCompletar] = useState({
    isOpen: false,
    mantenimientoId: null,
    activoId: null,
    activoNombre: ''
  });
  const [observacionEjecucion, setObservacionEjecucion] = useState('');

  // ===== EFECTOS =====
  useEffect(() => {
    const semanas = obtenerSemanasDelMes(anioActual, mesActual);
    setSemanasDelMes(semanas);
  }, [anioActual, mesActual]);

  useEffect(() => {
    cargarCronogramas();
  }, []);

  const recargarMantenimientos = async () => {
    if (!activos || activos.length === 0) return;
    try {
      const response = await api.get('/activos/mantenimientos');
      const mantenimientosData = response.data || [];

      const nuevosMantenimientosBD = {};
      const nuevoHistorial = [];
      const nuevaProgramacion = { ...programacionDeptos };

      mantenimientosData.forEach((record) => {
        const activo = record.activo;
        if (!activo) return;

        const activoId = activo.id;
        nuevosMantenimientosBD[activoId] = record;

        const estadoMostrar = record.fecha_completado ? 'Completado' : 'Pendiente';

        const etiquetaCodigo = activo.codigo || activo.etiqueta;
        const nombreConEtiqueta = etiquetaCodigo
          ? `${etiquetaCodigo} - ${activo.nombre || 'Activo'}`
          : (activo.nombre || 'Activo');

        const log = {
          id: record.id,
          activoId: activoId,
          activoNombre: nombreConEtiqueta,
          frecuencia: record.frecuencia || 'Mensual',
          frecuenciaDias: record.frecuencia_dias || 30,
          observacion: record.observacion_planificada || record.observacion || 'Sin observación',
          observacionEjecutada: record.observacion_ejecutada || '',
          fechaCierre: record.fecha_completado
            ? formatearFecha(record.ultimo_mantenimiento || record.fecha_completado)
            : (record.proximo_mantenimiento ? formatearFecha(record.proximo_mantenimiento) : 'No programado'),
          proximaFecha: record.proximo_mantenimiento
            ? formatearFecha(record.proximo_mantenimiento)
            : 'No programado',
          estado: estadoMostrar,
          esDepto: false,
          completadoEl: record.fecha_completado
            ? formatearFecha(record.fecha_completado)
            : null,
        };
        nuevoHistorial.push(log);

        if (record.cronograma_id) {
          const cronograma = cronogramas.find(c => c.id === record.cronograma_id);
          if (cronograma) {
            const deptoId = activo.departamento_id;
            const subId = activo.subdivision_id;
            const key = subId ? `${deptoId}_${subId}` : deptoId;
            const cronKey = `cron_${record.cronograma_id}_${key}`;

            if (!nuevaProgramacion[cronKey]) {
              nuevaProgramacion[cronKey] = {};
            }

            nuevaProgramacion[cronKey] = {
              ...nuevaProgramacion[cronKey],
              estado: record.fecha_completado ? 'Completado' : 'Programado',
              ultimoMantenimiento: record.ultimo_mantenimiento || null,
              proximoMantenimiento: record.proximo_mantenimiento || null,
              proximoMes: record.proximo_mantenimiento
                ? MESES_ANIO[parseFechaSegura(record.proximo_mantenimiento).getMonth()]
                : null,
              proximoSemana: record.proximo_mantenimiento
                ? obtenerSemanaDelMes(record.proximo_mantenimiento)
                : null,
              frecuencia: cronograma.frecuencia_original || 'mensual',
              mes: cronograma.mes || '',
              semana: cronograma.semana || '',
              horario: cronograma.hora || '08:00 AM',
            };
          }
        }
      });

      setMantenimientosBD(nuevosMantenimientosBD);
      setHistorialMantenimientos(nuevoHistorial);
      setProgramacionDeptos(nuevaProgramacion);

    } catch (error) {
      console.error('Error recargando mantenimientos:', error);
    }
  };

  useEffect(() => {
    recargarMantenimientos();
  }, [activos, cronogramas]);

  const obtenerNombreDepartamento = (id) => {
    if (!id) return 'Sin departamento';
    const depto = departamentos.find(d => d.id === id);
    return depto ? depto.nombre : 'No especificado';
  };

  const obtenerActivosPorEntidad = (nombreEntidad, esSubdivision = false, categoriaId = null) => {
    if (!activos) return [];
    let activosPorJefatura = [];
    if (!esSubdivision) {
      activosPorJefatura = activos.filter(a =>
        a.direccion_jefatura?.toLowerCase().trim() === nombreEntidad?.toLowerCase().trim()
      );
    }
    const asignacionesActivas = asignaciones.filter(asg => asg.estado_acta !== 'Anulada');
    const activosDesdeAsignaciones = [];
    asignacionesActivas.forEach(asg => {
      let coincide = false;
      if (esSubdivision) {
        coincide = asg.subdivision?.toLowerCase().trim() === nombreEntidad?.toLowerCase().trim();
      } else {
        coincide = asg.departamento?.nombre?.toLowerCase().trim() === nombreEntidad?.toLowerCase().trim() ||
          (asg.departamento_id && obtenerNombreDepartamento(asg.departamento_id).toLowerCase().trim() === nombreEntidad?.toLowerCase().trim());
      }
      if (coincide && asg.activos && asg.activos.length) {
        asg.activos.forEach(act => {
          if (!activosDesdeAsignaciones.some(a => a.id === act.id)) {
            activosDesdeAsignaciones.push(act);
          }
        });
      }
    });
    const combinados = [...activosPorJefatura];
    activosDesdeAsignaciones.forEach(act => {
      if (!combinados.some(a => a.id === act.id)) {
        combinados.push(act);
      }
    });

    if (categoriaId) {
      return combinados.filter(a => a.categoria_id === categoriaId);
    }

    return combinados;
  };

  const obtenerMantenimientoActivoLocal = (activoId) => {
    return mantenimientosBD[activoId] || null;
  };

  const toggleCronograma = (id) => {
    setExpandedCronogramas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAssets = (id, e) => {
    if (e) e.stopPropagation();
    setExpandedAssets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubs = (id) => {
    setExpandedSubs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const obtenerDiasPorFrecuencia = (frecuenciaId, diasPersonalizados = null) => {
    const frecuencia = FRECUENCIAS_CICLO.find(f => f.id === frecuenciaId);
    if (!frecuencia) return 30;
    if (frecuencia.id === 'personalizado' && diasPersonalizados) return parseInt(diasPersonalizados, 10);
    return frecuencia.dias;
  };

  const handleCambioPlanificacion = (cronogramaId, deptoId, subId, campo, valor) => {
    const key = subId ? `${deptoId}_${subId}` : deptoId;
    const cronKey = `cron_${cronogramaId}_${key}`;
    setProgramacionDeptos(prev => ({
      ...prev,
      [cronKey]: { ...prev[cronKey], [campo]: valor, estado: prev[cronKey]?.estado || 'Programado' }
    }));
  };

  const handleHoraChange = (cronogramaId, deptoId, subId, parte, valor) => {
    const key = subId ? `${deptoId}_${subId}` : deptoId;
    const cronKey = `cron_${cronogramaId}_${key}`;
    const actual = programacionDeptos[cronKey] || {};
    const parsed = parseHoraParaSelect(actual.horario);
    const nuevo = { ...parsed, [parte]: valor };
    const nuevoHorario = formatearHoraDesdeSelect(nuevo.hora, nuevo.minuto, nuevo.ampm);
    setProgramacionDeptos(prev => ({
      ...prev,
      [cronKey]: { ...prev[cronKey], horario: nuevoHorario, estado: prev[cronKey]?.estado || 'Programado' }
    }));
  };

  const abrirPlanificar = (cronogramaId, deptoId, subId, nombreDepto, activoId = null, activoNombre = null, frecuenciaId = null, diasPersonalizados = null, mes = '', semana = '', horario = '08:00 AM') => {
    setModalRegistro({
      isOpen: true,
      cronogramaId,
      deptoId,
      subId,
      activoId,
      activoNombre,
      nombreDepto,
      esDetector: false,
      frecuenciaId,
      diasPersonalizados,
      mes,
      semana,
      horario
    });
    setObservacionDepto('');
  };

  const abrirCompletar = (log) => {
    setModalCompletar({
      isOpen: true,
      mantenimientoId: log.id,
      activoId: log.activoId,
      activoNombre: log.activoNombre
    });
    setObservacionEjecucion('');
  };

  // ============================================================
  // PLANIFICAR 
  // ============================================================
  const guardarPlanificacion = async () => {
    if (!observacionDepto.trim()) {
      alert("Por favor, ingrese una observación de lo que se va a realizar.");
      return;
    }

    if (!modalRegistro.mes || !modalRegistro.semana) {
      alert("Debe seleccionar un mes y una semana en la configuración del cronograma antes de planificar.");
      return;
    }

    let fechaPlanificacion = new Date();
    const mesNombre = modalRegistro.mes;
    const semanaStr = modalRegistro.semana;

    if (mesNombre && semanaStr) {
      const mesNum = MESES_ANIO.findIndex(m => m.toLowerCase() === mesNombre.toLowerCase());
      if (mesNum !== -1) {
        const semanaNum = parseInt(semanaStr.replace(/[^\d]/g, ''), 10);
        if (!isNaN(semanaNum) && semanaNum >= 1 && semanaNum <= 6) {
          const hoy = new Date();
          let anio = hoy.getFullYear();

          let diaInicio = (semanaNum - 1) * 7 + 1;
          const maxDiasMes = new Date(anio, mesNum + 1, 0).getDate();
          if (diaInicio > maxDiasMes) diaInicio = maxDiasMes;

          fechaPlanificacion = new Date(anio, mesNum, diaInicio);

          if (fechaPlanificacion < hoy && (hoy.getMonth() > mesNum)) {
            fechaPlanificacion.setFullYear(anio + 1);
          }
        }
      }
    }

    const horario = modalRegistro.horario || '08:00 AM';
    try {
      const horaParse = parseHoraParaSelect(horario);
      let horas = parseInt(horaParse.hora, 10);
      if (horaParse.ampm === 'PM' && horas !== 12) horas += 12;
      if (horaParse.ampm === 'AM' && horas === 12) horas = 0;
      fechaPlanificacion.setHours(horas, parseInt(horaParse.minuto, 10), 0, 0);
    } catch (e) {}

    const yyyy = fechaPlanificacion.getFullYear();
    const mm = String(fechaPlanificacion.getMonth() + 1).padStart(2, '0');
    const dd = String(fechaPlanificacion.getDate()).padStart(2, '0');
    const fechaPlanificacionStr = `${yyyy}-${mm}-${dd}`;

    if (modalRegistro.activoId) {
      const frecuenciaId = modalRegistro.frecuenciaId || 'mensual';
      const frecuenciaDias = obtenerDiasPorFrecuencia(frecuenciaId, modalRegistro.diasPersonalizados);
      const activoIdReal = Number(modalRegistro.activoId);

      if (isNaN(activoIdReal) || activoIdReal <= 0) {
        alert(`ID de activo inválido: ${modalRegistro.activoId}`);
        return;
      }

      try {
        const payload = {
          cronograma_id: modalRegistro.cronogramaId || null,
          frecuencia: FRECUENCIAS_CICLO.find(f => f.id === frecuenciaId)?.nombre || 'Mensual',
          frecuencia_dias: frecuenciaDias,
          ultimo_mantenimiento: null,
          proximo_mantenimiento: fechaPlanificacionStr,
          estado: 'Pendiente',
          observacion_planificada: observacionDepto,
          observacion_ejecutada: null,
          fecha_completado: null,
        };

        const response = await api.post(`/activos/${activoIdReal}/mantenimiento`, payload);

        if (response.status === 200 || response.status === 201) {
          await recargarMantenimientos();
          alert('✅ Mantenimiento planificado correctamente.');
        } else {
          throw new Error('Respuesta inesperada del servidor');
        }
      } catch (error) {
        console.error('❌ Error al planificar mantenimiento:', error);
        alert('Error al planificar el mantenimiento.');
        return;
      }
    } else {
      const { cronogramaId, deptoId, subId, nombreDepto } = modalRegistro;
      const key = subId ? `${deptoId}_${subId}` : deptoId;
      const cronKey = `cron_${cronogramaId}_${key}`;
      const datosActuales = programacionDeptos[cronKey] || {};
      const frecuenciaId = datosActuales.frecuencia || 'mensual';
      const frecuenciaDias = obtenerDiasPorFrecuencia(frecuenciaId, datosActuales.diasPersonalizados);

      const semanaProxima = obtenerSemanaDelMes(fechaPlanificacion);
      const mesProxima = MESES_ANIO[fechaPlanificacion.getMonth()];

      const nuevoLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        area: nombreDepto,
        mesEjecutado: modalRegistro.mes || datosActuales.mes || 'N/A',
        semanaEjecutada: modalRegistro.semana || datosActuales.semana || 'N/A',
        frecuencia: FRECUENCIAS_CICLO.find(f => f.id === frecuenciaId)?.nombre || 'Mensual',
        frecuenciaDias: frecuenciaDias,
        horario: modalRegistro.horario || datosActuales.horario || 'N/A',
        observaciones: observacionDepto,
        fechaCierre: formatearFecha(fechaPlanificacion),
        proximaFecha: formatearFecha(fechaPlanificacion),
        esDepto: true,
        estado: 'Pendiente'
      };
      setHistorialMantenimientos(prev => [nuevoLog, ...prev]);
      setProgramacionDeptos(prev => ({
        ...prev,
        [cronKey]: {
          ...prev[cronKey],
          estado: 'Pendiente',
          ultimoMantenimiento: null,
          proximoMantenimiento: fechaPlanificacionStr,
          proximoMes: mesProxima,
          proximoSemana: semanaProxima
        }
      }));
      alert('✅ Planificación de mantenimiento registrada.');
    }

    setModalRegistro({ isOpen: false, cronogramaId: null, deptoId: '', subId: '', activoId: null, activoNombre: '', nombreDepto: '', esDetector: false, frecuenciaId: '', diasPersonalizados: null, mes: '', semana: '', horario: '08:00 AM' });
    setObservacionDepto('');
  };

  // ============================================================
  // COMPLETAR MANTENIMIENTO
  // ============================================================
  const completarMantenimiento = async () => {
    if (!observacionEjecucion.trim()) {
      alert("Por favor, ingrese la observación de lo que se realizó.");
      return;
    }

    const { mantenimientoId, activoId } = modalCompletar;
    if (!mantenimientoId || !activoId) {
      alert('Faltan datos para completar el mantenimiento.');
      return;
    }

    try {
      const mantenimientoActual = mantenimientosBD[activoId];
      if (!mantenimientoActual) {
        alert('No se encontró el mantenimiento.');
        return;
      }

      const frecuenciaNombre = mantenimientoActual.frecuencia || 'Mensual';
      const frecuenciaDias = FRECUENCIAS_CICLO.find(f => f.nombre === frecuenciaNombre)?.dias || 30;

      let fechaBase = new Date();
      if (mantenimientoActual.proximo_mantenimiento) {
        fechaBase = parseFechaSegura(mantenimientoActual.proximo_mantenimiento);
      }

      const proximaFecha = calcularProximaFecha(fechaBase, frecuenciaDias);

      const hoy = new Date();
      const yyyyHoy = hoy.getFullYear();
      const mmHoy = String(hoy.getMonth() + 1).padStart(2, '0');
      const ddHoy = String(hoy.getDate()).padStart(2, '0');
      const hoyStr = `${yyyyHoy}-${mmHoy}-${ddHoy}`;

      const yyyyProx = proximaFecha.getFullYear();
      const mmProx = String(proximaFecha.getMonth() + 1).padStart(2, '0');
      const ddProx = String(proximaFecha.getDate()).padStart(2, '0');
      const proximaFechaStr = `${yyyyProx}-${mmProx}-${ddProx}`;

      const payload = {
        estado: 'Pendiente',
        observacion_ejecutada: observacionEjecucion,
        fecha_completado: hoyStr,
        ultimo_mantenimiento: hoyStr,
        proximo_mantenimiento: proximaFechaStr,
        frecuencia: mantenimientoActual.frecuencia,
        frecuencia_dias: frecuenciaDias,
        cronograma_id: mantenimientoActual.cronograma_id,
        observacion_planificada: mantenimientoActual.observacion_planificada || mantenimientoActual.observacion,
      };

      const response = await api.post(`/activos/${activoId}/mantenimiento`, payload);

      if (response.status === 200 || response.status === 201) {
        await recargarMantenimientos();
        alert(`✅ Mantenimiento completado correctamente. Próximo ciclo programado para: ${proximaFechaStr}`);
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('❌ Error al completar mantenimiento:', error);
      alert('Error al completar el mantenimiento. Revisa la consola.');
    }

    setModalCompletar({ isOpen: false, mantenimientoId: null, activoId: null, activoNombre: '' });
    setObservacionEjecucion('');
  };

  // ============================================================
  // HANDLERS DE CRUD DE CRONOGRAMAS
  // ============================================================
  const handleCrearCronograma = async (payload) => {
    try {
      await agregarCronograma(payload);
      await cargarCronogramas();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al crear cronograma:', error);
      alert('Error al crear la planificación.');
    }
  };

  const handleEditarCronograma = async (id, payload) => {
    try {
      await actualizarCronograma(id, payload);
      await cargarCronogramas();
      setCronogramaAEditar(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al editar cronograma:', error);
      alert('Error al editar la planificación.');
    }
  };

  const handleEliminarCronograma = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta planificación? Se eliminarán todos los datos asociados.')) return;
    try {
      await eliminarCronograma(id);
      await cargarCronogramas();
    } catch (error) {
      console.error('Error al eliminar cronograma:', error);
      alert('Error al eliminar la planificación.');
    }
  };

  const abrirModalCrear = () => {
    setCronogramaAEditar(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (cronograma) => {
    setCronogramaAEditar(cronograma);
    setIsModalOpen(true);
  };

  // ============================================================
  // FUNCIÓN PARA GENERAR REPORTE CON FORMATO INSTITUCIONAL (CORREGIDA)
  // ============================================================
  const handleDescargarReporteDepartamentos = (cronograma) => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ---------- LOGO ----------
      if (logoEmpresa) {
        try {
          doc.addImage(logoEmpresa, 'PNG', 14, 10, 40, 12);
        } catch (e) {
          console.warn('No se pudo cargar el logo:', e);
        }
      }

      // ---------- ENCABEZADO ----------
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('TRANSMANDU, C.A.', pageWidth / 2, 18, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('RIF: J-50000000-0', pageWidth / 2, 24, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('CONTROL DE MANTENIMIENTO PREVENTIVO', pageWidth / 2, 34, { align: 'center' });

      // Código y fecha alineados a la derecha
      const codigoActa = cronograma.codigo || 'CMP-DP-ST-0001';
      const fecha = cronograma.created_at ? new Date(cronograma.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(codigoActa, pageWidth - 14, 10, { align: 'right' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`FECHA: ${fecha}`, pageWidth - 14, 16, { align: 'right' });

      // ---------- OBTENER TODOS LOS DEPARTAMENTOS Y SUS ACTIVOS CON MANTENIMIENTO ----------
      const activosConMantenimiento = (activos || []).filter(a => mantenimientosBD[a.id]);

      // Recorremos la jerarquía de departamentos y siempre agregamos una fila
      const rows = [];
      let totalEquipos = 0;

      const recorrerJerarquia = (nodo, nivel = 0) => {
        // Activos de este departamento que tengan mantenimiento
        const activosNodo = activosConMantenimiento.filter(a => a.departamento_id === nodo.id);

        let descripcion = '—';
        if (activosNodo.length > 0) {
          descripcion = activosNodo.map(a => {
            const codigo = a.codigo || 'N/A';
            const nombre = a.nombre || '';
            const marca = a.marca?.nombre || '';
            const modelo = a.modelo || '';
            const partes = [codigo, nombre, marca, modelo].filter(p => p && p.trim() !== '');
            return partes.join(' - ');
          }).join('\n');
          totalEquipos += activosNodo.length;
        }

        const indent = '  '.repeat(nivel);
        const nombreConIndent = `${indent}${nodo.nombre}`;
        rows.push([nombreConIndent, descripcion]);

        // Recorrer hijos
        if (nodo.hijos && nodo.hijos.length > 0) {
          nodo.hijos.forEach(hijo => recorrerJerarquia(hijo, nivel + 1));
        }
      };

      // Recorremos todos los departamentos raíz (incluyendo los que no tienen activos)
      departamentosJerarquicos.forEach(depto => recorrerJerarquia(depto));

      // Si no hay filas (por ejemplo, no hay departamentos), mostrar mensaje
      if (rows.length === 0) {
        rows.push(['Sin departamentos registrados', '—']);
      }

      // ---------- TABLA ----------
      autoTable(doc, {
        startY: 44,
        head: [['ÁREA / DEPARTAMENTO', 'EQUIPOS ASIGNADOS']],
        body: rows,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10,
          valign: 'middle',
        },
        styles: {
          fontSize: 9,
          cellPadding: 2.5,
          valign: 'middle',
        },
        columnStyles: {
          0: { cellWidth: 70, halign: 'left' },
          1: { cellWidth: 'auto', halign: 'left' },
        },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = data.pageNumber;
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(`Página ${currentPage} de ${pageCount}`, pageWidth - 20, pageHeight - 8, { align: 'right' });
        }
      });

      // ---------- PIE DE PÁGINA ----------
      const finalY = doc.lastAutoTable.finalY + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Total de equipos en mantenimiento: ${totalEquipos}`, 14, finalY);

      // Firma centrada
      const firmaY = finalY + 14;
      const firmaX = pageWidth / 2;
      doc.setLineWidth(0.3);
      doc.line(firmaX - 40, firmaY, firmaX + 40, firmaY);
      doc.setFontSize(9);
      doc.text('JONATHAN MORILLO', firmaX, firmaY + 4, { align: 'center' });
      doc.text('AUTORIZADO POR', firmaX, firmaY + 9, { align: 'center' });

      doc.save(`Reporte_${cronograma.titulo.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte. Revisa la consola.');
    }
  };

  // ============================================================
  // RENDERIZADO - VISTA DEPARTAMENTAL
  // ============================================================
  const getBadgeEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pendiente': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const listaDepartamentosFiltro = useMemo(() => {
    const flat = [];
    const recorrer = (nodo) => {
      flat.push(nodo.nombre);
      if (nodo.hijos) nodo.hijos.forEach(recorrer);
    };
    departamentosJerarquicos.forEach(recorrer);
    return flat;
  }, [departamentosJerarquicos]);

  const noHayDepartamentos = departamentosJerarquicos.length === 0;

  const renderVistaDepartamental = () => (
    <div className="space-y-6">
      {cronogramas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 p-8 text-center">
          <p className="text-slate-400 text-sm">No hay planificaciones registradas. Crea una nueva usando el botón "Crear Planificación".</p>
        </div>
      ) : (
        cronogramas.map((cronograma) => {
          const estaExpandido = expandedCronogramas[cronograma.id] || false;
          const cronId = cronograma.id;

          return (
            <div key={cronId} className="bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden">
              <div
                className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleCronograma(cronId)}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="text-slate-500" size={18} />
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">{cronograma.titulo}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {cronograma.frecuencia || 'Mensual'} · {cronograma.estado || 'Programado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  {puedeEditar && (
                    <button onClick={() => abrirModalEditar(cronograma)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                      <Edit2 size={15} />
                    </button>
                  )}
                  {puedeEliminar && (
                    <button onClick={() => handleEliminarCronograma(cronId)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                  <button onClick={() => handleDescargarReporteDepartamentos(cronograma)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-all">
                    <FileText size={13} className="text-red-500" /> Descargar Reporte
                  </button>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${estaExpandido ? '' : '-rotate-90'}`} />
                </div>
              </div>

              {estaExpandido && (
                <div className="p-4 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-full max-w-xs shadow-xs">
                      <Search size={14} className="text-slate-400" />
                      <input type="text" placeholder="Filtrar departamentos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent border-0 text-xs focus:outline-none text-slate-700 font-medium" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select value={selectedMes} onChange={(e) => setSelectedMes(e.target.value)} className="p-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-md shadow-xs focus:outline-none focus:border-blue-500">
                        {MESES_ANIO.map((m) => <option key={m.toLowerCase()} value={m.toLowerCase()}>{m}</option>)}
                      </select>
                      <select value={selectedEstado} onChange={(e) => setSelectedEstado(e.target.value)} className="p-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-md shadow-xs focus:outline-none focus:border-blue-500">
                        <option value="">Todos los Estados</option>
                        <option value="Programado">Programado</option>
                        <option value="Completado">Completado</option>
                      </select>
                    </div>
                  </div>

                  <div className="border border-slate-200/70 rounded-xl overflow-hidden divide-y divide-slate-100 mt-4">
                    {noHayDepartamentos ? (
                      <div className="p-6 text-center text-xs text-slate-400">No hay departamentos registrados.</div>
                    ) : (
                      departamentosJerarquicos
                        .filter(d => d.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((depto) => {
                          const tieneSub = depto.hijos && depto.hijos.length > 0;
                          const keyPadre = depto.id;
                          const cronKey = `cron_${cronId}_${keyPadre}`;
                          const progPadre = programacionDeptos[cronKey] || { frecuencia: 'mensual', estado: 'Programado', mes: '', semana: '', horario: '', ultimoMantenimiento: null, proximoMantenimiento: null };
                          
                          const activosDepto = obtenerActivosPorEntidad(depto.nombre, false, cronograma.categoria_id);
                          const totalActivosSub = tieneSub ? depto.hijos.reduce((total, sub) => total + obtenerActivosPorEntidad(sub.nombre, true, cronograma.categoria_id).length, 0) : 0;
                          
                          if (selectedEstado && progPadre.estado !== selectedEstado && !tieneSub) return null;
                          const horaObj = parseHoraParaSelect(progPadre.horario);

                          return (
                            <div key={`${cronId}-depto-${depto.id}`} className="bg-white flex flex-col">
                              <div className="p-3.5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                                <div className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer" onClick={(e) => { if (tieneSub) { e.stopPropagation(); toggleSubs(depto.id); } else toggleAssets(depto.id, e); }}>
                                  {tieneSub ? <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expandedSubs[depto.id] ? 'rotate-0' : '-rotate-90'}`} /> : <ChevronRight size={16} className="text-slate-300" />}
                                  <span className="text-xs font-bold text-slate-700 flex-1">{depto.nombre}</span>
                                  {!tieneSub && <span className="px-2 py-0.5 text-[10px] font-bold rounded-md border border-blue-100 uppercase bg-blue-50 text-blue-700">Mantenimiento</span>}
                                  {!tieneSub && <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold flex items-center gap-1">{activosDepto.length} Activos <ChevronDown size={10} className={`transform transition-transform ${expandedAssets[depto.id] ? 'rotate-180' : ''}`} /></span>}
                                  {tieneSub && totalActivosSub > 0 && <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">{totalActivosSub} Activos totales</span>}
                                </div>
                                {!tieneSub ? (
                                  <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <select value={progPadre.frecuencia} onChange={(e) => handleCambioPlanificacion(cronId, depto.id, null, 'frecuencia', e.target.value)} className="p-1 text-[11px] font-medium bg-slate-50 border border-slate-200 rounded text-slate-600">
                                      {FRECUENCIAS_CICLO.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                                    </select>
                                    {progPadre.frecuencia === 'personalizado' && <input type="number" min="1" placeholder="Días" value={progPadre.diasPersonalizados || ''} onChange={(e) => handleCambioPlanificacion(cronId, depto.id, null, 'diasPersonalizados', e.target.value)} className="p-1 text-[11px] font-medium bg-slate-50 border border-slate-200 rounded w-16" />}
                                    <select value={progPadre.mes} onChange={(e) => handleCambioPlanificacion(cronId, depto.id, null, 'mes', e.target.value)} className="p-1 text-[11px] font-medium bg-slate-50 border border-slate-200 rounded">
                                      <option value="">Seleccionar Mes</option>
                                      {MESES_ANIO.map(m => <option key={m.toLowerCase()} value={m.toLowerCase()}>{m}</option>)}
                                    </select>
                                    <select value={progPadre.semana} onChange={(e) => handleCambioPlanificacion(cronId, depto.id, null, 'semana', e.target.value)} className="p-1 text-[11px] font-medium bg-slate-50 border border-slate-200 rounded">
                                      <option value="">Semana</option><option value="Semana 1">Semana 1</option><option value="Semana 2">Semana 2</option><option value="Semana 3">Semana 3</option><option value="Semana 4">Semana 4</option>
                                    </select>
                                    <div className="flex gap-1 items-center">
                                      <select value={horaObj.hora} onChange={(e) => handleHoraChange(cronId, depto.id, null, 'hora', e.target.value)} className="p-1 text-[11px] font-medium bg-white border border-slate-200 rounded text-slate-600 w-16">
                                        {horasOpciones.map(h => <option key={h} value={h}>{h}</option>)}
                                      </select>
                                      <span className="text-slate-400">:</span>
                                      <select value={horaObj.minuto} onChange={(e) => handleHoraChange(cronId, depto.id, null, 'minuto', e.target.value)} className="p-1 text-[11px] font-medium bg-white border border-slate-200 rounded text-slate-600 w-16">
                                        {minutosOpciones.map(m => <option key={m} value={m}>{m}</option>)}
                                      </select>
                                      <select value={horaObj.ampm} onChange={(e) => handleHoraChange(cronId, depto.id, null, 'ampm', e.target.value)} className="p-1 text-[11px] font-medium bg-white border border-slate-200 rounded text-slate-600 w-16">
                                        {ampmOpciones.map(a => <option key={a} value={a}>{a}</option>)}
                                      </select>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${getBadgeEstadoColor(progPadre.estado)}`}>{progPadre.estado}</span>
                                    
                                    {puedeEditar && !cronograma.categoria_id && !progPadre.ultimoMantenimiento && (
                                      <button 
                                        onClick={() => abrirPlanificar(cronId, depto.id, null, depto.nombre, null, null, progPadre.frecuencia, progPadre.diasPersonalizados, progPadre.mes, progPadre.semana, progPadre.horario)} 
                                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
                                      >
                                        <CheckCircle2 size={12} /> Planificar
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic"></span>
                                )}
                              </div>

                              {!tieneSub && expandedAssets[depto.id] && (
                                <div className="p-3 bg-slate-50/50 border-t border-slate-100 shadow-inner">
                                  <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Activos Asignados</h4>
                                  {activosDepto.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {activosDepto.map(a => {
                                        const mantenimiento = obtenerMantenimientoActivoLocal(a.id);
                                        const frecuenciaUsada = progPadre.frecuencia || 'mensual';
                                        const diasPersonalizados = progPadre.diasPersonalizados;
                                        const tag = a.codigo || a.etiqueta;
                                        const nombreCompletoActivo = tag ? `${tag} - ${a.nombre}` : a.nombre;

                                        return (
                                          <div key={`act-${a.id}`} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2 shadow-sm">
                                            <div className="flex justify-between items-start">
                                              <div><span className="font-bold text-blue-600 font-mono text-xs">{tag}</span><span className="text-slate-600 text-[11px] truncate max-w-40 block">{a.nombre}</span></div>
                                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${a.estado?.nombre === 'Operativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : a.estado?.nombre === 'Asignado' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{a.estado?.nombre || a.estado}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-[9px] border-t border-dashed border-slate-100 pt-2">
                                              <div className="flex items-center gap-1"><CalendarDays size={10} className="text-slate-400" /><span className="font-medium text-slate-500">Ciclo:</span><span className="text-slate-700">{FRECUENCIAS_CICLO.find(f => f.id === frecuenciaUsada)?.nombre || 'Mensual'}</span></div>
                                              {mantenimiento && (
                                                <>
                                                  <div className="flex items-center gap-1">
                                                    <AlertCircle size={10} className="text-emerald-500" />
                                                    <span className="font-medium text-slate-500">Próx:</span>
                                                    <span className="text-emerald-600 font-mono">{formatearFecha(mantenimiento.proximo_mantenimiento)}</span>
                                                  </div>
                                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${mantenimiento.fecha_completado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                    {mantenimiento.fecha_completado ? 'Completado' : 'Pendiente'}
                                                  </span>
                                                </>
                                              )}
                                              {puedeEditar && !mantenimiento && (
                                                <button 
                                                  onClick={() => abrirPlanificar(cronId, depto.id, null, depto.nombre, a.id, nombreCompletoActivo, frecuenciaUsada, diasPersonalizados, progPadre.mes, progPadre.semana, progPadre.horario)} 
                                                  className="ml-auto flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-white bg-blue-500 hover:bg-blue-600 rounded disabled:bg-slate-300"
                                                >
                                                  <CheckCircle2 size={9} /> Planificar
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : <p className="text-[10px] text-slate-400 italic">No hay activos asignados a esta dependencia.</p>}
                                </div>
                              )}

                              {tieneSub && expandedSubs[depto.id] && (
                                <div className="bg-slate-50/30 pl-6 border-t border-slate-100/80 divide-y divide-slate-100">
                                  {depto.hijos.map((sub) => {
                                    const keySub = `${depto.id}_${sub.id}`;
                                    const cronKeySub = `cron_${cronId}_${keySub}`;
                                    const progSub = programacionDeptos[cronKeySub] || { frecuencia: 'mensual', estado: 'Programado', mes: '', semana: '', horario: '', ultimoMantenimiento: null, proximoMantenimiento: null };
                                    if (selectedEstado && progSub.estado !== selectedEstado) return null;
                                    
                                    const activosSub = obtenerActivosPorEntidad(sub.nombre, true, cronograma.categoria_id);
                                    const horaObjSub = parseHoraParaSelect(progSub.horario);

                                    return (
                                      <div key={`${cronId}-sub-${sub.id}`} className="flex flex-col border-b border-slate-100/50 last:border-0">
                                        <div className="p-3 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-600 hover:bg-slate-100/30 transition-colors">
                                          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={(e) => toggleAssets(sub.id, e)}>
                                            <ChevronRight size={14} className="text-slate-400" />
                                            <span className="font-semibold text-slate-600">{sub.nombre}</span>
                                            <span className="ml-2 px-1.5 py-0.5 bg-white border border-slate-200 text-slate-500 rounded text-[10px] font-bold flex items-center gap-1 shadow-xs">{activosSub.length} Activos <ChevronDown size={10} className={`transform transition-transform ${expandedAssets[sub.id] ? 'rotate-180' : ''}`} /></span>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <select value={progSub.frecuencia} onChange={(e) => handleCambioPlanificacion(cronId, depto.id, sub.id, 'frecuencia', e.target.value)} className="p-1 text-[11px] font-medium bg-white border border-slate-200 rounded">
                                              {FRECUENCIAS_CICLO.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                                            </select>
                                            {progSub.frecuencia === 'personalizado' && <input type="number" min="1" placeholder="Días" value={progSub.diasPersonalizados || ''} onChange={(e) => handleCambioPlanificacion(cronId, depto.id, sub.id, 'diasPersonalizados', e.target.value)} className="p-1 text-[11px] font-medium bg-white border border-slate-200 rounded w-16" />}
                                            <select value={progSub.mes} onChange={(e) => handleCambioPlanificacion(cronId, depto.id, sub.id, 'mes', e.target.value)} className="p-1 text-[11px] font-medium bg-white border border-slate-200 rounded">
                                              <option value="">Seleccionar Mes</option>
                                              {MESES_ANIO.map(m => <option key={m.toLowerCase()} value={m.toLowerCase()}>{m}</option>)}
                                            </select>
                                            <select value={progSub.semana} onChange={(e) => handleCambioPlanificacion(cronId, depto.id, sub.id, 'semana', e.target.value)} className="p-1 text-[11px] font-medium bg-white border border-slate-200 rounded">
                                              <option value="">Semana</option><option value="Semana 1">Semana 1</option><option value="Semana 2">Semana 2</option><option value="Semana 3">Semana 3</option><option value="Semana 4">Semana 4</option>
                                            </select>
                                            <div className="flex gap-1 items-center">
                                              <select value={horaObjSub.hora} onChange={(e) => handleHoraChange(cronId, depto.id, sub.id, 'hora', e.target.value)} className="p-1 text-[11px] font-medium bg-white border border-slate-200 rounded text-slate-600 w-16">
                                                {horasOpciones.map(h => <option key={h} value={h}>{h}</option>)}
                                              </select>
                                              <span className="text-slate-400">:</span>
                                              <select value={horaObjSub.minuto} onChange={(e) => handleHoraChange(cronId, depto.id, sub.id, 'minuto', e.target.value)} className="p-1 text-[11px] font-medium bg-white border border-slate-200 rounded text-slate-600 w-16">
                                                {minutosOpciones.map(m => <option key={m} value={m}>{m}</option>)}
                                              </select>
                                              <select value={horaObjSub.ampm} onChange={(e) => handleHoraChange(cronId, depto.id, sub.id, 'ampm', e.target.value)} className="p-1 text-[11px] font-medium bg-white border border-slate-200 rounded text-slate-600 w-16">
                                                {ampmOpciones.map(a => <option key={a} value={a}>{a}</option>)}
                                              </select>
                                            </div>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${getBadgeEstadoColor(progSub.estado)}`}>{progSub.estado}</span>
                                            
                                            {puedeEditar && !cronograma.categoria_id && !progSub.ultimoMantenimiento && (
                                              <button onClick={() => abrirPlanificar(cronId, depto.id, sub.id, sub.nombre, null, null, progSub.frecuencia, progSub.diasPersonalizados, progSub.mes, progSub.semana, progSub.horario)} className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded">
                                                <CheckCircle2 size={11} /> Planificar
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        {expandedAssets[sub.id] && (
                                          <div className="p-3 bg-white border-t border-dashed border-slate-200 ml-4 mr-2 mb-2 rounded-lg shadow-sm">
                                            {activosSub.length > 0 ? (
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {activosSub.map(a => {
                                                  const mantenimiento = obtenerMantenimientoActivoLocal(a.id);
                                                  const frecuenciaUsada = progSub.frecuencia || 'mensual';
                                                  const diasPersonalizados = progSub.diasPersonalizados;
                                                  const tag = a.codigo || a.etiqueta;
                                                  const nombreCompletoSub = tag ? `${tag} - ${a.nombre}` : a.nombre;

                                                  return (
                                                    <div key={`act-sub-${a.id}`} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-2">
                                                      <div className="flex justify-between items-start">
                                                        <div><span className="font-bold text-blue-600 font-mono text-xs">{tag}</span><span className="text-slate-600 text-[11px] truncate max-w-40 block">{a.nombre}</span></div>
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${a.estado?.nombre === 'Operativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : a.estado?.nombre === 'Asignado' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{a.estado?.nombre || a.estado}</span>
                                                      </div>
                                                      <div className="flex flex-wrap items-center gap-2 text-[9px] border-t border-dashed border-slate-100 pt-2">
                                                        <div className="flex items-center gap-1"><CalendarDays size={10} className="text-slate-400" /><span className="font-medium text-slate-500">Ciclo:</span><span className="text-slate-700">{FRECUENCIAS_CICLO.find(f => f.id === frecuenciaUsada)?.nombre || 'Mensual'}</span></div>
                                                        {mantenimiento && (
                                                          <>
                                                            <div className="flex items-center gap-1">
                                                              <AlertCircle size={10} className="text-emerald-500" />
                                                              <span className="font-medium text-slate-500">Próx:</span>
                                                              <span className="text-emerald-600 font-mono">{formatearFecha(mantenimiento.proximo_mantenimiento)}</span>
                                                            </div>
                                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${mantenimiento.fecha_completado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                              {mantenimiento.fecha_completado ? 'Completado' : 'Pendiente'}
                                                            </span>
                                                          </>
                                                        )}
                                                        {puedeEditar && !mantenimiento && (
                                                          <button 
                                                            onClick={() => abrirPlanificar(cronId, depto.id, sub.id, sub.nombre, a.id, nombreCompletoSub, frecuenciaUsada, diasPersonalizados, progSub.mes, progSub.semana, progSub.horario)} 
                                                            className="ml-auto flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-white bg-blue-500 hover:bg-blue-600 rounded disabled:bg-slate-300"
                                                          >
                                                            <CheckCircle2 size={9} /> Planificar
                                                          </button>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            ) : <p className="text-[10px] text-slate-400 italic">No hay activos asignados a esta jefatura.</p>}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  // ============================================================
  // RENDERIZADO - VISTA SEMANAL
  // ============================================================
  const renderVistaSemanal = () => (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden">
      <div className="p-4 bg-slate-50/70 border-b border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><CalendarDays size={18} className="text-blue-500" /> Calendario de Mantenimientos - {MESES_ANIO[mesActual]} {anioActual}</h3>
            <div className="flex items-center gap-1">
              <button onClick={() => { const nuevaFecha = new Date(anioActual, mesActual - 1, 1); setAnioActual(nuevaFecha.getFullYear()); setMesActual(nuevaFecha.getMonth()); }} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronRight size={14} className="rotate-180 text-slate-500" /></button>
              <button onClick={() => { const nuevaFecha = new Date(anioActual, mesActual + 1, 1); setAnioActual(nuevaFecha.getFullYear()); setMesActual(nuevaFecha.getMonth()); }} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronRight size={14} className="text-slate-500" /></button>
              <button onClick={() => { setAnioActual(new Date().getFullYear()); setMesActual(new Date().getMonth()); }} className="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">Hoy</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select value={filtroDepartamentoSemanal} onChange={(e) => setFiltroDepartamentoSemanal(e.target.value)} className="p-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-600">
              <option value="">Todos los departamentos</option>
              {listaDepartamentosFiltro.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 uppercase w-24">Semana</th>
              {DIAS_SEMANA.map(dia => <th key={dia} className="p-2 bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 uppercase">{dia}</th>)}
            </tr>
          </thead>
          <tbody>
            {semanasDelMes.map((semana, semanaIdx) => (
              <tr key={`semana-${semanaIdx}`}>
                <td className="p-2 border border-slate-200 bg-slate-50/50 text-center font-bold text-slate-700 text-xs">Semana {semanaIdx + 1}</td>
                {semana.map((dia, diaIdx) => {
                  const eventosDia = [];
                  if (dia.esMesActual && dia.dia) {
                    const yyyy = anioActual;
                    const mm = String(mesActual + 1).padStart(2, '0');
                    const dd = String(dia.dia).padStart(2, '0');
                    const diaSemana = `${yyyy}-${mm}-${dd}`;

                    activos.forEach(activo => {
                      const mantenimiento = obtenerMantenimientoActivoLocal(activo.id);
                      if (mantenimiento && mantenimiento.estado === 'Pendiente' && mantenimiento.proximo_mantenimiento) {
                        const fechaMantStr = String(mantenimiento.proximo_mantenimiento).split('T')[0];
                        if (fechaMantStr === diaSemana) {
                          if (filtroDepartamentoSemanal) {
                            const deptoNombre = activo.departamento?.nombre || '';
                            if (deptoNombre !== filtroDepartamentoSemanal) return;
                          }
                          const tag = activo.codigo || activo.etiqueta;
                          eventosDia.push({
                            titulo: tag ? `${tag} - ${activo.nombre}` : activo.nombre,
                            departamento: activo.departamento?.nombre || 'Sin departamento',
                            horario: 'Pendiente',
                            estado: 'Pendiente',
                            frecuencia: mantenimiento.frecuencia || 'Mensual'
                          });
                        }
                      }
                    });
                  }
                  return (
                    <td key={`dia-${diaIdx}`} className={`p-2 border border-slate-200 align-top ${dia.esDiaHoy ? 'bg-blue-50' : dia.esMesActual ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <div className={`text-[11px] font-bold mb-1 ${dia.esMesActual ? 'text-slate-700' : 'text-slate-400'}`}>{dia.esMesActual ? dia.dia : ''}</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {eventosDia.length > 0 ? (
                          eventosDia.map((ev, idx) => (
                            <div key={`ev-${idx}`} onClick={() => { setEventoSeleccionado(ev); setMostrarDetalleEvento(true); }} className="p-1.5 bg-blue-50 border-l-2 border-blue-500 rounded cursor-pointer hover:bg-blue-100">
                              <div className="text-[9px] font-bold text-blue-700 truncate">{ev.titulo}</div>
                              <div className="text-[8px] text-slate-500 truncate">{ev.departamento}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-[9px] text-slate-300 text-center py-1">—</div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-50 border-l-2 border-blue-500 rounded"></div><span>Mantenimiento pendiente</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-100 rounded-full"></div><span>Día actual</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-100 rounded"></div><span>Días de otros meses</span></div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-linear-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-md border border-slate-200/80">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-blue-600" size={22} />
            Control Estructural de Cronogramas
          </h2>
          <p className="text-xs text-slate-500 font-medium">Inspecciones de infraestructura aeroportuaria, preventivos de computación y soporte técnico.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setVistaActual('semanal')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${vistaActual === 'semanal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <BarChart3 size={14} className="inline mr-1" /> Vista Semanal
            </button>
            <button onClick={() => setVistaActual('departamental')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${vistaActual === 'departamental' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <ListChecks size={14} className="inline mr-1" /> Por Departamentos
            </button>
          </div>
          <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-sm transition-all">
            <Clock size={15} className="text-slate-500" /> Ver Historial
          </button>
          {puedeCrear && (
            <button onClick={abrirModalCrear} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all">
              <Plus size={15} /> Crear Planificación
            </button>
          )}
        </div>
      </div>

      {noHayDepartamentos && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <div>
            <p className="font-bold">No hay departamentos registrados</p>
            <p className="text-xs text-amber-600">Para utilizar el módulo de mantenimientos, debe registrar al menos un departamento en <strong>Configuración → Departamentos</strong>.</p>
          </div>
        </div>
      )}

      {vistaActual === 'departamental' && renderVistaDepartamental()}
      {vistaActual === 'semanal' && renderVistaSemanal()}

      {/* MODALES */}
      <ModalCronograma
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setCronogramaAEditar(null); }}
        cronogramaAEditar={cronogramaAEditar}
        onGuardar={cronogramaAEditar ? handleEditarCronograma : handleCrearCronograma}
      />

      {/* MODAL DE HISTORIAL MEJORADO */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock size={20} className="text-slate-500" /> Historial de Mantenimientos
              </h3>
              <button onClick={() => setIsHistoryOpen(false)} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Barra de búsqueda y pestañas */}
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/30 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shrink-0">
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  placeholder="Buscar por activo o área..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                />
              </div>
              <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                <button
                  onClick={() => setHistoryFilterEstado('todos')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    historyFilterEstado === 'todos'
                      ? 'bg-white text-slate-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setHistoryFilterEstado('pendiente')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    historyFilterEstado === 'pendiente'
                      ? 'bg-amber-100 text-amber-700 shadow-sm'
                      : 'text-slate-500 hover:text-amber-600'
                  }`}
                >
                  Pendientes
                </button>
                <button
                  onClick={() => setHistoryFilterEstado('completado')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    historyFilterEstado === 'completado'
                      ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:text-emerald-600'
                  }`}
                >
                  Completadas
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {historialMantenimientos.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8">No hay registros de mantenimientos.</div>
              ) : (
                <div className="space-y-3">
                  {historialMantenimientos
                    .filter(log => {
                      const matchSearch = log.activoNombre?.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                                         log.area?.toLowerCase().includes(historySearchTerm.toLowerCase());
                      const matchEstado = historyFilterEstado === 'todos' || log.estado.toLowerCase() === historyFilterEstado;
                      return matchSearch && matchEstado;
                    })
                    .map((log, idx) => {
                      const esPendiente = log.estado === 'Pendiente';
                      return (
                        <div key={idx} className={`p-4 rounded-xl border transition-all ${
                          esPendiente
                            ? 'bg-amber-50/30 border-amber-200 hover:bg-amber-50/60'
                            : 'bg-emerald-50/30 border-emerald-200 hover:bg-emerald-50/60'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {log.area || log.activoNombre || 'Registro'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {log.frecuencia} · {log.estado === 'Completado' ? 'Último:' : 'Planificado:'} {log.fechaCierre}
                              </p>
                              {log.proximaFecha && <p className="text-xs text-emerald-600 font-medium">Próximo: {log.proximaFecha}</p>}
                              {log.observacion && (
                                <p className="text-xs text-slate-600 mt-1">
                                  <span className="font-semibold">Planificación:</span> {log.observacion}
                                </p>
                              )}
                              {log.observacionEjecutada && (
                                <p className="text-xs text-slate-600 mt-1 border-t border-slate-200 pt-1">
                                  <span className="font-semibold">Ejecución:</span> {log.observacionEjecutada}
                                </p>
                              )}
                              {log.completadoEl && (
                                <p className="text-xs text-slate-400 mt-1">Completado el: {log.completadoEl}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                esPendiente
                                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                                  : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}>
                                {log.estado}
                              </span>
                              {esPendiente && puedeEditar && (
                                <button
                                  onClick={() => abrirCompletar(log)}
                                  className="px-3 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors"
                                >
                                  Completar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <button onClick={() => setIsHistoryOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {modalRegistro.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Planificar Mantenimiento</h4>
                <p className="text-xs text-slate-500">{modalRegistro.nombreDepto || modalRegistro.activoNombre}</p>
              </div>
              <button onClick={() => setModalRegistro(prev => ({ ...prev, isOpen: false }))} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Observación de planificación *</label>
                <textarea rows="3" value={observacionDepto} onChange={(e) => setObservacionDepto(e.target.value)} placeholder="Describa las acciones que se van a realizar..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-3">
              <button onClick={() => setModalRegistro(prev => ({ ...prev, isOpen: false }))} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">Cancelar</button>
              <button onClick={guardarPlanificacion} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors">
                <CheckCircle2 size={16} className="inline mr-1" /> Planificar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalCompletar.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Completar Mantenimiento</h4>
                <p className="text-xs text-slate-500">{modalCompletar.activoNombre}</p>
              </div>
              <button onClick={() => setModalCompletar({ isOpen: false, mantenimientoId: null, activoId: null, activoNombre: '' })} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Observación de ejecución *</label>
                <textarea rows="3" value={observacionEjecucion} onChange={(e) => setObservacionEjecucion(e.target.value)} placeholder="Describa lo que se realizó en el mantenimiento..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-3">
              <button onClick={() => setModalCompletar({ isOpen: false, mantenimientoId: null, activoId: null, activoNombre: '' })} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">Cancelar</button>
              <button onClick={completarMantenimiento} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-colors">
                <CheckCircle2 size={16} className="inline mr-1" /> Completar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarDetalleEvento && eventoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <h4 className="text-sm font-bold text-slate-800">Detalle del Evento</h4>
              <button onClick={() => { setMostrarDetalleEvento(false); setEventoSeleccionado(null); }} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div><span className="text-xs font-bold text-slate-500 uppercase block">Título</span><p className="text-sm font-semibold text-slate-800">{eventoSeleccionado.titulo}</p></div>
              <div><span className="text-xs font-bold text-slate-500 uppercase block">Departamento</span><p className="text-sm text-slate-700">{eventoSeleccionado.departamento}</p></div>
              <div><span className="text-xs font-bold text-slate-500 uppercase block">Horario</span><p className="text-sm text-slate-700">{eventoSeleccionado.horario}</p></div>
              <div><span className="text-xs font-bold text-slate-500 uppercase block">Estado</span><p className="text-sm text-slate-700">{eventoSeleccionado.estado}</p></div>
              <div><span className="text-xs font-bold text-slate-500 uppercase block">Frecuencia</span><p className="text-sm text-slate-700">{eventoSeleccionado.frecuencia}</p></div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <button onClick={() => { setMostrarDetalleEvento(false); setEventoSeleccionado(null); }} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cronogramas;
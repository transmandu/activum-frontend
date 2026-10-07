import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Trash2, Search, Calendar, Layers, 
  Users, Clock, FileSpreadsheet, CheckSquare, LogOut, Briefcase, 
  TrendingUp, Activity, AlertTriangle, Download, Printer, BarChart, 
  PieChart, Database, Zap, Eye, Filter, ChevronRight
} from 'lucide-react';
import { useData } from '../context/DataContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoEmpresa from '../assets/logo-empresa.png'; // Importar logo

// ============================================================
// FUNCIÓN AUXILIAR PARA EXTRAER NOMBRE DE OBJETO O STRING
// ============================================================
const extraerNombre = (valor) => {
  if (!valor) return 'N/A';
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'object' && valor !== null) {
    return valor.nombre_completo || valor.name || valor.nombre || 'N/A';
  }
  return String(valor);
};

// ============================================================
// COMPONENTE DE PAGINACIÓN SIMPLE
// ============================================================
const Paginacion = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-t border-slate-200 rounded-b-xl">
      <div className="text-xs text-slate-500">
        Página {currentPage} de {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="rotate-180" size={16} />
        </button>
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const Reportes = () => {
  const { 
    activos = [], cronogramas = [], desincorporaciones = [], asignaciones = [],
    tareas = [], ordenesSalida = [], proveedores = [],
    userPermissions
  } = useData();

  const puedeExportar = userPermissions?.includes('exportar_datos');

  // ============================================================
  // ESTADO PARA EL LOGO EN BASE64
  // ============================================================
  const [logoBase64, setLogoBase64] = useState(null);

  useEffect(() => {
    const cargarLogo = async () => {
      try {
        const response = await fetch(logoEmpresa);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.warn('No se pudo cargar el logo para los PDFs:', error);
      }
    };
    cargarLogo();
  }, []);

  // ============================================================
  // ESTADO PARA BÚSQUEDA Y FILTROS
  // ============================================================
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // ============================================================
  // ESTADO PARA PAGINACIÓN DE AUDITORÍA
  // ============================================================
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  // ============================================================
  // KPIs
  // ============================================================
  const totalActivos = activos.length;
  const activosSanos = activos.filter(act => act.estado === 'Operativo' || act.estado === 'Asignado').length;
  const saludActivos = totalActivos > 0 ? ((activosSanos / totalActivos) * 100).toFixed(1) : "100.0";

  // ============================================================
  // BITÁCORA CONSOLIDADA (CORREGIDA)
  // ============================================================
  const registrosAuditoria = useMemo(() => {
    const lista = [];

    activos.forEach(act => {
      lista.push({ 
        id: act.codigo || 'ACT-S/N', 
        equipo: act.nombre || 'Hardware', 
        tipo: 'Alta Inventario', 
        fecha: act.created_at ? new Date(act.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible', 
        detalles: `Categoría: ${extraerNombre(act.categoria)} | Serial: ${act.serial || 'S/N'} | INAC: ${act.inac || 'No Declarado'}` 
      });
    });

    asignaciones.forEach(asig => {
      lista.push({
        id: asig.codigo || `ASG-${asig.id}`,
        equipo: asig.activo || 'Equipo Asignado',
        tipo: 'Asignación',
        fecha: asig.fecha_hora ? new Date(asig.fecha_hora).toLocaleDateString('es-ES') : asig.fecha || 'Fecha no disponible',
        detalles: `Custodio: ${extraerNombre(asig.responsable)} | Dpto: ${extraerNombre(asig.departamento)} | Estado: ${asig.estado_acta || 'Pendiente'}`
      });
    });

    cronogramas.forEach(cron => {
      lista.push({
        id: cron.codigo || `CRO-${cron.id}`,
        equipo: cron.area || 'Área Planificada',
        tipo: 'Mantenimiento',
        fecha: cron.fecha_cierre || cron.fecha || 'Fecha no disponible',
        detalles: `Frecuencia: ${cron.frecuencia || 'Gral'} | Planificación: ${cron.mes || 'Mes no definido'} (${cron.semana || 'S/N'}) | Estado: ${cron.estado || 'Programado'}`
      });
    });

    tareas.forEach(tar => {
      lista.push({
        id: tar.codigo || `TAR-${tar.id}`,
        equipo: tar.descripcion || 'Actividad de Soporte',
        tipo: 'Tarea',
        fecha: tar.fecha_inicio ? new Date(tar.fecha_inicio).toLocaleDateString('es-ES') : 'Fecha no disponible',
        detalles: `Prioridad: ${tar.prioridad || 'Media'} | Responsables: ${tar.responsables || 'Soporte'} | Límite: ${tar.fecha_fin ? new Date(tar.fecha_fin).toLocaleDateString('es-ES') : 'S/F'}`
      });
    });

    ordenesSalida.forEach(ord => {
      lista.push({ 
        id: ord.codigo || `OS-${ord.id}`, 
        equipo: ord.activo || 'Equipo de Salida', 
        tipo: 'Órdenes de Salida', 
        fecha: ord.fecha_salida || 'Fecha no disponible',
        detalles: `Código Ref: ${ord.codigo || 'S/C'} | Destino: ${extraerNombre(ord.destino)} | Solicitante: ${extraerNombre(ord.solicitante)}`
      });
    });

    proveedores.forEach(prov => {
      lista.push({ 
        id: prov.codigo || `PROV-${prov.id}`, 
        equipo: prov.nombre || 'Firma Proveedora', 
        tipo: 'Proveedores C.A.', 
        fecha: prov.created_at ? new Date(prov.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible',
        detalles: `RIF: ${prov.rif || 'S/R'} | Ramo: ${prov.categoria || 'General'} | Contacto: ${prov.contacto || 'N/A'}`
      });
    });

    desincorporaciones.forEach(baja => {
      lista.push({ 
        id: baja.codigo_acta || `BAJ-${baja.id}`, 
        equipo: baja.activo || 'Activo de Baja', 
        tipo: 'Desincorporación', 
        fecha: baja.fecha_baja || 'Fecha no disponible',
        detalles: `Código Ref: ${baja.codigo || 'S/C'} | Informe: ${baja.informe || 'S/I'} | Autoriza: ${extraerNombre(baja.autorizado_por)}`
      });
    });

    return lista.sort((a, b) => String(b.id).localeCompare(String(a.id)));
  }, [activos, asignaciones, cronogramas, tareas, ordenesSalida, proveedores, desincorporaciones]);

  // ============================================================
  // FILTRADO DE REGISTROS
  // ============================================================
  const registrosFiltrados = useMemo(() => {
    return registrosAuditoria.filter(reg => {
      const cumpleBusqueda = reg.equipo.toLowerCase().includes(busqueda.toLowerCase()) || 
                             reg.id.toLowerCase().includes(busqueda.toLowerCase()) ||
                             reg.detalles.toLowerCase().includes(busqueda.toLowerCase());
      const cumpleFiltro = filtroTipo === '' || reg.tipo === filtroTipo;
      return cumpleBusqueda && cumpleFiltro;
    });
  }, [registrosAuditoria, busqueda, filtroTipo]);

  // ============================================================
  // PAGINACIÓN DE AUDITORÍA
  // ============================================================
  const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
  const indiceInicio = (paginaActual - 1) * registrosPorPagina;
  const indiceFin = Math.min(indiceInicio + registrosPorPagina, registrosFiltrados.length);
  const registrosPaginados = registrosFiltrados.slice(indiceInicio, indiceFin);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroTipo]);

  // ============================================================
  // EXPORTACIONES (CORREGIDAS CON LOGO)
  // ============================================================
  const exportarExcelApartado = (titulo, dataset, mapeoColumnas) => {
    if (!dataset || dataset.length === 0) {
      alert(`No hay registros en "${titulo}" para exportar.`);
      return;
    }
    const dataAcondicionada = dataset.map(mapeoColumnas);
    const hoja = XLSX.utils.json_to_sheet(dataAcondicionada);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, titulo.substring(0, 31));
    XLSX.writeFile(libro, `Reporte_${titulo.replace(/\s+/g, '_')}_Transmandu.xlsx`);
  };

  const exportarPDFApartado = (titulo, cabeceras, filas, mapeoExtra = null) => {
    if (!filas || filas.length === 0) {
      alert(`No hay registros en "${titulo}" para generar el PDF.`);
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // LOGO
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', 14, 6, 45, 12);
      } catch (e) {
        console.warn('Error al agregar logo al PDF:', e);
      }
    }

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("TRANSMANDU, C.A. - CONTROL DE INFRAESTRUCTURA I.T.", 14, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`REPORTE MAESTRO: ${titulo.toUpperCase()}`, 14, 28);
    doc.text(`Fecha de Extracción: ${new Date().toLocaleDateString()} | Auditor Responsable: Ing. Jesús Abraham`, 14, 34);

    // Tabla
    autoTable(doc, {
      startY: 40,
      head: [cabeceras],
      body: filas,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], fontStyle: 'bold' },
      styles: { fontSize: 8.5 },
      margin: { left: 14, right: 14 },
    });

    doc.save(`PDF_${titulo.replace(/\s+/g, '_')}_Transmandu.pdf`);
  };

  // ============================================================
  // RENDERIZADO
  // ============================================================
  return (
    <div className="space-y-8 text-left antialiased max-w-7xl mx-auto p-4 md:p-6 bg-linear-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* CABECERA */}
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-lg border border-slate-200/80 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1.5 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md">
              <Database size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 tracking-wider uppercase">Data Analytics Core</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">Enterprise Reporting Suite</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight uppercase">Consola Central de Reportes</h1>
          <p className="text-sm font-medium text-slate-500 mt-2 max-w-2xl">Módulo maestro de exportación e inteligencia de infraestructura de Transmandu C.A. Visualice, filtre y descargue informes ejecutables en formatos Excel y PDF.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1"><Database size={12} /> Volumen Total de Activos</span>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{totalActivos} <span className="text-sm font-semibold text-slate-400">Equipos</span></h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Layers size={24} /></div>
        </div>
        <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-l-emerald-500 border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1"><Activity size={12} /> Disponibilidad Operativa</span>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{saludActivos}%</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><ShieldCheck size={24} /></div>
        </div>
        <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-l-rose-500 border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1"><Trash2 size={12} /> Bajas de Equipamiento</span>
            <h3 className="text-3xl font-black text-rose-600 mt-1">{desincorporaciones.length} <span className="text-sm font-semibold text-slate-400">Unidades</span></h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Trash2 size={24} /></div>
        </div>
      </div>

      {/* CENTRO DE DESCARGAS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Download size={14} /> Centro de Descargas por Apartado
          </h3>
          <span className="h-px bg-slate-200 flex-1 ml-4"></span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. ACTIVOS I.T. */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors"><Layers size={18} /></div>
              <div><h4 className="text-sm font-bold text-slate-800">Activos I.T.</h4><p className="text-[10px] text-slate-400 font-medium">{activos.length} registros</p></div>
            </div>
            <div className="flex gap-2 mt-auto">
              {puedeExportar && (
                <button onClick={() => exportarExcelApartado('Activos Tecnológicos', activos, a => ({ 'CÓDIGO': a.codigo, 'NOMBRE': a.nombre, 'CATEGORÍA': extraerNombre(a.categoria), 'SERIAL': a.serial, 'ESTADO': extraerNombre(a.estado), 'INAC': a.inac }))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-[11px] font-bold transition-all">
                  <FileSpreadsheet size={13} /> Excel
                </button>
              )}
              {puedeExportar && (
                <button onClick={() => exportarPDFApartado('Activos Tecnológicos', ['Código','Nombre','Categoría','Serial','Estado','INAC'], activos.map(a => [a.codigo, a.nombre, extraerNombre(a.categoria), a.serial, extraerNombre(a.estado), a.inac]))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-800 text-slate-700 hover:text-white rounded-xl text-[11px] font-bold transition-all">
                  <FileText size={13} /> PDF
                </button>
              )}
            </div>
          </div>

          {/* 2. ASIGNACIONES */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors"><Users size={18} /></div>
              <div><h4 className="text-sm font-bold text-slate-800">Asignaciones</h4><p className="text-[10px] text-slate-400 font-medium">{asignaciones.length} registros</p></div>
            </div>
            <div className="flex gap-2 mt-auto">
              {puedeExportar && (
                <button onClick={() => exportarExcelApartado('Asignaciones', asignaciones, as => ({ 'CÓDIGO': as.codigo, 'CUSTODIO': extraerNombre(as.responsable), 'DEPARTAMENTO': extraerNombre(as.departamento), 'FECHA': as.fecha_hora ? new Date(as.fecha_hora).toLocaleDateString('es-ES') : as.fecha, 'ESTADO': as.estado_acta }))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-[11px] font-bold transition-all">
                  <FileSpreadsheet size={13} /> Excel
                </button>
              )}
              {puedeExportar && (
                <button onClick={() => exportarPDFApartado('Asignaciones de Personal', ['Código','Custodio','Departamento','Fecha','Estado'], asignaciones.map(as => [as.codigo, extraerNombre(as.responsable), extraerNombre(as.departamento), as.fecha_hora ? new Date(as.fecha_hora).toLocaleDateString('es-ES') : as.fecha, as.estado_acta]))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-800 text-slate-700 hover:text-white rounded-xl text-[11px] font-bold transition-all">
                  <FileText size={13} /> PDF
                </button>
              )}
            </div>
          </div>

          {/* 3. CRONOGRAMAS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors"><Clock size={18} /></div>
              <div><h4 className="text-sm font-bold text-slate-800">Cronogramas</h4><p className="text-[10px] text-slate-400 font-medium">{cronogramas.length} registros</p></div>
            </div>
            <div className="flex gap-2 mt-auto">
              {puedeExportar && (
                <button onClick={() => exportarExcelApartado('Cronogramas Mantenimiento', cronogramas, c => ({ 'CÓDIGO': c.codigo, 'ÁREA': c.area, 'FRECUENCIA': c.frecuencia, 'FECHA': c.fecha, 'ESTADO': c.estado }))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-[11px] font-bold transition-all">
                  <FileSpreadsheet size={13} /> Excel
                </button>
              )}
              {puedeExportar && (
                <button onClick={() => exportarPDFApartado('Cronogramas de Mantenimiento', ['Código','Área','Frecuencia','Fecha','Estado'], cronogramas.map(c => [c.codigo, c.area, c.frecuencia, c.fecha, c.estado]))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-800 text-slate-700 hover:text-white rounded-xl text-[11px] font-bold transition-all">
                  <FileText size={13} /> PDF
                </button>
              )}
            </div>
          </div>

          {/* 4. TAREAS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors"><CheckSquare size={18} /></div>
              <div><h4 className="text-sm font-bold text-slate-800">Tareas I.T.</h4><p className="text-[10px] text-slate-400 font-medium">{tareas.length} registros</p></div>
            </div>
            <div className="flex gap-2 mt-auto">
              {puedeExportar && (
                <button onClick={() => exportarExcelApartado('Tareas del Sistema', tareas, t => ({ 'CÓDIGO': t.codigo, 'DESCRIPCIÓN': t.descripcion, 'PROYECTO': t.proyecto, 'FECHA INICIO': t.fecha_inicio ? new Date(t.fecha_inicio).toLocaleDateString('es-ES') : '', 'PRIORIDAD': t.prioridad }))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-[11px] font-bold transition-all">
                  <FileSpreadsheet size={13} /> Excel
                </button>
              )}
              {puedeExportar && (
                <button onClick={() => exportarPDFApartado('Tareas y Soporte Técnico', ['Código','Descripción','Proyecto','Fecha Inicio','Prioridad'], tareas.map(t => [t.codigo, t.descripcion, t.proyecto, t.fecha_inicio ? new Date(t.fecha_inicio).toLocaleDateString('es-ES') : '', t.prioridad]))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-800 text-slate-700 hover:text-white rounded-xl text-[11px] font-bold transition-all">
                  <FileText size={13} /> PDF
                </button>
              )}
            </div>
          </div>

          {/* 5. ÓRDENES DE SALIDA */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600 group-hover:bg-orange-100 transition-colors"><LogOut size={18} /></div>
              <div><h4 className="text-sm font-bold text-slate-800">Órdenes Salida</h4><p className="text-[10px] text-slate-400 font-medium">{ordenesSalida.length} pases</p></div>
            </div>
            <div className="flex gap-2 mt-auto">
              {puedeExportar && (
                <button onClick={() => exportarExcelApartado('Ordenes de Salida', ordenesSalida, os => ({ 'NRO ORDEN': os.codigo, 'MOTIVO': os.motivo, 'DESTINO': extraerNombre(os.destino), 'SOLICITANTE': extraerNombre(os.solicitante), 'FECHA SALIDA': os.fecha_salida, 'ESTADO': os.estado }))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-[11px] font-bold transition-all">
                  <FileSpreadsheet size={13} /> Excel
                </button>
              )}
              {puedeExportar && (
                <button onClick={() => exportarPDFApartado('Ordenes de Salida', ['Nro Orden','Motivo','Destino','Solicitante','Fecha Salida','Estado'], ordenesSalida.map(os => [os.codigo, os.motivo, extraerNombre(os.destino), extraerNombre(os.solicitante), os.fecha_salida, os.estado]))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-800 text-slate-700 hover:text-white rounded-xl text-[11px] font-bold transition-all">
                  <FileText size={13} /> PDF
                </button>
              )}
            </div>
          </div>

          {/* 6. DESINCORPORACIONES */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 group-hover:bg-rose-100 transition-colors"><Trash2 size={18} /></div>
              <div><h4 className="text-sm font-bold text-slate-800">Desincorporación</h4><p className="text-[10px] text-slate-400 font-medium">{desincorporaciones.length} bajas</p></div>
            </div>
            <div className="flex gap-2 mt-auto">
              {puedeExportar && (
                <button onClick={() => exportarExcelApartado('Desincorporaciones', desincorporaciones, d => ({ 'NRO ACTA': d.codigo_acta, 'ACTIVO': d.activo, 'MOTIVO': d.motivo, 'FECHA BAJA': d.fecha_baja, 'AUTORIZADO': extraerNombre(d.autorizado_por) }))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-[11px] font-bold transition-all">
                  <FileSpreadsheet size={13} /> Excel
                </button>
              )}
              {puedeExportar && (
                <button onClick={() => exportarPDFApartado('Desincorporaciones de hardware', ['Nro Acta','Activo','Motivo','Fecha Baja','Autorizado'], desincorporaciones.map(d => [d.codigo_acta, d.activo, d.motivo, d.fecha_baja, extraerNombre(d.autorizado_por)]))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-800 text-slate-700 hover:text-white rounded-xl text-[11px] font-bold transition-all">
                  <FileText size={13} /> PDF
                </button>
              )}
            </div>
          </div>

          {/* 7. PROVEEDORES */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600 group-hover:bg-teal-100 transition-colors"><Briefcase size={18} /></div>
              <div><h4 className="text-sm font-bold text-slate-800">Proveedores C.A.</h4><p className="text-[10px] text-slate-400 font-medium">{proveedores.length} empresas registradas</p></div>
            </div>
            <div className="flex gap-2">
              {puedeExportar && (
                <button onClick={() => exportarExcelApartado('Proveedores Registrados', proveedores, p => ({ 'CÓDIGO': p.codigo, 'NOMBRE': p.nombre, 'RIF': p.rif, 'CATEGORÍA': p.categoria, 'CONTACTO': p.contacto, 'TELÉFONO': p.telefono, 'CORREO': p.correo, 'ESTADO': p.estado }))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-[11px] font-bold transition-all">
                  <FileSpreadsheet size={13} /> Excel
                </button>
              )}
              {puedeExportar && (
                <button onClick={() => exportarPDFApartado('Cartera de Proveedores Juridicos', ['Código','Razón Social','RIF','Categoría','Contacto','Teléfono','Correo','Estado'], proveedores.map(p => [p.codigo, p.nombre, p.rif, p.categoria, p.contacto, p.telefono, p.correo, p.estado]))} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-slate-800 text-slate-700 hover:text-white rounded-xl text-[11px] font-bold transition-all">
                  <FileText size={13} /> PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA CON PAGINACIÓN */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
        <div className="p-5 bg-linear-to-r from-slate-50 to-white border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2"><Activity size={16} className="text-blue-500" /> Historial de Auditoría General</h4>
            <p className="text-xs text-slate-500 mt-0.5">Línea de tiempo unificada de todos los movimientos del sistema</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Filtrar registros..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white w-48 md:w-56" />
            </div>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              <option value="">Todos los eventos</option>
              <option value="Alta Inventario">Activos</option>
              <option value="Asignación">Asignaciones</option>
              <option value="Mantenimiento">Cronogramas</option>
              <option value="Tarea">Tareas</option>
              <option value="Órdenes de Salida">Órdenes</option>
              <option value="Proveedores C.A.">Proveedores</option>
              <option value="Desincorporación">Desincorporaciones</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100/70">
              <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="p-3 pl-5 text-left">Código Log</th>
                <th className="p-3 text-left">Activo</th>
                <th className="p-3 text-left">Evento</th>
                <th className="p-3 text-left">Detalles</th>
                <th className="p-3 text-center w-28">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {registrosPaginados.length > 0 ? (
                registrosPaginados.map((reg, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-3 pl-5 text-xs font-mono font-bold text-slate-600">{reg.id}</td>
                    <td className="p-3 text-xs font-semibold text-slate-700">{reg.equipo}</td>
                    <td className="p-3 text-xs"><span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">{reg.tipo}</span></td>
                    <td className="p-3 text-xs text-slate-500 max-w-md truncate">{reg.detalles}</td>
                    <td className="p-3 text-xs text-center text-slate-500 whitespace-nowrap">{reg.fecha}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 text-sm">No hay registros que coincidan con los filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <Paginacion
          currentPage={paginaActual}
          totalPages={totalPaginas}
          onPageChange={setPaginaActual}
        />

        <div className="p-3 bg-slate-50/50 border-t border-slate-200 text-right text-[10px] text-slate-400">
          Mostrando {registrosPaginados.length} de {registrosFiltrados.length} registros
        </div>
      </div>
    </div>
  );
};

export default Reportes;
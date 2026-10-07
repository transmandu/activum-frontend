import React, { useState } from 'react';
import { Plus, Search, Filter, FileText, UserCheck, Calendar, ClipboardCheck, FileWarning, Layers, Download, FileX } from 'lucide-react';
import ModalAsignacion from '../components/modals/ModalAsignacion';
import ModalActaEntrega from '../components/modals/ModalActaEntrega';
import { useData } from '../context/DataContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoEmpresa from '../assets/logo-empresa.png';

// Mapeo de estados del backend a nombres mostrados
const ESTADO_MOSTRAR = {
  'Firmada': 'Autorizado',
  'Pendiente por Firma': 'Pendiente',
  'Anulada': 'Anulada'
};

const Asignaciones = () => {
  const { 
    asignaciones, 
    toggleEstadoActa, 
    anularAsignacion,
    departamentos = [],
    usuarioLogueado,
    cargarDatosIniciales,
    userPermissions
  } = useData();

  const puedeCrear = userPermissions?.includes('crear_asignaciones');
  const puedeEditar = userPermissions?.includes('editar_asignaciones');
  const puedeAnular = userPermissions?.includes('anular_asignaciones');

  const isAdmin = usuarioLogueado?.rol === 'Administrador';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActaOpen, setIsActaOpen] = useState(false);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null);
  const [puedeImprimir, setPuedeImprimir] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptoId, setSelectedDeptoId] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const asignacionesActivas = asignaciones.filter(a => a.estado_acta !== 'Anulada');
  const totalAsignaciones = asignacionesActivas.length;
  const totalAutorizados = asignacionesActivas.filter(a => a.estado_acta === 'Firmada').length;
  const totalPendientes = asignacionesActivas.filter(a => a.estado_acta === 'Pendiente por Firma').length;

  const estadoBackend = (estado) => {
    if (estado === 'Autorizado') return 'Firmada';
    if (estado === 'Pendiente') return 'Pendiente por Firma';
    return estado;
  };

  const asignacionesFiltradas = asignaciones.filter((asg) => {
    if (selectedEstado !== '' && selectedEstado !== 'Anulada' && asg.estado_acta === 'Anulada') return false;
    
    const term = searchTerm.toLowerCase();
    
    const deptoNombre = typeof asg.departamento === 'string' 
      ? asg.departamento 
      : (asg.departamento?.nombre || '');
    
    const estadoFiltro = estadoBackend(selectedEstado);
    
    const matchesSearch = 
      String(asg.codigo || '').toLowerCase().includes(term) ||
      String(asg.responsable?.nombre_completo || '').toLowerCase().includes(term) ||
      deptoNombre.toLowerCase().includes(term) ||
      String(asg.subdivision || '').toLowerCase().includes(term) ||
      (asg.activos?.some(a => String(a.codigo || '').toLowerCase().includes(term)) || false);
    
    const matchesDepto = selectedDeptoId === '' || 
                         (asg.departamento_id?.toString() === selectedDeptoId) || 
                         (asg.departamento?.id?.toString() === selectedDeptoId);
                         
    const matchesEstado = selectedEstado === '' || asg.estado_acta === estadoFiltro;
    
    return matchesSearch && matchesDepto && matchesEstado;
  });

  const handleToggleEstado = async (id) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await toggleEstadoActa(id);
      await cargarDatosIniciales();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnular = async (id) => {
    if (isLoading) return;
    if (!window.confirm('¿Está seguro de anular esta asignación? Se liberarán los activos asignados.')) {
      return;
    }
    setIsLoading(true);
    try {
      await anularAsignacion(id);
      await cargarDatosIniciales();
      alert('✅ Asignación anulada correctamente.');
    } catch (error) {
      console.error("Error al anular asignación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // VER ACTA: Obtener el nombre del elaborador desde la relación
  // ============================================================
  const handleVerActa = (asg) => {
    const nombreElaborado = asg.elaborado_por?.nombre_completo || 'SOPORTE TÉCNICO';
    
    setAsignacionSeleccionada({
      ...asg,
      entregado_por_nombre_completo: nombreElaborado
    });
    const puedeImprimir = asg.estado_acta === 'Firmada' || isAdmin;
    setPuedeImprimir(puedeImprimir);
    setIsActaOpen(true);
  };

  // ============================================================
  // DESCARGA DE PDF: usa el nombre del elaborador
  // ============================================================
  const descargarActaEntregaPDF = () => {
    const asg = asignacionSeleccionada;
    if (!asg) {
      alert('No hay acta seleccionada para descargar.');
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const numeroActa = asg.codigo || asg.id || 'N/A';
      const fecha = asg.fecha_hora 
        ? new Date(asg.fecha_hora).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : asg.fecha || 'N/A';
      const estado = asg.estado_acta || '';

      const deptoEmisor = 'DIRECCIÓN DE INFORMÁTICA, TECNOLOGÍA Y PUBLICACIONES';
      const responsableEmisor = 'ING. JONATHAN MORILLO';
      const cargoEmisor = 'DIRECTOR DE INFORMÁTICA, TECNOLOGÍA Y PUBLICACIONES';
      const ciEmisor = '14.986.385';

      const deptoReceptor = asg.departamento?.nombre || asg.departamento || 'JEFATURA DE DESARROLLO';
      const responsableReceptor = asg.responsable?.nombre_completo || asg.custodio || 'N/A';
      const cargoReceptor = asg.responsable?.cargo || 'N/A';
      const ciReceptor = asg.responsable?.cedula || 'N/A';

      const items = asg.activos || [];

      const autorizadoPor = asg.autorizadoPor?.nombre_completo || 'ING. JONATHAN MORILLO';
      const recibeConforme = asg.responsable?.nombre_completo || asg.custodio || 'N/A';
      
      // Priorizar elaborado_por del backend
      const elaboradoPor = asg.elaborado_por?.nombre_completo || asg.entregado_por_nombre_completo || 'SOPORTE TÉCNICO';

      const esAnulada = estado === 'Anulada';

      const img = new Image();
      img.src = logoEmpresa;
      
      const construirPDF = () => {
        if (img.complete && img.naturalHeight !== 0) {
           doc.addImage(img, 'PNG', 15, 10, 55, 15);
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(numeroActa, 195, 15, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`FECHA: ${fecha}`, 195, 21, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('ASIGNACIÓN DE EQUIPOS', 105, 34, { align: 'center' });

        // --- DEPENDENCIA EMISORA ---
        autoTable(doc, {
          startY: 40,
          margin: { left: 15, right: 15 },
          theme: 'plain',
          styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
          headStyles: { fillColor: [233, 236, 239], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'left' },
          head: [[{ content: 'DEPENDENCIA EMISORA', colSpan: 4 }]],
          body: [
            [
              { content: 'DEPENDENCIA:', fontStyle: 'bold', cellWidth: 28 },
              { content: deptoEmisor, colSpan: 3 }
            ],
            [
              { content: 'RESPONSABLE:', fontStyle: 'bold', cellWidth: 28 },
              { content: responsableEmisor, cellWidth: 70 },
              { content: 'N° FICHA / C.I.:', fontStyle: 'bold', cellWidth: 28 },
              { content: ciEmisor }
            ],
            [
              { content: 'CARGO:', fontStyle: 'bold', cellWidth: 28 },
              { content: cargoEmisor, colSpan: 3 }
            ]
          ]
        });

        // --- DEPENDENCIA RECEPTORA ---
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 3,
          margin: { left: 15, right: 15 },
          theme: 'plain',
          styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
          headStyles: { fillColor: [233, 236, 239], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'left' },
          head: [[{ content: 'DEPENDENCIA RECEPTORA', colSpan: 4 }]],
          body: [
            [
              { content: 'DEPENDENCIA:', fontStyle: 'bold', cellWidth: 28 },
              { content: deptoReceptor, colSpan: 3 }
            ],
            [
              { content: 'RESPONSABLE:', fontStyle: 'bold', cellWidth: 28 },
              { content: responsableReceptor, cellWidth: 70 },
              { content: 'N° FICHA / C.I.:', fontStyle: 'bold', cellWidth: 28 },
              { content: ciReceptor }
            ],
            [
              { content: 'CARGO:', fontStyle: 'bold', cellWidth: 28 },
              { content: cargoReceptor, colSpan: 3 }
            ]
          ]
        });

        // --- TABLA DE EQUIPOS ---
        const tableBody = items.length > 0
          ? items.map((item, index) => [
              (index + 1).toString(), 
              item.codigo || item.codigo_patrimonial || item.etiqueta || item.serie || 'S/N', 
              item.nombre || item.descripcion || 'Equipo', 
              item.observaciones || ''
            ])
          : [['-', '-', 'No hay equipos registrados', '']];

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 3,
          margin: { left: 15, right: 15 },
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 1.8, lineColor: [0, 0, 0], lineWidth: 0.2 },
          headStyles: { fillColor: [233, 236, 239], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.2 },
          columnStyles: {
            0: { cellWidth: 12, halign: 'center' }, 
            1: { cellWidth: 40, halign: 'center', fontStyle: 'bold' }, 
            2: { cellWidth: 78 },                   
            3: { cellWidth: 50 }                    
          },
          head: [['CANT', 'CÓDIGO / ETIQUETA', 'DESCRIPCIÓN', 'OBSERVACIÓN']],
          body: tableBody
        });

        // --- NOTA ---
        const notaY = doc.lastAutoTable.finalY + 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('NOTA:', 15, notaY);
        doc.setFont('helvetica', 'normal');
        const notaTexto = 'Los equipos y/o herramientas arriba listados quedan bajo la entera responsabilidad de quien firma conforme. Se agradece el buen uso y cuidado de éstos a fin de preservar su integridad.';
        const splitNota = doc.splitTextToSize(notaTexto, 165);
        doc.text(splitNota, 26, notaY);

        // --- FIRMAS ---
        const firmaY = Math.max(notaY + 18, 245);
        const colWidth = 50;

        // Autorizado Por
        const x1 = 15;
        doc.setLineWidth(0.3);
        doc.line(x1, firmaY, x1 + colWidth, firmaY);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Autorizado por:', x1 + colWidth / 2, firmaY + 4, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Nombre: ${autorizadoPor}`, x1, firmaY + 8);
        doc.text(`Fecha: ${fecha}`, x1, firmaY + 12);

        // Elaborado Por
        const x2 = 80;
        doc.line(x2, firmaY, x2 + colWidth, firmaY);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Elaborado por:', x2 + colWidth / 2, firmaY + 4, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Nombre: ${elaboradoPor.toUpperCase()}`, x2, firmaY + 8);
        doc.text(`Fecha: ${fecha}`, x2, firmaY + 12);

        // Recibe Conforme
        const x3 = 145;
        doc.line(x3, firmaY, x3 + colWidth, firmaY);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Recibe conforme:', x3 + colWidth / 2, firmaY + 4, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Nombre: ${recibeConforme.toUpperCase()}`, x3, firmaY + 8);
        doc.text(`Fecha: ${fecha}`, x3, firmaY + 12);

        if (esAnulada) {
          doc.setTextColor(239, 68, 68);
          doc.setFontSize(60);
          doc.setFont('helvetica', 'bold');
          doc.text('ANULADA', 105, 150, { align: 'center', angle: 30, opacity: 0.2 });
        }

        doc.save(`Acta_Entrega_${numeroActa}.pdf`);
      };

      img.onload = construirPDF;
      img.onerror = () => {
        console.warn("No se pudo cargar el logo. Generando PDF sin logo.");
        construirPDF();
      };

    } catch (error) {
      console.error("Error PDF:", error);
      alert("No se pudo generar el PDF.");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-linear-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/80 p-6 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-md text-white">
              <ClipboardCheck size={24} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Control de Asignaciones y Actas</h1>
          </div>
          <p className="text-slate-500 text-sm mt-2 ml-12">Gestión de entrega formal de herramientas tecnológicas a custodios.</p>
        </div>
        {puedeCrear && (
          <button onClick={() => setIsModalOpen(true)} className="self-start sm:self-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2">
            <Plus size={16} /> Nueva Asignación
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl"><FileText size={22} /></div>
          <div><span className="text-xs font-bold text-slate-500 uppercase">Total Actas</span><span className="text-3xl font-black text-slate-800">{totalAsignaciones}</span></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl"><UserCheck size={22} /></div>
          <div><span className="text-xs font-bold text-slate-500 uppercase">Autorizadas</span><span className="text-3xl font-black text-slate-800">{totalAutorizados}</span></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl"><FileWarning size={22} /></div>
          <div><span className="text-xs font-bold text-slate-500 uppercase">Pendientes</span><span className="text-3xl font-black text-slate-800">{totalPendientes}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por acta, responsable, departamento, subdivisión o activo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Layers size={14} className="text-slate-400" />
            <select 
              value={selectedDeptoId} 
              onChange={(e) => setSelectedDeptoId(e.target.value)} 
              className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none"
            >
              <option value="">Todos los Departamentos</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id.toString()}>{d.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={selectedEstado} 
              onChange={(e) => setSelectedEstado(e.target.value)} 
              className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none"
            >
              <option value="">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Autorizado">Autorizado</option>
              <option value="Anulada">Anulada</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100/70 border-b border-slate-200">
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6 text-left">Código Acta</th>
                <th className="py-4 px-4 text-left">Responsable</th>
                <th className="py-4 px-4 text-left">Ubicación</th>
                <th className="py-4 px-4 text-center">Cant. Equipos</th>
                <th className="py-4 px-4 text-left">Fecha</th>
                <th className="py-4 px-4 text-center">Estado</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {asignacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">No hay asignaciones.</td>
                </tr>
              ) : (
                asignacionesFiltradas.map((asg) => {
                  const esAnulada = asg.estado_acta === 'Anulada';
                  const cantActivos = asg.activos?.length || 0;
                  const estadoMostrado = ESTADO_MOSTRAR[asg.estado_acta] || asg.estado_acta;
                  const esAutorizado = asg.estado_acta === 'Firmada';
                  
                  return (
                    <tr key={`${asg.id}-${asg.codigo}`} className={`group hover:bg-slate-50/80 ${esAnulada ? 'bg-slate-50/40' : ''}`}>
                      <td className="py-4 px-6 font-mono font-semibold text-blue-600">{asg.codigo}</td>
                      <td className="py-4 px-4 font-medium text-slate-800">{asg.responsable?.nombre_completo || '—'}</td>
                      <td className="py-4 px-4">
                        <div>
                          <span className="text-slate-700">{asg.departamento?.nombre || '—'}</span>
                          {asg.subdivision && <span className="block text-xs text-blue-600">↳ {asg.subdivision}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-700">{cantActivos}</td>
                      <td className="py-4 px-4 text-slate-500">
                        {asg.fecha_hora ? new Date(asg.fecha_hora).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) : asg.fecha || '—'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {puedeEditar ? (
                          <button
                            disabled={esAnulada || isLoading}
                            onClick={() => handleToggleEstado(asg.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                              esAnulada || isLoading
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : esAutorizado
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            {isLoading ? '...' : estadoMostrado}
                          </button>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            esAnulada
                              ? 'bg-slate-100 text-slate-400 border-slate-200'
                              : esAutorizado
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {estadoMostrado}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleVerActa(asg)} 
                            className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg"
                            title="Ver acta"
                          >
                            <FileText size={15} />
                          </button>
                          
                          {(esAutorizado || esAnulada) && (
                            <button 
                              onClick={descargarActaEntregaPDF} 
                              className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg"
                              title="Descargar PDF"
                            >
                              <Download size={15} />
                            </button>
                          )}
                          
                          {puedeAnular && !esAnulada && (
                            <button
                              onClick={() => handleAnular(asg.id)}
                              disabled={isLoading}
                              className={`p-1.5 rounded-lg ${
                                isLoading 
                                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                                  : 'bg-white border border-rose-200 text-rose-500 hover:bg-rose-50'
                              }`}
                              title="Anular asignación"
                            >
                              <FileX size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalAsignacion isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <ModalActaEntrega 
        isOpen={isActaOpen} 
        onClose={() => setIsActaOpen(false)} 
        datos={asignacionSeleccionada}
        puedeImprimir={puedeImprimir}
      />
    </div>
  );
};

export default Asignaciones;
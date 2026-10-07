// src/components/modals/ModalActaEntrega.jsx
import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import ActaEntregaContent from '../common/ActaEntregaContent';
import ActaDesincorporacionContent from '../common/ActaDesincorporacionContent';
import ActaOrdenSalidaContent from '../common/ActaOrdenSalidaContent';

const ModalActaEntrega = ({ isOpen, onClose, datos, puedeImprimir = false, tipo = 'asignacion' }) => {
  if (!isOpen || !datos) return null;

  const handlePrint = () => {
    if (!puedeImprimir) {
      alert('Esta acta no está autorizada. Solo puede imprimirla cuando esté autorizada.');
      return;
    }
    window.print();
  };

  const renderContent = () => {
    if (tipo === 'desincorporacion') {
      return <ActaDesincorporacionContent datos={datos} id="modal-acta" />;
    }
    if (tipo === 'orden_salida') {
      return <ActaOrdenSalidaContent datos={datos} id="modal-acta" />;
    }
    return <ActaEntregaContent datos={datos} id="modal-acta" />;
  };

  return (
    <>
      <style>{`
        @media print {
          /* 1. Margen 0 en @page desactiva los encabezados/pies de página del navegador (URL, fecha, Vite+React, página 1/1) */
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }

          /* 2. Ocultar todo el sitio web por defecto */
          body * {
            visibility: hidden !important;
          }

          /* 3. Mostrar SOLO el área del acta */
          #printable-area, #printable-area * {
            visibility: visible !important;
          }

          /* 4. Posicionar el acta y darle sus márgenes internos físicos de hoja A4 */
          #printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 15mm 20mm !important; /* Margen interno de impresión */
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }

          /* 5. Prevenir páginas adicionales y forzar colores reales */
          html, body {
            height: 297mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:static print:inset-auto print:p-0">
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity print:hidden"
          onClick={onClose}
        />

        <div className="bg-white rounded-xl shadow-2xl border border-solid border-slate-300 w-full max-w-4xl z-10 flex flex-col h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:h-auto print:w-full print:max-w-none print:shadow-none print:border-0 print:rounded-none">
          
          {/* Encabezado del Modal */}
          <div className="p-4 border-0 border-b border-solid border-slate-100 flex items-center justify-between bg-slate-50 print:hidden shrink-0">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg flex items-center justify-center ${
                tipo === 'desincorporacion' ? 'bg-rose-100 text-rose-700' :
                tipo === 'orden_salida' ? 'bg-orange-100 text-orange-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                <FileText size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-700 m-0 uppercase tracking-tight">
                {tipo === 'desincorporacion' ? 'Vista Previa: Acta de Desincorporación' :
                 tipo === 'orden_salida' ? 'Vista Previa: Orden de Salida' :
                 'Vista Previa: Acta de Entrega'}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrint}
                disabled={!puedeImprimir}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border-0 cursor-pointer shadow-sm ${
                  puedeImprimir 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
                title={puedeImprimir ? 'Imprimir acta' : 'Solo disponible para actas autorizadas'}
              >
                <Printer size={14} /> Imprimir Acta
              </button>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 border-0 bg-transparent cursor-pointer transition-colors flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Cuerpo del Modal con Previsualización A4 */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100/40 print:bg-white print:p-0 print:overflow-visible">
            <div id="printable-area" className="bg-white border border-solid border-slate-200 shadow-sm mx-auto w-full max-w-[210mm] min-h-[297mm] p-8 text-slate-800 flex flex-col justify-between print:border-0 print:shadow-none print:p-0 print:mx-0 print:min-h-0">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalActaEntrega;
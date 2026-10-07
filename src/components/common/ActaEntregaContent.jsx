// src/components/common/ActaEntregaContent.jsx
import React from 'react';
import logoEmpresa from '../../assets/logo-empresa.png';

const ActaEntregaContent = ({ datos, id }) => {
  if (!datos) return null;

  const numeroActa = datos.codigo || datos.id || 'N/A';
  const fecha = datos.fecha_hora 
    ? new Date(datos.fecha_hora).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : datos.fecha || 'N/A';
  const estado = datos.estado_acta || '';

  // Datos fijos del Emisor
  const deptoEmisor = 'DIRECCIÓN DE INFORMÁTICA, TECNOLOGÍA Y PUBLICACIONES';
  const responsableEmisor = 'ING. JONATHAN MORILLO';
  const cargoEmisor = 'DIRECTOR DE INFORMÁTICA, TECNOLOGÍA Y PUBLICACIONES';
  const ciEmisor = '14.986.385';

  // Datos dinámicos del Receptor
  const deptoReceptor = datos.departamento?.nombre || datos.departamento || 'JEFATURA DE DESARROLLO';
  const responsableReceptor = datos.responsable?.nombre_completo || datos.custodio || 'N/A';
  const cargoReceptor = datos.responsable?.cargo || 'N/A';
  const ciReceptor = datos.responsable?.cedula || 'N/A';

  const items = datos.activos || [];

  // Firmas dinámicas corregidas
  const autorizadoPor = datos.autorizadoPor?.nombre_completo || 'ING. JONATHAN MORILLO';
  
  // ============================================================
  // 🔥 PRIORIDAD MÁXIMA: datos.elaborado_por?.nombre_completo
  // ============================================================
  const entregadoPor = 
    datos.elaborado_por?.nombre_completo || // <-- NUEVO: prioridad máxima
    datos.entregado_por_nombre_completo ||
    datos.entregado_por?.nombre_completo || 
    datos.entregado_por?.nombre || 
    datos.entregado_por_nombre ||
    (typeof datos.entregado_por === 'string' ? datos.entregado_por : null) ||
    datos.creado_por?.nombre_completo || 
    datos.creado_por?.nombre ||
    datos.creadoPor?.nombre_completo ||
    datos.creadoPor?.nombre ||
    datos.creadoPor?.name ||
    datos.usuario?.nombre_completo ||
    datos.usuario?.nombre ||
    datos.entregadoPor?.nombre_completo || 
    datos.entregadoPor?.nombre ||
    'SOPORTE TÉCNICO';

  const recibeConforme = datos.responsable?.nombre_completo || datos.custodio || 'N/A';

  const esAnulada = estado === 'Anulada';

  return (
    <div id={`acta-${id || 'print'}`} className="acta-container">
      <style>{`
        /* Configuración base en pantalla */
        .acta-container {
          font-family: 'Arial', sans-serif;
          font-size: 11px;
          color: #000;
          background: white;
          width: 100%;
          max-width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 30px 40px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .acta-main {
          flex: 1;
        }

        .acta-footer {
          margin-top: auto;
          padding-top: 20px;
          width: 100%;
          background: white;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important; 
          }
          body * {
            visibility: hidden !important;
          }
          .acta-container, .acta-container * {
            visibility: visible !important;
          }
          .acta-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 297mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 15mm 20mm !important; 
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            box-sizing: border-box !important;
          }
          .acta-main {
            flex: 1 !important;
            padding-bottom: 20px !important;
          }
          .acta-footer {
            margin-top: auto !important;
            position: relative !important;
            page-break-inside: avoid !important;
          }
        }

        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        .header-table td {
          border: none;
          vertical-align: top;
        }

        .acta-title {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          margin: 15px 0 20px 0;
          text-transform: uppercase;
        }

        .section-title {
          font-weight: bold;
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }
        .info-table td {
          border: 1px solid #000;
          padding: 4px 6px;
        }
        .info-table .label {
          font-weight: bold;
        }

        .equipos-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 5px;
        }
        .equipos-table th, .equipos-table td {
          border: 1px solid #000;
          padding: 6px;
        }
        .equipos-table th {
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          background-color: #f3f4f6;
        }
        .equipos-table td.center {
          text-align: center;
        }

        .nota {
          font-size: 10px;
          margin-bottom: 35px;
          text-align: justify;
        }

        .firmas-table {
          width: 100%;
          border-collapse: collapse;
        }
        .firmas-table td.firma-col {
          border: none;
          vertical-align: top;
          padding: 0 15px;
          width: 33.33%;
        }
        .firma-line {
          border-top: 1px solid #000;
          text-align: center;
          font-size: 11px;
          padding-top: 4px;
          margin-bottom: 8px;
        }
        .firma-detalle {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        .firma-detalle td {
          border: none;
          padding: 2px 0;
        }
        .firma-detalle td.label-izq {
          text-align: left;
          width: 30%;
        }
        .firma-detalle td.valor-der {
          text-align: right;
          font-weight: bold;
          text-transform: uppercase;
        }

        .acta-anulada {
          position: absolute;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 80px;
          font-weight: bold;
          color: #ef4444;
          opacity: 0.2;
          pointer-events: none;
          border: 8px solid #ef4444;
          padding: 20px 40px;
          border-radius: 10px;
          letter-spacing: 8px;
          z-index: 10;
        }
      `}</style>

      {esAnulada && <div className="acta-anulada">ANULADA</div>}

      <div className="acta-main">
        {/* ENCABEZADO */}
        <table className="header-table">
          <tbody>
            <tr>
              <td style={{ width: '50%', textAlign: 'left' }}>
                <img src={logoEmpresa} alt="Logo TRANSMANDU" style={{ maxWidth: '230px', maxHeight: '65px', objectFit: 'contain' }} />
              </td>
              <td style={{ width: '50%', textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>{numeroActa}</div>
                <div style={{ fontSize: '13px' }}>FECHA: {fecha}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* TÍTULO */}
        <div className="acta-title">ASIGNACION DE EQUIPOS</div>

        {/* DEPENDENCIA EMISORA */}
        <div className="section-title">DEPENDENCIA EMISORA</div>
        <table className="info-table">
          <tbody>
            <tr>
              <td className="label" style={{ width: '15%' }}>DEPENDENCIA:</td>
              <td colSpan="3">{deptoEmisor}</td>
            </tr>
            <tr>
              <td className="label" style={{ width: '15%' }}>RESPONSABLE:</td>
              <td style={{ width: '45%' }}>{responsableEmisor}</td>
              <td className="label" style={{ width: '15%' }}>N° FICHA / C.I.:</td>
              <td style={{ width: '25%' }}>{ciEmisor}</td>
            </tr>
            <tr>
              <td className="label">CARGO:</td>
              <td colSpan="3">{cargoEmisor}</td>
            </tr>
          </tbody>
        </table>

        {/* DEPENDENCIA RECEPTORA */}
        <div className="section-title">DEPENDENCIA RECEPTORA</div>
        <table className="info-table">
          <tbody>
            <tr>
              <td className="label" style={{ width: '15%' }}>DEPENDENCIA:</td>
              <td colSpan="3">{deptoReceptor}</td>
            </tr>
            <tr>
              <td className="label" style={{ width: '15%' }}>RESPONSABLE:</td>
              <td style={{ width: '45%' }}>{responsableReceptor}</td>
              <td className="label" style={{ width: '15%' }}>N° FICHA / C.I.:</td>
              <td style={{ width: '25%' }}>{ciReceptor}</td>
            </tr>
            <tr>
              <td className="label">CARGO:</td>
              <td colSpan="3">{cargoReceptor}</td>
            </tr>
          </tbody>
        </table>

        {/* TABLA DE EQUIPOS */}
        <table className="equipos-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>CANT</th>
              <th style={{ width: '22%' }}>CÓDIGO / ETIQUETA</th>
              <th style={{ width: '43%' }}>DESCRIPCIÓN</th>
              <th style={{ width: '25%' }}>OBSERVACIÓN</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={index}>
                  <td className="center">1</td>
                  <td className="center" style={{ fontWeight: '600' }}>
                    {item.codigo || item.codigo_patrimonial || item.etiqueta || item.serie || 'N/A'}
                  </td>
                  <td>{item.nombre || item.descripcion || 'Equipo'}</td>
                  <td>{item.observaciones || ''}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="center">No hay equipos registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER Y FIRMAS */}
      <div className="acta-footer">
        <div className="nota">
          <strong>NOTA:</strong> Los equipos y/o herramientas arriba listados quedan bajo la entera responsabilidad de quien firma conforme. Se agradece el buen uso y cuidado de éstos a fin de preservar su integridad.
        </div>
        
        <table className="firmas-table">
          <tbody>
            <tr>
              <td className="firma-col">
                <div className="firma-line">Autorizado por:</div>
                <table className="firma-detalle">
                  <tbody>
                    <tr>
                      <td className="label-izq">Nombre:</td>
                      <td className="valor-der">{autorizadoPor}</td>
                    </tr>
                    <tr>
                      <td className="label-izq">Fecha:</td>
                      <td className="valor-der">{fecha}</td>
                    </tr>
                  </tbody>
                </table>
              </td>

              <td className="firma-col">
                <div className="firma-line">Elaborado por:</div>
                <table className="firma-detalle">
                  <tbody>
                    <tr>
                      <td className="label-izq">Nombre:</td>
                      <td className="valor-der">{entregadoPor}</td>
                    </tr>
                    <tr>
                      <td className="label-izq">Fecha:</td>
                      <td className="valor-der">{fecha}</td>
                    </tr>
                  </tbody>
                </table>
              </td>

              <td className="firma-col">
                <div className="firma-line">Recibe conforme:</div>
                <table className="firma-detalle">
                  <tbody>
                    <tr>
                      <td className="label-izq">Nombre:</td>
                      <td className="valor-der">{recibeConforme}</td>
                    </tr>
                    <tr>
                      <td className="label-izq">Fecha:</td>
                      <td className="valor-der">{fecha}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActaEntregaContent;
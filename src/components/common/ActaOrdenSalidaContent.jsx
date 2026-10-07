import React from 'react';
import logoEmpresa from '../../assets/logo-empresa.png';

const ActaOrdenSalidaContent = ({ datos, id }) => {
  if (!datos) return null;

  const numeroActa = datos.codigo || (datos.id ? `TMD-DIP-OS-${String(datos.id).padStart(5, '0')}` : 'N/A');
  
  // Formato de fecha textual (ejemplo: 1 de Abril del 2026)
  const fecha = datos.fecha_salida 
    ? new Date(datos.fecha_salida).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : datos.fecha || 'N/A';

  const estado = datos.estado || '';
  const esProcesada = estado === 'Procesada';

  const solicitante = datos.solicitante?.nombre_completo || datos.solicitante || 'N/A';
  const cedula = datos.cedula || datos.solicitante?.cedula || 'N/A';
  const cargo = datos.cargo || datos.solicitante?.cargo || 'N/A';
  const destino = datos.destino?.nombre || datos.destino || 'N/A';

  // Determinar preposición según el destino
  const preposicion = (['SAMAN', 'HANGAR', 'TALLER', 'ALMACEN'].includes(destino?.toUpperCase?.())) 
    ? 'al' 
    : 'a';

  const equipos = datos.activos || [];
  const autorizadoPor = 'ING. JONATHAN MORILLO';

  return (
    <div id={`acta-${id || 'print'}`} className="acta-container">
      <style>{`
        .acta-container {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11pt;
          color: #000;
          background: white;
          width: 100%;
          max-width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 20mm 20mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        .header-table td {
          vertical-align: top;
        }
        .logo-img {
          max-height: 50px;
          width: auto;
        }
        .codigo-header {
          text-align: right;
          font-size: 11pt;
          font-weight: bold;
          color: #555555;
        }

        .title {
          text-align: center;
          font-size: 15pt;
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 25px;
          text-transform: uppercase;
          color: #333333;
        }

        .intro-text {
          font-size: 10.5pt;
          text-align: justify;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px;
        }
        .data-table th, .data-table td {
          border: 1px solid #b0c2de;
          padding: 6px 8px;
          font-size: 9.5pt;
        }
        .data-table th {
          background-color: #8da4d0;
          color: #000;
          text-align: center;
          font-weight: bold;
        }
        .data-table td.center {
          text-align: center;
          font-weight: bold;
        }

        .tabla-label {
          text-align: center;
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .footer-firma {
          margin-top: auto;
          padding-bottom: 10mm;
          text-align: center;
        }
        .autorizado-titulo {
          font-size: 11pt;
          margin-bottom: 35px;
        }
        .firma-nombre {
          font-weight: bold;
          font-size: 11.5pt;
        }
        .firma-cargo {
          font-size: 10pt;
          font-weight: bold;
          margin-top: 2px;
        }
        .firma-empresa {
          font-size: 10pt;
          font-weight: bold;
          margin-top: 2px;
        }

        .watermark {
          position: absolute;
          top: 35%;
          left: 15%;
          transform: rotate(-30deg);
          font-size: 65pt;
          color: rgba(239, 68, 68, 0.2);
          font-weight: bold;
          pointer-events: none;
          z-index: 1000;
        }

        @media print {
          .acta-container {
            padding: 15mm 15mm !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* Sello de estado (solo si no está procesada) */}
      {!esProcesada && <div className="watermark">PENDIENTE</div>}

      {/* ENCABEZADO */}
      <table className="header-table">
        <tbody>
          <tr>
            <td style={{ width: '60%' }}>
              <img src={logoEmpresa} className="logo-img" alt="Logo TRANSMANDU" />
            </td>
            <td style={{ width: '40%' }} className="codigo-header">
              {numeroActa}
            </td>
          </tr>
        </tbody>
      </table>

      {/* TÍTULO */}
      <div className="title">ORDEN DE SALIDA</div>

      {/* PÁRRAFO INTRODUCTORIO */}
      <div className="intro-text">
        En fecha <strong>{fecha}</strong>, se hace entrega de los equipos y componentes detallados en la siguiente tabla (Tabla 1) al ciudadano <strong>{solicitante}</strong>, titular de la cédula de identidad <strong>{cedula}</strong>, <strong>{cargo}</strong> de la empresa <strong>TRANSMANDU, C.A.</strong>, con la finalidad de ser trasladado {preposicion} <strong>{destino}</strong>.
      </div>

      {/* TABLA DE EQUIPOS */}
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '8%' }}>N°</th>
            <th style={{ width: '77%', textAlign: 'left' }}>EQUIPO / COMPONENTE</th>
            <th style={{ width: '15%' }}>CANT</th>
          </tr>
        </thead>
        <tbody>
          {equipos.length > 0 ? (
            equipos.map((item, index) => {
              const codigo = item.codigo || item.etiqueta || '';
              const serial = item.serial ? `S/N: ${item.serial}` : (codigo ? `S/N: ${codigo}` : '');
              const descripcion = `${item.nombre || 'Equipo'} ${item.modelo || ''} ${serial}`.trim();
              return (
                <tr key={index}>
                  <td className="center">{index + 1}</td>
                  <td>{item.descripcion || descripcion}</td>
                  <td className="center">{item.cantidad || 1}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="center">1</td>
              <td>No hay equipos registrados</td>
              <td className="center">0</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="tabla-label">Tabla 1</div>

      {/* FIRMA (SIEMPRE ABAJO) */}
      <div className="footer-firma">
        <div className="autorizado-titulo">Autorizado por</div>
        <div className="firma-nombre">{autorizadoPor}</div>
        <div className="firma-cargo">DIRECTOR DE INFORMÁTICA, TECNOLOGÍA Y PUBLICACIONES</div>
        <div className="firma-empresa">TRANSMANDU, C.A.</div>
      </div>

    </div>
  );
};

export default ActaOrdenSalidaContent;
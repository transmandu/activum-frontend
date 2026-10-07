import React from 'react';
import logoEmpresa from '../../assets/logo-empresa.png';

const ActaDesincorporacionContent = ({ datos, id }) => {
  if (!datos) return null;

  const numeroActa = datos.codigo_acta || (datos.id ? `TMD-DIP-DS-${String(datos.id).padStart(5, '0')}` : 'N/A');
  const fecha = datos.fecha_baja 
    ? new Date(datos.fecha_baja).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'N/A';

  // Datos del emisor
  const emisor = {
    departamento: 'DIRECCIÓN DE INFORMÁTICA, TECNOLOGÍA Y PUBLICACIONES',
    responsable: 'ING. JONATHAN MORILLO',
    ci: '14.986.385',
    cargo: 'DIRECTOR DE INFORMÁTICA, TECNOLOGÍA Y PUBLICACIONES',
  };

  // Se fuerza a ING. JONATHAN MORILLO para garantizar coherencia en las actas
  const autorizadoPor = 'ING. JONATHAN MORILLO';

  // Equipos a desincorporar
  const equipos = datos.activos_incluidos || datos.activos || [];

  return (
    <div id={`acta-${id || 'print'}`} className="acta-container">
      <style>{`
        .acta-container {
          font-family: 'Arial', sans-serif;
          font-size: 11px;
          color: #000;
          background: white;
          width: 100%;
          max-width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 25mm 15mm 20mm 15mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* Encabezado */
        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .header-table td {
          vertical-align: middle;
        }
        .logo-img {
          max-height: 55px;
          width: auto;
        }
        .codigo-fecha {
          text-align: right;
          font-size: 12px;
          font-weight: bold;
          line-height: 1.8;
        }
        /* Se quita el borde/rectángulo alrededor del código */
        .codigo-box {
          display: inline-block;
          font-size: 12px;
          font-weight: bold;
          padding: 2px 0;
        }

        /* Título */
        .title {
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        /* Tablas */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }
        .data-table th, .data-table td {
          border: 1px solid #000;
          padding: 5px 6px;
          font-size: 9.5px;
          vertical-align: middle;
        }
        .data-table th.section-title {
          background-color: #e9ecef;
          text-align: center;
          font-weight: bold;
          font-size: 10px;
        }
        .label-cell {
          font-weight: bold;
          width: 18%;
        }
        .center {
          text-align: center;
        }

        /* Tabla de equipos */
        .equipos-table th {
          background-color: #e9ecef;
          text-align: center;
          font-weight: bold;
        }

        /* Nota */
        .nota-box {
          font-size: 8.5px;
          margin-top: 15px;
          margin-bottom: 30px;
          text-align: justify;
          page-break-inside: avoid;
        }

        /* Firma (Siempre abajo) */
        .firma-box {
          margin-top: auto;
          text-align: center;
          page-break-inside: avoid;
        }
        .firma-line {
          border-top: 1px solid #000;
          width: 50%;
          margin: 0 auto;
          padding-top: 5px;
        }
        .firma-nombre {
          font-weight: bold;
          font-size: 12px;
          margin-top: 6px;
        }
        .firma-fecha {
          font-size: 10px;
          margin-top: 2px;
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

      {/* ENCABEZADO */}
      <table className="header-table">
        <tbody>
          <tr>
            <td style={{ width: '50%' }}>
              <img src={logoEmpresa} className="logo-img" alt="Logo TRANSMANDU" />
            </td>
            <td style={{ width: '50%' }} className="codigo-fecha">
              <div className="codigo-box">{numeroActa}</div>
              <div style={{ marginTop: '2px' }}>FECHA: {fecha}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* TÍTULO */}
      <div className="title">DESINCORPORACIÓN</div>

      {/* DEPARTAMENTO EMISOR */}
      <table className="data-table">
        <tbody>
          <tr>
            <th colSpan="4" className="section-title">DEPARTAMENTO EMISOR</th>
          </tr>
          <tr>
            <td className="label-cell">DEPARTAMENTO:</td>
            <td colSpan="3">{emisor.departamento}</td>
          </tr>
          <tr>
            <td className="label-cell">RESPONSABLE:</td>
            <td>{emisor.responsable}</td>
            <td className="label-cell" style={{ width: '18%' }}>N° FICHA / C.I.:</td>
            <td>{emisor.ci}</td>
          </tr>
          <tr>
            <td className="label-cell">CARGO:</td>
            <td colSpan="3">{emisor.cargo}</td>
          </tr>
        </tbody>
      </table>

      {/* TABLA DE EQUIPOS */}
      <table className="data-table equipos-table">
        <thead>
          <tr>
            <th style={{ width: '15%' }}>CANTIDAD</th>
            <th style={{ width: '55%' }}>DESCRIPCIÓN</th>
            <th style={{ width: '30%' }}>OBSERVACIÓN</th>
          </tr>
        </thead>
        <tbody>
          {equipos.length > 0 ? (
            equipos.map((item, index) => (
              <tr key={index}>
                <td className="center">{item.cantidad || 1}</td>
                <td>{item.nombre || item.descripcion || 'Equipo'}</td>
                <td>{item.observacion || item.observaciones || ''}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="center">1</td>
              <td>{datos.activo || 'No hay equipos registrados'}</td>
              <td></td>
            </tr>
          )}
        </tbody>
      </table>

      {/* NOTA */}
      <div className="nota-box">
        <strong>NOTA:</strong> Este documento certifica la baja definitiva del(los) activo(s) mencionado(s).
      </div>

      {/* FIRMA: Autorizado por */}
      <div className="firma-box">
        <div className="firma-line"></div>
        <div style={{ fontWeight: 'bold', marginTop: '8px' }}>Autorizado por</div>
        <div className="firma-nombre">{autorizadoPor}</div>
        <div className="firma-fecha">Fecha: {fecha}</div>
      </div>

    </div>
  );
};

export default ActaDesincorporacionContent;
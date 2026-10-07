// src/utils/generarActaPDF.jsx
import html2pdf from 'html2pdf.js';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ActaEntregaContent from '../components/common/ActaEntregaContent';

export const generarActaPDF = (datos, filename = 'Acta_Entrega.pdf') => {
  try {
    // Renderizar el componente a HTML
    const htmlContent = ReactDOMServer.renderToString(
      <ActaEntregaContent datos={datos} id="pdf-acta" />
    );

    // Crear un elemento temporal para el PDF
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    element.style.width = '210mm';
    element.style.padding = '20px';
    element.style.backgroundColor = 'white';
    document.body.appendChild(element);

    // Opciones de html2pdf
    const opt = {
      margin:        [10, 10, 10, 10],
      filename:      filename,
      image:         { type: 'jpeg', quality: 0.98 },
      html2canvas:   { scale: 2, letterRendering: true, useCORS: true, logging: false },
      jsPDF:         { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generar PDF y descargar
    html2pdf().set(opt).from(element).save().then(() => {
      // Limpiar elemento temporal
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
    });
  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('No se pudo generar el PDF. Revisa la consola.');
  }
};
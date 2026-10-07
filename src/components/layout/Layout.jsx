import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import CarritoPanel from '../common/CarritoPanel';
import { useData } from '../../context/DataContext';

const Layout = ({ children }) => {
  // Estado para controlar la apertura del menú flotante únicamente en dispositivos móviles
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const { carritoAbierto, toggleCarrito } = useData();

  return (
    /* Mantenemos tu contenedor principal e instrucciones originales */
    <div className="flex bg-[#f8fafc] min-h-screen relative overflow-hidden">
      
      {/* 1. MENÚ LATERAL: Recibe las funciones de apertura/cierre aisladas para móviles */}
      <Sidebar isOpen={sidebarAbierto} onClose={() => setSidebarAbierto(false)} />
      
      {/* 2. OVERLAY OSCURO TRASLÚCIDO: Solo se dibuja en pantallas táctiles (lg:hidden) cuando el menú está abierto */}
      {sidebarAbierto && (
        <div 
          onClick={() => setSidebarAbierto(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}
      
      {/* 3. CONTENEDOR PRINCIPAL: En PC mantiene tu 'ml-64' estricto e intacto sin comprimirse nada */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 w-full">
        
        {/* Pasamos el disparador al Header para activar el menú en móviles desde el botón de hamburguesa */}
        <Header onMenuToggle={() => setSidebarAbierto(!sidebarAbierto)} />
        
        {/* 4. ÁREA DE TRABAJO: Conserva tus estilos originales de PC 'pt-16 p-8' intactos y legibles */}
        <main className="pt-16 p-4 sm:p-6 lg:p-8 flex-1 min-w-0 w-full overflow-x-hidden">
          {children}
        </main>
        
      </div>

      {/* 5. PANEL DEL CARRITO */}
      <CarritoPanel isOpen={carritoAbierto} onClose={() => toggleCarrito()} />
    </div>
  );
};

export default Layout;
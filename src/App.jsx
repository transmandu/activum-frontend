import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard';
import Activos from './pages/Activos';
import Asignaciones from './pages/Asignaciones';
import Incidencias from './pages/Incidencias';
import Cronogramas from './pages/Cronogramas';
import Tareas from './pages/Tareas';
import OrdenesSalida from './pages/OrdenesSalida';
import Desincorporaciones from './pages/Desincorporaciones';
import Proveedores from './pages/Proveedores';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import Perfil from './pages/Perfil';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminRoles from './pages/AdminRoles';

import AdminCategorias from './pages/AdminCategorias';
import AdminMarcas from './pages/AdminMarcas';
import AdminModelos from './pages/AdminModelos';
import AdminDepartamentos from './pages/AdminDepartamentos';
import AdminPersonal from './pages/AdminPersonal';
import AdminUbicaciones from './pages/AdminUbicaciones';
import AdminPlataformasTest from './pages/AdminPlataformasTest';
import AdminDestinos from './pages/AdminDestinos';
import AdminLicencias from './pages/AdminLicencias';
import AdminDominios from './pages/AdminDominios';
import AdminInterfaces from './pages/AdminInterfaces';
import AdminDiscos from './pages/AdminDiscos';
import AdminConfigRaid from './pages/AdminConfigRaid';
import AdminEstados from './pages/AdminEstados';

// ===== NUEVO: INVENTARIO =====
import Inventario from './pages/Inventario';

import { DataProvider, useData } from './context/DataContext';

function ContenidoSistema() {
  const { usuarioLogueado } = useData();

  if (!usuarioLogueado) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Módulos principales */}
        <Route path="/activos" element={<Activos />} />
        <Route path="/asignaciones" element={<Asignaciones />} />
        <Route path="/incidencias" element={<Incidencias />} />
        <Route path="/cronogramas" element={<Cronogramas />} />
        <Route path="/tareas" element={<Tareas />} />
        <Route path="/salidas" element={<OrdenesSalida />} />
        <Route path="/desincorporaciones" element={<Desincorporaciones />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/perfil" element={<Perfil />} />

        {/* ===== NUEVO: MÓDULO DE INVENTARIO ===== */}
        <Route path="/inventario" element={<Inventario />} />

        {/* ===== ADMINISTRACIÓN DE USUARIOS Y ROLES ===== */}
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/roles" element={<AdminRoles />} />

        {/* ===== ADMINISTRACIÓN DE CATÁLOGOS ===== */}
        <Route path="/admin/categorias" element={<AdminCategorias />} />
        <Route path="/admin/marcas" element={<AdminMarcas />} />
        <Route path="/admin/modelos" element={<AdminModelos />} />
        <Route path="/admin/departamentos" element={<AdminDepartamentos />} />
        <Route path="/admin/personal" element={<AdminPersonal />} />
        <Route path="/admin/ubicaciones" element={<AdminUbicaciones />} />
        <Route path="/admin/plataformas-test" element={<AdminPlataformasTest />} />
        <Route path="/admin/destinos" element={<AdminDestinos />} />
        <Route path="/admin/licencias" element={<AdminLicencias />} />
        <Route path="/admin/dominios" element={<AdminDominios />} />
        <Route path="/admin/interfaces" element={<AdminInterfaces />} />
        <Route path="/admin/discos" element={<AdminDiscos />} />
        <Route path="/admin/config-raid" element={<AdminConfigRaid />} />
        <Route path="/admin/estados" element={<AdminEstados />} />

        {/* Ruta comodín */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <DataProvider>
      <ContenidoSistema />
    </DataProvider>
  );
}

export default App;
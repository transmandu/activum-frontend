// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Laptop, UserCheck, Calendar, CheckSquare, 
  FolderOutput, Trash2, Users, BarChart3, Settings, LogOut, X,
  Package, Shield, Key, ChevronDown, ChevronRight,
  Tag, Building2, Activity, MapPin, Globe, HardDrive, Server
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { usuarioLogueado, cerrarSesion, userPermissions } = useData();
  const navigate = useNavigate();
  const isAdmin = usuarioLogueado?.rol === 'Administrador';

  // Estado para controlar la expansión del submenú de Usuarios
  const [usuariosExpanded, setUsuariosExpanded] = useState(false);
  // Estado para controlar la expansión del submenú de Configuración
  const [configuracionExpanded, setConfiguracionExpanded] = useState(false);

  // MAPA DE PERMISOS POR ÍTEM
  const menuPermissionMap = {
    dashboard: ['ver_dashboard'],
    activos: ['ver_activos'],
    inventario: ['ver_inventario'],
    asignaciones: ['ver_asignaciones'],
    bajas: ['ver_desincorporaciones'],
    salidas: ['ver_ordenes_salida'],
    cronogramas: ['ver_cronogramas'],
    tareas: ['ver_tareas'],
    proveedores: ['ver_proveedores'],
    reportes: ['ver_reportes'],
    configuracion: ['ver_configuracion'],
    usuarios: ['ver_usuarios', 'gestionar_roles'],
    admin_usuarios: ['ver_usuarios'],
    admin_roles: ['gestionar_roles'],
    config_general: ['ver_configuracion'],
    config_categorias: ['ver_configuracion'],
    config_marcas: ['ver_configuracion'],
    config_modelos: ['ver_configuracion'],
    config_departamentos: ['ver_configuracion'],
    config_personal: ['ver_configuracion'],
    config_ubicaciones: ['ver_configuracion'],
    config_plataformas: ['ver_configuracion'],
    config_destinos: ['ver_configuracion'],
    config_licencias: ['ver_configuracion'],
    config_dominios: ['ver_configuracion'],
    config_interfaces: ['ver_configuracion'],
    config_discos: ['ver_configuracion'],
    config_raid: ['ver_configuracion'],
    config_estados: ['ver_configuracion'],
  };

  // FUNCIÓN PARA VERIFICAR PERMISOS (solo si no es admin)
  const tienePermiso = (permisosNecesarios) => {
    if (isAdmin) return true;
    if (!permisosNecesarios || permisosNecesarios.length === 0) return true;
    return permisosNecesarios.some(p => userPermissions.includes(p));
  };

  // Definición de secciones con títulos y elementos
  const secciones = [
    {
      titulo: null,
      items: [
        { id: 'dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, text: 'Dashboard' }
      ]
    },
    {
      titulo: 'Operaciones',
      items: [
        { id: 'activos', path: '/activos', icon: <Laptop size={20} />, text: 'Activos' },
        { id: 'inventario', path: '/inventario', icon: <Package size={20} />, text: 'Inventario' },
        { id: 'asignaciones', path: '/asignaciones', icon: <UserCheck size={20} />, text: 'Asignaciones' },
        { id: 'bajas', path: '/desincorporaciones', icon: <Trash2 size={20} />, text: 'Desincorporación' },
        { id: 'salidas', path: '/salidas', icon: <FolderOutput size={20} />, text: 'Órdenes de Salida' },
      ]
    },
    {
      titulo: 'Planificación',
      items: [
        { id: 'cronogramas', path: '/cronogramas', icon: <Calendar size={20} />, text: 'Cronogramas' },
        { id: 'tareas', path: '/tareas', icon: <CheckSquare size={20} />, text: 'Tareas' },
      ]
    },
    {
      titulo: 'Gestión',
      items: [
        { id: 'proveedores', path: '/proveedores', icon: <Users size={20} />, text: 'Proveedores C.A.' },
        { id: 'reportes', path: '/reportes', icon: <BarChart3 size={20} />, text: 'Reportes e Informes' },
      ]
    },
    {
      titulo: 'Sistema',
      items: [
        { 
          id: 'usuarios', 
          icon: <Users size={20} />, 
          text: 'Usuarios y Permisos',
          subItems: [
            { id: 'admin_usuarios', path: '/admin/usuarios', icon: <Users size={20} />, text: 'Administrar Usuarios' },
            { id: 'admin_roles', path: '/admin/roles', icon: <Shield size={20} />, text: 'Administrar Roles' },
          ]
        },
        { 
          id: 'configuracion', 
          icon: <Settings size={20} />, 
          text: 'Configuración',
          subItems: [
            { id: 'config_general', path: '/configuracion', icon: <Settings size={20} />, text: 'Parámetros Generales' },
            { id: 'config_categorias', path: '/admin/categorias', icon: <Tag size={20} />, text: 'Categorías' },
            { id: 'config_marcas', path: '/admin/marcas', icon: <Tag size={20} />, text: 'Marcas' },
            { id: 'config_modelos', path: '/admin/modelos', icon: <Tag size={20} />, text: 'Modelos' },
            { id: 'config_departamentos', path: '/admin/departamentos', icon: <Building2 size={20} />, text: 'Departamentos' },
            { id: 'config_personal', path: '/admin/personal', icon: <Users size={20} />, text: 'Personal' },
            { id: 'config_ubicaciones', path: '/admin/ubicaciones', icon: <MapPin size={20} />, text: 'Ubicaciones' },
            { id: 'config_plataformas', path: '/admin/plataformas-test', icon: <Activity size={20} />, text: 'Plataformas Test' },
            { id: 'config_destinos', path: '/admin/destinos', icon: <MapPin size={20} />, text: 'Destinos' },
            { id: 'config_licencias', path: '/admin/licencias', icon: <Key size={20} />, text: 'Licencias' },
            { id: 'config_dominios', path: '/admin/dominios', icon: <Globe size={20} />, text: 'Dominios' },
            { id: 'config_interfaces', path: '/admin/interfaces', icon: <Activity size={20} />, text: 'Interfaces' },
            { id: 'config_discos', path: '/admin/discos', icon: <HardDrive size={20} />, text: 'Discos' },
            { id: 'config_raid', path: '/admin/config-raid', icon: <Server size={20} />, text: 'Configuraciones RAID' },
            { id: 'config_estados', path: '/admin/estados', icon: <Tag size={20} />, text: 'Estados' },
          ]
        },
      ]
    }
  ];

  const seccionesFiltradas = secciones
    .map(seccion => {
      const itemsFiltrados = seccion.items.filter(item => {
        // Si es admin, mostrar todo sin filtrar
        if (isAdmin) return true;

        // Si no es admin, filtrar por permisos
        if (item.subItems) {
          const subItemsVisibles = item.subItems.filter(sub => 
            tienePermiso(menuPermissionMap[sub.id])
          );
          item.subItems = subItemsVisibles;
          return subItemsVisibles.length > 0;
        }

        const permisos = menuPermissionMap[item.id];
        return tienePermiso(permisos);
      });

      return { ...seccion, items: itemsFiltrados };
    })
    .filter(seccion => seccion.items.length > 0 || seccion.titulo === null);

  // Función para manejar el clic en el elemento "Usuarios y Permisos"
  const handleUsuariosClick = (e) => {
    e.preventDefault();
    setUsuariosExpanded(!usuariosExpanded);
  };

  // Función para manejar el clic en el elemento "Configuración"
  const handleConfiguracionClick = (e) => {
    e.preventDefault();
    setConfiguracionExpanded(!configuracionExpanded);
  };

  // Función para manejar clic en subítems
  const handleSubItemClick = (path) => {
    if (window.innerWidth < 1024) onClose();
    navigate(path);
  };

  // Función para renderizar un elemento del menú (puede ser padre o hijo)
  const renderMenuItem = (item) => {
    // Si es el elemento "Usuarios y Permisos" (tiene subItems)
    if (item.id === 'usuarios' && item.subItems) {
      // Solo mostrar si el usuario es admin (o si tiene permisos, pero el filtro ya lo hizo)
      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={handleUsuariosClick}
            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm font-medium border-0 text-left no-underline cursor-pointer transition-all text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.text}</span>
            </div>
            {usuariosExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {usuariosExpanded && (
            <div className="ml-7 mt-1 space-y-1">
              {item.subItems.map(sub => (
                <NavLink
                  key={sub.id}
                  to={sub.path}
                  onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium border-0 text-left no-underline cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/10' 
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`
                  }
                >
                  {sub.icon}
                  <span>{sub.text}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Elemento Configuración con subItems
    if (item.id === 'configuracion' && item.subItems) {
      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={handleConfiguracionClick}
            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm font-medium border-0 text-left no-underline cursor-pointer transition-all text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.text}</span>
            </div>
            {configuracionExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {configuracionExpanded && (
            <div className="ml-7 mt-1 space-y-1">
              {item.subItems.map(sub => (
                <NavLink
                  key={sub.id}
                  to={sub.path}
                  onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium border-0 text-left no-underline cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/10' 
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`
                  }
                >
                  {sub.icon}
                  <span>{sub.text}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Elemento normal (sin subItems)
    return (
      <NavLink
        key={item.id}
        to={item.path}
        onClick={() => { if (window.innerWidth < 1024) onClose(); }}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium border-0 text-left no-underline cursor-pointer transition-all ${
            isActive 
              ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/10' 
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
          }`
        }
      >
        {item.icon}
        <span>{item.text}</span>
      </NavLink>
    );
  };

  return (
    <aside 
      className={`fixed top-0 bottom-0 left-0 w-64 bg-slate-900 border-0 border-r border-solid border-slate-800 flex flex-col z-50 text-slate-400 transition-transform duration-300 ease-in-out h-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* ENCABEZADO LOGO */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/20">TM</div>
          <div className="text-left">
            <span className="text-sm font-black text-white block tracking-tight">Soporte I.T</span>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mt-0.5">Gestión de Activos</span>
          </div>
        </div>
        <button 
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800/50 border-0 rounded-lg cursor-pointer lg:hidden flex items-center justify-center touch-manipulation"
        >
          <X size={16} />
        </button>
      </div>

      {/* ÁREA DE NAVEGACIÓN */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-4">
          {seccionesFiltradas.map((seccion, idx) => (
            <div key={idx}>
              {seccion.titulo && (
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-1.5">
                  {seccion.titulo}
                </div>
              )}
              <div className="space-y-1">
                {seccion.items.map(item => renderMenuItem(item))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* SECCIÓN INFERIOR - solo cerrar sesión */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <button 
          onClick={cerrarSesion}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border-0 bg-transparent cursor-pointer"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, ChevronDown, LogOut, Settings, Menu,
  AlertTriangle, FileText, Wrench, CheckCircle2, Shield, X, User, Activity,
  PlusCircle, Truck, Building2, AlertCircle, CheckCheck
} from 'lucide-react';
import { useData } from "../../context/DataContext";

// Función auxiliar para extraer nombre de objeto o string
const extraerNombre = (valor) => {
  if (!valor) return '';
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'object' && valor !== null) {
    return valor.nombre || valor.name || '';
  }
  return String(valor);
};

const Header = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    activos, asignaciones, desincorporaciones, ordenesSalida, proveedores, incidencias,
    usuarioLogueado, cerrarSesion
  } = useData();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify([...readNotifications]));
  }, [readNotifications]);

  const generarNotificacionesReales = () => {
    const alertas = [];

    [...(activos || [])].reverse().slice(0, 5).forEach((a, idx) => {
      alertas.push({
        id: `activo-${a.codigo || idx}`,
        texto: `Nuevo activo registrado: ${extraerNombre(a.nombre)} (${a.codigo})`,
        hora: a.created_at ? new Date(a.created_at).toLocaleString() : 'Reciente',
        icon: <PlusCircle size={14} className="text-green-500" />,
        bgColor: "bg-green-50",
        linkTo: '/activos'
      });
    });

    activos?.filter(a => a.estado === 'Mantenimiento' || a.estado === 'En Mantenimiento').forEach((a, idx) => {
      alertas.push({
        id: `mtto-${a.codigo || idx}`,
        texto: `Equipo [${a.codigo}] ingresó a Mantenimiento.`,
        hora: 'Activo en taller',
        icon: <Wrench size={14} className="text-amber-500" />,
        bgColor: "bg-amber-50",
        linkTo: '/cronogramas'
      });
    });

    [...(asignaciones || [])].reverse().slice(0, 5).forEach((asig) => {
      const esAnulada = asig.estado_acta === 'Anulada';
      alertas.push({
        id: `asig-${asig.codigo || asig.id}`,
        texto: esAnulada 
          ? `Acta N° ${asig.codigo} fue ANULADA.` 
          : `Nueva Acta N° ${asig.codigo} emitida a ${extraerNombre(asig.custodio || 'Personal')}.`,
        hora: asig.fecha || 'Reciente',
        icon: esAnulada ? <AlertTriangle size={14} className="text-rose-500" /> : <FileText size={14} className="text-blue-500" />,
        bgColor: esAnulada ? "bg-rose-50" : "bg-blue-50",
        linkTo: '/asignaciones'
      });
    });

    [...(desincorporaciones || [])].reverse().slice(0, 5).forEach((baja) => {
      alertas.push({
        id: `baja-${baja.codigo_acta || baja.id}`,
        texto: `Equipo ${extraerNombre(baja.activo)} ha sido desincorporado (${extraerNombre(baja.motivo)})`,
        hora: baja.fecha_baja || 'Reciente',
        icon: <AlertCircle size={14} className="text-rose-500" />,
        bgColor: "bg-rose-50",
        linkTo: '/desincorporaciones'
      });
    });

    [...(ordenesSalida || [])].reverse().slice(0, 5).forEach((ord) => {
      alertas.push({
        id: `orden-${ord.codigo || ord.id}`,
        texto: `Orden de salida generada: ${extraerNombre(ord.activo)} solicitada por ${extraerNombre(ord.solicitante)}`,
        hora: ord.fecha_salida || 'Reciente',
        icon: <Truck size={14} className="text-orange-500" />,
        bgColor: "bg-orange-50",
        linkTo: '/salidas'
      });
    });

    [...(proveedores || [])].reverse().slice(0, 5).forEach((prov) => {
      alertas.push({
        id: `prov-${prov.codigo || prov.id}`,
        texto: `Nuevo proveedor registrado: ${extraerNombre(prov.nombre)}`,
        hora: prov.created_at ? new Date(prov.created_at).toLocaleString() : 'Reciente',
        icon: <Building2 size={14} className="text-teal-500" />,
        bgColor: "bg-teal-50",
        linkTo: '/proveedores'
      });
    });

    [...(incidencias || [])].reverse().slice(0, 5).forEach((inc) => {
      alertas.push({
        id: `inc-${inc.codigo || inc.id}`,
        texto: `Incidencia reportada: ${extraerNombre(inc.titulo)} (Prioridad ${extraerNombre(inc.prioridad)})`,
        hora: inc.fecha_hora || 'Reciente',
        icon: <AlertTriangle size={14} className="text-red-500" />,
        bgColor: "bg-red-50",
        linkTo: '/incidencias'
      });
    });

    return alertas.sort((a, b) => {
      if (a.hora === 'Activo' && b.hora !== 'Activo') return -1;
      if (a.hora !== 'Activo' && b.hora === 'Activo') return 1;
      return 0;
    });
  };

  const allNotifications = generarNotificacionesReales();
  const unreadNotifications = allNotifications.filter(notif => !readNotifications.has(notif.id));
  const unreadCount = unreadNotifications.length;

  const markAsRead = (id, e) => {
    e.stopPropagation();
    setReadNotifications(prev => new Set(prev).add(id));
  };

  const markAllAsRead = () => {
    const allIds = allNotifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
  };

  return (
    <header className="h-16 bg-white border-0 border-b border-solid border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm w-full shrink-0">
      
      {/* Izquierda - Solo menú hamburguesa */}
      <div className="flex items-center gap-3 text-left">
        <button 
          type="button"
          onClick={onMenuToggle}
          className="p-2 text-slate-500 hover:bg-slate-50 border-0 bg-transparent rounded-lg cursor-pointer lg:hidden flex items-center justify-center shrink-0"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Derecha - Campana y Perfil */}
      <div className="flex items-center gap-5 shrink-0">
        
        {/* Campana de Notificaciones */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-solid border-slate-200 rounded-xl cursor-pointer transition-all relative flex items-center justify-center"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-solid border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-solid border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-left max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-900 px-4 py-3 flex items-center justify-between sticky top-0">
                <span className="text-[10px] font-black uppercase text-white tracking-wider">
                  Notificaciones ({unreadCount} no leídas)
                </span>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-white hover:text-blue-300 transition-colors"
                      title="Marcar todas como leídas"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => setIsNotificationsOpen(false)} 
                    className="text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer text-xs p-0"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {allNotifications.length > 0 ? (
                  allNotifications.map((notif) => {
                    const isRead = readNotifications.has(notif.id);
                    return (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          if (notif.linkTo) navigate(notif.linkTo);
                          if (!isRead) markAsRead(notif.id, { stopPropagation: () => {} });
                          setIsNotificationsOpen(false);
                        }}
                        className={`p-3 transition-colors flex items-start gap-3 hover:bg-slate-50/60 cursor-pointer ${!isRead ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${notif.bgColor}`}>
                          {notif.icon}
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <p className="text-xs text-slate-700 font-bold m-0 leading-tight">{notif.texto}</p>
                          <span className="text-[10px] text-slate-400 font-medium block">{notif.hora}</span>
                        </div>
                        {!isRead && (
                          <button
                            onClick={(e) => markAsRead(notif.id, e)}
                            className="text-slate-400 hover:text-green-600"
                            title="Marcar como leída"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 font-medium">
                    No hay notificaciones.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Perfil */}
        <div ref={profileRef} className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 border border-solid border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer bg-transparent"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-blue-400 border border-solid border-slate-800 shadow-sm shrink-0">
              {usuarioLogueado?.nombre ? usuarioLogueado.nombre.substring(0, 2).toUpperCase() : 'IT'}
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs font-bold text-slate-700 block leading-tight">
                {usuarioLogueado?.nombre || 'Analista Técnico'}
              </span>
              <span className="text-[9px] text-slate-400 block font-medium">
                {usuarioLogueado?.rol || 'Personal I.T.'}
              </span>
            </div>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-11 w-48 bg-white border border-solid border-slate-200 rounded-xl shadow-lg z-50 py-1 text-left">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Nivel de Acceso</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <Shield size={11} /> {usuarioLogueado?.rol || 'Personal I.T.'}
                </span>
              </div>
              
              <button 
                onClick={() => { navigate('/perfil'); setIsProfileOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-slate-50 border-0 bg-transparent text-left cursor-pointer transition-colors font-semibold"
              >
                <User size={13} className="text-slate-400" />
                Cuenta
              </button>
              
              <hr className="border-0 border-b border-solid border-slate-100 my-1" />
              
              <button 
                onClick={() => { setIsProfileOpen(false); cerrarSesion(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50/60 border-0 bg-transparent text-left cursor-pointer font-bold transition-colors"
              >
                <LogOut size={13} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
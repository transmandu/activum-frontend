// src/pages/Dashboard.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Laptop, CheckCircle, Wrench, ArrowUpRight,
  User, Clock, FileCheck, ArrowDownCircle, Activity, AlertTriangle,
  CalendarDays, HardDrive, Users, Server, Monitor, ExternalLink
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useData } from '../context/DataContext';

const COLORS_PIE = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, icon, change, changeType, bgColor, onClick, linkTo }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) onClick();
    else if (linkTo) navigate(linkTo);
  };
  return (
    <div onClick={handleClick} className="bg-white p-6 rounded-xl shadow-sm border border-solid border-slate-200 flex items-center justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
      <div className="space-y-2 text-left">
        <p className="text-xs font-black text-slate-400 uppercase tracking-wider m-0">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 m-0 tracking-tight">{value}</h3>
        {change && <p className={`text-xs m-0 font-bold flex items-center gap-1 ${changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}><span>{change}</span> <span className="text-slate-400 font-medium">este mes</span></p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border border-solid ${bgColor}`}>{icon}</div>
    </div>
  );
};

// Función auxiliar para extraer nombre de objeto o string
const extraerNombre = (valor) => {
  if (!valor) return 'N/A';
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'object' && valor !== null) {
    return valor.nombre_completo || valor.name || valor.nombre || 'N/A';
  }
  return String(valor);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    activos = [], 
    asignaciones = [], 
    cronogramas = [], 
    desincorporaciones = [], 
    mantenimientosActivos = {} 
  } = useData();

  // ============================================================
  // KPIs CORREGIDOS (usando extraerNombre para relaciones)
  // ============================================================
  const totalActivos = activos.length;
  
  // ✅ Extraer el nombre del estado correctamente
  const activosOperativos = activos.filter(a => extraerNombre(a.estado) === 'Operativo').length;
  const activosMantenimiento = activos.filter(a => {
    const estado = extraerNombre(a.estado);
    return estado === 'Mantenimiento' || estado === 'En Mantenimiento';
  }).length;
  
  const actasActivas = asignaciones.filter(a => a.estado_acta !== 'Anulada').length;
  
  const tasaDisponibilidad = totalActivos > 0 ? ((activosOperativos / totalActivos) * 100).toFixed(1) : "100.0";

  // ============================================================
  // GRÁFICO DE BARRAS (Categorías) CORREGIDO
  // ============================================================
  const categoriasMap = {};
  activos.forEach(act => {
    const cat = extraerNombre(act.categoria) || 'Otros';
    categoriasMap[cat] = (categoriasMap[cat] || 0) + 1;
  });
  const dataCategoriasBar = Object.entries(categoriasMap)
    .map(([name, cantidad]) => ({ name, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // ============================================================
  // GRÁFICO DE PASTEL (Estados) CORREGIDO
  // ============================================================
  const estadosMap = {
    Operativo: activos.filter(a => extraerNombre(a.estado) === 'Operativo').length,
    Asignado: activos.filter(a => extraerNombre(a.estado) === 'Asignado').length,
    Mantenimiento: activos.filter(a => {
      const estado = extraerNombre(a.estado);
      return estado === 'Mantenimiento' || estado === 'En Mantenimiento';
    }).length,
    Inactivo: activos.filter(a => extraerNombre(a.estado) === 'Inactivo').length,
    Crítico: activos.filter(a => extraerNombre(a.estado) === 'Crítico').length
  };
  const dataEstadosPie = Object.entries(estadosMap)
    .filter(([_, value]) => value > 0)
    .map(([name, value], idx) => ({ name, value, color: COLORS_PIE[idx % COLORS_PIE.length] }));

  // ============================================================
  // EVENTOS DE AUDITORÍA (sin cambios, ya usan extraerNombre)
  // ============================================================
  const eventosAuditoria = useMemo(() => {
    const eventos = [];

    activos.forEach(act => {
      const estado = extraerNombre(act.estado);
      if (estado === 'Mantenimiento' || estado === 'En Mantenimiento') {
        eventos.push({
          id: `mtto-${act.codigo || act.id}`,
          descripcion: `Equipo [${act.codigo || act.id}] en Mantenimiento.`,
          usuario: extraerNombre(act.responsable),
          fecha: 'Activo',
          tipo: 'Mantenimiento',
          prioridad: 'Media',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          linkTo: '/cronogramas'
        });
      }
    });

    [...asignaciones]
      .sort((a, b) => new Date(b.fecha_hora || b.fecha) - new Date(a.fecha_hora || a.fecha))
      .slice(0, 3)
      .forEach(asg => {
        const custodioNombre = extraerNombre(asg.responsable) || extraerNombre(asg.custodio) || 'Personal';
        eventos.push({
          id: `asig-${asg.codigo || asg.id}`,
          descripcion: `Acta N° ${asg.codigo || asg.id} generada para ${custodioNombre}.`,
          usuario: 'Admin I.T.',
          fecha: asg.fecha_hora ? new Date(asg.fecha_hora).toLocaleDateString() : (asg.fecha || 'Reciente'),
          tipo: asg.estado_acta === 'Anulada' ? 'Anulación' : 'Asignación',
          prioridad: asg.estado_acta === 'Anulada' ? 'Alta' : 'Baja',
          badgeColor: asg.estado_acta === 'Anulada' 
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-blue-50 text-blue-700 border-blue-200',
          linkTo: '/asignaciones'
        });
      });

    cronogramas
      .filter(c => c.estado === 'Completado')
      .slice(0, 2)
      .forEach(c => {
        eventos.push({
          id: `cro-${c.codigo || c.id}`,
          descripcion: `Mantenimiento preventivo completado en: ${c.area || c.titulo || 'Área general'}.`,
          usuario: Array.isArray(c.personal) ? c.personal[0] : (c.personal || 'Soporte I.T.'),
          fecha: c.fecha_cierre || c.fecha || 'Reciente',
          tipo: 'Cierre Técnico',
          prioridad: 'Baja',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          linkTo: '/cronogramas'
        });
      });

    if (desincorporaciones.length > 0) {
      const ultimaBaja = desincorporaciones[0];
      eventos.push({
        id: `baja-${ultimaBaja.codigo_acta || ultimaBaja.id}`,
        descripcion: `Activo ${ultimaBaja.activo} ha sido desincorporado (${ultimaBaja.motivo}).`,
        usuario: extraerNombre(ultimaBaja.autorizado_por) || 'Auditoría',
        fecha: ultimaBaja.fecha_baja || 'Reciente',
        tipo: 'Desincorporación',
        prioridad: 'Alta',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        linkTo: '/desincorporaciones'
      });
    }

    return eventos.sort((a, b) => {
      if (a.fecha === 'Activo' && b.fecha !== 'Activo') return -1;
      if (a.fecha !== 'Activo' && b.fecha === 'Activo') return 0;
      return 0;
    }).slice(0, 5);
  }, [activos, asignaciones, cronogramas, desincorporaciones]);

  const getEventIcon = (tipo) => {
    switch (tipo) {
      case 'Mantenimiento': return <Wrench size={14} className="text-amber-500" />;
      case 'Asignación': return <FileCheck size={14} className="text-blue-500" />;
      case 'Anulación': return <AlertTriangle size={14} className="text-rose-500" />;
      case 'Cierre Técnico': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'Desincorporación': return <ArrowDownCircle size={14} className="text-rose-500" />;
      default: return <Activity size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* BANNER */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-solid border-slate-800 text-left">
        <div className="absolute -right-6 -bottom-6 text-slate-700/15 transform rotate-12 pointer-events-none select-none"><Laptop size={160} /></div>
        <div className="relative z-10 space-y-1">
          <span className="inline-flex text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-solid border-blue-500/20">Panel Operativo Activo</span>
          <h3 className="text-xl font-black m-0 mt-3 tracking-tight">¡Bienvenido de vuelta!</h3>
          <p className="text-xs text-slate-400 m-0 max-w-xl leading-relaxed">El sistema de gestión tecnológica reporta estabilidad general en la infraestructura local y control de auditoría integral sobre el inventario.</p>
        </div>
      </div>

      {/* TARJETAS MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Inventario" value={totalActivos} icon={<Laptop className="text-blue-600" size={18} />} change="+12" changeType="positive" bgColor="bg-blue-50/50 border-blue-100" linkTo="/activos" />
        <StatCard title="Disponibilidad Operativa" value={`${tasaDisponibilidad}%`} icon={<CheckCircle className="text-emerald-600" size={18} />} change="Óptimo" changeType="positive" bgColor="bg-emerald-50/50 border-emerald-100" linkTo="/activos" />
        <StatCard title="Equipos en Taller" value={activosMantenimiento} icon={<Wrench className="text-amber-600" size={18} />} change="+1" changeType="negative" bgColor="bg-amber-50/50 border-amber-100" linkTo="/cronogramas" />
        <StatCard title="Actas de Custodia" value={actasActivas} icon={<FileCheck className="text-indigo-600" size={18} />} change="Al día" changeType="positive" bgColor="bg-indigo-50/50 border-indigo-100" linkTo="/asignaciones" />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Barras */}
        <div className="bg-white p-5 rounded-xl border border-solid border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col text-left">
          <div className="mb-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider m-0">Densidad de Inventario Real</h4>
            <p className="text-[11px] text-slate-400 m-0 font-medium">Volumen físico clasificado por tipología de hardware corporativo</p>
          </div>
          {/* Añadido minHeight y minWidth al contenedor */}
          <div style={{ width: '100%', height: 300, minHeight: 300 }}>
            {dataCategoriasBar.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <BarChart data={dataCategoriasBar} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="cantidad" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">Registre activos para ver la distribución.</div>
            )}
          </div>
        </div>

        {/* Gráfico de Pastel */}
        <div className="bg-white p-5 rounded-xl border border-solid border-slate-200/80 shadow-sm flex flex-col text-left">
          <div className="mb-2">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider m-0">Estado Operativo de Línea</h4>
            <p className="text-[11px] text-slate-400 m-0 font-medium">Distribución porcentual de los dispositivos</p>
          </div>
          {/* Añadido minHeight y minWidth al contenedor */}
          <div style={{ width: '100%', height: 250, minHeight: 250 }}>
            {dataEstadosPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <PieChart>
                  <Pie data={dataEstadosPie} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value">
                    {dataEstadosPie.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sin estados registrados.</div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
            {dataEstadosPie.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase">
                  <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <strong className="text-sm font-black text-slate-700 mt-0.5">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BITÁCORA DE AUDITORÍA */}
      <div className="bg-white rounded-xl border border-solid border-slate-200/80 shadow-sm overflow-hidden text-left">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider m-0">Bitácora de Auditoría en Tiempo Real</h4>
            <p className="text-[11px] text-slate-400 m-0 font-medium">Historial automático de incidencias, asignación de actas de entrega y cierres técnicos</p>
          </div>
          <button onClick={() => navigate('/reportes')} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border-0 cursor-pointer transition-colors flex items-center gap-1">
            Ver Reportes <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">Detalles de Acción de Sistema</th>
                <th className="py-3 px-4">Operador Autorizado</th>
                <th className="py-3 px-4">Marca de Tiempo</th>
                <th className="py-3 px-6 text-center w-28">Nivel Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
              {eventosAuditoria.length > 0 ? (
                eventosAuditoria.map((ev) => (
                  <tr key={ev.id} onClick={() => ev.linkTo && navigate(ev.linkTo)} className={`hover:bg-slate-50/30 transition-colors ${ev.linkTo ? 'cursor-pointer' : ''}`}>
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 border border-solid border-slate-100 rounded-lg shrink-0">
                          {getEventIcon(ev.tipo)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 leading-tight">{ev.descripcion}</span>
                          <span className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">{ev.tipo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        {ev.usuario}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock size={13} className="text-slate-400" />
                        {ev.fecha}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-solid ${ev.badgeColor}`}>
                        {ev.prioridad}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-sm font-medium text-slate-400">
                    No se registran transacciones logísticas ni operativas en este ciclo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
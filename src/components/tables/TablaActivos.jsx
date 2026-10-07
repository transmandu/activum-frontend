import React from 'react';
import { Server, Laptop, Monitor, Printer, BatteryCharging, Radio, Network, HardDrive, Key, Package, Eye, Edit2 } from 'lucide-react';

const getIconoCategoria = (nombreCategoria) => {
  const cat = nombreCategoria?.toLowerCase() || '';
  if (cat.includes('servidor')) return <Server size={18} className="text-indigo-500" />;
  if (cat.includes('laptop')) return <Laptop size={18} className="text-cyan-500" />;
  if (cat.includes('pc') || cat.includes('escritorio')) return <Monitor size={18} className="text-blue-500" />;
  if (cat.includes('monitor')) return <Monitor size={18} className="text-emerald-500" />;
  if (cat.includes('impresora') || cat.includes('escaner')) return <Printer size={18} className="text-slate-500" />;
  if (cat.includes('regulador') || cat.includes('ups')) return <BatteryCharging size={18} className="text-amber-500" />;
  if (cat.includes('periferico')) return <Radio size={18} className="text-orange-500" />;
  if (cat.includes('red')) return <Network size={18} className="text-purple-500" />;
  if (cat.includes('radio')) return <Radio size={18} className="text-rose-500" />;
  if (cat.includes('almacenamiento')) return <HardDrive size={18} className="text-teal-500" />;
  if (cat.includes('software') || cat.includes('licencia')) return <Key size={18} className="text-purple-500" />;
  return <Package size={18} className="text-slate-400" />;
};

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || !/^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)) {
    return `rgba(100, 116, 139, ${alpha})`;
  }
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  c = '0x' + c.join('');
  return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(', ')}, ${alpha})`;
};

const TablaActivos = ({
  datos,
  sortConfig,
  onSort,
  activoADetalle,
  onVerDetalle,
  onEditar,
  puedeEditar,
  onCambiarEstadoRapido
}) => {
  return (
    <table className="w-full text-left border-collapse min-w-212.5">
      <thead>
        <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
          <th className="py-3 px-5 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => onSort('etiqueta')}>
            <div className="flex items-center gap-1">
              Etiqueta
              {sortConfig.key === 'etiqueta' && <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
            </div>
          </th>
          <th className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => onSort('nombre')}>
            <div className="flex items-center gap-1">
              Descripción
              {sortConfig.key === 'nombre' && <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
            </div>
          </th>
          <th className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => onSort('departamentoNombre')}>
            <div className="flex items-center gap-1">
              Departamento
              {sortConfig.key === 'departamentoNombre' && <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
            </div>
          </th>
          <th className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => onSort('ubicacionNombre')}>
            <div className="flex items-center gap-1">
              Ubicación Física
              {sortConfig.key === 'ubicacionNombre' && <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
            </div>
          </th>
          <th className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => onSort('responsableNombre')}>
            <div className="flex items-center gap-1">
              Responsable
              {sortConfig.key === 'responsableNombre' && <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
            </div>
          </th>
          <th className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => onSort('estadoNombre')}>
            <div className="flex items-center gap-1">
              Estado
              {sortConfig.key === 'estadoNombre' && <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
            </div>
          </th>
          <th className="py-3 px-5 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {datos.length === 0 ? (
          <tr><td colSpan="7" className="py-8 text-center text-xs text-slate-400">No se encontraron activos.</td></tr>
        ) : (
          datos.map((activo) => (
            <tr
              key={activo.id}
              onClick={() => onVerDetalle(activo)}
              className={`group hover:bg-slate-50/80 transition-colors text-xs cursor-pointer ${activoADetalle?.id === activo.id ? 'bg-blue-50/40' : ''}`}
            >
              <td className="py-4 px-5 font-mono font-bold text-blue-600">{activo.etiqueta}</td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-100 rounded-lg">{getIconoCategoria(activo.categoriaNombre)}</div>
                  <div>
                    <span className="block font-bold text-slate-700">{activo.nombre}</span>
                    <span className="block text-[10px] text-slate-400">
                      {activo.esSoftware
                        ? `${activo.version ? `v${activo.version} — ` : ''}${activo.marcaNombre !== 'Sin marca' ? activo.marcaNombre : (activo.proveedor || 'Software')}`
                        : `S/N: ${activo.serial || 'N/A'} — ${activo.marcaNombre}`}
                    </span>
                    {activo.tieneSoftware && !activo.esSoftware && (
                      <span className="inline-block mt-0.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        <Key size={9} className="inline mr-0.5" /> {activo.software.length} licencias
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-slate-500 font-medium">{activo.departamentoNombre}</td>
              <td className="py-4 px-4 text-cyan-600 font-medium">{activo.ubicacionNombre}</td>
              <td className="py-4 px-4 font-semibold text-slate-700">
                {activo.responsableNombre !== 'No asignado' ? (
                  activo.responsableNombre
                ) : (
                  <span className="text-slate-400 italic font-normal">No asignado</span>
                )}
              </td>
              <td className="py-4 px-4 relative">
                <span 
                  // Detenemos la propagación para que no abra el ModalActivo al hacer click
                    onClick={(e) => { 
                    e.stopPropagation(); 
                    if (activo.responsableNombre === 'No asignado' && onCambiarEstadoRapido) {
                      onCambiarEstadoRapido(activo, e);
                    }
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                    activo.responsableNombre === 'No asignado' 
                      ? 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-200' 
                      : 'cursor-default opacity-90'
                  }`}
                  title={activo.responsableNombre === 'No asignado' ? 'Clic para cambiar estado' : 'No se puede cambiar: Tiene responsable asignado'}
                  style={{
                    backgroundColor: hexToRgba(activo.estadoColor, 0.1),
                    borderColor: hexToRgba(activo.estadoColor, 0.25),
                    color: activo.estadoColor || '#475569'
                  }}
                >
                  <span 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: activo.estadoColor || '#64748b' }}
                  />
                  {activo.estadoNombre}
                </span>
                
                {activo.inac && (
                  <span className={`ml-2 inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${
                    activo.inac === 'Declarado'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {activo.inac}
                  </span>
                )}
              </td>
              <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-1.5">
                  <button onClick={(e) => { e.stopPropagation(); onVerDetalle(activo, e); }} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors" title="Ver detalles">
                    <Eye size={14} />
                  </button>
                  {puedeEditar && (
                    <button onClick={(e) => { e.stopPropagation(); onEditar(activo, e); }} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg transition-colors" title="Editar">
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default TablaActivos;
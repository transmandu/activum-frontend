// src/pages/Proveedores.jsx
import React, { useState } from 'react';
import { Plus, Building2, Phone, Mail, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import ModalProveedor from '../components/modals/ModalProveedor';
import { useData } from '../context/DataContext';

const Proveedores = () => {
  const { 
    proveedores, 
    actualizarProveedor, 
    eliminarProveedor,
    userPermissions
  } = useData();

  // VERIFICAR PERMISOS
  const puedeCrear = userPermissions.includes('crear_proveedores');
  const puedeEditar = userPermissions.includes('editar_proveedores');
  const puedeEliminar = userPermissions.includes('eliminar_proveedores');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proveedorAEditar, setProveedorAEditar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  const dataProveedores = Array.isArray(proveedores) ? proveedores : [];

  const toggleEstadoProveedor = async (proveedor) => {
    if (!actualizarProveedor) return;
    const nuevoEstado = proveedor.estado === "Activo" ? "Inactivo" : "Activo";
    try {
      await actualizarProveedor(proveedor.codigo, { ...proveedor, estado: nuevoEstado });
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const handleEliminar = async (proveedor) => {
    if (!window.confirm(`¿Está seguro de eliminar el proveedor "${proveedor.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarProveedor(proveedor.codigo);
    } catch (error) {
      console.error('Error eliminando proveedor:', error);
      alert('Ocurrió un error al eliminar el proveedor.');
    }
  };

  const especialidadesDisponibles = Array.from(new Set(dataProveedores.map(p => p.categoria).filter(Boolean)));

  const proveedoresFiltrados = dataProveedores.filter(prov => {
    const cumpleBusqueda = 
      (prov.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
      (prov.rif?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
      (prov.categoria?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
      (prov.tipo?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
      (prov.contacto?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
      (prov.correo?.toLowerCase() || '').includes(busqueda.toLowerCase());
    const cumpleCategoria = categoriaSeleccionada === '' || prov.categoria === categoriaSeleccionada;
    return cumpleBusqueda && cumpleCategoria;
  });

  const abrirEditar = (proveedor) => {
    setProveedorAEditar(proveedor);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setProveedorAEditar(null);
  };

  const getTipoBadge = (tipo) => {
    const colores = {
      'Venezolano': 'bg-blue-50 text-blue-700 border-blue-200',
      'Extranjero': 'bg-purple-50 text-purple-700 border-purple-200',
      'Jurídico': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Gobierno': 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return colores[tipo] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 m-0">Directorio de Proveedores</h3>
          <p className="text-xs text-slate-400 m-0 mt-0.5">Gestión de aliados comerciales, empresas de soporte externo y suministros de hardware</p>
        </div>
        {/* ✅ BOTÓN "Nuevo Proveedor" - solo si tiene permiso */}
        {puedeCrear && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md shadow-blue-600/10 transition-all border-0 cursor-pointer">
            <Plus size={18} /> Nuevo Proveedor
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, RIF, especialidad, tipo o contacto..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-solid border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-solid border-slate-200 px-3 py-2 rounded-lg">
            <Filter size={14} /> <span>Filtrar por:</span>
          </div>
          <select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)} className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer font-medium">
            <option value="">Todas las Especialidades</option>
            {especialidadesDisponibles.map(esp => <option key={esp} value={esp}>{esp}</option>)}
          </select>
        </div>
      </div>

      {/* Grid de tarjetas */}
      {proveedoresFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proveedoresFiltrados.map((prov) => {
            const isInactive = prov.estado === "Inactivo";
            return (
              <div key={prov.codigo} className={`bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-all relative overflow-hidden group text-left ${isInactive ? 'opacity-70 bg-slate-50/50' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl transition-colors ${isInactive ? '' : 'group-hover:border-blue-200 group-hover:bg-blue-50/30'}`}>
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h4 className={`text-base font-bold m-0 leading-tight ${isInactive ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{prov.nombre}</h4>
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50/60 border border-blue-100 px-2 py-0.5 rounded-md inline-block mt-1">{prov.rif}</span>
                      <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTipoBadge(prov.tipo)}`}>
                        {prov.tipo || 'Sin clasificar'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {/* ✅ BOTÓN EDITAR - solo si tiene permiso */}
                    {puedeEditar && (
                      <button onClick={() => abrirEditar(prov)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar proveedor">
                        <Edit2 size={15} />
                      </button>
                    )}
                    {/* ✅ BOTÓN ELIMINAR - solo si tiene permiso */}
                    {puedeEliminar && (
                      <button onClick={() => handleEliminar(prov)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar proveedor">
                        <Trash2 size={15} />
                      </button>
                    )}
                    {/* ✅ TOGGLE DE ESTADO - solo si tiene permiso de editar */}
                    {puedeEditar && (
                      <button onClick={() => toggleEstadoProveedor(prov)} className={`px-2.5 py-0.5 text-xs font-bold rounded-full border cursor-pointer transition-colors ${prov.estado === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}>
                        {prov.estado || 'Activo'}
                      </button>
                    )}
                  </div>
                </div>

                <hr className="border-slate-100 my-4 border-0 border-b" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Especialidad:</span><span className="font-bold text-slate-700 text-xs">{prov.categoria}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Contacto:</span><span className="font-semibold text-slate-600 text-xs">{prov.contacto}</span></div>
                </div>

                <hr className="border-slate-100 my-4 border-0 border-b-dashed" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg p-2"><Phone size={14} className="text-slate-400" /><span className="truncate">{prov.telefono}</span></div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg p-2"><Mail size={14} className="text-slate-400" /><span className="truncate underline cursor-pointer hover:text-blue-600">{prov.correo}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-sm text-slate-400 font-medium">
          No se encontraron aliados comerciales o proveedores con los filtros seleccionados.
        </div>
      )}

      <ModalProveedor isOpen={isModalOpen} onClose={cerrarModal} proveedorAEditar={proveedorAEditar} />
    </div>
  );
};

export default Proveedores;
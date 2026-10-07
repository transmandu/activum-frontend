// src/pages/AdminInterfaces.jsx
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Activity, X, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import ModalInterfaz from '../components/modals/ModalInterfaz';

const AdminInterfaces = () => {
  const { interfaces, eliminarInterfaz } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interfazAEditar, setInterfazAEditar] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Filtrar interfaces por búsqueda (nombre o descripción)
  const interfacesFiltradas = interfaces.filter(i =>
    i.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar la interfaz "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarInterfaz(id);
      setMessage({ type: 'success', text: `Interfaz "${nombre}" eliminada correctamente.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar la interfaz.' });
    }
  };

  const abrirModal = (interfaz = null) => {
    setInterfazAEditar(interfaz);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setInterfazAEditar(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity size={22} className="text-blue-600" />
            Administrar Interfaces de Red
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de tipos de interfaz de red (ETH, WIFI, etc.).</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all border-0 cursor-pointer"
        >
          <Plus size={16} />
          Nueva Interfaz
        </button>
      </div>

      {/* Mensaje de éxito/error */}
      {message.text && (
        <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
          'bg-slate-50 text-slate-700 border border-slate-200'
        }`}>
          {message.type === 'success' && <CheckCircle size={16} />}
          {message.type === 'error' && <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Buscador */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Tabla de interfaces */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">Nombre</th>
                <th className="py-4 px-5">Descripción</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interfacesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-400 text-sm">
                    No hay interfaces de red registradas.
                  </td>
                </tr>
              ) : (
                interfacesFiltradas.map((interfaz) => (
                  <tr key={interfaz.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-800">{interfaz.nombre}</td>
                    <td className="py-4 px-5 text-slate-500 text-sm max-w-xs truncate">
                      {interfaz.descripcion || '—'}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModal(interfaz)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar interfaz"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleEliminar(interfaz.id, interfaz.nombre)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar interfaz"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/50 border-t border-slate-200 text-right text-[10px] text-slate-400">
          Total: {interfacesFiltradas.length} interfaces
        </div>
      </div>

      {/* Modal de Interfaz */}
      <ModalInterfaz
        isOpen={isModalOpen}
        onClose={cerrarModal}
        interfazAEditar={interfazAEditar}
      />
    </div>
  );
};

export default AdminInterfaces;
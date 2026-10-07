// src/pages/AdminMarcas.jsx
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Tag, X, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import ModalMarca from '../components/modals/ModalMarca';

const AdminMarcas = () => {
  const { marcas, eliminarMarca } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [marcaAEditar, setMarcaAEditar] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const marcasFiltradas = marcas.filter(m =>
    m.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar la marca "${nombre}"?`)) return;
    try {
      await eliminarMarca(id);
      setMessage({ type: 'success', text: `Marca "${nombre}" eliminada.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar.' });
    }
  };

  const abrirModal = (marca = null) => {
    setMarcaAEditar(marca);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setMarcaAEditar(null);
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'hardware': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'software': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ambos': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Tag size={22} className="text-blue-600" />
            Administrar Marcas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de fabricantes de equipos y software.</p>
        </div>
        <button onClick={() => abrirModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all border-0 cursor-pointer">
          <Plus size={16} /> Nueva Marca
        </button>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' :
          'bg-slate-50 text-slate-700 border-slate-200'
        }`}>
          {message.type === 'success' && <CheckCircle size={16} />}
          {message.type === 'error' && <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre de marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">Nombre</th>
                <th className="py-4 px-5 text-center">Tipo</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {marcasFiltradas.length === 0 ? (
                <tr><td colSpan="3" className="py-8 text-center text-slate-400 text-sm">No hay marcas registradas.</td></tr>
              ) : (
                marcasFiltradas.map((marca) => (
                  <tr key={marca.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-800">{marca.nombre}</td>
                    <td className="py-4 px-5 text-center">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getTipoBadge(marca.tipo)}`}>
                        {marca.tipo ? marca.tipo.charAt(0).toUpperCase() + marca.tipo.slice(1) : 'Hardware'}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => abrirModal(marca)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar marca">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleEliminar(marca.id, marca.nombre)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar marca">
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
          Total: {marcasFiltradas.length} marcas
        </div>
      </div>

      <ModalMarca isOpen={isModalOpen} onClose={cerrarModal} marcaAEditar={marcaAEditar} />
    </div>
  );
};

export default AdminMarcas;
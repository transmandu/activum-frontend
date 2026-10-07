// src/pages/AdminModelos.jsx
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Tag, X, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import ModalModelo from '../components/modals/ModalModelo';

const AdminModelos = () => {
  const { modelos, eliminarModelo } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modeloAEditar, setModeloAEditar] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Filtrar modelos por búsqueda (nombre, marca o tipo)
  const modelosFiltrados = modelos.filter(m =>
    m.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.marca?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar el modelo "${nombre}"?`)) return;
    try {
      await eliminarModelo(id);
      setMessage({ type: 'success', text: `Modelo "${nombre}" eliminado.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar el modelo.' });
    }
  };

  const abrirModal = (modelo = null) => {
    setModeloAEditar(modelo);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setModeloAEditar(null);
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'hardware': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'software': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ambos': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Tag size={22} className="text-blue-600" />
            Administrar Modelos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de modelos de equipos tecnológicos asociados a marcas.</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all border-0 cursor-pointer"
        >
          <Plus size={16} />
          Nuevo Modelo
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
            placeholder="Buscar por nombre de modelo, marca o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Tabla de modelos */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">Nombre</th>
                <th className="py-4 px-5">Marca</th>
                <th className="py-4 px-5 text-center">Tipo</th>
                <th className="py-4 px-5">Descripción</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modelosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 text-sm">
                    No hay modelos registrados.
                  </td>
                </tr>
              ) : (
                modelosFiltrados.map((modelo) => (
                  <tr key={modelo.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-800">{modelo.nombre}</td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-200">
                        {modelo.marca?.nombre || 'Sin marca'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getTipoBadge(modelo.tipo)}`}>
                        {modelo.tipo === 'hardware' ? 'Hardware' : 
                         modelo.tipo === 'software' ? 'Software' : 
                         modelo.tipo === 'ambos' ? 'Ambos' : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-500 text-sm max-w-xs truncate">
                      {modelo.descripcion || '—'}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModal(modelo)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar modelo"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleEliminar(modelo.id, modelo.nombre)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar modelo"
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
          Total: {modelosFiltrados.length} modelos
        </div>
      </div>

      {/* Modal de Modelo */}
      <ModalModelo
        isOpen={isModalOpen}
        onClose={cerrarModal}
        modeloAEditar={modeloAEditar}
        // No pasamos tipoFiltro aquí porque en admin queremos ver todos
      />
    </div>
  );
};

export default AdminModelos;
// src/pages/AdminPlataformasTest.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Activity, X, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import ModalPlataformaTest from '../components/modals/ModalPlataformaTest';

const AdminPlataformasTest = () => {
  const { plataformasTest = [], eliminarPlataformaTest, cargarDatosIniciales } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plataformaAEditar, setPlataformaAEditar] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Asegurar que plataformasTest sea un array
  const plataformasArray = Array.isArray(plataformasTest) ? plataformasTest : [];

  const plataformasFiltradas = plataformasArray.filter(p =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar la plataforma "${nombre}"?`)) return;
    try {
      await eliminarPlataformaTest(id);
      await cargarDatosIniciales();
      setMessage({ type: 'success', text: `Plataforma "${nombre}" eliminada correctamente.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar la plataforma.' });
    }
  };

  const abrirModal = (plataforma = null) => {
    setPlataformaAEditar(plataforma);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setPlataformaAEditar(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity size={22} className="text-blue-600" />
            Administrar Plataformas de Test
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de plataformas para pruebas de velocidad de internet.</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all border-0 cursor-pointer"
        >
          <Plus size={16} />
          Nueva Plataforma
        </button>
      </div>

      {/* Mensaje de éxito/error */}
      {message.text && (
        <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
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
            placeholder="Buscar por nombre de plataforma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Tabla de plataformas */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">Nombre</th>
                <th className="py-4 px-5 text-center">Orden</th>
                <th className="py-4 px-5 text-center">Estado</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plataformasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400 text-sm">
                    No hay plataformas de test registradas.
                  </td>
                </tr>
              ) : (
                plataformasFiltradas.map((plataforma) => (
                  <tr key={plataforma.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-800">{plataforma.nombre}</td>
                    <td className="py-4 px-5 text-center text-slate-600">{plataforma.orden || 0}</td>
                    <td className="py-4 px-5 text-center">
                      {plataforma.activo ? (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold border border-slate-200">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModal(plataforma)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar plataforma"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleEliminar(plataforma.id, plataforma.nombre)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar plataforma"
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
          Total: {plataformasFiltradas.length} plataformas
        </div>
      </div>

      {/* Modal de Plataforma Test */}
      <ModalPlataformaTest
        isOpen={isModalOpen}
        onClose={cerrarModal}
        plataformaAEditar={plataformaAEditar}
      />
    </div>
  );
};

export default AdminPlataformasTest;
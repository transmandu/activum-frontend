// src/pages/AdminCategorias.jsx
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Tag, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { useData } from '../context/DataContext';
import ModalCategoria from '../components/modals/ModalCategoria';
import ModalCategoriaConsumible from '../components/modals/ModalCategoriaConsumible';

const AdminCategorias = () => {
  const {
    categorias,
    agregarCategoria,
    actualizarCategoria,
    eliminarCategoria,
    categoriasConsumibles,
    agregarCategoriaConsumible,
    actualizarCategoriaConsumible,
    eliminarCategoriaConsumible,
    consumibles,
  } = useData();

  const [tabActiva, setTabActiva] = useState('activos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalActivoOpen, setIsModalActivoOpen] = useState(false);
  const [categoriaActivoAEditar, setCategoriaActivoAEditar] = useState(null);
  const [isModalConsumibleOpen, setIsModalConsumibleOpen] = useState(false);
  const [categoriaConsumibleAEditar, setCategoriaConsumibleAEditar] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categoriasActivosFiltradas = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.descripcion && cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categoriasConsumiblesFiltradas = categoriasConsumibles.filter(cat =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.descripcion && cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const contarArticulosPorTipo = (tipoId) => {
    if (!consumibles || !Array.isArray(consumibles)) return 0;
    return consumibles.filter(item => item.categoria_consumible_id === tipoId).length;
  };

  const abrirNuevoActivo = () => {
    setCategoriaActivoAEditar(null);
    setIsModalActivoOpen(true);
  };

  const abrirEditarActivo = (categoria) => {
    setCategoriaActivoAEditar(categoria);
    setIsModalActivoOpen(true);
  };

  const cerrarModalActivo = () => {
    setIsModalActivoOpen(false);
    setCategoriaActivoAEditar(null);
  };

  const handleEliminarActivo = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar la categoría de activo "${nombre}"?`)) return;
    try {
      await eliminarCategoria(id);
      setMessage({ type: 'success', text: 'Categoría de activo eliminada correctamente.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar la categoría.' });
    }
  };

  const abrirNuevoConsumible = () => {
    setCategoriaConsumibleAEditar(null);
    setIsModalConsumibleOpen(true);
  };

  const abrirEditarConsumible = (categoria) => {
    setCategoriaConsumibleAEditar(categoria);
    setIsModalConsumibleOpen(true);
  };

  const cerrarModalConsumible = () => {
    setIsModalConsumibleOpen(false);
    setCategoriaConsumibleAEditar(null);
  };

  const handleEliminarConsumible = async (id, nombre) => {
    const articulosAsociados = contarArticulosPorTipo(id);
    if (articulosAsociados > 0) {
      alert(`No se puede eliminar el tipo "${nombre}" porque tiene ${articulosAsociados} artículo(s) asociado(s).`);
      return;
    }
    if (!window.confirm(`¿Está seguro de eliminar el tipo "${nombre}"?`)) return;
    try {
      await eliminarCategoriaConsumible(id);
      setMessage({ type: 'success', text: `Tipo "${nombre}" eliminado correctamente.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar el tipo.' });
    }
  };

  const renderTablaActivos = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-medium text-slate-500">Total: {categoriasActivosFiltradas.length}</span>
        <button onClick={abrirNuevoActivo} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all border-0 cursor-pointer">
          <Plus size={16} /> Nueva Categoría de Activo
        </button>
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">Nombre</th>
                <th className="py-4 px-5 text-center">Prefijo</th>
                <th className="py-4 px-5">Descripción</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoriasActivosFiltradas.length === 0 ? (
                <tr><td colSpan="4" className="py-8 text-center text-slate-400 text-sm">No hay categorías de activos registradas.</td></tr>
              ) : (
                categoriasActivosFiltradas.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-800">{cat.nombre}</td>
                    <td className="py-4 px-5 text-center">
                      {cat.prefijo ? (
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-mono font-bold">{cat.prefijo}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-slate-500 text-sm">{cat.descripcion || '—'}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => abrirEditarActivo(cat)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar categoría"><Edit2 size={15} /></button>
                        <button onClick={() => handleEliminarActivo(cat.id, cat.nombre)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar categoría"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTablaTipos = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-medium text-slate-500">Total: {categoriasConsumiblesFiltradas.length}</span>
        <button onClick={abrirNuevoConsumible} className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all border-0 cursor-pointer">
          <Plus size={16} /> Nuevo Tipo
        </button>
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">Nombre</th>
                <th className="py-4 px-5">Descripción</th>
                <th className="py-4 px-5 text-center">Artículos</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoriasConsumiblesFiltradas.length === 0 ? (
                <tr><td colSpan="4" className="py-8 text-center text-slate-400 text-sm">No hay tipos registrados.</td></tr>
              ) : (
                categoriasConsumiblesFiltradas.map(cat => {
                  const cantArticulos = contarArticulosPorTipo(cat.id);
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5 font-medium text-slate-800">{cat.nombre}</td>
                      <td className="py-4 px-5 text-slate-500 text-sm">{cat.descripcion || '—'}</td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[11px] font-bold border border-blue-200">
                          <Package size={12} /> {cantArticulos}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => abrirEditarConsumible(cat)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar tipo"><Edit2 size={15} /></button>
                          <button onClick={() => handleEliminarConsumible(cat.id, cat.nombre)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar tipo"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Tag size={22} className="text-blue-600" /> Administrar Categorías
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de categorías para activos tecnológicos y tipos de consumibles.</p>
        </div>
      </div>

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

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar categoría o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button onClick={() => setTabActiva('activos')} className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-all ${
            tabActiva === 'activos' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}>
            Activos ({categorias.length})
          </button>
          <button onClick={() => setTabActiva('tipos')} className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-all ${
            tabActiva === 'tipos' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}>
            Tipos ({categoriasConsumibles.length})
          </button>
        </div>
        <div className="p-5">
          {tabActiva === 'activos' && renderTablaActivos()}
          {tabActiva === 'tipos' && renderTablaTipos()}
        </div>
      </div>

      <ModalCategoria isOpen={isModalActivoOpen} onClose={cerrarModalActivo} categoriaAEditar={categoriaActivoAEditar} />
      <ModalCategoriaConsumible isOpen={isModalConsumibleOpen} onClose={cerrarModalConsumible} categoriaAEditar={categoriaConsumibleAEditar} />
    </div>
  );
};

export default AdminCategorias;
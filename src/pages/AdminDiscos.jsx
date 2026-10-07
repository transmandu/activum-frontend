// src/pages/AdminDiscos.jsx
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, HardDrive, X, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import ModalTipoDisco from '../components/modals/ModalTipoDisco';
import ModalInterfazDisco from '../components/modals/ModalInterfazDisco';
import ModalTamanoDisco from '../components/modals/ModalTamanoDisco';

const AdminDiscos = () => {
  const {
    tiposDisco,
    interfacesDisco,
    tamanosDisco,
    eliminarTipoDisco,
    eliminarInterfazDisco,
    eliminarTamanoDisco,
  } = useData();

  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermInterfaz, setSearchTermInterfaz] = useState('');
  const [searchTermTamano, setSearchTermTamano] = useState('');

  // Estados para modales de Tipos
  const [modalTipoOpen, setModalTipoOpen] = useState(false);
  const [tipoAEditar, setTipoAEditar] = useState(null);

  // Estados para modales de Interfaces
  const [modalInterfazOpen, setModalInterfazOpen] = useState(false);
  const [interfazAEditar, setInterfazAEditar] = useState(null);

  // Estados para modales de Tamaños
  const [modalTamanoOpen, setModalTamanoOpen] = useState(false);
  const [tamanoAEditar, setTamanoAEditar] = useState(null);

  // Mensajes de éxito/error
  const [message, setMessage] = useState({ type: '', text: '' });

  // --- Filtros ---
  const tiposFiltrados = tiposDisco.filter(t =>
    t.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const interfacesFiltradas = interfacesDisco.filter(i =>
    i.nombre?.toLowerCase().includes(searchTermInterfaz.toLowerCase()) ||
    i.descripcion?.toLowerCase().includes(searchTermInterfaz.toLowerCase())
  );

  const tamanosFiltrados = tamanosDisco.filter(t =>
    t.nombre?.toLowerCase().includes(searchTermTamano.toLowerCase()) ||
    t.descripcion?.toLowerCase().includes(searchTermTamano.toLowerCase())
  );

  // --- Funciones de eliminación con mensaje ---
  const handleEliminarTipo = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el tipo de disco "${nombre}"?`)) return;
    try {
      await eliminarTipoDisco(id);
      setMessage({ type: 'success', text: `Tipo "${nombre}" eliminado.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar.' });
    }
  };

  const handleEliminarInterfaz = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar la interfaz de disco "${nombre}"?`)) return;
    try {
      await eliminarInterfazDisco(id);
      setMessage({ type: 'success', text: `Interfaz "${nombre}" eliminada.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar.' });
    }
  };

  const handleEliminarTamano = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el tamaño de disco "${nombre}"?`)) return;
    try {
      await eliminarTamanoDisco(id);
      setMessage({ type: 'success', text: `Tamaño "${nombre}" eliminado.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar.' });
    }
  };

  // --- Funciones de apertura de modales ---
  const abrirModalTipo = (item = null) => {
    setTipoAEditar(item);
    setModalTipoOpen(true);
  };
  const cerrarModalTipo = () => {
    setModalTipoOpen(false);
    setTipoAEditar(null);
  };

  const abrirModalInterfaz = (item = null) => {
    setInterfazAEditar(item);
    setModalInterfazOpen(true);
  };
  const cerrarModalInterfaz = () => {
    setModalInterfazOpen(false);
    setInterfazAEditar(null);
  };

  const abrirModalTamano = (item = null) => {
    setTamanoAEditar(item);
    setModalTamanoOpen(true);
  };
  const cerrarModalTamano = () => {
    setModalTamanoOpen(false);
    setTamanoAEditar(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <HardDrive size={22} className="text-blue-600" />
            Administrar Catálogos de Discos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de tipos, interfaces y tamaños de discos.</p>
        </div>
      </div>

      {/* Mensaje global */}
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

      {/* ==================== TIPOS DE DISCO ==================== */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-700">Tipos de Disco</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Buscar tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white w-48"
              />
            </div>
            <button
              onClick={() => abrirModalTipo()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
            >
              <Plus size={14} /> Nuevo Tipo
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-5">Nombre</th>
                <th className="py-3 px-5">Descripción</th>
                <th className="py-3 px-5 text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tiposFiltrados.length === 0 ? (
                <tr><td colSpan="3" className="py-6 text-center text-slate-400 text-xs">No hay tipos de disco registrados.</td></tr>
              ) : (
                tiposFiltrados.map((tipo) => (
                  <tr key={tipo.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-800 text-sm">{tipo.nombre}</td>
                    <td className="py-3 px-5 text-slate-500 text-xs">{tipo.descripcion || '—'}</td>
                    <td className="py-3 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => abrirModalTipo(tipo)} className="p-1 text-slate-400 hover:text-amber-600 rounded" title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleEliminarTipo(tipo.id, tipo.nombre)} className="p-1 text-slate-400 hover:text-rose-600 rounded" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-2 bg-slate-50/50 border-t border-slate-200 text-right text-[9px] text-slate-400">
          Total: {tiposFiltrados.length}
        </div>
      </div>

      {/* ==================== INTERFACES DE DISCO ==================== */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-700">Interfaces de Disco</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Buscar interfaz..."
                value={searchTermInterfaz}
                onChange={(e) => setSearchTermInterfaz(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white w-48"
              />
            </div>
            <button
              onClick={() => abrirModalInterfaz()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
            >
              <Plus size={14} /> Nueva Interfaz
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-5">Nombre</th>
                <th className="py-3 px-5">Descripción</th>
                <th className="py-3 px-5 text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interfacesFiltradas.length === 0 ? (
                <tr><td colSpan="3" className="py-6 text-center text-slate-400 text-xs">No hay interfaces de disco registradas.</td></tr>
              ) : (
                interfacesFiltradas.map((interfaz) => (
                  <tr key={interfaz.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-800 text-sm">{interfaz.nombre}</td>
                    <td className="py-3 px-5 text-slate-500 text-xs">{interfaz.descripcion || '—'}</td>
                    <td className="py-3 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => abrirModalInterfaz(interfaz)} className="p-1 text-slate-400 hover:text-amber-600 rounded" title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleEliminarInterfaz(interfaz.id, interfaz.nombre)} className="p-1 text-slate-400 hover:text-rose-600 rounded" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-2 bg-slate-50/50 border-t border-slate-200 text-right text-[9px] text-slate-400">
          Total: {interfacesFiltradas.length}
        </div>
      </div>

      {/* ==================== TAMAÑOS DE DISCO ==================== */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-700">Tamaños de Disco</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Buscar tamaño..."
                value={searchTermTamano}
                onChange={(e) => setSearchTermTamano(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white w-48"
              />
            </div>
            <button
              onClick={() => abrirModalTamano()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
            >
              <Plus size={14} /> Nuevo Tamaño
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-5">Nombre</th>
                <th className="py-3 px-5">Descripción</th>
                <th className="py-3 px-5 text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tamanosFiltrados.length === 0 ? (
                <tr><td colSpan="3" className="py-6 text-center text-slate-400 text-xs">No hay tamaños de disco registrados.</td></tr>
              ) : (
                tamanosFiltrados.map((tamano) => (
                  <tr key={tamano.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-800 text-sm">{tamano.nombre}</td>
                    <td className="py-3 px-5 text-slate-500 text-xs">{tamano.descripcion || '—'}</td>
                    <td className="py-3 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => abrirModalTamano(tamano)} className="p-1 text-slate-400 hover:text-amber-600 rounded" title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleEliminarTamano(tamano.id, tamano.nombre)} className="p-1 text-slate-400 hover:text-rose-600 rounded" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-2 bg-slate-50/50 border-t border-slate-200 text-right text-[9px] text-slate-400">
          Total: {tamanosFiltrados.length}
        </div>
      </div>

      {/* ===== MODALES ===== */}
      <ModalTipoDisco
        isOpen={modalTipoOpen}
        onClose={cerrarModalTipo}
        tipoDiscoAEditar={tipoAEditar}
      />
      <ModalInterfazDisco
        isOpen={modalInterfazOpen}
        onClose={cerrarModalInterfaz}
        interfazDiscoAEditar={interfazAEditar}
      />
      <ModalTamanoDisco
        isOpen={modalTamanoOpen}
        onClose={cerrarModalTamano}
        tamanoDiscoAEditar={tamanoAEditar}
      />
    </div>
  );
};

export default AdminDiscos;
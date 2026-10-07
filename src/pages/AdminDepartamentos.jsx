// src/pages/AdminDepartamentos.jsx
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Building2, AlertCircle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import ModalDepartamento from '../components/modals/ModalDepartamento';

const AdminDepartamentos = () => {
  const { departamentos, eliminarDepartamento, cargarDatosIniciales } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departamentoAEditar, setDepartamentoAEditar] = useState(null);
  const [departamentoPadre, setDepartamentoPadre] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Estado global de expansión persistente durante re-renders
  const [expandidos, setExpandidos] = useState({});

  const toggleExpandir = (id) => {
    setExpandidos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const nodoCoincideBusqueda = (depto, term) => {
    if (!term) return true;
    if (depto.nombre?.toLowerCase().includes(term.toLowerCase())) return true;
    const hijos = departamentos.filter(d => d.padre_id === depto.id);
    return hijos.some(h => nodoCoincideBusqueda(h, term));
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar "${nombre}" y sus dependencias?`)) return;
    try {
      await eliminarDepartamento(id);
      await cargarDatosIniciales();
      setMessage({ type: 'success', text: `"${nombre}" eliminado correctamente.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al eliminar.' });
    }
  };

  const abrirModal = (editar = null, padre = null) => {
    setDepartamentoAEditar(editar);
    setDepartamentoPadre(padre);
    setIsModalOpen(true);
  };

  // ==========================================
  // COMPONENTE RECURSIVO DEL ÁRBOL
  // ==========================================
  const DepartamentoNodo = ({ departamento, nivel = 0 }) => {
    const hijos = departamentos.filter(d => d.padre_id === departamento.id);
    const tieneHijos = hijos.length > 0;
    
    const forzarExpansion = searchTerm.length > 0;
    const estaExpandido = forzarExpansion || !!expandidos[departamento.id];

    if (searchTerm && !nodoCoincideBusqueda(departamento, searchTerm)) {
      return null;
    }

    return (
      <div className="flex flex-col w-full">
        <div 
          className={`flex items-center justify-between py-2.5 pr-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${nivel === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
          style={{ paddingLeft: `calc(1rem + ${nivel * 1.5}rem)` }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 flex justify-center">
              {tieneHijos ? (
                <button 
                  onClick={() => toggleExpandir(departamento.id)}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  {estaExpandido ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              )}
            </div>
            
            <span className={`font-medium truncate ${nivel === 0 ? 'text-slate-800 font-semibold' : 'text-slate-600 text-sm'}`}>
              {departamento.nombre}
            </span>
            
            {tieneHijos && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-2">
                {hijos.length} sub
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
            <button
              onClick={() => abrirModal(null, departamento)}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Agregar sub-división"
            >
              <Plus size={15} />
            </button>
            <button
              onClick={() => abrirModal(departamento, null)}
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Editar nombre y posición"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => handleEliminar(departamento.id, departamento.nombre)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {tieneHijos && estaExpandido && (
          <div className="flex flex-col relative">
            <div 
              className="absolute top-0 bottom-0 w-px bg-slate-200" 
              style={{ left: `calc(1.7rem + ${nivel * 1.5}rem)` }}
            ></div>
            
            {hijos.map(hijo => (
              <DepartamentoNodo key={hijo.id} departamento={hijo} nivel={nivel + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };
  // ==========================================

  const departamentosRaiz = departamentos.filter(d => d.padre_id === null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 size={22} className="text-blue-600" />
            Estructura Organizacional
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de jerarquías y departamentos de la empresa.</p>
        </div>
        <button
          onClick={() => abrirModal(null, null)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all cursor-pointer"
        >
          <Building2 size={16} />
          Nuevo Departamento Raíz
        </button>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'} border`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar en todo el organigrama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-200 py-3 px-5 text-slate-500 text-[11px] font-bold uppercase tracking-wider flex justify-between">
          <span>Unidad Organizativa</span>
          <span className="w-24 text-center">Acciones</span>
        </div>
        
        <div className="flex flex-col">
          {departamentosRaiz.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No hay departamentos registrados. Comienza creando un nodo raíz.
            </div>
          ) : (
            departamentosRaiz.map(raiz => (
              <DepartamentoNodo key={raiz.id} departamento={raiz} nivel={0} />
            ))
          )}
        </div>
      </div>

      <ModalDepartamento
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        departamentoAEditar={departamentoAEditar}
        departamentoPadre={departamentoPadre}
      />
    </div>
  );
};

export default AdminDepartamentos;
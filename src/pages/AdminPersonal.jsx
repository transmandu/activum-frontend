// src/pages/AdminPersonal.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Users, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import ModalPersonal from '../components/modals/ModalPersonal';

const AdminPersonal = () => {
  const { personal, departamentos, eliminarPersonal, cargarDatosIniciales } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personalAEditar, setPersonalAEditar] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      if (departamentos.length > 0 && personal.length > 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      await cargarDatosIniciales();
      setLoading(false);
    };
    cargar();
  }, []);

  const personalFiltrado = personal.filter(p =>
    p.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cedula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.departamento?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const obtenerNombreDepartamento = (persona) => {
    if (persona.departamento && persona.departamento.nombre) {
      return persona.departamento.nombre;
    }
    const idBuscado = persona.departamento_id || persona.departamento?.id;
    if (!idBuscado) return '—';
    const depto = departamentos.find(d => String(d.id) === String(idBuscado));
    return depto ? depto.nombre : '—';
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar a "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarPersonal(id);
      await cargarDatosIniciales();
      setMessage({ type: 'success', text: `Personal "${nombre}" eliminado correctamente.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar el personal.' });
    }
  };

  const abrirModal = (persona = null) => {
    setPersonalAEditar(persona);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setPersonalAEditar(null);
    cargarDatosIniciales();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
        <span className="ml-3 text-sm text-slate-500">Cargando personal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users size={22} className="text-blue-600" />
            Administrar Personal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de empleados, colaboradores y responsables de activos.</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all border-0 cursor-pointer"
        >
          <Plus size={16} />
          Nuevo Personal
        </button>
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
            placeholder="Buscar por nombre, cédula, cargo, departamento o email..."
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
                <th className="py-4 px-5">Nombre Completo</th>
                <th className="py-4 px-5">Cédula</th>
                <th className="py-4 px-5">Cargo</th>
                <th className="py-4 px-5">Departamento</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {personalFiltrado.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 text-sm">
                    No hay personal registrado.
                  </td>
                </tr>
              ) : (
                personalFiltrado.map((persona) => (
                  <tr key={persona.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-800">{persona.nombre_completo}</td>
                    <td className="py-4 px-5 font-mono text-slate-600">{persona.cedula}</td>
                    <td className="py-4 px-5 text-slate-600">{persona.cargo || '—'}</td>
                    <td className="py-4 px-5 text-slate-600">{obtenerNombreDepartamento(persona)}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModal(persona)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar personal"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleEliminar(persona.id, persona.nombre_completo)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar personal"
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
          Total: {personalFiltrado.length} registros
        </div>
      </div>

      <ModalPersonal
        isOpen={isModalOpen}
        onClose={cerrarModal}
        personalAEditar={personalAEditar}
      />
    </div>
  );
};

export default AdminPersonal;
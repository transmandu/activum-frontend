// src/pages/AdminRoles.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, Edit2, Trash2, Users, Save, X, Loader2, AlertCircle, CheckCircle, Plus, Key
} from 'lucide-react';
import { useData } from '../context/DataContext';
import api from '../services/api';

const AdminRoles = () => {
  const {
    roles = [],
    usuarios = [],
    cargarRoles,
    cargarUsuarios,
    agregarRol,
    actualizarRol,
    eliminarRol,
    usuarioLogueado,
    cargarPermisosUsuario
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [allPermissions, setAllPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (usuarioLogueado?.rol === 'Administrador') {
      cargarRoles();
      cargarUsuarios();
      cargarPermisos();
    }
  }, [usuarioLogueado]);

  const cargarPermisos = async () => {
    setLoadingPermissions(true);
    try {
      const response = await api.get('/permissions');
      setAllPermissions(response.data || []);
    } catch (error) {
      console.error('❌ Error al cargar permisos:', error);
      setMessage({ type: 'error', text: 'Error al cargar los permisos.' });
    } finally {
      setLoadingPermissions(false);
    }
  };

  const rolesData = useMemo(() => {
    const rolesList = roles || [];
    const usersList = usuarios || [];

    const rolesMap = {};
    rolesList.forEach(rol => {
      if (rol && rol.id) {
        rolesMap[rol.id] = {
          ...rol,
          cantidad: 0,
          usuarios: []
        };
      }
    });

    usersList.forEach(user => {
      const roleId = user?.role_id || user?.role?.id;
      if (roleId && rolesMap[roleId]) {
        rolesMap[roleId].cantidad++;
        rolesMap[roleId].usuarios.push(user);
      }
    });

    return Object.values(rolesMap);
  }, [roles, usuarios]);

  const rolesFiltrados = useMemo(() => {
    if (!Array.isArray(rolesData) || rolesData.length === 0) return [];
    const term = searchTerm?.toLowerCase() || '';
    if (!term) return rolesData;
    return rolesData.filter(rol => {
      const name = rol?.name?.toLowerCase() || '';
      const description = rol?.description?.toLowerCase() || '';
      return name.includes(term) || description.includes(term);
    });
  }, [rolesData, searchTerm]);

  const permisosAgrupados = useMemo(() => {
    const grupos = {};
    allPermissions.forEach(perm => {
      const modulo = perm.module || 'Otros';
      if (!grupos[modulo]) {
        grupos[modulo] = [];
      }
      grupos[modulo].push(perm);
    });
    return grupos;
  }, [allPermissions]);

  const isAdmin = usuarioLogueado?.rol === 'Administrador';

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-600">Acceso Denegado</h2>
          <p className="text-sm text-slate-400">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  const abrirNuevo = () => {
    setIsEditing(false);
    setRolSeleccionado(null);
    setFormData({ name: '', description: '', permissions: [] });
    setErrors({});
    setMessage({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const abrirEditar = (rol) => {
    setIsEditing(true);
    setRolSeleccionado(rol);
    const permisosIds = rol.permissions?.map(p => p.id) || [];
    setFormData({
      name: rol?.name || '',
      description: rol?.description || '',
      permissions: permisosIds,
    });
    setErrors({});
    setMessage({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setRolSeleccionado(null);
    setFormData({ name: '', description: '', permissions: [] });
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    setMessage({ type: '', text: '' });
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => {
      const currentPermissions = prev.permissions || [];
      if (currentPermissions.includes(permissionId)) {
        return { ...prev, permissions: currentPermissions.filter(id => id !== permissionId) };
      } else {
        return { ...prev, permissions: [...currentPermissions, permissionId] };
      }
    });
  };

  const toggleModulePermissions = (moduleName, checked) => {
    const modulePermissions = permisosAgrupados[moduleName] || [];
    const modulePermissionIds = modulePermissions.map(p => p.id);

    setFormData(prev => {
      const currentPermissions = prev.permissions || [];
      if (checked) {
        const newPermissions = [...currentPermissions];
        modulePermissionIds.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return { ...prev, permissions: newPermissions };
      } else {
        return {
          ...prev,
          permissions: currentPermissions.filter(id => !modulePermissionIds.includes(id))
        };
      }
    });
  };

  const isModuleFullySelected = (moduleName) => {
    const modulePermissions = permisosAgrupados[moduleName] || [];
    if (modulePermissions.length === 0) return false;
    const moduleIds = modulePermissions.map(p => p.id);
    const selectedIds = formData.permissions || [];
    return moduleIds.every(id => selectedIds.includes(id));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre del rol es obligatorio.';
    }
    const nombreExistente = rolesData.find(r =>
      r?.name?.toLowerCase() === formData.name?.trim()?.toLowerCase() &&
      r?.id !== (rolSeleccionado?.id || 0)
    );
    if (nombreExistente) {
      newErrors.name = 'Ya existe un rol con ese nombre.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        permissions: formData.permissions || [],
      };

      if (isEditing && rolSeleccionado) {
        await actualizarRol(rolSeleccionado.id, payload);
        setMessage({ type: 'success', text: 'Rol actualizado correctamente.' });
      } else {
        await agregarRol(payload);
        setMessage({ type: 'success', text: 'Rol creado correctamente.' });
      }

      // ✅ Recargar roles y permisos del usuario actual
      await cargarRoles();
      await cargarPermisosUsuario();

      // ✅ Cerrar modal inmediatamente
      cerrarModal();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        setMessage({ type: 'error', text: 'Por favor, corrige los errores.' });
      } else {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Error al guardar el rol.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminar = async (rol) => {
    if (rol?.cantidad > 0) {
      alert(`No se puede eliminar el rol "${rol?.name}" porque tiene ${rol.cantidad} usuario(s) asignado(s).`);
      return;
    }
    if (!window.confirm(`¿Está seguro de eliminar el rol "${rol?.name}"?`)) return;
    try {
      await eliminarRol(rol.id);
      await cargarRoles();
      await cargarPermisosUsuario(); // ✅ NUEVO
      setMessage({ type: 'success', text: 'Rol eliminado correctamente.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar el rol.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Shield size={22} className="text-blue-600" />
            Administrar Roles y Permisos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de roles del sistema y asignación de permisos.</p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all border-0 cursor-pointer"
        >
          <Plus size={16} />
          Nuevo Rol
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
          <input
            type="text"
            placeholder="Buscar rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!Array.isArray(rolesFiltrados) || rolesFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400 text-sm">
            No hay roles registrados.
          </div>
        ) : (
          rolesFiltrados.map((rol) => (
            <div key={rol.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{rol.name}</h4>
                    {rol.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{rol.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      <Users size={12} className="inline mr-1" />
                      {rol.cantidad} usuario{rol.cantidad !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => abrirEditar(rol)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Editar rol"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleEliminar(rol)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      rol.cantidad > 0
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title={rol.cantidad > 0 ? 'No se puede eliminar, tiene usuarios asignados' : 'Eliminar rol'}
                    disabled={rol.cantidad > 0}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {rol.cantidad > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 truncate">
                    Usuarios: {rol.usuarios.map(u => u.name).join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                    {isEditing ? '✏️ Editar Rol' : '➕ Nuevo Rol'}
                  </h2>
                  <p className="text-xs text-slate-500">Complete los datos y asigne permisos</p>
                </div>
              </div>
              <button onClick={cerrarModal} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {message.text && message.type === 'error' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={14} />
                  {message.text}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Nombre del Rol *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Soporte Técnico..."
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                    autoFocus
                  />
                  {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Descripción (opcional)</label>
                  <textarea
                    name="description"
                    rows="2"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Breve descripción del rol..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Key size={14} /> Permisos del Rol
                  </label>
                  {loadingPermissions && <Loader2 size={14} className="animate-spin text-slate-400" />}
                </div>

                {allPermissions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay permisos disponibles.</p>
                ) : (
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                    {Object.keys(permisosAgrupados).map((modulo) => {
                      const permissions = permisosAgrupados[modulo] || [];
                      const allSelected = isModuleFullySelected(modulo);
                      return (
                        <div key={modulo} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                          <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-slate-600 tracking-wider">
                              {modulo}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleModulePermissions(modulo, !allSelected)}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                            </button>
                          </div>
                          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {permissions.map((perm) => {
                              const isChecked = (formData.permissions || []).includes(perm.id);
                              return (
                                <label
                                  key={perm.id}
                                  className={`flex items-center gap-2 text-xs font-medium p-1.5 rounded-lg cursor-pointer transition-colors ${
                                    isChecked ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handlePermissionToggle(perm.id)}
                                    className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="select-none">{perm.display_name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-2">Seleccione los permisos que tendrán los usuarios con este rol.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> {isEditing ? 'Actualizar' : 'Guardar'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;
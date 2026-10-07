// src/pages/AdminUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Edit2, Trash2, Shield, Mail, User, Key,
  X, Save, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';

const AdminUsuarios = () => {
  const { 
    usuarios, 
    roles,
    cargarUsuarios, 
    cargarRoles,
    agregarUsuario, 
    actualizarUsuario, 
    eliminarUsuario,
    cambiarPasswordUsuario,
    usuarioLogueado,
    cargarPermisosUsuario // <-- IMPORTAR DEL CONTEXTO
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '',
  });
  const [errors, setErrors] = useState({});

  // Estado para cambio de contraseña
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Cargar usuarios y roles al montar el componente
  useEffect(() => {
    if (usuarioLogueado?.rol === 'Administrador') {
      cargarUsuarios();
      cargarRoles();
    }
  }, [usuarioLogueado]);

  // Cargar roles cuando se abre el modal (por si no se cargaron antes)
  useEffect(() => {
    if (isModalOpen && roles.length === 0) {
      cargarRoles();
    }
  }, [isModalOpen]);

  // Filtrar usuarios por búsqueda
  const usuariosFiltrados = usuarios.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.rol?.toLowerCase().includes(term) ||
      user.role?.nombre?.toLowerCase().includes(term)
    );
  });

  // Obtener nombre del rol
  const getRolNombre = (user) => {
    return user.rol || user.role?.name || 'Sin rol';
  };

  // Abrir modal para nuevo usuario
  const abrirNuevo = () => {
    setIsEditing(false);
    setUsuarioSeleccionado(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role_id: roles.length > 0 ? roles[0].id : '',
    });
    setErrors({});
    setMessage({ type: '', text: '' });
    setIsModalOpen(true);
  };

  // Abrir modal para editar usuario
  const abrirEditar = (user) => {
    setIsEditing(true);
    setUsuarioSeleccionado(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role_id: user.role_id || user.role?.id || '',
    });
    setErrors({});
    setMessage({ type: '', text: '' });
    setIsModalOpen(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setIsModalOpen(false);
    setUsuarioSeleccionado(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role_id: '',
    });
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    setMessage({ type: '', text: '' });
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.email.trim()) newErrors.email = 'El correo es obligatorio.';
    if (!formData.email.includes('@')) newErrors.email = 'El correo no es válido.';
    if (!isEditing && !formData.password) newErrors.password = 'La contraseña es obligatoria.';
    if (!isEditing && formData.password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    if (!formData.role_id) newErrors.role_id = 'Debe seleccionar un rol.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // GUARDAR USUARIO
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      if (isEditing && usuarioSeleccionado) {
        const payload = {
          name: formData.name,
          email: formData.email,
          role_id: parseInt(formData.role_id),
        };
        await actualizarUsuario(usuarioSeleccionado.id, payload);
        setMessage({ type: 'success', text: 'Usuario actualizado correctamente.' });
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role_id: parseInt(formData.role_id),
        };
        await agregarUsuario(payload);
        setMessage({ type: 'success', text: 'Usuario creado correctamente.' });
        setFormData(prev => ({ ...prev, password: '' }));
      }

      // Recargar lista de usuarios
      await cargarUsuarios();
      
      // Recargar permisos del usuario logueado (por si cambió su propio rol)
      await cargarPermisosUsuario();

      // Cerrar modal inmediatamente (sin setTimeout)
      cerrarModal();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        setMessage({ type: 'error', text: 'Por favor, corrige los errores.' });
      } else {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Error al guardar el usuario.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // ELIMINAR USUARIO
  // ============================================================
  const handleEliminar = async (user) => {
    if (!window.confirm(`¿Está seguro de eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarUsuario(user.id);
      await cargarUsuarios();
      
      // Si el usuario eliminado es el mismo que está logueado, recargar permisos
      if (user.id === usuarioLogueado?.id) {
        await cargarPermisosUsuario();
      }
      
      setMessage({ type: 'success', text: 'Usuario eliminado correctamente.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar el usuario.' });
    }
  };

  // Abrir modal de cambio de contraseña
  const abrirPasswordModal = (user) => {
    setPasswordUser(user);
    setNewPassword('');
    setPasswordError('');
    setPasswordModalOpen(true);
  };

  // Cambiar contraseña
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    try {
      await cambiarPasswordUsuario(passwordUser.id, { password: newPassword });
      setPasswordModalOpen(false);
      setPasswordUser(null);
      setNewPassword('');
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Error al cambiar la contraseña.');
    }
  };

  // Verificar si el usuario actual es administrador
  const isAdmin = usuarioLogueado?.rol === 'Administrador';

  // Si no es admin, mostrar mensaje de acceso denegado
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

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users size={22} className="text-blue-600" />
            Administrar Usuarios
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de usuarios del sistema, roles y permisos.</p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all border-0 cursor-pointer"
        >
          <Plus size={16} />
          Nuevo Usuario
        </button>
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

      {/* Buscador */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">Nombre</th>
                <th className="py-4 px-5">Correo</th>
                <th className="py-4 px-5">Rol</th>
                <th className="py-4 px-5">Fecha Registro</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 text-sm">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-800">{user.name}</td>
                    <td className="py-4 px-5 text-slate-600">{user.email}</td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        getRolNombre(user) === 'Administrador'
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {getRolNombre(user)}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-500 text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirEditar(user)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => abrirPasswordModal(user)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Cambiar contraseña"
                        >
                          <Key size={15} />
                        </button>
                        {user.id !== usuarioLogueado?.id && (
                          <button
                            onClick={() => handleEliminar(user)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/50 border-t border-slate-200 text-right text-[10px] text-slate-400">
          Total: {usuariosFiltrados.length} usuarios
        </div>
      </div>

      {/* Modal de Usuario (Crear/Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                    {isEditing ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
                  </h2>
                  <p className="text-xs text-slate-500">Complete los datos del usuario</p>
                </div>
              </div>
              <button onClick={cerrarModal} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Mensaje de error */}
              {message.text && message.type === 'error' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={14} />
                  {message.text}
                </div>
              )}

              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Nombre Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Jonathan Morillo"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                    errors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
              </div>

              {/* Correo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Correo Electrónico *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@transmandu.com"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                    errors.email ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
              </div>

              {/* Contraseña (solo en nuevo) */}
              {!isEditing && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Contraseña *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.password ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
                </div>
              )}

              {/* Rol (selector con datos reales) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Rol *</label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                    errors.role_id ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                >
                  <option value="">-- Seleccione un rol --</option>
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.name}
                    </option>
                  ))}
                </select>
                {errors.role_id && <p className="text-xs text-rose-500">{errors.role_id}</p>}
                {roles.length === 0 && (
                  <p className="text-[10px] text-amber-500">⚠️ No hay roles registrados. Cree uno primero.</p>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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

      {/* Modal de Cambio de Contraseña */}
      {passwordModalOpen && passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                  <Key size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">Cambiar Contraseña</h2>
                  <p className="text-xs text-slate-500">Usuario: {passwordUser.name}</p>
                </div>
              </div>
              <button onClick={() => setPasswordModalOpen(false)} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={14} />
                  {passwordError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Nueva Contraseña *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  minLength={8}
                />
                <p className="text-[10px] text-slate-400">La contraseña debe tener al menos 8 caracteres.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors"
                >
                  <Key size={16} /> Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
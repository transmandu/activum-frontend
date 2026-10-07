import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Mail, Key, Bell, Database, 
  Settings, CheckCircle, Save, Smartphone, Loader2, AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';

const Perfil = () => {
  const { 
    usuarioLogueado, 
    obtenerPerfil, 
    actualizarPerfil, 
    cambiarPasswordPerfil,
    cargarUsuarios 
  } = useData();

  // Estados del formulario de perfil
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    if (usuarioLogueado) {
      setFormData({
        name: usuarioLogueado.nombre || '',
        email: usuarioLogueado.correo || '',
      });
    }
  }, [usuarioLogueado]);

  // Manejar cambios en el formulario de perfil
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    setMessage({ type: '', text: '' });
  };

  // Manejar cambios en el formulario de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordMessage.type) setPasswordMessage({ type: '', text: '' });
  };

  // Guardar cambios del perfil
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setErrors({});
    setIsLoading(true);

    try {
      const payload = {};
      if (formData.name !== usuarioLogueado.nombre) payload.name = formData.name;
      if (formData.email !== usuarioLogueado.correo) payload.email = formData.email;

      if (Object.keys(payload).length === 0) {
        setMessage({ type: 'info', text: 'No hay cambios para guardar.' });
        setIsLoading(false);
        return;
      }

      await actualizarPerfil(payload);
      // Recargar usuarios para actualizar la lista
      await cargarUsuarios();
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      // Limpiar errores
      setErrors({});
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        setMessage({ type: 'error', text: 'Por favor, corrige los errores.' });
      } else {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Error al actualizar el perfil.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar contraseña
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });
    setIsPasswordLoading(true);

    // Validar que las contraseñas coincidan
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      setIsPasswordLoading(false);
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres.' });
      setIsPasswordLoading(false);
      return;
    }

    try {
      await cambiarPasswordPerfil({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' });
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al cambiar la contraseña.' 
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Obtener iniciales del usuario
  const obtenerIniciales = (nombre) => {
    if (!nombre) return 'IT';
    const partes = nombre.trim().split(/\s+/);
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return partes[0].substring(0, 2).toUpperCase();
  };

  // Determinar si el usuario es administrador
  const isAdmin = usuarioLogueado?.rol === 'Administrador';

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 m-0">Mi Cuenta</h3>
        <p className="text-xs text-slate-400 m-0 mt-0.5">Gestión de tu perfil, credenciales de acceso y preferencias operativas del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Tarjeta de Identidad del Usuario */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-md relative overflow-hidden flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-blue-500/50 flex items-center justify-center text-blue-400 font-black text-2xl shadow-inner relative z-10">
              {obtenerIniciales(usuarioLogueado?.nombre)}
            </div>
            
            <div className="mt-4 space-y-1 relative z-10">
              <h4 className="text-base font-black tracking-tight m-0">{usuarioLogueado?.nombre || 'Usuario'}</h4>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-block uppercase tracking-wider ${
                isAdmin 
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                  : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
              }`}>
                {usuarioLogueado?.rol || 'Personal I.T.'}
              </span>
              <p className="text-xs text-slate-400 pt-2 m-0 max-w-xs">
                {isAdmin 
                  ? 'Administrador del sistema con acceso total a la plataforma.' 
                  : 'Usuario con permisos operativos sobre la plataforma.'}
              </p>
            </div>

            {/* Separador */}
            <div className="w-full border-t border-slate-800/60 my-5 relative z-10"></div>

            {/* Metadatos Rápidos */}
            <div className="w-full space-y-2.5 text-left text-xs text-slate-400 relative z-10">
              <div className="flex justify-between items-center">
                <span className="font-medium">Correo Electrónico:</span>
                <span className="font-bold text-blue-400 tracking-wide truncate max-w-40">{usuarioLogueado?.correo || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Nivel de Acceso:</span>
                <span className={`font-bold flex items-center gap-1 ${isAdmin ? 'text-amber-400' : 'text-emerald-400'}`}>
                  <Shield size={12} /> {isAdmin ? 'Root / Full Access' : 'Usuario Operativo'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Entorno:</span>
                <span className="font-mono text-[11px] text-slate-300">Sistema Activo</span>
              </div>
            </div>
          </div>

          {/* Estado del Sistema */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <h5 className="text-xs font-bold text-slate-800 m-0 flex items-center gap-2">
              <Database size={14} className="text-slate-400" /> Estado del Sistema
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-500 font-medium">Sesión Activa</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle size={10} /> Conectado
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-500 font-medium">Rol Asignado</span>
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {usuarioLogueado?.rol || 'Sin asignar'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario y Ajustes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Formulario de Datos del Perfil */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              <h4 className="text-sm font-bold text-slate-800 m-0">Datos de la Cuenta</h4>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Mensaje de éxito/error */}
              {message.text && (
                <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  'bg-slate-50 text-slate-700 border border-slate-200'
                }`}>
                  {message.type === 'success' && <CheckCircle size={16} />}
                  {message.type === 'error' && <AlertCircle size={16} />}
                  {message.type === 'info' && <AlertCircle size={16} />}
                  <span>{message.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <User size={13} /> Nombre Completo
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors font-semibold text-slate-800 ${
                      errors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-rose-500">{errors.name[0]}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Mail size={13} /> Correo Electrónico
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors font-semibold text-slate-800 ${
                      errors.email ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-rose-500">{errors.email[0]}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg shadow-md transition-all border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : <><Save size={14} /> Guardar Cambios</>}
                </button>
              </div>
            </form>
          </div>

          {/* Formulario de Cambio de Contraseña */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Key size={16} className="text-blue-600" />
              <h4 className="text-sm font-bold text-slate-800 m-0">Cambiar Contraseña</h4>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {/* Mensaje de éxito/error */}
              {passwordMessage.text && (
                <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  passwordMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  'bg-slate-50 text-slate-700 border border-slate-200'
                }`}>
                  {passwordMessage.type === 'success' && <CheckCircle size={16} />}
                  {passwordMessage.type === 'error' && <AlertCircle size={16} />}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Key size={13} /> Contraseña Actual
                  </label>
                  <input 
                    type="password" 
                    name="current_password" 
                    placeholder="••••••••"
                    value={passwordData.current_password} 
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Key size={13} /> Nueva Contraseña
                    </label>
                    <input 
                      type="password" 
                      name="new_password" 
                      placeholder="Mínimo 8 caracteres"
                      value={passwordData.new_password} 
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Key size={13} /> Confirmar Nueva Contraseña
                    </label>
                    <input 
                      type="password" 
                      name="new_password_confirmation" 
                      placeholder="Repite la contraseña"
                      value={passwordData.new_password_confirmation} 
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  disabled={isPasswordLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md transition-all border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPasswordLoading ? <><Loader2 size={14} className="animate-spin" /> Actualizando...</> : <><Key size={14} /> Cambiar Contraseña</>}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 mt-2">La contraseña debe tener al menos 8 caracteres.</p>
            </form>
          </div>

          {/* Preferencias (mantenidas igual pero con datos reales) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Bell size={16} className="text-blue-600" />
              <h4 className="text-sm font-bold text-slate-800 m-0">Preferencias de Sistema</h4>
            </div>

            <div className="p-6 divide-y divide-slate-100">
              <div className="flex items-center justify-between pb-4">
                <div className="space-y-0.5 max-w-md">
                  <div className="text-xs font-bold text-slate-700">Modo Oscuro</div>
                  <p className="text-[11px] text-slate-400 m-0">Alternar entre tema claro y oscuro en toda la interfaz.</p>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400">Próximamente</div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5 max-w-md">
                  <div className="text-xs font-bold text-slate-700">Notificaciones por Correo</div>
                  <p className="text-[11px] text-slate-400 m-0">Recibir alertas por correo sobre eventos importantes del sistema.</p>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400">Próximamente</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Perfil;
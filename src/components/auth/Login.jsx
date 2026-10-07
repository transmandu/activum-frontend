import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Shield, Mail, Key, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

// 🔥 IMPORTANTE: Importamos la imagen localmente para que viva siempre en la app
import logoActivum from '../../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { iniciarSesion } = useData();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!correo.trim() || !password.trim()) {
      setErrorMsg('Por favor, complete todos los campos institucionales.');
      return;
    }
    setIsSubmitting(true);
    try {
      const resultado = await iniciarSesion(correo, password);
      if (resultado.exito) {
        navigate('/dashboard', { replace: true });
      } else {
        setErrorMsg(resultado.mensaje);
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex antialiased">
      
      {/* ========================================================= */}
      {/* LADO IZQUIERDO - LOGO LOCAL ACTIVUM                       */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12">
        <img 
          src={logoActivum} 
          alt="Activum - Sistema de Gestión de Activos I.T." 
          className="w-full max-w-md object-contain select-none pointer-events-none"
        />
      </div>

      {/* ========================================================= */}
      {/* LADO DERECHO - FORMULARIO OSCURO                          */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 bg-slate-900 flex items-center justify-center p-4 sm:p-8">
        
        {/* CONTENEDOR DEL FORMULARIO */}
        <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-blue-600 to-indigo-600"></div>
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600/10 rounded-xl text-blue-500 border border-blue-500/20 mb-3">
              <Shield size={28} className="stroke-[1.75]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">TRANSMANDU, C.A.</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider"></p>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo correo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block uppercase">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="ejemplo@transmandu.com"
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-3 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Campo contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block uppercase">Contraseña de Acceso</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Key size={16} />
                </div>
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl pl-10 pr-10 py-3 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 bg-transparent border-0 cursor-pointer"
                >
                  {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-dashed border-slate-700">
              <span className="text-[15px] font-medium text-slate-400">Jefatura de Soporte Técnico.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-blue-600/10 border-0 cursor-pointer transition-all disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> <span>Autenticando Oficial...</span></>
              ) : (
                <span>Ingresar al Sistema</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
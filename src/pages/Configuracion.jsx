// src/pages/Configuracion.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Shield, Building, Save, AlertCircle, Mail, Globe, Clock, 
  CheckCircle2, Server, Cpu, Lock, User, Sparkles, Activity,
  Tag, Layers, Users, MapPin, Database, Plus, Edit2, Trash2,
  X, Loader2, Key, HardDrive
} from 'lucide-react';
import { useData } from '../context/DataContext';

// Importación de los modales de catálogos
import ModalCategoria from '../components/modals/ModalCategoria';
import ModalMarca from '../components/modals/ModalMarca';
import ModalModelo from '../components/modals/ModalModelo';
import ModalDepartamento from '../components/modals/ModalDepartamento';
import ModalPersonal from '../components/modals/ModalPersonal';
import ModalPlataformaTest from '../components/modals/ModalPlataformaTest';
import ModalDestino from '../components/modals/ModalDestino';
import ModalLicencia from '../components/modals/ModalLicencia';
import ModalDominio from '../components/modals/ModalDominio';
import ModalInterfaz from '../components/modals/ModalInterfaz';
import ModalTipoDisco from '../components/modals/ModalTipoDisco';
import ModalConfigRaid from '../components/modals/ModalConfigRaid';
import ModalEstado from '../components/modals/ModalEstado';
import ModalInterfazDisco from '../components/modals/ModalInterfazDisco';
import ModalTamanoDisco from '../components/modals/ModalTamanoDisco';

const Configuracion = () => {
  const { 
    configuracion, 
    actualizarConfiguracion, 
    cargarConfiguracion,
    usuarioLogueado,
    // Datos de catálogos
    categorias,
    marcas,
    modelos,
    departamentos,
    personal,
    plataformasTest,
    destinos,
    licencias,
    dominios,
    interfaces,
    tiposDisco,
    configuracionesRaid,
    estados,
    interfacesDisco,
    tamanosDisco,
    // Funciones de eliminación
    eliminarCategoria,
    eliminarMarca,
    eliminarModelo,
    eliminarDepartamento,
    eliminarPersonal,
    eliminarPlataformaTest,
    eliminarDestino,
    eliminarLicencia,
    eliminarDominio,
    eliminarInterfaz,
    eliminarTipoDisco,
    eliminarConfiguracionRaid,
    eliminarEstado,
    eliminarInterfazDisco,
    eliminarTamanoDisco,
    userPermissions
  } = useData();

  // VERIFICAR PERMISOS
  const puedeEditarConfiguracion = userPermissions.includes('editar_configuracion');

  // ===== NUEVO: Leer el parámetro "tab" de la URL =====
  const [searchParams, setSearchParams] = useSearchParams();
  const tabInicial = searchParams.get('tab') || 'categorias';

  const [formData, setFormData] = useState({
    institucion: '',
    correoAlertas: '',
    idioma: 'es',
    zonaHoraria: 'vzt',
    test_plataforma_1: 'speedtest',
    test_plataforma_2: 'gfiber',
    test_plataforma_3: 'nperf',
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados para los modales de catálogos
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [modalMarcaOpen, setModalMarcaOpen] = useState(false);
  const [modalModeloOpen, setModalModeloOpen] = useState(false);
  const [modalDepartamentoOpen, setModalDepartamentoOpen] = useState(false);
  const [modalPersonalOpen, setModalPersonalOpen] = useState(false);
  const [modalPlataformaTestOpen, setModalPlataformaTestOpen] = useState(false);
  const [modalDestinoOpen, setModalDestinoOpen] = useState(false);
  const [modalLicenciaOpen, setModalLicenciaOpen] = useState(false);
  const [modalDominioOpen, setModalDominioOpen] = useState(false);
  const [modalInterfazOpen, setModalInterfazOpen] = useState(false);
  const [modalTipoDiscoOpen, setModalTipoDiscoOpen] = useState(false);
  const [modalConfigRaidOpen, setModalConfigRaidOpen] = useState(false);
  const [modalEstadoOpen, setModalEstadoOpen] = useState(false);
  const [modalInterfazDiscoOpen, setModalInterfazDiscoOpen] = useState(false);
  const [modalTamanoDiscoOpen, setModalTamanoDiscoOpen] = useState(false);

  // Estados para edición de catálogos
  const [categoriaAEditar, setCategoriaAEditar] = useState(null);
  const [marcaAEditar, setMarcaAEditar] = useState(null);
  const [modeloAEditar, setModeloAEditar] = useState(null);
  const [departamentoAEditar, setDepartamentoAEditar] = useState(null);
  const [personalAEditar, setPersonalAEditar] = useState(null);
  const [plataformaAEditar, setPlataformaAEditar] = useState(null);
  const [destinoAEditar, setDestinoAEditar] = useState(null);
  const [licenciaAEditar, setLicenciaAEditar] = useState(null);
  const [dominioAEditar, setDominioAEditar] = useState(null);
  const [interfazAEditar, setInterfazAEditar] = useState(null);
  const [tipoDiscoAEditar, setTipoDiscoAEditar] = useState(null);
  const [configRaidAEditar, setConfigRaidAEditar] = useState(null);
  const [estadoAEditar, setEstadoAEditar] = useState(null);
  const [interfazDiscoAEditar, setInterfazDiscoAEditar] = useState(null);
  const [tamanoDiscoAEditar, setTamanoDiscoAEditar] = useState(null);

  // ===== NUEVO: Estado de pestaña activa, inicializado desde URL =====
  const [tabActiva, setTabActiva] = useState(tabInicial);

  // ===== NUEVO: Sincronizar la URL cuando cambie la pestaña =====
  const handleTabChange = (tabId) => {
    setTabActiva(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    if (cargarConfiguracion) cargarConfiguracion();
  }, []);

  useEffect(() => {
    if (configuracion) {
      setFormData({
        institucion: configuracion.nombre_institucion || '',
        correoAlertas: configuracion.correo_alertas || '',
        idioma: configuracion.idioma || 'es',
        zonaHoraria: configuracion.zona_horaria || 'vzt',
        test_plataforma_1: configuracion.test_plataforma_1 || 'speedtest',
        test_plataforma_2: configuracion.test_plataforma_2 || 'gfiber',
        test_plataforma_3: configuracion.test_plataforma_3 || 'nperf',
      });
    }
  }, [configuracion]);

  // ===== NUEVO: Sincronizar tabActiva cuando cambie la URL =====
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setTabActiva(tabFromUrl);
    }
  }, [searchParams]);

  const obtenerIniciales = (nombre) => {
    if (!nombre) return 'IT';
    const partes = nombre.trim().split(/\s+/);
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return partes[0].substring(0, 2).toUpperCase();
  };

  const validarFormulario = () => {
    let erroresTemporales = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.institucion.trim()) {
      erroresTemporales.institucion = "El nombre institucional es requerido para los encabezados de reportes.";
    } else if (formData.institucion.trim().length < 4) {
      erroresTemporales.institucion = "El nombre institucional es demasiado corto.";
    }
    if (!formData.correoAlertas.trim()) {
      erroresTemporales.correoAlertas = "El canal de correo de alertas es obligatorio.";
    } else if (!emailRegex.test(formData.correoAlertas)) {
      erroresTemporales.correoAlertas = "El formato de correo electrónico I.T. no es válido.";
    }
    if (!formData.idioma) erroresTemporales.idioma = "Debe seleccionar un entorno de idioma operativo.";
    if (!formData.zonaHoraria) erroresTemporales.zonaHoraria = "La zona horaria es obligatoria.";
    if (!formData.test_plataforma_1.trim()) erroresTemporales.test_plataforma_1 = "El nombre de la plataforma 1 es requerido.";
    if (!formData.test_plataforma_2.trim()) erroresTemporales.test_plataforma_2 = "El nombre de la plataforma 2 es requerido.";
    if (!formData.test_plataforma_3.trim()) erroresTemporales.test_plataforma_3 = "El nombre de la plataforma 3 es requerido.";

    setErrors(erroresTemporales);
    return Object.keys(erroresTemporales).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    if (!validarFormulario()) return;
    setIsSaving(true);

    try {
      const payload = {
        nombre_institucion: formData.institucion,
        correo_alertas: formData.correoAlertas,
        idioma: formData.idioma,
        zona_horaria: formData.zonaHoraria,
        test_plataforma_1: formData.test_plataforma_1.toLowerCase(),
        test_plataforma_2: formData.test_plataforma_2.toLowerCase(),
        test_plataforma_3: formData.test_plataforma_3.toLowerCase(),
      };
      await actualizarConfiguracion(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (error) {
      alert('Error al guardar la configuración. Intente de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== FUNCIONES PARA ABRIR MODALES ====================
  const abrirModalCategoria = (item = null) => {
    setCategoriaAEditar(item);
    setModalCategoriaOpen(true);
  };
  const abrirModalMarca = (item = null) => {
    setMarcaAEditar(item);
    setModalMarcaOpen(true);
  };
  const abrirModalModelo = (item = null) => {
    setModeloAEditar(item);
    setModalModeloOpen(true);
  };
  const abrirModalDepartamento = (item = null) => {
    setDepartamentoAEditar(item);
    setModalDepartamentoOpen(true);
  };
  const abrirModalPersonal = (item = null) => {
    setPersonalAEditar(item);
    setModalPersonalOpen(true);
  };
  const abrirModalPlataformaTest = (item = null) => {
    setPlataformaAEditar(item);
    setModalPlataformaTestOpen(true);
  };
  const abrirModalDestino = (item = null) => {
    setDestinoAEditar(item);
    setModalDestinoOpen(true);
  };
  const abrirModalLicencia = (item = null) => {
    setLicenciaAEditar(item);
    setModalLicenciaOpen(true);
  };
  const abrirModalDominio = (item = null) => {
    setDominioAEditar(item);
    setModalDominioOpen(true);
  };
  const abrirModalInterfaz = (item = null) => {
    setInterfazAEditar(item);
    setModalInterfazOpen(true);
  };
  const abrirModalTipoDisco = (item = null) => {
    setTipoDiscoAEditar(item);
    setModalTipoDiscoOpen(true);
  };
  const abrirModalConfigRaid = (item = null) => {
    setConfigRaidAEditar(item);
    setModalConfigRaidOpen(true);
  };
  const abrirModalEstado = (item = null) => {
    setEstadoAEditar(item);
    setModalEstadoOpen(true);
  };
  const abrirModalInterfazDisco = (item = null) => {
    setInterfazDiscoAEditar(item);
    setModalInterfazDiscoOpen(true);
  };
  const abrirModalTamanoDisco = (item = null) => {
    setTamanoDiscoAEditar(item);
    setModalTamanoDiscoOpen(true);
  };

  // ==================== FUNCIONES DE ELIMINACIÓN ====================
  const handleEliminarCategoria = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta categoría?')) {
      await eliminarCategoria(id);
    }
  };
  const handleEliminarMarca = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta marca?')) {
      await eliminarMarca(id);
    }
  };
  const handleEliminarModelo = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este modelo?')) {
      await eliminarModelo(id);
    }
  };
  const handleEliminarDepartamento = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este departamento?')) {
      await eliminarDepartamento(id);
    }
  };
  const handleEliminarPersonal = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este personal?')) {
      await eliminarPersonal(id);
    }
  };
  const handleEliminarPlataformaTest = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta plataforma de test?')) {
      await eliminarPlataformaTest(id);
    }
  };
  const handleEliminarDestino = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este destino?')) {
      await eliminarDestino(id);
    }
  };
  const handleEliminarLicencia = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta licencia?')) {
      await eliminarLicencia(id);
    }
  };
  const handleEliminarDominio = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este dominio?')) {
      await eliminarDominio(id);
    }
  };
  const handleEliminarInterfaz = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta interfaz?')) {
      await eliminarInterfaz(id);
    }
  };
  const handleEliminarTipoDisco = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este tipo de disco?')) {
      await eliminarTipoDisco(id);
    }
  };
  const handleEliminarConfigRaid = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta configuración RAID?')) {
      await eliminarConfiguracionRaid(id);
    }
  };
  const handleEliminarEstado = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este estado?')) {
      await eliminarEstado(id);
    }
  };
  const handleEliminarInterfazDisco = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta interfaz de disco?')) {
      await eliminarInterfazDisco(id);
    }
  };
  const handleEliminarTamanoDisco = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este tamaño de disco?')) {
      await eliminarTamanoDisco(id);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left antialiased p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-2.5 py-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1">
              <Shield size={10} /> Consola Root
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1">
              <Activity size={12} /> Terminal Activo
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
            Parámetros del Sistema
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Ajustes operativos globales de la plataforma. Las modificaciones aplicadas aquí alteran los encabezados de los módulos de auditoría, los reportes PDF y los nombres de las plataformas de test de velocidad en el módulo de Tareas.
          </p>
        </div>
      </div>

      {/* DISEÑO EN DOS COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLUMNA PRINCIPAL */}
        <div className="lg:col-span-2 space-y-6">
          {/* ===== FORMULARIO DE PARÁMETROS ===== */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sección 1: Identidad */}
              <div>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                  <div className="p-2.5 bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-md">
                    <Building size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Identidad de la Organización</h4>
                    <p className="text-xs text-slate-500">Define los encabezados y firmas en reportes globales.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Nombre Institucional (Cabecera de Documentos)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building size={14} />
                      </div>
                      <input 
                        type="text"
                        name="institucion"
                        value={formData.institucion}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-slate-50/80 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.institucion ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/20' : 'border-slate-200'}`}
                        placeholder="Ej. TRANSMANDU C.A."
                      />
                    </div>
                    {errors.institucion && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.institucion}</p>}
                  </div>
                </div>
              </div>

              {/* Sección 2: Canales y Localización */}
              <div className="pt-2">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                  <div className="p-2.5 bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-md">
                    <Mail size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Canales de Alerta y Localización</h4>
                    <p className="text-xs text-slate-500">Configuración de mensajería del sistema y variables de tiempo.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Correo de Alertas Técnicas</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail size={14} />
                      </div>
                      <input 
                        type="text"
                        name="correoAlertas"
                        value={formData.correoAlertas}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-slate-50/80 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.correoAlertas ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200'}`}
                        placeholder="ejemplo@transmandu.com"
                      />
                    </div>
                    {errors.correoAlertas && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.correoAlertas}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Idioma Predeterminado</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Globe size={14} />
                      </div>
                      <select
                        name="idioma"
                        value={formData.idioma}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-slate-50/80 text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
                      >
                        <option value="es">Español (América Latina)</option>
                        <option value="en">English (US)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Zona Horaria del Servidor</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Clock size={14} />
                      </div>
                      <select
                        name="zonaHoraria"
                        value={formData.zonaHoraria}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-slate-50/80 text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
                      >
                        <option value="vzt">Venezuela (GMT-4) [VET]</option>
                        <option value="est">Eastern Time (GMT-5) [EST]</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 3: Plataformas de Test */}
              <div className="pt-2">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                  <div className="p-2.5 bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-md">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Plataformas de Test de Velocidad</h4>
                    <p className="text-xs text-slate-500">Nombres que aparecerán en el módulo de Tareas para los tres tests de internet.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Plataforma 1</label>
                    <input
                      type="text"
                      name="test_plataforma_1"
                      value={formData.test_plataforma_1}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm font-medium bg-slate-50/80 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.test_plataforma_1 ? 'border-rose-300' : 'border-slate-200'}`}
                      placeholder="Ej: speedtest"
                    />
                    {errors.test_plataforma_1 && <p className="text-[10px] font-bold text-rose-500">{errors.test_plataforma_1}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Plataforma 2</label>
                    <input
                      type="text"
                      name="test_plataforma_2"
                      value={formData.test_plataforma_2}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm font-medium bg-slate-50/80 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.test_plataforma_2 ? 'border-rose-300' : 'border-slate-200'}`}
                      placeholder="Ej: gfiber"
                    />
                    {errors.test_plataforma_2 && <p className="text-[10px] font-bold text-rose-500">{errors.test_plataforma_2}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Plataforma 3</label>
                    <input
                      type="text"
                      name="test_plataforma_3"
                      value={formData.test_plataforma_3}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm font-medium bg-slate-50/80 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.test_plataforma_3 ? 'border-rose-300' : 'border-slate-200'}`}
                      placeholder="Ej: nperf"
                    />
                    {errors.test_plataforma_3 && <p className="text-[10px] font-bold text-rose-500">{errors.test_plataforma_3}</p>}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Ingrese el nombre exacto de la plataforma (en minúsculas) que desea mostrar en los reportes. Se mostrarán en mayúsculas automáticamente.</p>
              </div>

              {saveSuccess && (
                <div className="p-3.5 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-fadeIn shadow-sm">
                  <Sparkles size={16} className="text-emerald-600" />
                  <span>Parámetros globales sincronizados con éxito.</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                {/* ✅ BOTÓN "Sincronizar Parámetros" - solo si tiene permiso */}
                {puedeEditarConfiguracion && (
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="group flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Save size={16} className="group-hover:rotate-12 transition-transform" />
                    {isSaving ? "Escribiendo en Servidor..." : "Sincronizar Parámetros"}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ===== GESTIÓN DE CATÁLOGOS ===== */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <div className="p-2.5 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-md">
                <Database size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Gestión de Catálogos</h4>
                <p className="text-xs text-slate-500">Administre las opciones disponibles en los selectores de toda la aplicación.</p>
              </div>
            </div>

            {/* Pestañas */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
              {[
                { id: 'categorias', label: 'Categorías', icon: <Tag size={14} /> },
                { id: 'marcas', label: 'Marcas', icon: <Tag size={14} /> },
                { id: 'modelos', label: 'Modelos', icon: <Tag size={14} /> },
                { id: 'departamentos', label: 'Departamentos', icon: <Building size={14} /> },
                { id: 'personal', label: 'Personal', icon: <Users size={14} /> },
                { id: 'plataformas', label: 'Plataformas Test', icon: <Activity size={14} /> },
                { id: 'destinos', label: 'Destinos', icon: <MapPin size={14} /> },
                { id: 'licencias', label: 'Licencias', icon: <Key size={14} /> },
                { id: 'dominios', label: 'Dominios', icon: <Globe size={14} /> },
                { id: 'interfaces', label: 'Interfaces', icon: <Activity size={14} /> },
                { id: 'discos', label: 'Discos', icon: <HardDrive size={14} /> },
                { id: 'config_raid', label: 'Configuraciones RAID', icon: <Server size={14} /> },
                { id: 'estados', label: 'Estados', icon: <Tag size={14} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    tabActiva === tab.id
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* CONTENIDO DE PESTAÑAS */}

            {/* ===== CATEGORÍAS ===== */}
            {tabActiva === 'categorias' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Total: {categorias?.length || 0}</span>
                  {/* ✅ BOTÓN AGREGAR - solo si tiene permiso */}
                  {puedeEditarConfiguracion && (
                    <button onClick={() => abrirModalCategoria()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">
                      <Plus size={14} /> Agregar Categoría
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                      <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Descripción</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {categorias?.length > 0 ? categorias.map(cat => (
                        <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{cat.nombre}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{cat.descripcion || '—'}</td>
                          <td className="px-4 py-2.5 text-right flex justify-end gap-1">
                            {puedeEditarConfiguracion && (
                              <button onClick={() => abrirModalCategoria(cat)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={14} /></button>
                            )}
                            {puedeEditarConfiguracion && (
                              <button onClick={() => handleEliminarCategoria(cat.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="3" className="px-4 py-6 text-center text-xs text-slate-400">No hay categorías registradas.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== MARCAS ===== */}
            {tabActiva === 'marcas' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Total: {marcas?.length || 0}</span>
                  {puedeEditarConfiguracion && (
                    <button onClick={() => abrirModalMarca()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">
                      <Plus size={14} /> Agregar Marca
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                      <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Modelos</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {marcas?.length > 0 ? marcas.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{m.nombre}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">
                            {m.modelos && m.modelos.length > 0
                              ? m.modelos.map(mod => mod.nombre).join(', ')
                              : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right flex justify-end gap-1">
                            {puedeEditarConfiguracion && (
                              <button onClick={() => abrirModalMarca(m)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={14} /></button>
                            )}
                            {puedeEditarConfiguracion && (
                              <button onClick={() => handleEliminarMarca(m.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="3" className="px-4 py-6 text-center text-xs text-slate-400">No hay marcas registradas.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== MODELOS ===== */}
            {tabActiva === 'modelos' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Total: {modelos?.length || 0}</span>
                  {puedeEditarConfiguracion && (
                    <button onClick={() => abrirModalModelo()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">
                      <Plus size={14} /> Agregar Modelo
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                      <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Marca</th><th className="px-4 py-2.5">Descripción</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {modelos?.length > 0 ? modelos.map(mod => (
                        <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{mod.nombre}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{mod.marca?.nombre || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{mod.descripcion || '—'}</td>
                          <td className="px-4 py-2.5 text-right flex justify-end gap-1">
                            {puedeEditarConfiguracion && (
                              <button onClick={() => abrirModalModelo(mod)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={14} /></button>
                            )}
                            {puedeEditarConfiguracion && (
                              <button onClick={() => handleEliminarModelo(mod.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="4" className="px-4 py-6 text-center text-xs text-slate-400">No hay modelos registrados.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== DEPARTAMENTOS ===== */}
            {tabActiva === 'departamentos' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Total: {departamentos?.length || 0}</span>
                  {puedeEditarConfiguracion && (
                    <button onClick={() => abrirModalDepartamento()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">
                      <Plus size={14} /> Agregar Departamento
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                      <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Padre</th><th className="px-4 py-2.5">Nivel</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {departamentos?.length > 0 ? departamentos.map(d => {
                        const padre = departamentos.find(p => p.id === d.padre_id);
                        return <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{d.nombre}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{padre?.nombre || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{d.nivel}</td>
                          <td className="px-4 py-2.5 text-right flex justify-end gap-1">
                            {puedeEditarConfiguracion && (
                              <button onClick={() => abrirModalDepartamento(d)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={14} /></button>
                            )}
                            {puedeEditarConfiguracion && (
                              <button onClick={() => handleEliminarDepartamento(d.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>;
                      }) : <tr><td colSpan="4" className="px-4 py-6 text-center text-xs text-slate-400">No hay departamentos registrados.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== PERSONAL ===== */}
            {tabActiva === 'personal' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Total: {personal?.length || 0}</span>
                  {puedeEditarConfiguracion && (
                    <button onClick={() => abrirModalPersonal()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">
                      <Plus size={14} /> Agregar Personal
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                      <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Cédula</th><th className="px-4 py-2.5">Cargo</th><th className="px-4 py-2.5">Autoriza</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {personal?.length > 0 ? personal.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{p.nombre_completo}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{p.cedula}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{p.cargo || '—'}</td>
                          <td className="px-4 py-2.5 text-xs">{p.puede_autorizar ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">Sí</span> : <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full text-[10px] font-bold">No</span>}</td>
                          <td className="px-4 py-2.5 text-right flex justify-end gap-1">
                            {puedeEditarConfiguracion && (
                              <button onClick={() => abrirModalPersonal(p)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={14} /></button>
                            )}
                            {puedeEditarConfiguracion && (
                              <button onClick={() => handleEliminarPersonal(p.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="5" className="px-4 py-6 text-center text-xs text-slate-400">No hay personal registrado.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== PLATAFORMAS TEST ===== */}
            {tabActiva === 'plataformas' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Total: {plataformasTest?.length || 0}</span>
                  {puedeEditarConfiguracion && (
                    <button onClick={() => abrirModalPlataformaTest()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">
                      <Plus size={14} /> Agregar Plataforma
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                      <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Orden</th><th className="px-4 py-2.5">Estado</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {plataformasTest?.length > 0 ? plataformasTest.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{p.nombre}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{p.orden || 0}</td>
                          <td className="px-4 py-2.5 text-xs">{p.activo ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">Activo</span> : <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full text-[10px] font-bold">Inactivo</span>}</td>
                          <td className="px-4 py-2.5 text-right flex justify-end gap-1">
                            {puedeEditarConfiguracion && (
                              <button onClick={() => abrirModalPlataformaTest(p)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={14} /></button>
                            )}
                            {puedeEditarConfiguracion && (
                              <button onClick={() => handleEliminarPlataformaTest(p.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="4" className="px-4 py-6 text-center text-xs text-slate-400">No hay plataformas de test registradas.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== DESTINOS ===== */}
            {tabActiva === 'destinos' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Total: {destinos?.length || 0}</span>
                  {puedeEditarConfiguracion && (
                    <button onClick={() => abrirModalDestino()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">
                      <Plus size={14} /> Agregar Destino
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                      <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Descripción</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {destinos?.length > 0 ? destinos.map(d => (
                        <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{d.nombre}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{d.descripcion || '—'}</td>
                          <td className="px-4 py-2.5 text-right flex justify-end gap-1">
                            {puedeEditarConfiguracion && (
                              <button onClick={() => abrirModalDestino(d)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={14} /></button>
                            )}
                            {puedeEditarConfiguracion && (
                              <button onClick={() => handleEliminarDestino(d.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="3" className="px-4 py-6 text-center text-xs text-slate-400">No hay destinos registrados.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== LICENCIAS ===== */}
            {tabActiva === 'licencias' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Total: {licencias?.length || 0}</span>
                  {puedeEditarConfiguracion && (
                    <button onClick={() => abrirModalLicencia()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">
                      <Plus size={14} /> Agregar Licencia
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                      <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Versión</th><th className="px-4 py-2.5">Edición</th><th className="px-4 py-2.5">Tipo</th><th className="px-4 py-2.5">Estado</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {licencias?.length > 0 ? licencias.map(l => (
                        <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{l.nombre}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{l.version || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{l.edicion || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{l.tipo || 'Perpetua'}</td>
                          <td className="px-4 py-2.5 text-xs">{l.activa ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">Activa</span> : <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full text-[10px] font-bold">Inactiva</span>}</td>
                          <td className="px-4 py-2.5 text-right flex justify-end gap-1">
                            {puedeEditarConfiguracion && (
                              <button onClick={() => abrirModalLicencia(l)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={14} /></button>
                            )}
                            {puedeEditarConfiguracion && (
                              <button onClick={() => handleEliminarLicencia(l.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="6" className="px-4 py-6 text-center text-xs text-slate-400">No hay licencias registradas.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== DOMINIOS ===== */}
            {tabActiva === 'dominios' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Total: {dominios?.length || 0}</span>
                  {puedeEditarConfiguracion && (
                    <button onClick={() => abrirModalDominio()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">
                      <Plus size={14} /> Agregar Dominio
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                      <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Descripción</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {dominios?.length > 0 ? dominios.map(d => (
                        <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{d.nombre}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{d.descripcion || '—'}</td>
                          <td className="px-4 py-2.5 text-right flex justify-end gap-1">
                            {puedeEditarConfiguracion && (
                              <button onClick={() => abrirModalDominio(d)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={14} /></button>
                            )}
                            {puedeEditarConfiguracion && (
                              <button onClick={() => handleEliminarDominio(d.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="3" className="px-4 py-6 text-center text-xs text-slate-400">No hay dominios registrados.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== INTERFACES ===== */}
            {tabActiva === 'interfaces' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Total: {interfaces?.length || 0}</span>
                  {puedeEditarConfiguracion && (
                    <button onClick={() => abrirModalInterfaz()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">
                      <Plus size={14} /> Agregar Interfaz
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                      <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Descripción</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {interfaces?.length > 0 ? interfaces.map(i => (
                        <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{i.nombre}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{i.descripcion || '—'}</td>
                          <td className="px-4 py-2.5 text-right flex justify-end gap-1">
                            {puedeEditarConfiguracion && (
                              <button onClick={() => abrirModalInterfaz(i)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={14} /></button>
                            )}
                            {puedeEditarConfiguracion && (
                              <button onClick={() => handleEliminarInterfaz(i.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="3" className="px-4 py-6 text-center text-xs text-slate-400">No hay interfaces registradas.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== DISCOS (UNIFICADO) ===== */}
            {tabActiva === 'discos' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-500">Gestión de catálogos de discos</span>
                  {puedeEditarConfiguracion && (
                    <button
                      onClick={() => abrirModalTipoDisco()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all"
                    >
                      <Plus size={14} /> Agregar Tipo de Disco
                    </button>
                  )}
                </div>

                {/* TIPOS DE DISCO */}
                <div>
                  <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Tipos de Disco</h5>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                        <tr><th className="px-3 py-2">Nombre</th><th className="px-3 py-2">Descripción</th><th className="px-3 py-2 text-right">Acciones</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {tiposDisco?.length > 0 ? tiposDisco.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-3 py-2 font-medium text-slate-700 text-xs">{t.nombre}</td>
                            <td className="px-3 py-2 text-slate-500 text-xs">{t.descripcion || '—'}</td>
                            <td className="px-3 py-2 text-right flex justify-end gap-1">
                              {puedeEditarConfiguracion && (
                                <button onClick={() => abrirModalTipoDisco(t)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={12} /></button>
                              )}
                              {puedeEditarConfiguracion && (
                                <button onClick={() => handleEliminarTipoDisco(t.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={12} /></button>
                              )}
                            </td>
                          </tr>
                        )) : <tr><td colSpan="3" className="px-3 py-4 text-center text-xs text-slate-400">No hay tipos de disco registrados.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* INTERFACES DE DISCO */}
                <div>
                  <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Interfaces de Disco</h5>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                        <tr><th className="px-3 py-2">Nombre</th><th className="px-3 py-2">Descripción</th><th className="px-3 py-2 text-right">Acciones</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {interfacesDisco?.length > 0 ? interfacesDisco.map(i => (
                          <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-3 py-2 font-medium text-slate-700 text-xs">{i.nombre}</td>
                            <td className="px-3 py-2 text-slate-500 text-xs">{i.descripcion || '—'}</td>
                            <td className="px-3 py-2 text-right flex justify-end gap-1">
                              {puedeEditarConfiguracion && (
                                <button onClick={() => abrirModalInterfazDisco(i)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={12} /></button>
                              )}
                              {puedeEditarConfiguracion && (
                                <button onClick={() => handleEliminarInterfazDisco(i.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={12} /></button>
                              )}
                            </td>
                          </tr>
                        )) : <tr><td colSpan="3" className="px-3 py-4 text-center text-xs text-slate-400">No hay interfaces de disco registradas.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TAMAÑOS DE DISCO */}
                <div>
                  <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Tamaños de Disco (2.5", 3.5", etc.)</h5>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                        <tr><th className="px-3 py-2">Nombre</th><th className="px-3 py-2">Descripción</th><th className="px-3 py-2 text-right">Acciones</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {tamanosDisco?.length > 0 ? tamanosDisco.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-3 py-2 font-medium text-slate-700 text-xs">{t.nombre}</td>
                            <td className="px-3 py-2 text-slate-500 text-xs">{t.descripcion || '—'}</td>
                            <td className="px-3 py-2 text-right flex justify-end gap-1">
                              {puedeEditarConfiguracion && (
                                <button onClick={() => abrirModalTamanoDisco(t)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={12} /></button>
                              )}
                              {puedeEditarConfiguracion && (
                                <button onClick={() => handleEliminarTamanoDisco(t.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={12} /></button>
                              )}
                            </td>
                          </tr>
                        )) : <tr><td colSpan="3" className="px-3 py-4 text-center text-xs text-slate-400">No hay tamaños de disco registrados.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== CONFIGURACIONES RAID ===== */}
            {tabActiva === 'config_raid' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Total: {configuracionesRaid?.length || 0}</span>
                  {puedeEditarConfiguracion && (
                    <button onClick={() => abrirModalConfigRaid()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">
                      <Plus size={14} /> Agregar Configuración RAID
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                      <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Descripción</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {configuracionesRaid?.length > 0 ? configuracionesRaid.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{r.nombre}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{r.descripcion || '—'}</td>
                          <td className="px-4 py-2.5 text-right flex justify-end gap-1">
                            {puedeEditarConfiguracion && (
                              <button onClick={() => abrirModalConfigRaid(r)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={14} /></button>
                            )}
                            {puedeEditarConfiguracion && (
                              <button onClick={() => handleEliminarConfigRaid(r.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="3" className="px-4 py-6 text-center text-xs text-slate-400">No hay configuraciones RAID registradas.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== ESTADOS ===== */}
            {tabActiva === 'estados' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-medium text-slate-500">Total: {estados?.length || 0}</span>
                  {puedeEditarConfiguracion && (
                    <button onClick={() => abrirModalEstado()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all">
                      <Plus size={14} /> Agregar Estado
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase">
                      <tr><th className="px-4 py-2.5">Nombre</th><th className="px-4 py-2.5">Descripción</th><th className="px-4 py-2.5">Color</th><th className="px-4 py-2.5 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {estados?.length > 0 ? estados.map(e => (
                        <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{e.nombre}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs">{e.descripcion || '—'}</td>
                          <td className="px-4 py-2.5"><span className="inline-block w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: e.color || '#3b82f6' }} /></td>
                          <td className="px-4 py-2.5 text-right flex justify-end gap-1">
                            {puedeEditarConfiguracion && (
                              <button onClick={() => abrirModalEstado(e)} className="p-1 text-slate-400 hover:text-amber-600 rounded"><Edit2 size={14} /></button>
                            )}
                            {puedeEditarConfiguracion && (
                              <button onClick={() => handleEliminarEstado(e.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="4" className="px-4 py-6 text-center text-xs text-slate-400">No hay estados registrados.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA - PERFIL Y SEGURIDAD */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden relative group hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-blue-600 font-bold text-2xl shadow-inner border-2 border-white uppercase">
                {obtenerIniciales(usuarioLogueado?.nombre)}
              </div>
              <h3 className="mt-4 text-base font-black text-slate-800 uppercase tracking-tight truncate px-2">{usuarioLogueado?.nombre || 'Soporte Técnico'}</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 mb-0 truncate px-2">{usuarioLogueado?.rol || 'Analista I.T.'}</p>
              <div className="w-full grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-3 text-left shadow-sm"><span className="text-[9px] font-bold text-slate-400 uppercase block">Nivel Acceso</span><span className="text-xs font-black text-blue-600 uppercase block mt-1 truncate">{usuarioLogueado?.rol === 'Administrador' ? 'ROOT' : 'OPERATOR'}</span></div>
                <div className="bg-slate-50 rounded-xl p-3 text-left shadow-sm"><span className="text-[9px] font-bold text-slate-400 uppercase block">Canal</span><span className="text-xs font-black text-emerald-600 uppercase block mt-1">Encriptado</span></div>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 text-slate-700/20 transition-transform duration-500 group-hover:scale-110">
              <Shield size={140} strokeWidth={0.6} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30 backdrop-blur-sm"><Lock size={15} /></div>
                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-300">Seguridad Perimetral</h5>
              </div>
              <div>
                <h4 className="text-lg font-black tracking-tight">Cifrado Remoto Activo</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">La sesión de auditoría está blindada de manera inmutable bajo la red interna de la corporación.</p>
              </div>
              <div className="pt-2 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500 uppercase tracking-wide">Firma del Servidor:</span>
                  <span className="text-emerald-400 font-bold tracking-wider">{usuarioLogueado?.rol === 'Administrador' ? 'SYS_ROOT_SIGNED' : 'SYS_AUTH_OPERATOR'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-xl p-5 space-y-4 transition-all hover:shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-linear-to-r from-indigo-500 to-purple-500 rounded-lg shadow-sm"><Cpu size={14} className="text-white" /></div>
              <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Estado de Infraestructura</h5>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2"><Server size={14} className="text-slate-500" /><span className="text-xs font-bold text-slate-700">Base de Datos</span></div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1"><CheckCircle2 size={10} /> Conectado</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2"><Cpu size={14} className="text-slate-500" /><span className="text-xs font-bold text-slate-700">Núcleo Operativo</span></div>
                <span className="text-[10px] font-mono font-bold bg-white px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 shadow-sm">v2.4.1-stable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MODALES ========== */}
      <ModalCategoria isOpen={modalCategoriaOpen} onClose={() => { setModalCategoriaOpen(false); setCategoriaAEditar(null); }} categoriaAEditar={categoriaAEditar} />
      <ModalMarca isOpen={modalMarcaOpen} onClose={() => { setModalMarcaOpen(false); setMarcaAEditar(null); }} marcaAEditar={marcaAEditar} />
      <ModalModelo isOpen={modalModeloOpen} onClose={() => { setModalModeloOpen(false); setModeloAEditar(null); }} modeloAEditar={modeloAEditar} />
      <ModalDepartamento isOpen={modalDepartamentoOpen} onClose={() => { setModalDepartamentoOpen(false); setDepartamentoAEditar(null); }} departamentoAEditar={departamentoAEditar} />
      <ModalPersonal isOpen={modalPersonalOpen} onClose={() => { setModalPersonalOpen(false); setPersonalAEditar(null); }} personalAEditar={personalAEditar} />
      <ModalPlataformaTest isOpen={modalPlataformaTestOpen} onClose={() => { setModalPlataformaTestOpen(false); setPlataformaAEditar(null); }} plataformaAEditar={plataformaAEditar} />
      <ModalDestino isOpen={modalDestinoOpen} onClose={() => { setModalDestinoOpen(false); setDestinoAEditar(null); }} destinoAEditar={destinoAEditar} />
      <ModalLicencia isOpen={modalLicenciaOpen} onClose={() => { setModalLicenciaOpen(false); setLicenciaAEditar(null); }} licenciaAEditar={licenciaAEditar} />
      <ModalDominio isOpen={modalDominioOpen} onClose={() => { setModalDominioOpen(false); setDominioAEditar(null); }} dominioAEditar={dominioAEditar} />
      <ModalInterfaz isOpen={modalInterfazOpen} onClose={() => { setModalInterfazOpen(false); setInterfazAEditar(null); }} interfazAEditar={interfazAEditar} />
      <ModalTipoDisco isOpen={modalTipoDiscoOpen} onClose={() => { setModalTipoDiscoOpen(false); setTipoDiscoAEditar(null); }} tipoDiscoAEditar={tipoDiscoAEditar} />
      <ModalConfigRaid isOpen={modalConfigRaidOpen} onClose={() => { setModalConfigRaidOpen(false); setConfigRaidAEditar(null); }} configRaidAEditar={configRaidAEditar} />
      <ModalEstado isOpen={modalEstadoOpen} onClose={() => { setModalEstadoOpen(false); setEstadoAEditar(null); }} estadoAEditar={estadoAEditar} />
      <ModalInterfazDisco isOpen={modalInterfazDiscoOpen} onClose={() => { setModalInterfazDiscoOpen(false); setInterfazDiscoAEditar(null); }} interfazDiscoAEditar={interfazDiscoAEditar} />
      <ModalTamanoDisco isOpen={modalTamanoDiscoOpen} onClose={() => { setModalTamanoDiscoOpen(false); setTamanoDiscoAEditar(null); }} tamanoDiscoAEditar={tamanoDiscoAEditar} />
    </div>
  );
};

export default Configuracion;
// src/components/modals/ModalActivo.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, ShieldCheck, Network, Cpu, Package, Plus, Trash2, HardDrive, Monitor, Server, Printer, BatteryCharging, AlertCircle, Minus, UserCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';
import api from '../../services/api';
import { validarMAC, validarIP } from '../../utils/validaciones';
import ModalMarcaRapida from './ModalMarcaRapida';
import ModalModeloRapido from './ModalModeloRapido';

const extraerNombre = (valor) => {
  if (!valor) return '';
  if (typeof valor === 'string') return valor;
  if (typeof valor === 'object' && valor !== null) {
    return valor.nombre || valor.name || '';
  }
  return String(valor);
};

const ModalActivo = ({ isOpen, onClose, onAgregarActivo, activoAEditar }) => {
  const {
    categorias = [],
    marcas = [],
    modelos = [],
    personal = [],
    departamentos = [],
    ubicaciones = [],
    licencias = [],
    dominios = [],
    interfaces = [],
    tiposDisco = [],
    configuracionesRaid = [],
    estados = [],
    interfacesDisco = [],
    tamanosDisco = [],
  } = useData();

  const [softwareNombres, setSoftwareNombres] = useState([]);
  const [errors, setErrors] = useState({});
  const [mostrarRaid, setMostrarRaid] = useState(false);
  const [modalMarcaRapidaOpen, setModalMarcaRapidaOpen] = useState(false);
  const [modalModeloRapidoOpen, setModalModeloRapidoOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cargandoCodigo, setCargandoCodigo] = useState(false);
  const [cargandoMarcas, setCargandoMarcas] = useState(false);

  const [etiqueta, setEtiqueta] = useState('');

  const [form, setForm] = useState({
    serial: '',
    nombre: '',
    modelo_id: '',
    estado_id: '',
    inac: 'No Declarado',
    categoria_id: '',
    departamento_id: '',
    responsable_id: '',
    ubicacion_id: '',
    marca_id: '',
    hardware: {
      tarjetaMadre: '',
      procesador: '',
      ram: '',
      discos: [{ tipoDisco: '', interfazDisco: '', tamano: '', capacidad: '', particiones: '' }],
      configRaid: '',
    },
    software: [],
    red: {
      nombre_red: '',
      dominio_id: '',
    },
    interfacesRed: [{ interfaz: '', mac: '', ips: '' }],
    observaciones: ''
  });

  const [modelosOpciones, setModelosOpciones] = useState([]);
  const [marcasFiltradas, setMarcasFiltradas] = useState([]);

  const fetchMarcasPorCategoria = async (categoriaId) => {
    if (!categoriaId) {
      setMarcasFiltradas([]);
      return;
    }
    setCargandoMarcas(true);
    try {
      const response = await api.get(`/marcas/por-categoria/${categoriaId}`);
      setMarcasFiltradas(response.data || []);
    } catch (error) {
      console.error('Error obteniendo marcas por categoría:', error);
      setMarcasFiltradas([]);
    } finally {
      setCargandoMarcas(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const fetchSoftwareNames = async () => {
        try {
          const res = await api.get('/software/nombres');
          setSoftwareNombres(res.data);
        } catch (error) {
          console.error('Error cargando nombres de software:', error);
        }
      };
      fetchSoftwareNames();
    }
  }, [isOpen]);

  const fetchSiguienteCodigo = async (categoriaId) => {
    if (!categoriaId) return;
    setCargandoCodigo(true);
    try {
      const response = await api.get(`/activos/siguiente-codigo?categoria_id=${categoriaId}`);
      if (response.data && response.data.codigo) {
        setEtiqueta(response.data.codigo);
      } else {
        setEtiqueta('');
      }
    } catch (error) {
      console.error('Error obteniendo siguiente código:', error);
      setEtiqueta('');
    } finally {
      setCargandoCodigo(false);
    }
  };

  useEffect(() => {
    if (!form.categoria_id) {
      setMarcasFiltradas([]);
      setEtiqueta('');
      return;
    }

    fetchMarcasPorCategoria(form.categoria_id);

    if (!activoAEditar) {
      fetchSiguienteCodigo(form.categoria_id);
    }
  }, [form.categoria_id, activoAEditar]);

  useEffect(() => {
    if (!form.marca_id) {
      setModelosOpciones([]);
      return;
    }

    const modelosDeMarca = modelos.filter(m =>
      String(m.marca_id || m.marca?.id) === String(form.marca_id)
    );
    
    setModelosOpciones(modelosDeMarca);

  }, [form.marca_id, modelos]);

  useEffect(() => {
    if (!isOpen) return;

    if (activoAEditar) {
      const catId = activoAEditar.categoria_id || activoAEditar.categoria?.id || '';
      const marId = activoAEditar.marca_id || activoAEditar.marca?.id || '';
      const modId = activoAEditar.modelo_id || activoAEditar.modelo?.id || '';

      let estadoId = activoAEditar.estado_id || null;
      if (!estadoId && activoAEditar.estado) {
        const estadoEncontrado = estados.find(e => e.nombre === activoAEditar.estado);
        if (estadoEncontrado) estadoId = estadoEncontrado.id;
      }

      if (activoAEditar.hardware?.config_raid_id) {
        setMostrarRaid(true);
      }

      const discosProcesados = activoAEditar.discos?.length > 0
        ? activoAEditar.discos.map(d => ({
            tipoDisco: extraerNombre(d.tipoDisco || d.tipo_disco),
            interfazDisco: extraerNombre(d.interfazDisco || d.interfaz_disco),
            tamano: d.tamano || '',
            capacidad: d.capacidad ? String(d.capacidad).replace(/\D/g, '') : '',
            particiones: d.particiones ? String(d.particiones).replace(/\D/g, '') : '',
          }))
        : [{ tipoDisco: '', interfazDisco: '', tamano: '', capacidad: '', particiones: '' }];

      const interfacesRedProcesadas = activoAEditar.interfaces_red?.length > 0
        ? activoAEditar.interfaces_red.map(ir => ({
            interfaz: extraerNombre(ir.interfaz),
            mac: ir.mac || '',
            ips: ir.ips || '',
          }))
        : [{ interfaz: '', mac: '', ips: '' }];

      const softwareProcesado = activoAEditar.software?.length > 0
        ? activoAEditar.software.map(s => {
            let fechaInstalacion = s.fecha_instalacion || '';
            if (fechaInstalacion) {
              try {
                const fecha = new Date(fechaInstalacion);
                if (!isNaN(fecha.getTime())) {
                  fechaInstalacion = fecha.toISOString().split('T')[0];
                }
              } catch (_) { }
            }
            return {
              nombre_software: s.nombre_software || '',
              licencia_key: s.licencia_key || '',
              fecha_instalacion: fechaInstalacion,
              observaciones: s.observaciones || '',
            };
          })
        : [];

      setEtiqueta(activoAEditar.codigo || activoAEditar.etiqueta || '');

      setForm({
        serial: activoAEditar.serial || '',
        nombre: activoAEditar.nombre || '',
        modelo_id: modId,
        estado_id: estadoId || '',
        inac: activoAEditar.inac || 'No Declarado',
        categoria_id: catId,
        marca_id: marId,
        departamento_id: activoAEditar.departamento_id || activoAEditar.departamento?.id || '',
        responsable_id: activoAEditar.responsable_id || activoAEditar.responsable?.id || '',
        ubicacion_id: activoAEditar.ubicacion_id || activoAEditar.ubicacion?.id || '',
        observaciones: activoAEditar.observaciones || '',
        hardware: {
          tarjetaMadre: activoAEditar.hardware?.tarjeta_madre || '',
          procesador: activoAEditar.hardware?.procesador || '',
          ram: activoAEditar.hardware?.ram || '',
          discos: discosProcesados,
          configRaid: activoAEditar.hardware?.config_raid || '',
        },
        software: softwareProcesado,
        red: {
          nombre_red: activoAEditar.red?.nombre_red || '',
          dominio_id: activoAEditar.red?.dominio_id || '',
        },
        interfacesRed: interfacesRedProcesadas,
      });

      if (catId) {
        fetchMarcasPorCategoria(catId);
      }

    } else {
      const estadoDefault = estados.find(e => e.nombre === 'Operativo');
      setEtiqueta('');
      setForm({
        serial: '',
        nombre: '', // <--- Vacío por defecto
        modelo_id: '',
        estado_id: estadoDefault?.id || '',
        inac: 'No Declarado',
        categoria_id: '',
        marca_id: '',
        hardware: {
          tarjetaMadre: '',
          procesador: '',
          ram: '',
          discos: [{ tipoDisco: '', interfazDisco: '', tamano: '', capacidad: '', particiones: '' }],
          configRaid: '',
        },
        software: [],
        red: {
          nombre_red: '',
          dominio_id: '',
        },
        interfacesRed: [{ interfaz: '', mac: '', ips: '' }],
      });
      setMostrarRaid(false);
      setMarcasFiltradas([]);
    }
    setErrors({});
  }, [isOpen, activoAEditar]);

  const handleMarcaCreada = (nuevaMarca) => {
    setForm(prev => ({ ...prev, marca_id: nuevaMarca.id, modelo_id: '' }));
  };

  const handleModeloCreado = (nuevoModelo) => {
    setModelosOpciones(prev => [...prev, nuevoModelo]);
    setForm(prev => ({ ...prev, modelo_id: nuevoModelo.id }));
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // ==========================================
  // LÓGICA DE ASIGNACIÓN (PERSONAL Y DEPARTAMENTO)
  // ==========================================

  // 1. Extraer nombre seguro del personal
  const getNombrePersonal = (p) => {
    if (!p) return 'Sin datos';
    return p.nombre_completo || p.Nombre_completo || p.nombres || p.nombre || 'Usuario sin nombre';
  };

  // 2. Filtrar personal según el departamento seleccionado
  const personalFiltrado = useMemo(() => {
    if (!form.departamento_id) return personal; // Si no hay departamento, muestra todos
    return personal.filter(p => String(p.departamento_id) === String(form.departamento_id));
  }, [personal, form.departamento_id]);

  const modulosActivos = useMemo(() => {
    const categoriaSeleccionada = categorias.find(c => String(c.id) === String(form.categoria_id));
    
    return categoriaSeleccionada?.modulos || {
      hardware: true,
      almacenamiento: true,
      red: true,
      software: true
    };
  }, [form.categoria_id, categorias]);

  // 3. Manejar cambio de Responsable (Auto-asigna el departamento)
  const handleResponsableChange = (e) => {
    const respId = e.target.value;
    
    setForm(prev => {
      const newState = { ...prev, responsable_id: respId };
      
      if (respId) {
        const persona = personal.find(p => String(p.id) === String(respId));
        if (persona && persona.departamento_id) {
          newState.departamento_id = persona.departamento_id;
        }
        
        const estadoAsignado = estados.find(est => est.nombre.toLowerCase() === 'asignado');
        if (estadoAsignado) {
          newState.estado_id = estadoAsignado.id;
        }
      } else {
        const estadoPorAsignar = estados.find(est => est.nombre.toLowerCase() === 'por asignar');
        if (estadoPorAsignar) {
          newState.estado_id = estadoPorAsignar.id;
        }
      }
      
      return newState;
    });
    
    if (errors.responsable_id) setErrors(prev => ({ ...prev, responsable_id: null }));
  };

  // 4. Manejar cambio de Departamento (Limpia al responsable si no pertenece)
  const handleDepartamentoChange = (e) => {
    const depId = e.target.value;
    
    setForm(prev => {
      const newState = { ...prev, departamento_id: depId };
      if (depId && prev.responsable_id) {
        const personaActual = personal.find(p => String(p.id) === String(prev.responsable_id));
        if (personaActual && String(personaActual.departamento_id) !== String(depId)) {
          newState.responsable_id = ''; // Se esfuma porque no pertenece a este departamento
        }
      }
      return newState;
    });

    if (errors.departamento_id) setErrors(prev => ({ ...prev, departamento_id: null }));
  };

  const handleHardwareChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, hardware: { ...prev.hardware, [name]: value } }));
  };

  const handleRedChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, red: { ...prev.red, [name]: value } }));
  };

  const handleSoftwareChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosSoftware = [...form.software];
    nuevosSoftware[index][name] = value;
    setForm(prev => ({ ...prev, software: nuevosSoftware }));
  };

  const agregarSoftware = () => {
    setForm(prev => ({
      ...prev,
      software: [...prev.software, { nombre_software: '', licencia_key: '', fecha_instalacion: '', observaciones: '' }],
    }));
  };

  const eliminarSoftware = (index) => {
    const nuevosSoftware = form.software.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, software: nuevosSoftware }));
  };

  const handleDiscoChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosDiscos = [...form.hardware.discos];
    nuevosDiscos[index][name] = value;
    setForm(prev => ({ ...prev, hardware: { ...prev.hardware, discos: nuevosDiscos } }));
  };

  const agregarFilaDisco = () => {
    setForm(prev => ({
      ...prev,
      hardware: { ...prev.hardware, discos: [...prev.hardware.discos, { tipoDisco: '', interfazDisco: '', tamano: '', capacidad: '', particiones: '' }] },
    }));
  };

  const eliminarFilaDisco = (index) => {
    if (form.hardware.discos.length === 1) return;
    const nuevosDiscos = form.hardware.discos.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, hardware: { ...prev.hardware, discos: nuevosDiscos } }));
  };

  const handleInterfazRedChange = (index, e) => {
    const { name, value } = e.target;
    const nuevasInterfaces = [...form.interfacesRed];
    nuevasInterfaces[index][name] = value;
    setForm(prev => ({ ...prev, interfacesRed: nuevasInterfaces }));
  };

  const agregarInterfazRed = () => {
    setForm(prev => ({
      ...prev,
      interfacesRed: [...prev.interfacesRed, { interfaz: '', mac: '', ips: '' }],
    }));
  };

  const eliminarInterfazRed = (index) => {
    if (form.interfacesRed.length === 1) return;
    const nuevasInterfaces = form.interfacesRed.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, interfacesRed: nuevasInterfaces }));
  };

  const handleMACChange = (index, value) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/gi, '').toUpperCase();
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 2 === 0) formatted += '-';
      formatted += cleaned[i];
    }
    const nuevasInterfaces = [...form.interfacesRed];
    nuevasInterfaces[index].mac = formatted;
    setForm(prev => ({ ...prev, interfacesRed: nuevasInterfaces }));
  };

  const handleIPChange = (index, value) => {
    let cleaned = value.replace(/[^0-9.]/g, '');
    if (cleaned.length > 15) cleaned = cleaned.substring(0, 15);
    const nuevasInterfaces = [...form.interfacesRed];
    nuevasInterfaces[index].ips = cleaned;
    setForm(prev => ({ ...prev, interfacesRed: nuevasInterfaces }));
  };

  const handleDominioChange = (e) => {
    setForm(prev => ({ ...prev, red: { ...prev.red, dominio_id: e.target.value } }));
  };

  const handleConfigRaidChange = (e) => {
    setForm(prev => ({ ...prev, hardware: { ...prev.hardware, configRaid: e.target.value } }));
  };

  const validarFormulario = () => {
    const errores = {};
    if (!etiqueta || !etiqueta.trim()) errores.etiqueta = "La etiqueta es obligatoria.";
    if (!form.serial || !form.serial.trim()) errores.serial = "El número de serie es obligatorio.";
    if (!form.categoria_id) errores.categoria_id = "Debe seleccionar una categoría.";
    if (!form.marca_id) errores.marca_id = "Debe seleccionar una marca.";
    setErrors(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validarFormulario()) {
      alert('Por favor complete todos los campos obligatorios.');
      setIsSubmitting(false);
      return;
    }

    try {
      let configRaidId = null;
      if (form.hardware.configRaid && form.hardware.configRaid.trim() !== '') {
        const raidExistente = configuracionesRaid.find(r => r.nombre.toLowerCase() === form.hardware.configRaid.trim().toLowerCase());
        if (raidExistente) configRaidId = raidExistente.id;
      }

      let dominioId = null;
      if (form.red.dominio_id && form.red.dominio_id !== '') {
        const dominioExistente = dominios.find(d => d.id === parseInt(form.red.dominio_id));
        if (dominioExistente) dominioId = dominioExistente.id;
      }

      const discosProcesados = form.hardware.discos
        .filter(disco => String(disco.tipoDisco || '').trim() || String(disco.interfazDisco || '').trim() || String(disco.tamano || '').trim() || String(disco.capacidad || '').trim() || String(disco.particiones || '').trim())
        .map(disco => {
          let tipoDiscoId = null;
          if (String(disco.tipoDisco || '').trim() !== '') {
            const tipo = tiposDisco.find(t => t.nombre.toLowerCase() === String(disco.tipoDisco).trim().toLowerCase());
            if (tipo) tipoDiscoId = tipo.id;
          }
          let interfazDiscoId = null;
          if (String(disco.interfazDisco || '').trim() !== '') {
            const interfaz = interfacesDisco.find(i => i.nombre.toLowerCase() === String(disco.interfazDisco).trim().toLowerCase());
            if (interfaz) interfazDiscoId = interfaz.id;
          }
          const capNum = String(disco.capacidad || '').trim();
          const partNum = String(disco.particiones || '').trim();
          return {
            tipo_disco_id: tipoDiscoId,
            interfaz_disco_id: interfazDiscoId,
            tamano: String(disco.tamano || ''),
            capacidad: capNum ? `${capNum} GB` : '',
            particiones: partNum ? (partNum === '1' ? '1 partición' : `${partNum} particiones`) : '',
          };
      });

      const softwareProcesado = form.software
        .filter(soft => String(soft.nombre_software || '').trim() || String(soft.licencia_key || '').trim())
        .map(soft => ({ ...soft, licencia_id: null }));

      const interfacesRedProcesadas = form.interfacesRed
        .filter(iface => String(iface.interfaz || '').trim() || String(iface.mac || '').trim() || String(iface.ips || '').trim())
        .map(iface => {
          let interfazId = null;
          if (String(iface.interfaz || '').trim() !== '') {
            const interfazExistente = interfaces.find(i => i.nombre.toLowerCase() === String(iface.interfaz).trim().toLowerCase());
            if (interfazExistente) interfazId = interfazExistente.id;
          }
          let ipsClean = iface.ips ? String(iface.ips).split(/[\n,]+/).map(ip => ip.trim()).filter(ip => ip !== '').join('\n') : '';
          return {
            interfaz_id: interfazId,
            mac: String(iface.mac || '').trim() || null,
            ips: ipsClean || null,
          };
      });

      const payload = {
        codigo: etiqueta.trim(),
        nombre: String(form.nombre || '').trim() || null,
        serial: form.serial.trim(),
        modelo_id: form.modelo_id ? parseInt(form.modelo_id) : null,
        estado_id: form.estado_id ? parseInt(form.estado_id) : null,
        inac: form.inac || 'No Declarado',
        categoria_id: form.categoria_id ? parseInt(form.categoria_id) : null,
        marca_id: form.marca_id ? parseInt(form.marca_id) : null,

        responsable_id: form.responsable_id ? parseInt(form.responsable_id) : null,
        departamento_id: form.departamento_id ? parseInt(form.departamento_id) : null,
        ubicacion_id: form.ubicacion_id ? parseInt(form.ubicacion_id) : null,
        observaciones: String(form.observaciones || '').trim() || null,

        fecha_ultimo_movimiento: null,
        hardware: {
          tarjetaMadre: String(form.hardware.tarjetaMadre || '').trim() || null,
          procesador: String(form.hardware.procesador || '').trim() || null,
          ram: String(form.hardware.ram || '').trim() || null,
          configRaid: String(form.hardware.configRaid || '').trim() || null,
          config_raid_id: configRaidId,
        },
        discos: discosProcesados,
        red: {
          nombre_red: String(form.red.nombre_red || '').trim() || null,
          dominio_id: dominioId,
        },
        interfaces_red: interfacesRedProcesadas,
        software: softwareProcesado,
      };

      await onAgregarActivo(payload);
      onClose();
    } catch (error) {
      console.error('Error al guardar el activo:', error);
      alert('Ocurrió un error al guardar el activo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const nombresDominios = dominios.map(d => d.nombre);
  const nombresInterfaces = interfaces.map(i => i.nombre);
  const nombresTiposDisco = tiposDisco.map(t => t.nombre);
  const nombresInterfacesDisco = interfacesDisco.map(i => i.nombre);
  const nombresTamanosDisco = tamanosDisco.map(t => t.nombre);
  const nombresConfigRaid = configuracionesRaid.map(r => r.nombre);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              <Package size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {activoAEditar ? 'Editar Activo' : 'Registrar Nuevo Activo'}
              </h2>
              <p className="text-xs text-slate-500">Complete los datos del equipo o componente</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-slate-50/30">
          {/* ===== SECCIÓN 1: IDENTIFICACIÓN Y CONTROL ===== */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-blue-700 border-b border-blue-100 pb-2">
              <Package size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wide">1. Identificación y Control</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Etiqueta (Código único) *</label>
                <input type="text" name="etiqueta" value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} maxLength={9} autoComplete="off" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 transition-all text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Número de Serie *</label>
                <input type="text" name="serial" value={form.serial} onChange={handleInputChange} autoComplete="off" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 transition-all text-sm" />
              </div>

              {/* ===== CAMPO DE NOMBRE AÑADIDO AQUÍ ===== */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre del Equipo (Opcional)</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleInputChange}
                  autoComplete="off"
                  placeholder="Ej: Servidor Principal de Contabilidad (Dejar en blanco para autogenerar)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 transition-all text-sm"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Si lo deja en blanco, el nombre se generará automáticamente usando la Categoría, Marca y Modelo.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Categoría *</label>
                <select name="categoria_id" value={form.categoria_id} onChange={(e) => setForm(prev => ({ ...prev, categoria_id: e.target.value, marca_id: '', modelo_id: '' }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 transition-all text-sm">
                  <option value="">Seleccione una categoría</option>
                  {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Marca *</label>
                <div className="flex gap-2">
                  <select name="marca_id" value={form.marca_id} onChange={(e) => setForm(prev => ({ ...prev, marca_id: e.target.value, modelo_id: '' }))} disabled={!form.categoria_id} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 text-sm flex-1">
                    <option value="">{form.categoria_id ? 'Seleccione una marca' : 'Seleccione categoría primero'}</option>
                    {marcasFiltradas.map(marca => <option key={marca.id} value={marca.id}>{marca.nombre}</option>)}
                  </select>
                  <button type="button" onClick={() => setModalMarcaRapidaOpen(true)} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 font-bold text-xs"><Plus size={14} /></button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Modelo</label>
                <div className="flex gap-2">
                  <select name="modelo_id" value={form.modelo_id} onChange={(e) => setForm(prev => ({ ...prev, modelo_id: e.target.value }))} disabled={!form.marca_id} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 text-sm flex-1">
                    <option value="">{form.marca_id ? 'Seleccione un modelo' : 'Seleccione marca primero'}</option>
                    {modelosOpciones.map(mod => <option key={mod.id} value={mod.id}>{mod.nombre}</option>)}
                  </select>
                  <button type="button" onClick={() => setModalModeloRapidoOpen(true)} disabled={!form.marca_id} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 font-bold text-xs disabled:opacity-50"><Plus size={14} /></button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Clasificación INAC</label>
                <select name="inac" value={form.inac} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 text-sm">
                  <option value="Declarado">Declarado</option>
                  <option value="No Declarado">No Declarado</option>
                </select>
              </div>
            </div>
          </div>
          {/* ===== SECCIÓN 2: ASIGNACIÓN Y UBICACIÓN ===== */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 border-b border-indigo-100 pb-2">
              <UserCheck size={18} /> 
              <h3 className="text-sm font-bold uppercase tracking-wide">2. Asignación y Ubicación</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Responsable</label>
                <select 
                  name="responsable_id" 
                  value={form.responsable_id} 
                  onChange={handleResponsableChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 transition-all text-sm"
                >
                  <option value="">Sin responsable específico</option>
                  {personalFiltrado.map(p => (
                    <option key={p.id} value={p.id}>
                      {getNombrePersonal(p)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Departamento</label>
                <select 
                  name="departamento_id" 
                  value={form.departamento_id} 
                  onChange={handleDepartamentoChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 transition-all text-sm"
                >
                  <option value="">Sin departamento</option>
                  {departamentos.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ubicación Física</label>
                <select 
                  name="ubicacion_id" 
                  value={form.ubicacion_id} 
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 transition-all text-sm"
                >
                  <option value="">Seleccione ubicación</option>
                  {ubicaciones.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Puede asignar un responsable específico, o dejarlo en blanco si es un equipo de uso común referenciado solo por su Ubicación (Ej: Lobby).</p>
          </div>

          {/* ===== SECCIÓN 3: ESPECIFICACIONES DE HARDWARE ===== */}
          {(modulosActivos.hardware || modulosActivos.almacenamiento) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-2 text-purple-700 border-b border-purple-100 pb-2">
                <Cpu size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wide">3. Especificaciones de Hardware</h3>
              </div>
              
              {modulosActivos.hardware && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tarjeta Madre</label>
                      <input type="text" name="tarjetaMadre" value={form.hardware.tarjetaMadre} onChange={handleHardwareChange} autoComplete="off" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Procesador</label>
                      <input type="text" name="procesador" value={form.hardware.procesador} onChange={handleHardwareChange} autoComplete="off" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Memoria RAM</label>
                      <input type="text" name="ram" value={form.hardware.ram} onChange={handleHardwareChange} autoComplete="off" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <button type="button" onClick={() => setMostrarRaid(!mostrarRaid)} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1">
                      {mostrarRaid ? <Minus size={14} /> : <Plus size={14} />} Configuración RAID
                    </button>
                    {mostrarRaid && (
                      <div className="mt-2 animate-fadeIn">
                        <label className="block text-xs font-bold text-slate-600 mb-1">Configuración RAID</label>
                        <input type="text" name="configRaid" value={form.hardware.configRaid} onChange={handleConfigRaidChange} list="raid-list" autoComplete="off" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                        <datalist id="raid-list">{nombresConfigRaid.map(nombre => <option key={nombre} value={nombre} />)}</datalist>
                      </div>
                    )}
                  </div>
                </>
              )}

              {modulosActivos.almacenamiento && (
                <div className={modulosActivos.hardware ? "border-t border-slate-100 pt-3" : ""}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-600">Unidades de Almacenamiento</label>
                    <button type="button" onClick={agregarFilaDisco} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg flex items-center gap-1"><Plus size={12} /> Añadir disco</button>
                  </div>
                  {form.hardware.discos.map((disco, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-2 bg-slate-50 p-2 rounded-lg">
                      <div className="sm:col-span-3">
                        <input type="text" name="tipoDisco" value={String(disco.tipoDisco || '')} onChange={(e) => handleDiscoChange(idx, e)} list={`tipos-disco-list-${idx}`} placeholder="Tipo..." className="w-full px-2 py-1 border border-slate-200 rounded text-xs" />
                        <datalist id={`tipos-disco-list-${idx}`}>{nombresTiposDisco.map(nombre => <option key={nombre} value={nombre} />)}</datalist>
                      </div>
                      <div className="sm:col-span-2">
                        <input type="text" name="interfazDisco" value={String(disco.interfazDisco || '')} onChange={(e) => handleDiscoChange(idx, e)} list={`interfaces-disco-list-${idx}`} placeholder="Interfaz..." className="w-full px-2 py-1 border border-slate-200 rounded text-xs" />
                        <datalist id={`interfaces-disco-list-${idx}`}>{nombresInterfacesDisco.map(nombre => <option key={nombre} value={nombre} />)}</datalist>
                      </div>
                      <div className="sm:col-span-2">
                        <input type="text" name="tamano" value={String(disco.tamano || '')} onChange={(e) => handleDiscoChange(idx, e)} list={`tamanos-list-${idx}`} placeholder="Tamaño" className="w-full px-2 py-1 border border-slate-200 rounded text-xs" />
                        <datalist id={`tamanos-list-${idx}`}>{nombresTamanosDisco.map(nombre => <option key={nombre} value={nombre} />)}</datalist>
                      </div>
                      <div className="sm:col-span-2">
                        <input type="number" min="0" name="capacidad" value={String(disco.capacidad || '')} onChange={(e) => handleDiscoChange(idx, e)} placeholder="Capacidad (GB)" className="w-full px-2 py-1 border border-slate-200 rounded text-xs" />
                      </div>
                      <div className="sm:col-span-2">
                        <input type="number" min="0" name="particiones" value={String(disco.particiones || '')} onChange={(e) => handleDiscoChange(idx, e)} placeholder="Particiones" className="w-full px-2 py-1 border border-slate-200 rounded text-xs" />
                      </div>
                      <div className="sm:col-span-1 text-center">
                        <button type="button" onClick={() => eliminarFilaDisco(idx)} disabled={form.hardware.discos.length === 1} className="text-rose-500 disabled:opacity-30"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== SECCIÓN 4: CONFIGURACIÓN DE RED ===== */}
          {modulosActivos.red && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-2 text-cyan-700 border-b border-cyan-100 pb-2">
                <Network size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wide">4. Configuración de Red</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Hostname</label>
                  <input type="text" name="nombre_red" value={String(form.red.nombre_red || '')} onChange={handleRedChange} autoComplete="off" placeholder="Ej: PC-001" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Dominio</label>
                  <select
                    name="dominio_id"
                    value={form.red.dominio_id || ''}
                    onChange={handleDominioChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-400"
                  >
                    <option value="">Seleccione un dominio...</option>
                    {dominios.map(dom => (
                      <option key={dom.id} value={dom.id}>
                        {dom.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="border-t border-cyan-100 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-600">Interfaces de Red</label>
                  <button type="button" onClick={agregarInterfazRed} className="text-xs bg-cyan-50 text-cyan-600 px-2 py-1 rounded-lg flex items-center gap-1"><Plus size={12} /> Añadir interfaz</button>
                </div>
                {form.interfacesRed.map((iface, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-2 bg-slate-50 p-2 rounded-lg">
                    <div className="sm:col-span-3">
                      <input type="text" name="interfaz" value={String(iface.interfaz || '')} onChange={(e) => handleInterfazRedChange(idx, e)} list={`interfaces-list-${idx}`} placeholder="Interfaz..." className="w-full px-2 py-1 border border-slate-200 rounded text-xs" />
                      <datalist id={`interfaces-list-${idx}`}>{nombresInterfaces.map(nombre => <option key={nombre} value={nombre} />)}</datalist>
                    </div>
                    <div className="sm:col-span-3">
                      <input type="text" value={String(iface.mac || '')} onChange={(e) => handleMACChange(idx, e.target.value)} placeholder="MAC" className="w-full px-2 py-1 border border-slate-200 rounded text-xs" maxLength={17} />
                    </div>
                    <div className="sm:col-span-5">
                      <textarea value={String(iface.ips || '')} onChange={(e) => handleIPChange(idx, e.target.value)} rows="1" placeholder="IP" className="w-full px-2 py-1 border border-slate-200 rounded text-xs resize-y" />
                    </div>
                    <div className="sm:col-span-1 text-center">
                      <button type="button" onClick={() => eliminarInterfazRed(idx)} disabled={form.interfacesRed.length === 1} className="text-rose-500 disabled:opacity-30"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SECCIÓN 5: SOFTWARE INSTALADO ===== */}
          {modulosActivos.software && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-700 border-b border-amber-100 pb-2">
                <ShieldCheck size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wide">5. Software Instalado</h3>
              </div>
              <button type="button" onClick={agregarSoftware} className="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus size={14} /> Añadir software</button>
              {form.software.map((soft, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-5">
                      <input type="text" name="nombre_software" value={String(soft.nombre_software || '')} onChange={(e) => handleSoftwareChange(idx, e)} list="software-list" placeholder="Nombre del software" className="w-full px-2 py-1 border border-slate-200 rounded text-sm" />
                    </div>
                    <div className="sm:col-span-4">
                      <input type="text" name="licencia_key" value={String(soft.licencia_key || '')} onChange={(e) => handleSoftwareChange(idx, e)} placeholder="Clave de licencia" className="w-full px-2 py-1 border border-slate-200 rounded text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <input type="date" name="fecha_instalacion" value={String(soft.fecha_instalacion || '')} onChange={(e) => handleSoftwareChange(idx, e)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" />
                    </div>
                    <div className="sm:col-span-1 text-center">
                      <button type="button" onClick={() => eliminarSoftware(idx)} className="text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <input type="text" name="observaciones" value={String(soft.observaciones || '')} onChange={(e) => handleSoftwareChange(idx, e)} placeholder="Observaciones" className="w-full px-2 py-1 border border-slate-200 rounded text-sm" />
                  </div>
                </div>
              ))}
              <datalist id="software-list">
                {softwareNombres.map(name => <option key={name} value={name} />)}
              </datalist>
            </div>
          )}

          {/* ===== SECCIÓN 6: OBSERVACIONES GENERALES ===== */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-slate-700 border-b border-slate-200 pb-2 mb-3">
              <AlertCircle size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wide">Observaciones Generales</h3>
            </div>
            <textarea 
              name="observaciones" 
              value={form.observaciones} 
              onChange={handleInputChange} 
              rows="3" 
              placeholder="Añada cualquier detalle, condición física o nota importante sobre este activo..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 transition-all text-sm resize-y" 
            />
          </div>
        </form>

        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancelar</button>
          <button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50">
            {isSubmitting ? 'Guardando...' : <><Save size={16} /> {activoAEditar ? 'Actualizar' : 'Registrar'}</>}
          </button>
        </div>
      </div>

      <ModalMarcaRapida isOpen={modalMarcaRapidaOpen} onClose={() => setModalMarcaRapidaOpen(false)} onMarcaCreada={handleMarcaCreada} />
      <ModalModeloRapido isOpen={modalModeloRapidoOpen} onClose={() => setModalModeloRapidoOpen(false)} marcaId={(() => { const marcaSeleccionada = marcasFiltradas.find(m => (m.nombre || '').toLowerCase() === (form.marca_nombre || '').trim().toLowerCase()); return marcaSeleccionada?.id || null; })()} onModeloCreado={handleModeloCreado} />
    </div>
  );
};

export default ModalActivo;
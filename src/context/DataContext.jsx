import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // ============================================================
  // ESTADOS GLOBALES
  // ============================================================
  const [activos, setActivos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [desincorporaciones, setDesincorporaciones] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [ordenesSalida, setOrdenesSalida] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [mantenimientosActivos, setMantenimientosActivos] = useState(() => {
    const saved = localStorage.getItem('transmandu_mantenimientos');
    return saved ? JSON.parse(saved) : {};
  });
  const [historialSemanas, setHistorialSemanas] = useState([]);
  const [usuarioLogueado, setUsuarioLogueado] = useState(() => {
    const sesionGuardada = localStorage.getItem('transmandu_sesion');
    return sesionGuardada ? JSON.parse(sesionGuardada) : null;
  });
  const [loading, setLoading] = useState(false);
  const [configuracion, setConfiguracion] = useState({});
  const [errorGlobal, setErrorGlobal] = useState(null);

  // Catálogos
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [plataformasTest, setPlataformasTest] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [licencias, setLicencias] = useState([]);
  const [dominios, setDominios] = useState([]);
  const [interfaces, setInterfaces] = useState([]);
  const [tiposDisco, setTiposDisco] = useState([]);
  const [configuracionesRaid, setConfiguracionesRaid] = useState([]);
  const [estados, setEstados] = useState([]);
  const [interfacesDisco, setInterfacesDisco] = useState([]);
  const [tamanosDisco, setTamanosDisco] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  // ============================================================
  // CONSUMIBLES Y MOVIMIENTOS
  // ============================================================
  const [consumibles, setConsumibles] = useState([]);
  const [categoriasConsumibles, setCategoriasConsumibles] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [consumiblesPagination, setConsumiblesPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const [movimientosPagination, setMovimientosPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // ============================================================
  // NUEVO: MODELOS DE CONSUMIBLES Y CARRITO
  // ============================================================
  const [modelosConsumibles, setModelosConsumibles] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // ============================================================
  // NUEVO: CARGA INICIAL COMPLETA
  // ============================================================
  const [cargaInicialCompleta, setCargaInicialCompleta] = useState(false);

  // ============================================================
  // CARGAR DATOS INICIALES
  // ============================================================
  useEffect(() => {
    const cargarDatos = async () => {
      if (usuarioLogueado && !cargaInicialCompleta) {
        setLoading(true);
        setErrorGlobal(null);
        try {
          await cargarDatosIniciales();
          await cargarConfiguracion();
          await cargarPermisosUsuario();
          
          //  Solo cargar usuarios y roles si el usuario es administrador
          if (usuarioLogueado?.rol === 'Administrador') {
            await cargarUsuarios();
            await cargarRoles();
          }
          
          await cargarModelos();
          await cargarModelosConsumibles();

          await cargarUbicaciones();
        } catch (error) {
          console.error(' Error cargando datos iniciales:', error);
          setErrorGlobal('No se pudieron cargar algunos datos. Verifique su conexión al servidor.');
        } finally {
          setLoading(false);
          setCargaInicialCompleta(true);
        }
      }
    };
    cargarDatos();
  }, [usuarioLogueado, cargaInicialCompleta]);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    setErrorGlobal(null);
    try {
      const [
        activosRes,
        asignacionesRes,
        cronogramasRes,
        tareasRes,
        desincorporacionesRes,
        proveedoresRes,
        ordenesRes,
        incidenciasRes,
        categoriasRes,
        marcasRes,
        departamentosRes,
        personalRes,
        plataformasTestRes,
        destinosRes,
        licenciasRes,
        dominiosRes,
        interfacesRes,
        tiposDiscoRes,
        configuracionesRaidRes,
        estadosRes,
        interfacesDiscoRes,
        tamanosDiscoRes,
        categoriasConsumiblesRes,
        consumiblesRes,
      ] = await Promise.all([
        api.get('/activos'),
        api.get('/asignaciones'),
        api.get('/cronogramas'),
        api.get('/tareas'),
        api.get('/desincorporaciones'),
        api.get('/proveedores'),
        api.get('/ordenes-salida'),
        api.get('/incidencias'),
        api.get('/categorias'),
        api.get('/marcas'),
        api.get('/departamentos'),
        api.get('/personal'),
        api.get('/plataformas-test'),
        api.get('/destinos'),
        api.get('/licencias'),
        api.get('/dominios'),
        api.get('/interfaces'),
        api.get('/tipos-disco'),
        api.get('/configuraciones-raid'),
        api.get('/estados'),
        api.get('/interfaces-disco'),
        api.get('/tamanos-disco'),
        api.get('/categorias-consumibles'),
        api.get('/consumibles'),
      ]);

      setActivos(activosRes.data);
      setAsignaciones(asignacionesRes.data);
      setCronogramas(cronogramasRes.data);
      setTareas(tareasRes.data);
      setDesincorporaciones(desincorporacionesRes.data);
      setProveedores(proveedoresRes.data);
      setOrdenesSalida(ordenesRes.data);
      setIncidencias(incidenciasRes.data);
      setCategorias(categoriasRes.data);
      setMarcas(marcasRes.data);
      setDepartamentos(departamentosRes.data);
      setPersonal(personalRes.data);
      setPlataformasTest(plataformasTestRes.data);
      setDestinos(destinosRes.data);
      setLicencias(licenciasRes.data);
      setDominios(dominiosRes.data);
      setInterfaces(interfacesRes.data);
      setTiposDisco(tiposDiscoRes.data);
      setConfiguracionesRaid(configuracionesRaidRes.data);
      setEstados(estadosRes.data);
      setInterfacesDisco(interfacesDiscoRes.data);
      setTamanosDisco(tamanosDiscoRes.data);
      setCategoriasConsumibles(categoriasConsumiblesRes.data);
      // Asegurar que consumibles sea un array
      setConsumibles(Array.isArray(consumiblesRes.data) ? consumiblesRes.data : []);
    } catch (error) {
      console.error(' Error cargando datos:', error);
      setErrorGlobal('No se pudieron cargar algunos datos. Verifique su conexión al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const cargarModelos = async () => {
    try {
      const response = await api.get('/modelos');
      setModelos(response.data);
    } catch (error) {
      console.error(' Error cargando modelos:', error);
    }
  };

  const cargarModelosConsumibles = async () => {
    try {
      const response = await api.get('/modelos-consumibles');
      setModelosConsumibles(response.data);
    } catch (error) {
      console.error(' Error cargando modelos de consumibles:', error);
    }
  };

  const cargarUbicaciones = async () => {
    try {
      const response = await api.get('/ubicaciones');
      setUbicaciones(response.data);
    } catch (error) {
      console.error('Error cargando ubicaciones:', error);
    }
  };

  const agregarUbicacion = async (ubicacion) => {
    try {
      const response = await api.post('/ubicaciones', ubicacion);
      setUbicaciones(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error agregando ubicación:', error);
      throw error;
    }
  };

  const actualizarUbicacion = async (id, ubicacionActualizada) => {
    try {
      const response = await api.put(`/ubicaciones/${id}`, ubicacionActualizada);
      setUbicaciones(prev => prev.map(u => (u.id === id ? response.data : u)));
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      throw error;
    }
  };

  const eliminarUbicacion = async (id) => {
    try {
      await api.delete(`/ubicaciones/${id}`);
      setUbicaciones(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error eliminando ubicación:', error);
      throw error;
    }
  };

  const cargarUsuarios = async () => {
    try {
      const response = await api.get('/users');
      setUsuarios(response.data);
    } catch (error) {
      console.error(' Error cargando usuarios:', error);
    }
  };

  const cargarRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error) {
      console.error(' Error cargando roles:', error);
    }
  };

  const cargarPermisosUsuario = async () => {
  try {
    const response = await api.get('/user/permissions');
    const permisos = response.data || [];
    setUserPermissions(permisos);
    return permisos;
  } catch (error) {
    console.error(' Error cargando permisos del usuario:', error);
    // Si falla, no rompemos la aplicación, simplemente dejamos array vacío
    setUserPermissions([]);
    return [];
  }
 };

  // Agregar esta función dentro del DataProvider
 const cargarMantenimientos = async () => {
  try {
    // Obtener todos los activos con su mantenimiento
    const response = await api.get('/activos');
    const activos = response.data;
    const mantenimientosMap = {};
    
    activos.forEach(activo => {
      // Buscar si el activo tiene un mantenimiento asociado en la BD
      // (Nota: esto dependerá de cómo estructuren los datos en el backend)
      // Si el activo tiene un campo 'mantenimiento' o similar
      if (activo.mantenimiento) {
        mantenimientosMap[activo.codigo || activo.id] = {
          ...activo.mantenimiento,
          // Asegurar que el estado se mantenga
          estado: activo.mantenimiento.estado || 'Programado',
        };
      }
    });
    
    setMantenimientosActivos(mantenimientosMap);
  } catch (error) {
    console.error('Error cargando mantenimientos:', error);
  }
};

  // ============================================================
  // AUTENTICACIÓN
  // ============================================================
  const iniciarSesion = async (correo, password) => {
  try {
    const response = await api.post('/login', { email: correo, password });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    const usuario = {
      id: user.id,
      nombre: user.name,
      correo: user.email,
      rol: user.rol,
      role_id: user.role_id,
      role: user.role,
    };
    localStorage.setItem('transmandu_sesion', JSON.stringify(usuario));
    setUsuarioLogueado(usuario);
    
    //  CARGAR PERMISOS DESPUÉS DEL LOGIN
    await cargarPermisosUsuario();
    
    return { exito: true };
  } catch (error) {
    const mensaje = error.response?.data?.message || 'Credenciales incorrectas';
    return { exito: false, mensaje };
  }
 };

  const cerrarSesion = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('transmandu_sesion');
      setUsuarioLogueado(null);
      setCargaInicialCompleta(false);
      // Limpiar todos los estados
      setActivos([]);
      setAsignaciones([]);
      setCronogramas([]);
      setTareas([]);
      setDesincorporaciones([]);
      setProveedores([]);
      setOrdenesSalida([]);
      setIncidencias([]);
      setCategorias([]);
      setMarcas([]);
      setModelos([]);
      setDepartamentos([]);
      setPersonal([]);
      setPlataformasTest([]);
      setDestinos([]);
      setLicencias([]);
      setDominios([]);
      setInterfaces([]);
      setTiposDisco([]);
      setConfiguracionesRaid([]);
      setEstados([]);
      setInterfacesDisco([]);
      setTamanosDisco([]);
      setUsuarios([]);
      setRoles([]);
      setConsumibles([]);
      setCategoriasConsumibles([]);
      setModelosConsumibles([]);
      setCarrito([]);
      setMovimientos([]);
    }
  };

  // ============================================================
  // CRUD ACTIVOS
  // ============================================================
  const agregarActivo = async (activoBackend) => {

    if (!activoBackend.codigo || !activoBackend.codigo.trim()) {
      throw new Error('El campo "codigo" es obligatorio y no puede estar vacío.');
    }

    const camposPrincipales = {
      codigo: activoBackend.codigo?.trim(),
      nombre: activoBackend.nombre,
      serial: activoBackend.serial?.trim(),
      modelo_id: activoBackend.modelo_id || null,
      estado_id: activoBackend.estado_id || null,
      inac: activoBackend.inac || 'No Declarado',
      categoria_id: activoBackend.categoria_id || null,
      marca_id: activoBackend.marca_id || null,
      responsable_id: activoBackend.responsable_id || null,
      departamento_id: activoBackend.departamento_id || null,
      ubicacion_id: activoBackend.ubicacion_id || null,
      fecha_ultimo_movimiento: activoBackend.fecha_ultimo_movimiento || null,
      observaciones: activoBackend.observaciones || null,
    };

    Object.keys(camposPrincipales).forEach(key => {
      if (camposPrincipales[key] === '' || camposPrincipales[key] === undefined) {
        camposPrincipales[key] = null;
      }
    });

    try {
      const response = await api.post('/activos', camposPrincipales);
      const nuevoActivo = response.data;
      const id = nuevoActivo.id;

      const relacionesPromises = [];

      if (activoBackend.hardware) {
        const hardwareData = {
          tarjeta_madre: activoBackend.hardware.tarjetaMadre || null,
          procesador: activoBackend.hardware.procesador || null,
          ram: activoBackend.hardware.ram || null,
          config_raid: activoBackend.hardware.configRaid || null,
          config_raid_id: activoBackend.hardware.config_raid_id || null,
        };
        Object.keys(hardwareData).forEach(key => {
          if (hardwareData[key] === '' || hardwareData[key] === undefined) {
            hardwareData[key] = null;
          }
        });
        relacionesPromises.push(api.put(`/activos/${id}/hardware`, hardwareData));
      }

      if (activoBackend.red) {
        const redData = {
          nombre_red: activoBackend.red.nombre_red || null,
          dominio_id: activoBackend.red.dominio_id || null,
        };
        Object.keys(redData).forEach(key => {
          if (redData[key] === '' || redData[key] === undefined) {
            redData[key] = null;
          }
        });
        relacionesPromises.push(api.put(`/activos/${id}/red`, redData));
      }

      if (activoBackend.discos && Array.isArray(activoBackend.discos)) {
        const discosFiltrados = activoBackend.discos.filter(d =>
          d.tipo_disco_id || d.interfaz_disco_id || (d.capacidad && d.capacidad.trim() !== '')
        );
        if (discosFiltrados.length > 0) {
          relacionesPromises.push(api.post(`/activos/${id}/discos`, { discos: discosFiltrados }));
        }
      }

      if (activoBackend.software && Array.isArray(activoBackend.software)) {
        const softwareFiltrado = activoBackend.software.filter(s =>
          s.nombre_software && s.nombre_software.trim() !== ''
        );
        if (softwareFiltrado.length > 0) {
          relacionesPromises.push(api.post(`/activos/${id}/software`, { software: softwareFiltrado }));
        }
      }

      if (activoBackend.interfaces_red && Array.isArray(activoBackend.interfaces_red)) {
        const interfacesFiltradas = activoBackend.interfaces_red.filter(i =>
          i.interfaz_id || (i.mac && i.mac.trim() !== '') || (i.ips && i.ips.trim() !== '')
        );
        if (interfacesFiltradas.length > 0) {
          relacionesPromises.push(api.post(`/activos/${id}/interfaces-red`, { interfaces_red: interfacesFiltradas }));
        }
      }

      if (relacionesPromises.length > 0) {
        await Promise.all(relacionesPromises);
      }

      const activoCompleto = await obtenerActivoCompleto(id);
      setActivos(prev => [activoCompleto, ...prev]);
      return activoCompleto;
    } catch (error) {
      console.error(' Error al agregar activo:', error.response?.data);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        const mensajes = Object.entries(errors)
          .map(([k, v]) => `• ${k}: ${v[0]}`)
          .join('\n');
        alert(` Error de validación:\n\n${mensajes}`);
      } else {
        alert(error.response?.data?.message || 'Error al guardar activo');
      }
      throw error;
    }
  };

  const actualizarActivo = async (codigo, datosActualizados) => {
    try {

      if (!datosActualizados.codigo || !datosActualizados.codigo.trim()) {
        throw new Error('El campo "codigo" es obligatorio y no puede estar vacío.');
      }

      let idParaRuta = codigo;
      const activoExistente = activos.find(a => a.codigo === codigo || String(a.id) === String(codigo));
      if (activoExistente && activoExistente.id) {
        idParaRuta = activoExistente.id;
      } else if (datosActualizados.id) {
        idParaRuta = datosActualizados.id;
      }

      const camposPrincipales = {
        codigo: datosActualizados.codigo?.trim(),
        nombre: datosActualizados.nombre,
        serial: datosActualizados.serial?.trim(),
        modelo_id: datosActualizados.modelo_id || null,
        estado_id: datosActualizados.estado_id || null,
        inac: datosActualizados.inac || 'No Declarado',
        categoria_id: datosActualizados.categoria_id || null,
        marca_id: datosActualizados.marca_id || null,
        responsable_id: datosActualizados.responsable_id || null,
        departamento_id: datosActualizados.departamento_id || null,
        ubicacion_id: datosActualizados.ubicacion_id || null,
        fecha_ultimo_movimiento: datosActualizados.fecha_ultimo_movimiento || null,
        observaciones: datosActualizados.observaciones || null,
      };

      Object.keys(camposPrincipales).forEach(key => {
        if (camposPrincipales[key] === '' || camposPrincipales[key] === undefined) {
          camposPrincipales[key] = null;
        }
      });

      await api.put(`/activos/${idParaRuta}`, camposPrincipales);

      const erroresRelaciones = [];

      if (datosActualizados.hardware) {
        try {
          const hardwareData = {
            tarjeta_madre: datosActualizados.hardware.tarjetaMadre || null,
            procesador: datosActualizados.hardware.procesador || null,
            ram: datosActualizados.hardware.ram || null,
            config_raid: datosActualizados.hardware.configRaid || null,
            config_raid_id: datosActualizados.hardware.config_raid_id || null,
          };
          Object.keys(hardwareData).forEach(key => {
            if (hardwareData[key] === '' || hardwareData[key] === undefined) {
              hardwareData[key] = null;
            }
          });
          await api.put(`/activos/${idParaRuta}/hardware`, hardwareData);
        } catch (error) {
          console.error(' [actualizarActivo] Error en hardware:', error.response?.data);
          erroresRelaciones.push('Hardware');
        }
      }

      if (datosActualizados.red) {
        try {
          const redData = {
            nombre_red: datosActualizados.red.nombre_red || null,
            dominio_id: datosActualizados.red.dominio_id || null,
          };
          Object.keys(redData).forEach(key => {
            if (redData[key] === '' || redData[key] === undefined) {
              redData[key] = null;
            }
          });
          await api.put(`/activos/${idParaRuta}/red`, redData);
        } catch (error) {
          console.error(' [actualizarActivo] Error en red:', error.response?.data);
          erroresRelaciones.push('Red');
        }
      }

      if (datosActualizados.discos && Array.isArray(datosActualizados.discos)) {
        try {
          const discosFiltrados = datosActualizados.discos.filter(d =>
            d.tipo_disco_id || d.interfaz_disco_id || (d.capacidad && d.capacidad.trim() !== '')
          );
          if (discosFiltrados.length > 0) {
            await api.post(`/activos/${idParaRuta}/discos`, { discos: discosFiltrados });
          }
        } catch (error) {
          console.error(' [actualizarActivo] Error en discos:', error.response?.data);
          erroresRelaciones.push('Discos');
        }
      }

      if (datosActualizados.software && Array.isArray(datosActualizados.software)) {
        try {
          const softwareFiltrado = datosActualizados.software.filter(s =>
            s.nombre_software && s.nombre_software.trim() !== ''
          );
          if (softwareFiltrado.length > 0) {
            await api.post(`/activos/${idParaRuta}/software`, { software: softwareFiltrado });
          }
        } catch (error) {
          console.error(' [actualizarActivo] Error en software:', error.response?.data);
          erroresRelaciones.push('Software');
        }
      }

      if (datosActualizados.interfaces_red && Array.isArray(datosActualizados.interfaces_red)) {
        try {
          const interfacesFiltradas = datosActualizados.interfaces_red.filter(i =>
            i.interfaz_id || (i.mac && i.mac.trim() !== '') || (i.ips && i.ips.trim() !== '')
          );
          if (interfacesFiltradas.length > 0)
            await api.post(`/activos/${idParaRuta}/interfaces-red`, { interfaces_red: interfacesFiltradas });
          
        } catch (error) {
          console.error(' [actualizarActivo] Error en interfaces de red:', error.response?.data);
          erroresRelaciones.push('InterfacesRed');
        }
      }

      if (erroresRelaciones.length > 0) {
        console.warn('️ [actualizarActivo] Algunas relaciones fallaron:', erroresRelaciones);
        alert(`️ Algunas relaciones no se guardaron correctamente: ${erroresRelaciones.join(', ')}. Revisa la consola para más detalles.`);
      }

      const activoCompleto = await obtenerActivoCompleto(idParaRuta);
      setActivos(prev =>
        prev.map(a => (a.id === idParaRuta || a.codigo === codigo ? activoCompleto : a))
      );

      return activoCompleto;
    } catch (error) {
      console.error(' [actualizarActivo] Error general:', error.response?.data);
      if (error.response?.status === 500) {
        alert(' Error interno del servidor al actualizar activo. Revisa relaciones (discos/interfaces).');
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        const mensajes = Object.entries(errors)
          .map(([k, v]) => `• ${k}: ${v[0]}`)
          .join('\n');
        alert(` Error de validación al actualizar:\n\n${mensajes}`);
      } else {
        alert(error.response?.data?.message || 'Error al actualizar activo');
      }
      throw error;
    }
  };

  const eliminarActivo = async (codigo) => {
    try {
      await api.delete(`/activos/${codigo}`);
      setActivos(prev => prev.filter(a => a.codigo !== codigo));
    } catch (error) {
      console.error('Error al eliminar activo:', error);
      alert('Error al eliminar el activo');
    }
  };

  const obtenerActivoCompleto = async (id) => {
    try {
      const response = await api.get(`/activos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo activo completo:', error);
      throw error;
    }
  };

  // ============================================================
  // CRUD ASIGNACIONES
  // ============================================================
  const agregarAsignacion = async (nuevaAsignacion, codigoActivo) => {
    try {
      const payload = {
        codigo: nuevaAsignacion.codigo,
        responsable_id: nuevaAsignacion.responsable_id,
        departamento_id: nuevaAsignacion.departamento_id,
        subdivision: nuevaAsignacion.subdivision || null,
        custodio: nuevaAsignacion.custodio || null,
        autorizado_por_id: nuevaAsignacion.autorizado_por_id || null,
        elaborado_por_id: nuevaAsignacion.elaborado_por_id || null,
        fecha_hora: nuevaAsignacion.fecha_hora,
        estado_acta: nuevaAsignacion.estado_acta || 'Pendiente por Firma',
        observaciones: nuevaAsignacion.observaciones || '',
        activos: nuevaAsignacion.activos || []
      };

      const response = await api.post('/asignaciones', payload);
      const asignacionGuardada = response.data;
      
      setAsignaciones(prev => [asignacionGuardada, ...prev]);

      //  1. ACTUALIZACIÓN OPTIMISTA: Forzamos a React a mostrar el responsable al instante
      const responsableSeleccionado = personal.find(p => String(p.id) === String(payload.responsable_id));
      const departamentoSeleccionado = departamentos.find(d => String(d.id) === String(payload.departamento_id));
      const estadoAsignado = estados.find(e => e.nombre === 'Asignado');

      setActivos(prevActivos => prevActivos.map(activo => {
        // Convertimos a string para evitar fallos si un ID es número y el otro texto
        const estaEnAsignacion = payload.activos.some(actId => String(actId) === String(activo.id));

        if (estaEnAsignacion) {
          return {
            ...activo,
            responsable_id: payload.responsable_id,
            responsable: responsableSeleccionado || activo.responsable, // <--- Aquí se inyecta la data visual
            departamento_id: payload.departamento_id,
            departamento: departamentoSeleccionado || activo.departamento,
            estado_id: estadoAsignado ? estadoAsignado.id : activo.estado_id,
            estado: estadoAsignado || activo.estado
          };
        }
        return activo;
      }));

      //  2. REFRESCO ESPECÍFICO: Traemos solo los activos de la BD en segundo plano sin bloquear la UI
      api.get('/activos').then(res => {
        setActivos(res.data);
      }).catch(err => console.error("Error recargando activos:", err));

      return asignacionGuardada;
    } catch (error) {
      console.error(' Error en agregarAsignacion:', error);
      throw error;
    }
  };

  // ============================================================
  // 2. CAMBIAR ESTADO DE ACTA
  // ============================================================
  const toggleEstadoActa = async (id) => {
    try {
      const asignacionActual = asignaciones.find(a => a.id === id);
      if (!asignacionActual) {
        alert('No se encontró la asignación.');
        return;
      }

      const nuevoEstado = asignacionActual.estado_acta === 'Firmada' 
        ? 'Pendiente por Firma' 
        : 'Firmada';

      const response = await api.put(`/asignaciones/${id}`, { 
        estado_acta: nuevoEstado 
      });

      setAsignaciones(prev => 
        prev.map(a => a.id === id ? { ...a, ...response.data } : a)
      );

      // (Firmar no cambia al responsable, así que solo refrescamos la asignación)
      return response.data;
    } catch (error) {
      console.error(' Error al cambiar estado:', error);
      if (error.response?.data?.errors) {
        const msg = Object.values(error.response.data.errors).flat().join('\n');
        alert('Error de validación:\n' + msg);
      } else {
        alert('Error al cambiar el estado. Revisa la consola.');
      }
      throw error;
    }
  };

  // ============================================================
  // 3. ANULAR ASIGNACIÓN
  // ============================================================
  const anularAsignacion = async (id) => {
    try {

      // Buscamos la asignación antes de borrarla para saber qué equipos hay que liberar
      const asignacionAAnular = asignaciones.find(a => a.id === id);

      const response = await api.delete(`/asignaciones/${id}`);
      
      if (response.status === 204 || response.status === 200) {
        if (response.data && response.data.estado_acta === 'Anulada') {
          setAsignaciones(prev => prev.map(a => a.id === id ? { ...a, ...response.data } : a));
        } else {
          setAsignaciones(prev => prev.filter(a => a.id !== id));
        }

        //  ACTUALIZACIÓN OPTIMISTA: Limpiamos al responsable de la vista de inmediato
        if (asignacionAAnular && asignacionAAnular.activos) {
          // Extraemos los IDs asegurándonos de que soporte arreglos de objetos o números
          const activosIds = asignacionAAnular.activos.map(act => String(act.id || act));
          const estadoOperativo = estados.find(e => e.nombre === 'Operativo');

          setActivos(prevActivos => prevActivos.map(activo => {
            if (activosIds.includes(String(activo.id))) {
              return {
                ...activo,
                responsable_id: null,
                responsable: null, // <--- Borramos al responsable visualmente
                departamento_id: null,
                departamento: null,
                estado_id: estadoOperativo ? estadoOperativo.id : activo.estado_id,
                estado: estadoOperativo || activo.estado
              };
            }
            return activo;
          }));
        }

        // Refresco silencioso de respaldo
        api.get('/activos').then(res => setActivos(res.data)).catch(console.error);

        return true;
      } else {
        throw new Error('Respuesta inesperada del servidor: ' + response.status);
      }
    } catch (error) {
      console.error(' Error al anular:', error);
      if (error.response?.data?.message) {
        alert('Error al anular: ' + error.response.data.message);
      } else {
        alert('Error al anular la asignación. Revisa la consola.');
      }
      throw error;
    }
  };

  // ============================================================
  // CRUD CRONOGRAMAS
  // ============================================================
  const agregarCronograma = async (nuevo) => {
  try {
    const response = await api.post('/cronogramas', nuevo);
    setCronogramas(prev => [response.data, ...prev]);
    return response.data;
  } catch (error) {
    console.error(' Error al agregar cronograma:', error);
    alert('Error al guardar el cronograma');
    throw error;
  }
};

const actualizarCronograma = async (id, datos) => {
  try {
    const response = await api.put(`/cronogramas/${id}`, datos);
    setCronogramas(prev => prev.map(c => (c.id === id ? response.data : c)));
    return response.data;
  } catch (error) {
    console.error(' Error al actualizar cronograma:', error);
    alert('Error al actualizar el cronograma');
    throw error;
  }
};

const eliminarCronograma = async (id) => {
  try {
    await api.delete(`/cronogramas/${id}`);
    setCronogramas(prev => prev.filter(c => c.id !== id));
  } catch (error) {
    console.error(' Error al eliminar cronograma:', error);
    alert('Error al eliminar el cronograma');
    throw error;
  }
};

const cambiarEstadoCronograma = async (id) => {
  try {
    const cron = cronogramas.find(c => c.id === id);
    let nuevoEstado = 'Programado';
    if (cron.estado === 'Programado') nuevoEstado = 'Pendiente';
    else if (cron.estado === 'Pendiente') nuevoEstado = 'Completado';
    const response = await api.put(`/cronogramas/${id}`, { estado: nuevoEstado });
    setCronogramas(prev => prev.map(c => (c.id === id ? response.data : c)));
    return response.data;
  } catch (error) {
    console.error(' Error al cambiar estado del cronograma:', error);
    alert('Error al cambiar estado');
    throw error;
  }
};

const cargarCronogramas = async () => {
  try {
    const response = await api.get('/cronogramas');
    setCronogramas(response.data);
    return response.data;
  } catch (error) {
    console.error(' Error cargando cronogramas:', error);
    throw error;
  }
};


  // ============================================================
  // CRUD TAREAS
  // ============================================================
  const agregarTarea = async (nuevo) => {
  try {
    const response = await api.post('/tareas', nuevo);
    setTareas(prev => [response.data, ...prev]);
    return response.data; // <-- Retorna la tarea creada
  } catch (error) {
    console.error('Error al agregar tarea:', error);
    alert('Error al guardar la tarea');
    throw error;
  }
};

  const eliminarTarea = async (id) => {
  try {
      await api.delete(`/tareas/${id}`);
      setTareas(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar la tarea.');
      throw error;
    }
};

  // ============================================================
  // CRUD PROVEEDORES
  // ============================================================
  const agregarProveedor = async (nuevo) => {
    try {
      const response = await api.post('/proveedores', nuevo);
      setProveedores(prev => [response.data, ...prev]);
    } catch (error) {
      console.error('Error al agregar proveedor:', error);
      alert('Error al guardar proveedor');
    }
  };

  const actualizarProveedor = async (codigo, datos) => {
    try {
      const response = await api.put(`/proveedores/${codigo}`, datos);
      setProveedores(prev => prev.map(p => (p.codigo === codigo ? response.data : p)));
    } catch (error) {
      console.error('Error actualizando proveedor:', error);
      alert('Error al actualizar el proveedor');
    }
  };

  const eliminarProveedor = async (codigo) => {
    try {
      await api.delete(`/proveedores/${codigo}`);
      setProveedores(prev => prev.filter(p => p.codigo !== codigo));
    } catch (error) {
      console.error('Error eliminando proveedor:', error);
      alert('Error al eliminar el proveedor');
      throw error;
    }
  };

  // ============================================================
  // CRUD ÓRDENES DE SALIDA
  // ============================================================
  const agregarOrdenSalida = async (nuevo) => {
  try {
    const response = await api.post('/ordenes-salida', nuevo);
    setOrdenesSalida(prev => [response.data, ...prev]);
    return response.data;
  } catch (error) {
    console.error(' Error al agregar orden de salida:', error);
    alert('Error al guardar orden');
    throw error;
  }
};

const actualizarOrdenSalida = async (id, datos) => {
  try {
    const response = await api.put(`/ordenes-salida/${id}`, datos);
    setOrdenesSalida(prev => prev.map(o => o.id === id ? response.data : o));
    return response.data;
  } catch (error) {
    console.error(' Error al actualizar orden de salida:', error);
    alert('Error al actualizar la orden');
    throw error;
  }
};

const cargarOrdenesSalida = async () => {
  try {
    const response = await api.get('/ordenes-salida');
    setOrdenesSalida(response.data);
    return response.data;
  } catch (error) {
    console.error(' Error al cargar órdenes de salida:', error);
    throw error;
  }
};

const cambiarEstadoOrdenSalida = async (id, nuevoEstado) => {
  try {
    const response = await api.put(`/ordenes-salida/${id}`, { estado: nuevoEstado });
    setOrdenesSalida(prev => prev.map(o => o.id === id ? response.data : o));
    return response.data;
  } catch (error) {
    console.error(' Error al cambiar estado de orden:', error);
    alert('Error al cambiar el estado');
    throw error;
  }
};

  // ============================================================
  // CRUD DESINCORPORACIONES
  // ============================================================
 const confirmarBajaDefinitiva = async (nuevaBaja) => {
  try {
    const payload = {
      codigo_acta: nuevaBaja.codigo_acta,
      activo: nuevaBaja.activo,
      codigo: nuevaBaja.codigo,
      motivo: nuevaBaja.motivo,
      informe: nuevaBaja.informe,
      autorizado_por_id: nuevaBaja.autorizado_por_id ?? null, //  permite null
      fecha_baja: nuevaBaja.fecha_baja,
      destino: nuevaBaja.destino,
      activos_incluidos: nuevaBaja.activos_incluidos || [],
      activos: nuevaBaja.activos || [],
    };

    const response = await api.post('/desincorporaciones', payload);
    setDesincorporaciones(prev => [response.data, ...prev]);
    return response.data;
  } catch (error) {
    console.error(' Error al registrar baja:', error);
    if (error.response?.data?.errors) {
      const msg = Object.values(error.response.data.errors).flat().join('\n');
      alert(' Errores de validación:\n' + msg);
    } else if (error.response?.data?.message) {
      alert(' ' + error.response.data.message);
    } else {
      alert(' Error al registrar desincorporación. Revisa la consola.');
    }
    throw error;
  }
};

const autorizarDesincorporacion = async (id, autorizadoPorId) => {
  try {
    const response = await api.put(`/desincorporaciones/${id}/autorizar`, {
      autorizado_por_id: autorizadoPorId
    });
    //  Actualizar el estado local con la respuesta
    setDesincorporaciones(prev => prev.map(d => d.id === id ? response.data : d));
    return response.data;
  } catch (error) {
    console.error(' Error al autorizar desincorporación:', error);
    if (error.response?.data?.message) {
      alert(' ' + error.response.data.message);
    } else {
      alert(' Error al autorizar la desincorporación. Revisa la consola.');
    }
    throw error;
  }
};
  // ============================================================
  // CRUD INCIDENCIAS
  // ============================================================
  const agregarIncidencia = async (nueva) => {
    try {
      const response = await api.post('/incidencias', nueva);
      setIncidencias(prev => [response.data, ...prev]);
    } catch (error) {
      console.error('Error al agregar incidencia:', error);
      alert('Error al reportar incidencia');
    }
  };

  // ============================================================
  // MANTENIMIENTOS DE ACTIVOS
  // ============================================================
  const asignarMantenimientoActivo = async (activoId, datos) => {
  try {
    const payload = {
      cronograma_id: datos.cronograma_id || null,
      frecuencia: datos.frecuencia || 'mensual',
      frecuencia_dias: datos.frecuenciaDias || 30,
      ultimo_mantenimiento: datos.ultimoMantenimiento || null,
      proximo_mantenimiento: datos.proximoMantenimiento || null,
      estado: datos.estado || 'Programado',
      observacion: datos.observacion || null,
    };

    const response = await api.post(`/activos/${activoId}/mantenimiento`, payload);
    const mantenimientoGuardado = response.data;

    // Actualizar el estado local con la respuesta del servidor
    setMantenimientosActivos(prev => ({
      ...prev,
      [activoId]: {
        ...prev[activoId],
        ...mantenimientoGuardado,
        activoId: activoId,
      }
    }));

    return mantenimientoGuardado;
  } catch (error) {
    console.error('Error al asignar mantenimiento:', error);
    throw error;
  }
};

const completarMantenimientoActivo = async (activoId, observacion) => {
  try {
    // Obtener el mantenimiento actual
    const mantenimientoActual = mantenimientosActivos[activoId];
    if (!mantenimientoActual) {
      throw new Error('No hay mantenimiento activo para este activo');
    }

    const hoy = new Date();
    const frecuenciaDias = mantenimientoActual.frecuencia_dias || 30;
    const proximaFecha = new Date(hoy);
    proximaFecha.setDate(proximaFecha.getDate() + frecuenciaDias);

    const payload = {
      cronograma_id: mantenimientoActual.cronograma_id || null,
      frecuencia: mantenimientoActual.frecuencia || 'mensual',
      frecuencia_dias: frecuenciaDias,
      ultimo_mantenimiento: hoy.toISOString(),
      proximo_mantenimiento: proximaFecha.toISOString(),
      estado: 'Programado',
      observacion: observacion,
    };

    const response = await api.post(`/activos/${activoId}/mantenimiento`, payload);
    const mantenimientoActualizado = response.data;

    // Actualizar estado local
    setMantenimientosActivos(prev => ({
      ...prev,
      [activoId]: {
        ...prev[activoId],
        ...mantenimientoActualizado,
        ultimoMantenimiento: hoy.toISOString(),
        proximoMantenimiento: proximaFecha.toISOString(),
        estado: 'Programado',
        ultimaObservacion: observacion,
        // Actualizar historial en el objeto local (opcional, pero útil para UI)
        historial: [
          ...(prev[activoId]?.historial || []),
          { fecha: hoy.toISOString(), observacion, proximo: proximaFecha.toISOString() }
        ]
      }
    }));

    return mantenimientoActualizado;
  } catch (error) {
    console.error('Error al completar mantenimiento:', error);
    throw error;
  }
};

const obtenerMantenimientoActivo = async (activoId) => {
  //  VALIDACIÓN AÑADIDA: Si no hay un ID válido, cancelamos la operación silenciosamente
  if (!activoId || activoId === 'undefined') {
    return null;
  }

  try {
    // Si ya tenemos el dato en el estado, podemos devolverlo directamente
    if (mantenimientosActivos[activoId]) {
      return mantenimientosActivos[activoId];
    }

    // Si no, lo obtenemos del backend
    const response = await api.get(`/activos/${activoId}/mantenimiento`);
    const data = response.data;

    if (data) {
      // Guardar en el estado local
      setMantenimientosActivos(prev => ({
        ...prev,
        [activoId]: {
          ...data,
          activoId: activoId,
        }
      }));
    }

    return data || null;
  } catch (error) {
    console.error('Error al obtener mantenimiento:', error);
    return null;
  }
};

  // ============================================================
  // CONFIGURACIÓN
  // ============================================================
  const cargarConfiguracion = async () => {
    try {
      const response = await api.get('/configuracion');
      setConfiguracion(response.data);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const actualizarConfiguracion = async (datos) => {
    try {
      const response = await api.put('/configuracion', datos);
      setConfiguracion(response.data);
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      throw error;
    }
  };

  // ============================================================
  // CRUD CATÁLOGOS
  // ============================================================
  const agregarCategoria = async (categoria) => {
    try {
      const response = await api.post('/categorias', categoria);
      setCategorias(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando categoría:', error);
      alert('Error al guardar la categoría');
      throw error;
    }
  };

  const actualizarCategoria = async (id, categoria) => {
    try {
      const response = await api.put(`/categorias/${id}`, categoria);
      setCategorias(prev => prev.map(c => c.id === id ? response.data : c));
      return response.data;
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      alert('Error al actualizar la categoría');
      throw error;
    }
  };

  const eliminarCategoria = async (id) => {
    try {
      await api.delete(`/categorias/${id}`);
      setCategorias(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert('Error al eliminar la categoría');
      throw error;
    }
  };

  const agregarMarca = async (marca) => {
    try {
      const response = await api.post('/marcas', marca);
      setMarcas(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando marca:', error);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      alert('Error al guardar la marca');
      throw error;
    }
  };

  const actualizarMarca = async (id, marca) => {
    try {
      const response = await api.put(`/marcas/${id}`, marca);
      setMarcas(prev => prev.map(m => m.id === id ? response.data : m));
      return response.data;
    } catch (error) {
      console.error('Error actualizando marca:', error);
      alert('Error al actualizar la marca');
      throw error;
    }
  };

  const eliminarMarca = async (id) => {
    try {
      await api.delete(`/marcas/${id}`);
      setMarcas(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error eliminando marca:', error);
      alert('Error al eliminar la marca');
      throw error;
    }
  };

  const agregarModelo = async (modelo) => {
    try {
      const response = await api.post('/modelos', modelo);
      setModelos(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando modelo:', error);
      alert('Error al guardar el modelo');
      throw error;
    }
  };

  const actualizarModelo = async (id, modelo) => {
    try {
      const response = await api.put(`/modelos/${id}`, modelo);
      setModelos(prev => prev.map(m => m.id === id ? response.data : m));
      return response.data;
    } catch (error) {
      console.error('Error actualizando modelo:', error);
      alert('Error al actualizar el modelo');
      throw error;
    }
  };

  const eliminarModelo = async (id) => {
    try {
      await api.delete(`/modelos/${id}`);
      setModelos(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error eliminando modelo:', error);
      alert('Error al eliminar el modelo');
      throw error;
    }
  };

  const agregarDepartamento = async (departamento) => {
    try {
      const response = await api.post('/departamentos', departamento);
      setDepartamentos(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error(' Error agregando departamento:', error.response?.data || error.message);
      alert('Error al guardar el departamento: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const actualizarDepartamento = async (id, departamento) => {
    try {
      const response = await api.put(`/departamentos/${id}`, departamento);
      setDepartamentos(prev => prev.map(d => d.id === id ? response.data : d));
      return response.data;
    } catch (error) {
      console.error('Error actualizando departamento:', error);
      alert('Error al actualizar el departamento');
      throw error;
    }
  };

  const eliminarDepartamento = async (id) => {
    try {
        await api.delete(`/departamentos/${id}`);
        setDepartamentos(prev => prev.filter(d => d.id !== id));
    } catch (error) {
        if (error.response && error.response.status === 422) {
            const mensaje = error.response.data?.message || 'No se puede eliminar el departamento porque tiene dependencias.';
            throw new Error(mensaje);
        }
        throw error;
    }
  };

  const agregarPersonal = async (persona) => {
    try {
      const response = await api.post('/personal', persona);
      setPersonal(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando personal:', error);
      alert('Error al guardar el personal');
      throw error;
    }
  };

  const actualizarPersonal = async (id, persona) => {
    try {
      const response = await api.put(`/personal/${id}`, persona);
      setPersonal(prev => prev.map(p => p.id === id ? response.data : p));
      return response.data;
    } catch (error) {
      console.error('Error actualizando personal:', error);
      alert('Error al actualizar el personal');
      throw error;
    }
  };

  const eliminarPersonal = async (id) => {
    try {
      await api.delete(`/personal/${id}`);
      setPersonal(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error eliminando personal:', error);
      alert('Error al eliminar el personal');
      throw error;
    }
  };

  const agregarPlataformaTest = async (plataforma) => {
    try {
      const response = await api.post('/plataformas-test', plataforma);
      setPlataformasTest(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando plataforma:', error);
      alert('Error al guardar la plataforma');
      throw error;
    }
  };

  const actualizarPlataformaTest = async (id, plataforma) => {
    try {
      const response = await api.put(`/plataformas-test/${id}`, plataforma);
      setPlataformasTest(prev => prev.map(p => p.id === id ? response.data : p));
      return response.data;
    } catch (error) {
      console.error('Error actualizando plataforma:', error);
      alert('Error al actualizar la plataforma');
      throw error;
    }
  };

  const eliminarPlataformaTest = async (id) => {
    try {
      await api.delete(`/plataformas-test/${id}`);
      setPlataformasTest(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error eliminando plataforma:', error);
      alert('Error al eliminar la plataforma');
      throw error;
    }
  };

  const agregarDestino = async (destino) => {
    try {
      const response = await api.post('/destinos', destino);
      setDestinos(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando destino:', error);
      alert('Error al guardar el destino');
      throw error;
    }
  };

  const actualizarDestino = async (id, destino) => {
    try {
      const response = await api.put(`/destinos/${id}`, destino);
      setDestinos(prev => prev.map(d => d.id === id ? response.data : d));
      return response.data;
    } catch (error) {
      console.error('Error actualizando destino:', error);
      alert('Error al actualizar el destino');
      throw error;
    }
  };

  const eliminarDestino = async (id) => {
    try {
      await api.delete(`/destinos/${id}`);
      setDestinos(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error eliminando destino:', error);
      alert('Error al eliminar el destino');
      throw error;
    }
  };

  const agregarLicencia = async (licencia) => {
    try {
      const response = await api.post('/licencias', licencia);
      setLicencias(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando licencia:', error);
      alert('Error al guardar la licencia');
      throw error;
    }
  };

  const actualizarLicencia = async (id, licencia) => {
    try {
      const response = await api.put(`/licencias/${id}`, licencia);
      setLicencias(prev => prev.map(l => l.id === id ? response.data : l));
      return response.data;
    } catch (error) {
      console.error('Error actualizando licencia:', error);
      alert('Error al actualizar la licencia');
      throw error;
    }
  };

  const eliminarLicencia = async (id) => {
    try {
      await api.delete(`/licencias/${id}`);
      setLicencias(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error eliminando licencia:', error);
      alert('Error al eliminar la licencia');
      throw error;
    }
  };

  const agregarDominio = async (dominio) => {
    try {
      const response = await api.post('/dominios', dominio);
      setDominios(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando dominio:', error);
      alert('Error al guardar el dominio');
      throw error;
    }
  };

  const actualizarDominio = async (id, dominio) => {
    try {
      const response = await api.put(`/dominios/${id}`, dominio);
      setDominios(prev => prev.map(d => d.id === id ? response.data : d));
      return response.data;
    } catch (error) {
      console.error('Error actualizando dominio:', error);
      alert('Error al actualizar el dominio');
      throw error;
    }
  };

  const eliminarDominio = async (id) => {
    try {
      await api.delete(`/dominios/${id}`);
      setDominios(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error eliminando dominio:', error);
      alert('Error al eliminar el dominio');
      throw error;
    }
  };

  const agregarInterfaz = async (interfaz) => {
    try {
      const response = await api.post('/interfaces', interfaz);
      setInterfaces(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando interfaz:', error);
      alert('Error al guardar la interfaz');
      throw error;
    }
  };

  const actualizarInterfaz = async (id, interfaz) => {
    try {
      const response = await api.put(`/interfaces/${id}`, interfaz);
      setInterfaces(prev => prev.map(i => i.id === id ? response.data : i));
      return response.data;
    } catch (error) {
      console.error('Error actualizando interfaz:', error);
      alert('Error al actualizar la interfaz');
      throw error;
    }
  };

  const eliminarInterfaz = async (id) => {
    try {
      await api.delete(`/interfaces/${id}`);
      setInterfaces(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error eliminando interfaz:', error);
      alert('Error al eliminar la interfaz');
      throw error;
    }
  };

  const agregarTipoDisco = async (tipoDisco) => {
    try {
      const response = await api.post('/tipos-disco', tipoDisco);
      setTiposDisco(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando tipo de disco:', error);
      alert('Error al guardar el tipo de disco');
      throw error;
    }
  };

  const actualizarTipoDisco = async (id, tipoDisco) => {
    try {
      const response = await api.put(`/tipos-disco/${id}`, tipoDisco);
      setTiposDisco(prev => prev.map(t => t.id === id ? response.data : t));
      return response.data;
    } catch (error) {
      console.error('Error actualizando tipo de disco:', error);
      alert('Error al actualizar el tipo de disco');
      throw error;
    }
  };

  const eliminarTipoDisco = async (id) => {
    try {
      await api.delete(`/tipos-disco/${id}`);
      setTiposDisco(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error eliminando tipo de disco:', error);
      alert('Error al eliminar el tipo de disco');
      throw error;
    }
  };

  const agregarConfiguracionRaid = async (configRaid) => {
    try {
      const response = await api.post('/configuraciones-raid', configRaid);
      setConfiguracionesRaid(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando configuración RAID:', error);
      alert('Error al guardar la configuración RAID');
      throw error;
    }
  };

  const actualizarConfiguracionRaid = async (id, configRaid) => {
    try {
      const response = await api.put(`/configuraciones-raid/${id}`, configRaid);
      setConfiguracionesRaid(prev => prev.map(c => c.id === id ? response.data : c));
      return response.data;
    } catch (error) {
      console.error('Error actualizando configuración RAID:', error);
      alert('Error al actualizar la configuración RAID');
      throw error;
    }
  };

  const eliminarConfiguracionRaid = async (id) => {
    try {
      await api.delete(`/configuraciones-raid/${id}`);
      setConfiguracionesRaid(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error eliminando configuración RAID:', error);
      alert('Error al eliminar la configuración RAID');
      throw error;
    }
  };

  const agregarEstado = async (estado) => {
    try {
      const response = await api.post('/estados', estado);
      setEstados(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando estado:', error);
      alert('Error al guardar el estado');
      throw error;
    }
  };

  const actualizarEstado = async (id, estado) => {
    try {
      const response = await api.put(`/estados/${id}`, estado);
      setEstados(prev => prev.map(e => e.id === id ? response.data : e));
      return response.data;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado');
      throw error;
    }
  };

  const eliminarEstado = async (id) => {
    try {
      await api.delete(`/estados/${id}`);
      setEstados(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error eliminando estado:', error);
      alert('Error al eliminar el estado');
      throw error;
    }
  };

  const agregarInterfazDisco = async (interfazDisco) => {
    try {
      const response = await api.post('/interfaces-disco', interfazDisco);
      setInterfacesDisco(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando interfaz de disco:', error);
      alert('Error al guardar la interfaz de disco');
      throw error;
    }
  };

  const actualizarInterfazDisco = async (id, interfazDisco) => {
    try {
      const response = await api.put(`/interfaces-disco/${id}`, interfazDisco);
      setInterfacesDisco(prev => prev.map(i => i.id === id ? response.data : i));
      return response.data;
    } catch (error) {
      console.error('Error actualizando interfaz de disco:', error);
      alert('Error al actualizar la interfaz de disco');
      throw error;
    }
  };

  const eliminarInterfazDisco = async (id) => {
    try {
      await api.delete(`/interfaces-disco/${id}`);
      setInterfacesDisco(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error eliminando interfaz de disco:', error);
      alert('Error al eliminar la interfaz de disco');
      throw error;
    }
  };

  const agregarTamanoDisco = async (tamanoDisco) => {
    try {
      const response = await api.post('/tamanos-disco', tamanoDisco);
      setTamanosDisco(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando tamaño de disco:', error);
      alert('Error al guardar el tamaño de disco');
      throw error;
    }
  };

  const actualizarTamanoDisco = async (id, tamanoDisco) => {
    try {
      const response = await api.put(`/tamanos-disco/${id}`, tamanoDisco);
      setTamanosDisco(prev => prev.map(t => t.id === id ? response.data : t));
      return response.data;
    } catch (error) {
      console.error('Error actualizando tamaño de disco:', error);
      alert('Error al actualizar el tamaño de disco');
      throw error;
    }
  };

  const eliminarTamanoDisco = async (id) => {
    try {
      await api.delete(`/tamanos-disco/${id}`);
      setTamanosDisco(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error eliminando tamaño de disco:', error);
      alert('Error al eliminar el tamaño de disco');
      throw error;
    }
  };

  // ============================================================
  // NUEVO: CRUD MODELOS DE CONSUMIBLES
  // ============================================================
  const agregarModeloConsumible = async (modelo) => {
    try {
      const response = await api.post('/modelos-consumibles', modelo);
      setModelosConsumibles(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando modelo de consumible:', error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        const mensajes = Object.entries(errors)
          .map(([k, v]) => `• ${k}: ${v[0]}`)
          .join('\n');
        alert(` Error de validación:\n${mensajes}`);
      } else {
        alert(error.response?.data?.message || 'Error al guardar el modelo');
      }
      throw error;
    }
  };

  const actualizarModeloConsumible = async (id, modelo) => {
    try {
      const response = await api.put(`/modelos-consumibles/${id}`, modelo);
      setModelosConsumibles(prev => prev.map(m => m.id === id ? response.data : m));
      return response.data;
    } catch (error) {
      console.error('Error actualizando modelo de consumible:', error);
      alert('Error al actualizar el modelo');
      throw error;
    }
  };

  const eliminarModeloConsumible = async (id) => {
    try {
      await api.delete(`/modelos-consumibles/${id}`);
      setModelosConsumibles(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error eliminando modelo de consumible:', error);
      alert('Error al eliminar el modelo');
      throw error;
    }
  };

  // ============================================================
  // CRUD USUARIOS Y ROLES
  // ============================================================
  const agregarUsuario = async (usuario) => {
    try {
      const response = await api.post('/users', usuario);
      setUsuarios(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando usuario:', error);
      alert('Error al guardar el usuario');
      throw error;
    }
  };

  const actualizarUsuario = async (id, usuario) => {
    try {
      const response = await api.put(`/users/${id}`, usuario);
      setUsuarios(prev => prev.map(u => u.id === id ? response.data : u));
      return response.data;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      alert('Error al actualizar el usuario');
      throw error;
    }
  };

  const eliminarUsuario = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsuarios(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar el usuario');
      throw error;
    }
  };

  const cambiarPasswordUsuario = async (id, passwordData) => {
    try {
      const response = await api.put(`/users/${id}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      alert('Error al cambiar la contraseña');
      throw error;
    }
  };

  const agregarRol = async (rol) => {
  try {
    const response = await api.post('/roles', rol);
    setRoles(prev => [...prev, response.data]);
    return response.data;
  } catch (error) {
    console.error('Error agregando rol:', error);
    alert('Error al guardar el rol');
    throw error;
  }
};

  const actualizarRol = async (id, rol) => {
    try {
      const response = await api.put(`/roles/${id}`, rol);
      setRoles(prev => prev.map(r => r.id === id ? response.data : r));
      return response.data;
    } catch (error) {
      console.error('Error actualizando rol:', error);
      alert('Error al actualizar el rol');
      throw error;
    }
  };

  const eliminarRol = async (id) => {
    try {
      await api.delete(`/roles/${id}`);
      setRoles(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error eliminando rol:', error);
      alert('Error al eliminar el rol');
      throw error;
    }
  };

  // ============================================================
  // PERFIL DEL USUARIO AUTENTICADO
  // ============================================================
  const obtenerPerfil = async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  };

  const actualizarPerfil = async (datos) => {
    try {
      const response = await api.put('/profile', datos);
      setUsuarioLogueado(prev => ({
        ...prev,
        nombre: datos.name || prev.nombre,
        correo: datos.email || prev.correo,
      }));
      const sesionActualizada = {
        ...usuarioLogueado,
        nombre: datos.name || usuarioLogueado.nombre,
        correo: datos.email || usuarioLogueado.correo,
      };
      localStorage.setItem('transmandu_sesion', JSON.stringify(sesionActualizada));
      return response.data;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      alert('Error al actualizar el perfil');
      throw error;
    }
  };

  const cambiarPasswordPerfil = async (passwordData) => {
    try {
      const response = await api.put('/profile/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error cambiando contraseña del perfil:', error);
      alert('Error al cambiar la contraseña');
      throw error;
    }
  };

  // ============================================================
  // CRUD CONSUMIBLES Y MOVIMIENTOS (CORREGIDO)
  // ============================================================
  const cargarConsumibles = async (page = 1, filtros = {}) => {
    try {
      // Iniciamos los parámetros con la página actual
      const params = new URLSearchParams({ page });

      if (filtros.search) params.append('search', filtros.search);
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      if (filtros.modelo) params.append('modelo', filtros.modelo);

      const response = await api.get(`/consumibles?${params.toString()}`);
      
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setConsumibles(data);
      
      setConsumiblesPagination({
        current_page: response.data?.current_page || 1,
        last_page: response.data?.last_page || 1,
        per_page: response.data?.per_page || 15,
        total: response.data?.total || 0,
        from: response.data?.from || null,
        to: response.data?.to || null,
      });
      return response.data;
    } catch (error) {
      console.error('Error cargando consumibles:', error);
      alert('Error al cargar los consumibles');
      throw error;
    }
  };

  const cargarCategoriasConsumibles = async () => {
    try {
      const response = await api.get('/categorias-consumibles');
      setCategoriasConsumibles(response.data);
    } catch (error) {
      console.error('Error cargando categorías de consumibles:', error);
    }
  };

  const agregarConsumible = async (consumible) => {
    try {
      const response = await api.post('/consumibles', consumible);
      const nuevoConsumible = response.data;
      setConsumibles(prev => {
        if (!Array.isArray(prev)) return [nuevoConsumible];
        return [nuevoConsumible, ...prev];
      });
      await cargarConsumibles(1);
      return nuevoConsumible;
    } catch (error) {
      console.error('Error agregando consumible:', error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        const mensajes = Object.entries(errors)
          .map(([k, v]) => `• ${k}: ${v[0]}`)
          .join('\n');
        alert(` Error de validación:\n\n${mensajes}`);
      } else {
        alert(error.response?.data?.message || 'Error al guardar consumible');
      }
      throw error;
    }
  };

  const actualizarConsumible = async (id, datos) => {
    try {
      const response = await api.put(`/consumibles/${id}`, datos);
      const consumibleActualizado = response.data;
      setConsumibles(prev => {
        if (!Array.isArray(prev)) return [consumibleActualizado];
        return prev.map(c => c.id === id ? consumibleActualizado : c);
      });
      await cargarConsumibles(consumiblesPagination.current_page);
      return consumibleActualizado;
    } catch (error) {
      console.error('Error actualizando consumible:', error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        const mensajes = Object.entries(errors)
          .map(([k, v]) => `• ${k}: ${v[0]}`)
          .join('\n');
        alert(` Error de validación:\n\n${mensajes}`);
      } else {
        alert(error.response?.data?.message || 'Error al actualizar consumible');
      }
      throw error;
    }
  };

  const eliminarConsumible = async (id) => {
    try {
      await api.delete(`/consumibles/${id}`);
      setConsumibles(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.filter(c => c.id !== id);
      });
      await cargarConsumibles(consumiblesPagination.current_page);
    } catch (error) {
      console.error('Error eliminando consumible:', error);
      alert('Error al eliminar consumible');
      throw error;
    }
  };

  const agregarCategoriaConsumible = async (categoria) => {
    try {
      const response = await api.post('/categorias-consumibles', categoria);
      setCategoriasConsumibles(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error agregando categoría de consumible:', error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        const mensajes = Object.entries(errors)
          .map(([k, v]) => `• ${k}: ${v[0]}`)
          .join('\n');
        alert(` Error de validación:\n\n${mensajes}`);
      } else {
        alert(error.response?.data?.message || 'Error al guardar categoría');
      }
      throw error;
    }
  };

  const actualizarCategoriaConsumible = async (id, datos) => {
    try {
      const response = await api.put(`/categorias-consumibles/${id}`, datos);
      setCategoriasConsumibles(prev => prev.map(c => c.id === id ? response.data : c));
      return response.data;
    } catch (error) {
      console.error('Error actualizando categoría de consumible:', error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        const mensajes = Object.entries(errors)
          .map(([k, v]) => `• ${k}: ${v[0]}`)
          .join('\n');
        alert(` Error de validación:\n\n${mensajes}`);
      } else {
        alert(error.response?.data?.message || 'Error al actualizar categoría');
      }
      throw error;
    }
  };

  const eliminarCategoriaConsumible = async (id) => {
    try {
      await api.delete(`/categorias-consumibles/${id}`);
      setCategoriasConsumibles(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error eliminando categoría de consumible:', error);
      alert('Error al eliminar categoría');
      throw error;
    }
  };

  // ============================================================
  // FUNCIONES DEL CARRITO
  // ============================================================
  const agregarAlCarrito = (item) => {
  const cantidad = item.cantidad || 1;
  setCarrito(prev => {
    const existente = prev.find(i => i.id === item.id && i.color === item.color);
    if (existente) {
      return prev.map(i =>
        i.id === item.id && i.color === item.color
          ? { ...i, cantidad: i.cantidad + cantidad }
          : i
      );
    }
    return [...prev, { ...item, cantidad }];
  });
};

const eliminarDelCarrito = (id, color = null) => {
  setCarrito(prev => {
    const existente = prev.find(item => item.id === id && item.color === color);
    if (!existente) return prev;

    if (existente.cantidad > 1) {
      devolverStock(id, color, 1);
      return prev.map(item =>
        item.id === id && item.color === color
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      );
    }

    devolverStock(id, color, 1);
    return prev.filter(item => !(item.id === id && item.color === color));
  });
};

//  CORREGIDO: forzar números para evitar concatenación de strings
const devolverStock = (id, color, cantidad) => {
  const consumible = consumibles.find(c => c.id === id);
  if (!consumible) return;

  const cantidadNum = Number(cantidad);

  if (color) {
    const coloresActualizados = consumible.colores.map(c => {
      if (c.color === color) {
        const nuevaCantidad = Number(c.cantidad || 0) + cantidadNum;
        return { ...c, cantidad: nuevaCantidad };
      }
      return c;
    });
    actualizarConsumible(id, { colores: coloresActualizados });
  } else {
    const nuevaCantidad = Number(consumible.cantidad || 0) + cantidadNum;
    actualizarConsumible(id, { cantidad: nuevaCantidad });
  }
};

//  CORREGIDO: forzar números al descontar stock
const incrementarCarrito = (item) => {
  const consumible = consumibles.find(c => c.id === item.id);
  if (!consumible) return;

  let stockDisponible = 0;
  if (item.color) {
    const colorItem = consumible.colores?.find(c => c.color === item.color);
    stockDisponible = colorItem ? Number(colorItem.cantidad) : 0;
  } else {
    stockDisponible = Number(consumible.cantidad || 0);
  }

  if (stockDisponible <= 0) {
    alert('No hay suficiente stock disponible para agregar más.');
    return;
  }

  // Descontar del stock
  if (item.color) {
    const coloresActualizados = consumible.colores.map(c => {
      if (c.color === item.color) {
        const nuevaCantidad = Number(c.cantidad || 0) - 1;
        return { ...c, cantidad: nuevaCantidad };
      }
      return c;
    });
    actualizarConsumible(item.id, { colores: coloresActualizados });
  } else {
    const nuevaCantidad = Number(consumible.cantidad || 0) - 1;
    actualizarConsumible(item.id, { cantidad: nuevaCantidad });
  }

  // Agregar al carrito
  setCarrito(prev => {
    const existente = prev.find(i => i.id === item.id && i.color === item.color);
    if (existente) {
      return prev.map(i =>
        i.id === item.id && i.color === item.color
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      );
    }
    return [...prev, { ...item, cantidad: 1 }];
  });
};

//  CORREGIDO: forzar números al devolver stock
const decrementarCarrito = (item) => {
  setCarrito(prev => {
    const existente = prev.find(i => i.id === item.id && i.color === item.color);
    if (!existente) return prev;

    // Devolver 1 al stock
    const consumible = consumibles.find(c => c.id === item.id);
    if (consumible) {
      if (item.color) {
        const coloresActualizados = consumible.colores.map(c => {
          if (c.color === item.color) {
            const nuevaCantidad = Number(c.cantidad || 0) + 1;
            return { ...c, cantidad: nuevaCantidad };
          }
          return c;
        });
        actualizarConsumible(item.id, { colores: coloresActualizados });
      } else {
        const nuevaCantidad = Number(consumible.cantidad || 0) + 1;
        actualizarConsumible(item.id, { cantidad: nuevaCantidad });
      }
    }

    // Quitar del carrito
    if (existente.cantidad > 1) {
      return prev.map(i =>
        i.id === item.id && i.color === item.color
          ? { ...i, cantidad: i.cantidad - 1 }
          : i
      );
    }
    return prev.filter(i => !(i.id === item.id && i.color === item.color));
  });
};

const vaciarCarrito = () => {
  setCarrito([]);
};

const toggleCarrito = () => {
  setCarritoAbierto(prev => !prev);
};

const totalCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);

// ============================================================
// MOVIMIENTOS DE CONSUMIBLES
// ============================================================

const cargarMovimientos = async (filtros = {}, page = 1) => {
  try {
    const params = new URLSearchParams({ ...filtros, page });
    const response = await api.get(`/movimientos-consumibles?${params.toString()}`);
    setMovimientos(response.data.data);
    setMovimientosPagination({
      current_page: response.data.current_page,
      last_page: response.data.last_page,
      per_page: response.data.per_page,
      total: response.data.total,
      from: response.data.from,
      to: response.data.to,
    });
    return response.data;
  } catch (error) {
    console.error('Error cargando movimientos:', error);
    alert('Error al cargar los movimientos');
    throw error;
  }
};

const registrarSalidaCarrito = async (items, motivo = '') => {
  try {
    const payload = {
      items: items.map(item => ({
        id: item.id,
        cantidad: item.cantidad,
        color: item.color || null
      })),
      motivo: motivo || 'Salida por carrito'
    };
    const response = await api.post('/consumibles/salida', payload);
    await cargarConsumibles(consumiblesPagination.current_page);
    setCarrito([]);
    await cargarMovimientos({}, movimientosPagination.current_page);
    return response.data;
  } catch (error) {
    console.error('Error registrando salida:', error);
    if (error.response?.status === 422) {
      const errors = error.response.data.errors || {};
      const mensajes = Object.entries(errors)
        .map(([k, v]) => `• ${k}: ${v[0]}`)
        .join('\n');
      alert(` Error de validación:\n\n${mensajes}`);
    } else {
      alert(error.response?.data?.message || 'Error al registrar la salida');
    }
    throw error;
  }
};

  // ============================================================
  // VALOR DEL CONTEXTO
  // ============================================================
  const value = {
    // Estados existentes
    activos,
    asignaciones,
    cronogramas,
    tareas,
    desincorporaciones,
    proveedores,
    incidencias,
    mantenimientosActivos,
    usuarioLogueado,
    historialSemanas,
    setHistorialSemanas,
    configuracion,
    loading,
    errorGlobal,
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
    usuarios,
    roles,
    userPermissions,
    cargarPermisosUsuario,

    // Consumibles y movimientos
    consumibles,
    categoriasConsumibles,
    movimientos,
    consumiblesPagination,
    movimientosPagination,

    // NUEVOS: Modelos de consumibles
    modelosConsumibles,
    agregarModeloConsumible,
    actualizarModeloConsumible,
    eliminarModeloConsumible,
    cargarModelosConsumibles,

    // NUEVOS: Carrito con toggle
    carritoAbierto,
    toggleCarrito,

    // NUEVO: carga inicial completa
    cargaInicialCompleta,

    // Autenticación
    iniciarSesion,
    cerrarSesion,

    // CRUD Activos
    agregarActivo,
    actualizarActivo,
    eliminarActivo,
    obtenerActivoCompleto,

    // CRUD Asignaciones
    agregarAsignacion,
    toggleEstadoActa,
    anularAsignacion,

    // CRUD Cronogramas
      agregarCronograma,
      actualizarCronograma,
      eliminarCronograma,
      cambiarEstadoCronograma,
      cargarCronogramas,

    // CRUD Tareas
    agregarTarea,
    eliminarTarea,

    // CRUD Proveedores
    agregarProveedor,
    actualizarProveedor,
    eliminarProveedor,

    // CRUD Órdenes de Salida
    ordenesSalida,
    setOrdenesSalida,
    agregarOrdenSalida,
    actualizarOrdenSalida,
    cargarOrdenesSalida,
    cambiarEstadoOrdenSalida,

    // CRUD Desincorporaciones
    confirmarBajaDefinitiva,
    autorizarDesincorporacion,

    // CRUD Incidencias
    agregarIncidencia,

    // Mantenimientos
    asignarMantenimientoActivo,
    completarMantenimientoActivo,
    obtenerMantenimientoActivo,

    // Configuración
    cargarConfiguracion,
    actualizarConfiguracion,

    // Catálogos existentes
    agregarCategoria,
    actualizarCategoria,
    eliminarCategoria,
    agregarMarca,
    actualizarMarca,
    eliminarMarca,
    agregarModelo,
    actualizarModelo,
    eliminarModelo,
    agregarDepartamento,
    actualizarDepartamento,
    eliminarDepartamento,
    cargarDatosIniciales, 
    agregarPersonal,
    actualizarPersonal,
    eliminarPersonal,
    agregarPlataformaTest,
    actualizarPlataformaTest,
    eliminarPlataformaTest,
    agregarDestino,
    actualizarDestino,
    eliminarDestino,
    agregarLicencia,
    actualizarLicencia,
    eliminarLicencia,
    agregarDominio,
    actualizarDominio,
    eliminarDominio,
    agregarInterfaz,
    actualizarInterfaz,
    eliminarInterfaz,
    agregarTipoDisco,
    actualizarTipoDisco,
    eliminarTipoDisco,
    agregarConfiguracionRaid,
    actualizarConfiguracionRaid,
    eliminarConfiguracionRaid,
    agregarEstado,
    actualizarEstado,
    eliminarEstado,
    agregarInterfazDisco,
    actualizarInterfazDisco,
    eliminarInterfazDisco,
    agregarTamanoDisco,
    actualizarTamanoDisco,
    eliminarTamanoDisco,

    // Usuarios y Roles
    cargarUsuarios,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    cambiarPasswordUsuario,
    cargarRoles,
    agregarRol,
    actualizarRol,
    eliminarRol,

    // Perfil
    obtenerPerfil,
    actualizarPerfil,
    cambiarPasswordPerfil,

    // Modelos
    cargarModelos,

    // Consumibles
    cargarConsumibles,
    cargarCategoriasConsumibles,
    agregarConsumible,
    actualizarConsumible,
    eliminarConsumible,
    agregarCategoriaConsumible,
    actualizarCategoriaConsumible,
    eliminarCategoriaConsumible,

    // Carrito
    carrito,
    totalCarrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    incrementarCarrito,
    decrementarCarrito,
    vaciarCarrito,

    // Movimientos
    cargarMovimientos,
    registrarSalidaCarrito,

    // Ubicaciones
    ubicaciones,
    cargarUbicaciones,
    agregarUbicacion,
    actualizarUbicacion,
    eliminarUbicacion
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
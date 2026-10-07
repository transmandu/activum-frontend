// src/pages/Inventario.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Package, Search, Filter, Plus, ShoppingCart, Download,
  Edit2, Trash2, Minus, CheckCircle, XCircle, AlertCircle,
  ChevronDown, ChevronUp, History, X
} from 'lucide-react';
import { useData } from '../context/DataContext';
import ModalConsumible from '../components/modals/ModalConsumible';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLOR_HEX_MAP = {
  'Negro': '#000000',
  'Blanco': '#FFFFFF',
  'Rojo': '#FF0000',
  'Azul': '#0000FF',
  'Verde': '#00FF00',
  'Amarillo': '#FFFF00',
  'Naranja': '#FFA500',
  'Morado': '#800080',
  'Rosa': '#FFC0CB',
  'Gris': '#808080',
  'Cian': '#00FFFF',
  'Magenta': '#FF00FF',
  'Marrón': '#A52A2A',
  'Plateado': '#C0C0C0',
  'Dorado': '#FFD700',
  'Transparente': '#FFFFFF',
};

const Inventario = () => {
  const {
    consumibles,
    categoriasConsumibles,
    modelosConsumibles,
    movimientos,
    agregarConsumible,
    actualizarConsumible,
    eliminarConsumible,
    agregarAlCarrito,
    cargarConsumibles,
    toggleCarrito,
    carrito,
    cargarMovimientos,
    cargaInicialCompleta,
    userPermissions
  } = useData();

  //  VERIFICAR PERMISOS
  const puedeCrear = userPermissions?.includes('crear_inventario');
  const puedeEditar = userPermissions?.includes('editar_inventario');
  const puedeEliminar = userPermissions?.includes('eliminar_inventario');

  const [tabActiva, setTabActiva] = useState('inventario');
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [modeloFilter, setModeloFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consumibleAEditar, setConsumibleAEditar] = useState(null);
  const [expandidos, setExpandidos] = useState({});

  const [movimientoSearchTerm, setMovimientoSearchTerm] = useState('');
  const [movimientoTipoFilter, setMovimientoTipoFilter] = useState('');

  // Estados para el modal de cantidad
  const [cantidadModalOpen, setCantidadModalOpen] = useState(false);
  const [cantidadModalItem, setCantidadModalItem] = useState(null);
  const [cantidadModalColorIndex, setCantidadModalColorIndex] = useState(null);
  const [cantidadModalValor, setCantidadModalValor] = useState(1);

  // Cargar datos iniciales
  useEffect(() => {
    if (cargaInicialCompleta) {
      cargarConsumibles();
      cargarMovimientos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargaInicialCompleta]);

  const opcionesTipos = useMemo(() => {
    if (!categoriasConsumibles || categoriasConsumibles.length === 0) return [];
    return categoriasConsumibles.map(t => t.nombre);
  }, [categoriasConsumibles]);

  const opcionesModelos = useMemo(() => {
    if (!modelosConsumibles || modelosConsumibles.length === 0) return [];
    return modelosConsumibles.map(m => m.nombre);
  }, [modelosConsumibles]);

  const opcionesTiposMovimiento = [
    { value: '', label: 'Todos los tipos' },
    { value: 'alta', label: 'Alta' },
    { value: 'ajuste', label: 'Ajuste' },
    { value: 'baja', label: 'Baja' },
    { value: 'salida', label: 'Salida' },
  ];

  // ============================================================
  // FILTRADO LOCAL (Instantáneo)
  // ============================================================
  const consumiblesFiltrados = useMemo(() => {
    if (!consumibles || !Array.isArray(consumibles)) return [];
    return consumibles.filter(item => {
      const matchSearch =
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchTipo = tipoFilter === '' ||
        (item.categoria?.nombre && item.categoria.nombre.toLowerCase() === tipoFilter.toLowerCase());
      const matchModelo = modeloFilter === '' ||
        (item.modelo?.nombre && item.modelo.nombre.toLowerCase() === modeloFilter.toLowerCase());
      return matchSearch && matchTipo && matchModelo;
    });
  }, [consumibles, searchTerm, tipoFilter, modeloFilter]);

  const movimientosFiltrados = useMemo(() => {
    if (!movimientos || !Array.isArray(movimientos)) return [];
    return movimientos.filter(item => {
      const matchSearch =
        (item.consumible?.nombre || '').toLowerCase().includes(movimientoSearchTerm.toLowerCase()) ||
        (item.motivo || '').toLowerCase().includes(movimientoSearchTerm.toLowerCase()) ||
        (item.color || '').toLowerCase().includes(movimientoSearchTerm.toLowerCase());
      const matchTipo = movimientoTipoFilter === '' || item.tipo_movimiento === movimientoTipoFilter;
      return matchSearch && matchTipo;
    });
  }, [movimientos, movimientoSearchTerm, movimientoTipoFilter]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const refreshMovimientos = async () => {
    await cargarMovimientos();
  };

  const handleGuardarConsumible = async (payload) => {
    if (consumibleAEditar) {
      await actualizarConsumible(consumibleAEditar.id, payload);
    } else {
      await agregarConsumible(payload);
    }
    setIsModalOpen(false);
    setConsumibleAEditar(null);
    await refreshMovimientos();
  };

  const abrirNuevo = () => {
    setConsumibleAEditar(null);
    setIsModalOpen(true);
  };

  const abrirEditar = (item, e) => {
    e.stopPropagation();
    setConsumibleAEditar(item);
    setIsModalOpen(true);
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar el consumible "${nombre}"?`)) return;
    await eliminarConsumible(id);
    await refreshMovimientos();
  };

  // ============================================================
  // MODAL DE CANTIDAD & ACCIONES DE STOCK
  // ============================================================
  const abrirModalCantidad = (item, colorIndex = null) => {
    setCantidadModalItem(item);
    setCantidadModalColorIndex(colorIndex);
    setCantidadModalValor(1);
    setCantidadModalOpen(true);
  };

  const cerrarModalCantidad = () => {
    setCantidadModalOpen(false);
    setCantidadModalItem(null);
    setCantidadModalColorIndex(null);
  };

  const confirmarAgregarCantidad = async () => {
    const cantidad = cantidadModalValor;
    if (cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0.');
      return;
    }
    const item = cantidadModalItem;
    if (!item) return;

    if (cantidadModalColorIndex !== null) {
      const nuevosColores = [...item.colores];
      const idx = cantidadModalColorIndex;
      const colorActual = nuevosColores[idx];
      if (!colorActual) return;
      const nuevaCantidad = parseInt(colorActual.cantidad || 0) + cantidad;
      nuevosColores[idx] = { ...colorActual, cantidad: nuevaCantidad };
      await actualizarConsumible(item.id, {
        colores: nuevosColores,
        motivo: `Ajuste: +${cantidad} unds (${colorActual.color})`
      });
    } else {
      const nuevaCantidad = (item.cantidad || 0) + cantidad;
      await actualizarConsumible(item.id, {
        cantidad: nuevaCantidad,
        motivo: `Ajuste: +${cantidad} unds`
      });
    }
    cerrarModalCantidad();
    await refreshMovimientos();
  };

  const modificarStockRapido = async (item, cantidadCambio, colorIndex = null, alCarrito = false) => {
    const isColorMode = colorIndex !== null;
    let nuevaCantidad;
    let colorName = null;
    let nuevosColores = [];

    if (isColorMode) {
      nuevosColores = [...item.colores];
      const colorData = nuevosColores[colorIndex];
      colorName = colorData.color;
      const cantidadActual = parseInt(colorData.cantidad) || 0;
      
      if (cantidadCambio < 0 && cantidadActual < Math.abs(cantidadCambio)) {
        alert('Stock insuficiente.');
        return;
      }
      nuevosColores[colorIndex] = { ...colorData, cantidad: cantidadActual + cantidadCambio };
    } else {
      if (cantidadCambio < 0 && (item.cantidad || 0) < Math.abs(cantidadCambio)) {
        alert('Stock insuficiente.');
        return;
      }
      nuevaCantidad = (item.cantidad || 0) + cantidadCambio;
    }

    if (alCarrito) {
      const itemCarrito = {
        ...item,
        nombre: colorName ? `${item.nombre} (${colorName})` : item.nombre,
        cantidad: Math.abs(cantidadCambio),
        color: colorName || (item.colores?.length > 0 ? item.colores[0].color : null),
      };
      agregarAlCarrito(itemCarrito);
    }

    const accion = alCarrito ? 'Salida a carrito' : 'Reducción de stock';
    const sufijo = colorName ? ` (${colorName})` : '';

    await actualizarConsumible(item.id, isColorMode ? {
      colores: nuevosColores,
      motivo: `${accion}: ${cantidadCambio}${sufijo}`
    } : {
      cantidad: nuevaCantidad,
      motivo: `${accion}: ${cantidadCambio}${sufijo}`
    });

    await refreshMovimientos();
  };

  const toggleExpandir = (id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));

  const totalCarritoItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  // ============================================================
  // HELPERS DE UI
  // ============================================================
  const RenderBadgeEstado = ({ cantidad, stockMinimo }) => {
    let config = { label: 'Disponible', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle, iconColor: 'text-emerald-500' };
    
    if (cantidad === 0) {
      config = { label: 'Agotado', color: 'bg-rose-50 text-rose-700 border-rose-200', Icon: XCircle, iconColor: 'text-rose-500' };
    } else if (stockMinimo && cantidad <= stockMinimo) {
      config = { label: 'Stock Bajo', color: 'bg-amber-50 text-amber-700 border-amber-200', Icon: AlertCircle, iconColor: 'text-amber-500' };
    }

    const { label, color, Icon, iconColor } = config;

    return (
      <span className={`inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${color}`}>
        <Icon size={12} className={iconColor} />
        {label}
      </span>
    );
  };

  // ============================================================
  // EXPORTACIONES
  // ============================================================
  const exportarPDF = () => {
    if (consumiblesFiltrados.length === 0) return alert('No hay elementos para exportar.');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 216, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('INVENTARIO DE ACTIVOS I.T.', 15, 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('TRANSMANDU, C.A.', 15, 22);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, 15, 28);
    
    const body = consumiblesFiltrados.map((item, idx) => [
      idx + 1,
      item.nombre,
      item.categoria?.nombre || 'N/A',
      item.modelo?.nombre || 'N/A',
      item.cantidad || 0,
      item.stock_minimo || '-',
      item.colores?.length > 0 ? item.colores.map(c => c.color).join(', ') : (item.color || '-')
    ]);
    
    autoTable(doc, {
      startY: 42,
      head: [['#', 'Nombre / Descripción', 'Categoría', 'Modelo', 'Cant.', 'Mín.', 'Color']],
      headStyles: { fillColor: [15, 23, 42], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      body: body,
      margin: { left: 15, right: 15 }
    });
    doc.save('Inventario_IT_Transmandu.pdf');
  };

  const exportarExcel = () => {
    if (consumiblesFiltrados.length === 0) return alert('No hay consumibles para exportar.');
    const data = consumiblesFiltrados.map((item) => ({
      Nombre: item.nombre,
      Tipo: item.categoria?.nombre || 'N/A',
      Modelo: item.modelo?.nombre || 'N/A',
      Cantidad: item.cantidad || 0,
      'Stock Mínimo': item.stock_minimo || 'N/A',
      Color: item.colores?.length > 0 ? item.colores.map(c => c.color).join(', ') : (item.color || 'N/A'),
      Descripción: item.descripcion || '',
    }));
    const hoja = XLSX.utils.json_to_sheet(data);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Inventario_IT');
    XLSX.writeFile(libro, 'Inventario_IT_Transmandu.xlsx');
  };

  const exportarMovimientosExcel = () => {
    if (!movimientosFiltrados || movimientosFiltrados.length === 0) return alert('No hay movimientos para exportar.');
    const tiposMov = { alta: 'Alta', ajuste: 'Ajuste', baja: 'Baja', salida: 'Salida' };
    const data = movimientosFiltrados.map((item) => ({
      Fecha: new Date(item.fecha_hora).toLocaleString('es-ES'),
      Consumible: item.consumible?.nombre || 'Registro Eliminado',
      Color: item.color || 'N/A',
      Tipo: tiposMov[item.tipo_movimiento] || item.tipo_movimiento,
      Cantidad: item.cantidad,
      'Cant. Anterior': item.cantidad_anterior ?? 'N/A',
      'Cant. Nueva': item.cantidad_nueva ?? 'N/A',
      Motivo: item.motivo || 'N/A',
      Usuario: item.usuario?.name || 'Sistema',
    }));
    const hoja = XLSX.utils.json_to_sheet(data);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Auditoría_Movimientos');
    XLSX.writeFile(libro, 'Auditoria_Movimientos_IT.xlsx');
  };

  // ============================================================
  // RENDER INVENTARIO
  // ============================================================
  const renderInventario = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre, código o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            autoComplete="off"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="">Todos los Tipos</option>
            {opcionesTipos.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={modeloFilter}
            onChange={(e) => setModeloFilter(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="">Todos los Modelos</option>
            {opcionesModelos.map(modelo => <option key={modelo} value={modelo}>{modelo}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-md">
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Artículo</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 hidden md:table-cell">Modelo</th>
                <th className="py-3 px-4 text-center w-24">Cant.</th>
                <th className="py-3 px-4 text-center hidden lg:table-cell w-24">Mínimo</th>
                <th className="py-3 px-4 text-center w-32">Estado</th>
                <th className="py-3 px-4 text-center w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consumiblesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-sm">
                    No se encontraron resultados.
                  </td>
                </tr>
              ) : (
                consumiblesFiltrados.map((item) => {
                  const esAgrupador = item.colores && item.colores.length > 0;
                  const estaExpandido = expandidos[item.id];

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-50/60 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{item.nombre}</span>
                            {item.color && !esAgrupador && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-sm"
                                style={{ backgroundColor: COLOR_HEX_MAP[item.color] || '#FFFFFF' }}
                                title={item.color}
                              />
                            )}
                            {esAgrupador && (
                              <button
                                onClick={() => toggleExpandir(item.id)}
                                className="text-slate-400 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 p-1 rounded-md transition-colors"
                              >
                                {estaExpandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            )}
                          </div>
                          {item.descripcion && (
                            <span className="block text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              {item.descripcion}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.categoria?.nombre || '—'}</td>
                        <td className="py-3 px-4 hidden md:table-cell text-slate-600">{item.modelo?.nombre || '—'}</td>
                        
                        <td className="py-3 px-4 text-center font-bold text-slate-700">
                          {esAgrupador ? '—' : (item.cantidad || 0)}
                        </td>
                        <td className="py-3 px-4 text-center hidden lg:table-cell text-slate-500">
                          {esAgrupador ? '—' : (item.stock_minimo || '—')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {esAgrupador ? <span className="text-slate-400">—</span> : <RenderBadgeEstado cantidad={item.cantidad || 0} stockMinimo={item.stock_minimo} />}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {!esAgrupador && (
                              <>
                                <button onClick={() => abrirModalCantidad(item)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Añadir stock"><Plus size={15} /></button>
                                <button onClick={() => modificarStockRapido(item, -1)} className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Restar stock"><Minus size={15} /></button>
                                <button onClick={() => modificarStockRapido(item, -1, null, true)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Mover a carrito"><ShoppingCart size={15} /></button>
                              </>
                            )}
                            {puedeEditar && (
                              <button onClick={(e) => abrirEditar(item, e)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar registro"><Edit2 size={15} /></button>
                            )}
                            {puedeEliminar && !esAgrupador && (
                              <button onClick={() => handleEliminar(item.id, item.nombre)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar registro"><Trash2 size={15} /></button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Sub-tabla de colores */}
                      {esAgrupador && estaExpandido && (
                        <tr className="bg-slate-50/50">
                          <td colSpan="7" className="py-3 px-4">
                            <div className="ml-6 pl-4 border-l-2 border-blue-300">
                              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase mb-2">
                                <div className="col-span-3">Variante</div>
                                <div className="col-span-2 text-center">Stock</div>
                                <div className="col-span-2 text-center">Mínimo</div>
                                <div className="col-span-2 text-center">Estado</div>
                                <div className="col-span-3 text-right pr-2">Acciones Rápidas</div>
                              </div>
                              <div className="flex flex-col gap-2">
                                {item.colores.map((colorItem, idx) => (
                                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white px-3 py-2.5 rounded-lg border border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
                                    <div className="col-span-3 flex items-center gap-2">
                                      <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: COLOR_HEX_MAP[colorItem.color] || '#FFFFFF' }} />
                                      <span className="text-xs font-semibold text-slate-700">{colorItem.color}</span>
                                    </div>
                                    <div className="col-span-2 text-xs text-slate-800 font-bold text-center">{parseInt(colorItem.cantidad) || 0}</div>
                                    <div className="col-span-2 text-xs text-slate-500 text-center">{parseInt(item.stock_minimo) || 0}</div>
                                    <div className="col-span-2 text-center flex justify-center">
                                      <RenderBadgeEstado cantidad={parseInt(colorItem.cantidad) || 0} stockMinimo={item.stock_minimo} />
                                    </div>
                                    <div className="col-span-3 flex items-center justify-end gap-1">
                                      <button onClick={() => abrirModalCantidad(item, idx)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Añadir"><Plus size={14} /></button>
                                      <button onClick={() => modificarStockRapido(item, -1, idx)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Restar"><Minus size={14} /></button>
                                      <button onClick={() => modificarStockRapido(item, -1, idx, true)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="A carrito"><ShoppingCart size={14} /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER MOVIMIENTOS
  // ============================================================
  const renderMovimientos = () => {
    const tiposMov = { alta: 'Alta', ajuste: 'Ajuste', baja: 'Baja', salida: 'Salida' };
    const badgesTipos = {
      alta: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      ajuste: 'bg-amber-50 text-amber-700 border-amber-200',
      baja: 'bg-rose-50 text-rose-700 border-rose-200',
      salida: 'bg-blue-50 text-blue-700 border-blue-200'
    };

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Rastrear activo, color o motivo..."
              value={movimientoSearchTerm}
              onChange={(e) => setMovimientoSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={movimientoTipoFilter}
              onChange={(e) => setMovimientoTipoFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none cursor-pointer"
            >
              {opcionesTiposMovimiento.map(tipo => <option key={tipo.value} value={tipo.value}>{tipo.label}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-md">
                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Activo I.T.</th>
                  <th className="py-3 px-4 text-center">Variante</th>
                  <th className="py-3 px-4 text-center">Operación</th>
                  <th className="py-3 px-4 text-center">Variación</th>
                  <th className="py-3 px-4 text-center hidden lg:table-cell">Previo</th>
                  <th className="py-3 px-4 text-center hidden lg:table-cell">Actual</th>
                  <th className="py-3 px-4 hidden md:table-cell">Motivo (Log)</th>
                  <th className="py-3 px-4 hidden xl:table-cell">Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movimientosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400 text-sm">
                      No existen logs con esos filtros.
                    </td>
                  </tr>
                ) : (
                  movimientosFiltrados.map((item) => {
                    const fecha = new Date(item.fecha_hora);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700 text-xs">{fecha.toLocaleDateString('es-ES')}</span>
                            <span className="text-[10px] text-slate-400">{fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800 text-xs">{item.consumible?.nombre || '—'}</td>
                        <td className="py-3 px-4 text-center text-slate-600 text-xs">{item.color || '—'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgesTipos[item.tipo_movimiento] || 'bg-slate-50 text-slate-700'}`}>
                            {tiposMov[item.tipo_movimiento] || item.tipo_movimiento}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-700 text-xs">
                          {item.cantidad > 0 ? `+${item.cantidad}` : item.cantidad}
                        </td>
                        <td className="py-3 px-4 text-center hidden lg:table-cell text-slate-500 text-xs">{item.cantidad_anterior ?? '—'}</td>
                        <td className="py-3 px-4 text-center hidden lg:table-cell text-slate-500 text-xs">{item.cantidad_nueva ?? '—'}</td>
                        <td className="py-3 px-4 hidden md:table-cell text-slate-600 text-xs max-w-xs truncate" title={item.motivo}>{item.motivo || '—'}</td>
                        <td className="py-3 px-4 hidden xl:table-cell text-slate-600 text-xs font-medium">{item.usuario?.name || 'Sistema'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md text-white">
              <Package size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Inventario</h1>
              <p className="text-slate-500 text-xs font-medium mt-0.5">Insumos de I.T.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          <button
            onClick={toggleCarrito}
            className="relative p-2.5 text-slate-500 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center"
            title="Ver carrito de asignaciones"
          >
            <ShoppingCart size={18} />
            {totalCarritoItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalCarritoItems}
              </span>
            )}
          </button>

          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl shadow-sm transition-all">
              <Download size={16} /> Exportar
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
              {tabActiva === 'inventario' ? (
                <>
                  <button onClick={exportarPDF} className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors border-b border-slate-100">
                    Reporte PDF
                  </button>
                  <button onClick={exportarExcel} className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    Data Excel (.xlsx)
                  </button>
                </>
              ) : (
                <button onClick={exportarMovimientosExcel} className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                  Auditoría Excel (.xlsx)
                </button>
              )}
            </div>
          </div>

          {tabActiva === 'inventario' && puedeCrear && (
            <button
              onClick={abrirNuevo}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all"
            >
              <Plus size={16} /> Nuevo Registro
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setTabActiva('inventario')}
            className={`flex-1 py-3.5 px-4 text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
              tabActiva === 'inventario' ? 'bg-blue-50/50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Package size={18} />
            Stock Activo
          </button>
          <button
            onClick={() => setTabActiva('movimientos')}
            className={`flex-1 py-3.5 px-4 text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
              tabActiva === 'movimientos' ? 'bg-blue-50/50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <History size={18} />
            Trazabilidad (Logs)
          </button>
        </div>

        <div className="p-5">
          {tabActiva === 'inventario' ? renderInventario() : renderMovimientos()}
        </div>
      </div>

      {/* Modal para agregar cantidad */}
      {cantidadModalOpen && cantidadModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Ajuste de Entrada</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {cantidadModalItem.nombre}
                  {cantidadModalColorIndex !== null && (
                    <span className="text-blue-600 font-bold ml-1">
                      (Var: {cantidadModalItem.colores[cantidadModalColorIndex].color})
                    </span>
                  )}
                </p>
              </div>
              <button onClick={cerrarModalCantidad} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unidades a ingresar</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCantidadModalValor(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl text-xl font-bold text-slate-600 transition-colors shadow-sm"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={cantidadModalValor}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1) setCantidadModalValor(val);
                    }}
                    className="w-20 text-center text-2xl font-black text-slate-800 border-none bg-slate-50 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow"
                  />
                  <button
                    onClick={() => setCantidadModalValor(prev => prev + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl text-xl font-bold text-slate-600 transition-colors shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={cerrarModalCantidad} className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="button" onClick={confirmarAgregarCantidad} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all active:scale-95">
                  Confirmar Ingreso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ModalConsumible
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setConsumibleAEditar(null); }}
        onGuardar={handleGuardarConsumible}
        consumibleAEditar={consumibleAEditar}
      />
    </div>
  );
};

export default Inventario;
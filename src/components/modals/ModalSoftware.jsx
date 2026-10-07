import React, { useState, useEffect } from 'react';
import { X, Save, Package, Plus, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import ModalMarcaRapida from './ModalMarcaRapida';
import ModalModeloRapido from './ModalModeloRapido';

const ModalSoftware = ({ isOpen, onClose, onGuardar, softwareAEditar = null }) => {
  const { marcas = [], modelos = [] } = useData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    etiqueta: '',
    categoria: 'Software',
    inac: 'No Declarado',
    marca_id: '',
    modelo_id: '',
    serial: '',
    version: '',
    licencia: '',
    observaciones: '',
  });

  const [modalMarcaRapidaOpen, setModalMarcaRapidaOpen] = useState(false);
  const [modalModeloRapidoOpen, setModalModeloRapidoOpen] = useState(false);

  const marcasFiltradas = marcas.filter(
    (m) => m.tipo && m.tipo.toLowerCase() === 'software'
  );

  const [modelosOpciones, setModelosOpciones] = useState([]);

  // ============================================================
  // EFECTO: Filtrar modelos cuando cambia la marca
  // ============================================================
  useEffect(() => {
    if (!formData.marca_id) {
      setModelosOpciones([]);
      return;
    }

    const marcaSeleccionadaId = String(formData.marca_id);

    const modelosFiltrados = modelos.filter((m) => {
      const idDirecto = m.marca_id !== undefined && m.marca_id !== null ? String(m.marca_id) : null;
      const idAnidado = m.marca?.id !== undefined && m.marca?.id !== null ? String(m.marca.id) : null;
      return idDirecto === marcaSeleccionadaId || idAnidado === marcaSeleccionadaId;
    });

    setModelosOpciones(modelosFiltrados);
  }, [formData.marca_id, modelos]);

  // ============================================================
  // EFECTO: Inicializar / Cargar datos al abrir el modal
  // ============================================================
  useEffect(() => {
    if (isOpen) {
      if (softwareAEditar) {
        const codigo = softwareAEditar.codigo || '';
        const numeroEtiqueta = codigo.startsWith('SW-') ? codigo.replace('SW-', '') : codigo;

        const marcaId = softwareAEditar.marca_id
          ? String(softwareAEditar.marca_id)
          : softwareAEditar.marca?.id
          ? String(softwareAEditar.marca.id)
          : '';

        let modeloId = softwareAEditar.modelo_id
          ? String(softwareAEditar.modelo_id)
          : softwareAEditar.modelo?.id
          ? String(softwareAEditar.modelo.id)
          : '';

        if (!modeloId && softwareAEditar.modelo && marcaId) {
          const modeloNombreStr = typeof softwareAEditar.modelo === 'object' 
            ? softwareAEditar.modelo.nombre 
            : softwareAEditar.modelo;

          const modeloEncontrado = modelos.find(
            (m) =>
              String(m.nombre).toLowerCase() === String(modeloNombreStr).toLowerCase() &&
              (String(m.marca_id) === marcaId || String(m.marca?.id) === marcaId)
          );
          if (modeloEncontrado) {
            modeloId = String(modeloEncontrado.id);
          }
        }

        // ============================================================
        // 🔥 NUEVA LÓGICA PARA EXTRAER VERSIÓN, LICENCIA Y OBSERVACIONES
        // ============================================================
        let versionExtraida = '';
        let licenciaExtraida = '';
        let observacionesExtraidas = '';

        // 1. Intentar parsear desde 'observaciones' (campo principal)
        if (softwareAEditar.observaciones && typeof softwareAEditar.observaciones === 'string') {
          try {
            const parsed = JSON.parse(softwareAEditar.observaciones);
            versionExtraida = parsed.version || '';
            licenciaExtraida = parsed.licencia || '';
            observacionesExtraidas = parsed.observaciones || '';
          } catch (e) {
            // Si no es JSON válido, lo usamos como texto plano en observaciones
            observacionesExtraidas = softwareAEditar.observaciones;
            console.warn('No se pudo parsear observaciones:', softwareAEditar.observaciones);
          }
        }

        // 2. Fallback: si no se encontró nada, intentar con 'especificaciones' (compatibilidad con datos antiguos)
        if (!versionExtraida && !licenciaExtraida && !observacionesExtraidas && softwareAEditar.especificaciones) {
          const specs = softwareAEditar.especificaciones;
          versionExtraida = specs.version || '';
          licenciaExtraida = specs.licencia || '';
          observacionesExtraidas = specs.observaciones || '';
        }

        // 3. Si aún no hay datos, usar los campos directos (por si el backend los devuelve así)
        if (!versionExtraida && softwareAEditar.version) versionExtraida = softwareAEditar.version;
        if (!licenciaExtraida && softwareAEditar.licencia) licenciaExtraida = softwareAEditar.licencia;
        if (!observacionesExtraidas && softwareAEditar.observaciones_texto) {
          observacionesExtraidas = softwareAEditar.observaciones_texto;
        }

        setFormData({
          etiqueta: numeroEtiqueta,
          categoria: 'Software',
          inac: softwareAEditar.inac || 'No Declarado',
          marca_id: marcaId,
          modelo_id: modeloId,
          serial: softwareAEditar.serial || '',
          version: versionExtraida,
          licencia: licenciaExtraida,
          observaciones: observacionesExtraidas,
        });

        if (marcaId) {
          const modelosFiltrados = modelos.filter((m) => {
            const idDirecto = m.marca_id !== undefined && m.marca_id !== null ? String(m.marca_id) : null;
            const idAnidado = m.marca?.id !== undefined && m.marca?.id !== null ? String(m.marca.id) : null;
            return idDirecto === marcaId || idAnidado === marcaId;
          });
          setModelosOpciones(modelosFiltrados);
        } else {
          setModelosOpciones([]);
        }

        setErrors({});
      } else {
        setFormData({
          etiqueta: '',
          categoria: 'Software',
          inac: 'No Declarado',
          marca_id: '',
          modelo_id: '',
          serial: '',
          version: '',
          licencia: '',
          observaciones: '',
        });
        setErrors({});
        setModelosOpciones([]);
      }
    }
  }, [isOpen, softwareAEditar, modelos]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'marca_id') {
        newData.modelo_id = '';
      }
      return newData;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleEtiquetaChange = (e) => {
    let value = e.target.value;
    if (value.startsWith('SW-')) value = value.replace('SW-', '');
    value = value.replace(/\D/g, '');
    if (value.length > 6) value = value.slice(0, 6);
    setFormData((prev) => ({ ...prev, etiqueta: value }));
    if (errors.etiqueta) setErrors((prev) => ({ ...prev, etiqueta: null }));
  };

  const handleMarcaCreada = (nuevaMarca) => {
    setFormData((prev) => ({ ...prev, marca_id: String(nuevaMarca.id), modelo_id: '' }));
  };

  const handleModeloCreado = (nuevoModelo) => {
    setFormData((prev) => ({ ...prev, modelo_id: String(nuevoModelo.id) }));
  };

  const marcaSeleccionada = marcasFiltradas.find((m) => String(m.id) === String(formData.marca_id));

  const validate = () => {
    const newErrors = {};
    const etiquetaCompleta = `SW-${formData.etiqueta}`;

    if (!formData.etiqueta) {
      newErrors.etiqueta = 'Debe ingresar un número para la etiqueta.';
    } else if (etiquetaCompleta.length > 9) {
      newErrors.etiqueta = 'La etiqueta completa no puede tener más de 9 caracteres.';
    }

    if (!formData.serial.trim()) {
      newErrors.serial = 'El número de serie es obligatorio.';
    }

    if (!formData.marca_id) {
      newErrors.marca_id = 'Debe seleccionar una marca.';
    }

    if (!formData.modelo_id) {
      newErrors.modelo_id = 'Debe seleccionar un modelo.';
    } else {
      const modeloValido = modelosOpciones.some((m) => String(m.id) === String(formData.modelo_id));
      if (!modeloValido) {
        newErrors.modelo_id = 'El modelo seleccionado no pertenece a la marca.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const etiquetaCompleta = `SW-${formData.etiqueta}`;
      const marcaObj = marcasFiltradas.find((m) => String(m.id) === String(formData.marca_id));
      const modeloObj = modelos.find((m) => String(m.id) === String(formData.modelo_id));

      const observacionesObj = {
        version: formData.version?.trim() || null,
        licencia: formData.licencia?.trim() || null,
        observaciones: formData.observaciones?.trim() || null,
      };
      const observacionesString = JSON.stringify(observacionesObj);

      const payload = {
        codigo: etiquetaCompleta,
        nombre: `Software - ${marcaObj?.nombre || 'Sin marca'} - ${modeloObj?.nombre || 'Sin modelo'}`,
        serial: formData.serial.trim(),
        modelo: modeloObj?.nombre || null,
        categoria_id: null,
        marca_id: parseInt(formData.marca_id),
        modelo_id: parseInt(formData.modelo_id) || null,
        estado_id: 1,
        inac: formData.inac,
        observaciones: observacionesString,
      };

      await onGuardar(payload);
      onClose();
    } catch (error) {
      console.error('❌ Error al guardar software:', error);
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        let msg = '❌ Errores de validación:\n';
        Object.keys(backendErrors).forEach((key) => {
          msg += `• ${key}: ${backendErrors[key].join(', ')}\n`;
        });
        alert(msg);
      } else {
        alert('Error al guardar el software. Revisa la consola.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const esEdicion = !!softwareAEditar;
  const titulo = esEdicion ? 'Editar Software' : 'Registrar Software';
  const subtitulo = esEdicion ? 'Modifique los datos del software o aplicación' : 'Ingrese los datos del software o aplicación';
  const textoBoton = esEdicion ? 'Actualizar' : 'Registrar Software';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              <Package size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">{titulo}</h2>
              <p className="text-xs text-slate-500">{subtitulo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-slate-50/30">
          {/* Etiqueta */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Etiqueta (Código único) *</label>
            <div className="flex items-center gap-1">
              <span className="px-3 py-2 bg-slate-200 text-slate-700 rounded-l-lg text-sm font-mono font-bold border border-r-0 border-slate-300">
                SW-
              </span>
              <input
                type="text"
                name="etiqueta"
                value={formData.etiqueta}
                onChange={handleEtiquetaChange}
                placeholder="Ej: 001"
                maxLength={6}
                autoComplete="off"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-r-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all text-sm font-mono ${
                  errors.etiqueta ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.etiqueta && <p className="text-rose-500 text-xs mt-1">{errors.etiqueta}</p>}
            <p className="text-[10px] text-slate-400 mt-0.5">Máximo 6 dígitos (SW- + 6 dígitos = 9 caracteres).</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Categoría */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Categoría</label>
              <input
                type="text"
                value="Software"
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* Clasificación INAC */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Clasificación INAC</label>
              <select
                name="inac"
                value={formData.inac}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
              >
                <option value="Declarado">Declarado</option>
                <option value="No Declarado">No Declarado</option>
              </select>
            </div>
          </div>

          {/* Marca */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Marca *</label>
            <div className="flex gap-2">
              <select
                name="marca_id"
                value={formData.marca_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all ${
                  errors.marca_id ? 'border-rose-300' : 'border-slate-200'
                }`}
              >
                <option value="">-- Seleccione una marca --</option>
                {marcasFiltradas.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setModalMarcaRapidaOpen(true)}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 text-xs font-bold whitespace-nowrap"
              >
                <Plus size={14} /> Nueva
              </button>
            </div>
            {errors.marca_id && <p className="text-rose-500 text-xs mt-1">{errors.marca_id}</p>}
          </div>

          {/* Modelo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Modelo *</label>
            <div className="flex gap-2">
              <select
                name="modelo_id"
                value={formData.modelo_id}
                onChange={handleChange}
                disabled={!formData.marca_id}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all ${
                  errors.modelo_id ? 'border-rose-300' : 'border-slate-200'
                } ${!formData.marca_id ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
              >
                <option value="">{formData.marca_id ? 'Seleccione un modelo' : 'Seleccione una marca primero'}</option>
                {modelosOpciones.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.nombre}
                  </option>
                ))}
              </select>

              {(() => {
                const tieneMarcaValida = !!marcaSeleccionada;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      if (!tieneMarcaValida) {
                        alert('Por favor, selecciona una marca válida de la lista antes de agregar un modelo.');
                        return;
                      }
                      setModalModeloRapidoOpen(true);
                    }}
                    disabled={!tieneMarcaValida}
                    className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-1 text-xs font-bold whitespace-nowrap ${
                      tieneMarcaValida
                        ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                    title={tieneMarcaValida ? 'Agregar modelo a esta marca' : 'Seleccione una marca válida primero'}
                  >
                    <Plus size={14} /> Modelo
                  </button>
                );
              })()}
            </div>
            {errors.modelo_id && <p className="text-rose-500 text-xs mt-1">{errors.modelo_id}</p>}
          </div>

          {/* Serial */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Número de Serie *</label>
            <input
              type="text"
              name="serial"
              value={formData.serial}
              onChange={handleChange}
              placeholder="Ej: SW-001-SN123"
              autoComplete="off"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all ${
                errors.serial ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
            {errors.serial && <p className="text-rose-500 text-xs mt-1">{errors.serial}</p>}
          </div>

          {/* Versión */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Versión</label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              placeholder="Ej: v2.1, 2023.1"
              autoComplete="off"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>

          {/* Licencia */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Licencia</label>
            <input
              type="text"
              name="licencia"
              value={formData.licencia}
              onChange={handleChange}
              placeholder="Ej: GPLv3, Propietaria, MIT"
              autoComplete="off"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Observaciones</label>
            <textarea
              name="observaciones"
              rows="3"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales sobre el software..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save size={16} /> {textoBoton}
              </>
            )}
          </button>
        </div>

        {/* Modales rápidos */}
        <ModalMarcaRapida
          isOpen={modalMarcaRapidaOpen}
          onClose={() => setModalMarcaRapidaOpen(false)}
          onMarcaCreada={handleMarcaCreada}
          tipoPredeterminado="software"
        />
        <ModalModeloRapido
          isOpen={modalModeloRapidoOpen}
          onClose={() => setModalModeloRapidoOpen(false)}
          marcaId={marcaSeleccionada?.id || null}
          onModeloCreado={handleModeloCreado}
          tipoPredeterminado="software"
        />
      </div>
    </div>
  );
};

export default ModalSoftware;
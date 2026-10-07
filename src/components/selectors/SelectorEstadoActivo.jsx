import React, { useEffect } from 'react';

const SelectorEstadoActivo = ({ 
  formData, 
  setFormData, 
  estadosDisponibles 
}) => {
  const tieneResponsable = !!formData.responsable_id;

  const getIdEstado = (nombreBuscado) => {
    return estadosDisponibles.find(e => e.nombre.toLowerCase() === nombreBuscado)?.id;
  };

  useEffect(() => {
    if (tieneResponsable) {
      setFormData(prev => ({ ...prev, estado_id: getIdEstado('asignado') }));
    } else {
      const estadoActual = estadosDisponibles.find(e => e.id === formData.estado_id)?.nombre.toLowerCase();
      const estadosValidosSinResponsable = ['por asignar', 'sin uso', 'ubicado'];
      
      if (!estadosValidosSinResponsable.includes(estadoActual)) {
        setFormData(prev => ({ ...prev, estado_id: getIdEstado('por asignar') }));
      }
    }
  }, [formData.responsable_id]);

  if (tieneResponsable) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <span className="text-sm font-semibold text-slate-700">Estado de inactividad o depósito:</span>
      
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="estado_equipo"
            className="text-blue-600 focus:ring-blue-500"
            checked={formData.estado_id === getIdEstado('por asignar')}
            onChange={() => setFormData(prev => ({ ...prev, estado_id: getIdEstado('por asignar') }))}
          />
          <span className="text-sm text-slate-600">Por asignar</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="estado_equipo"
            className="text-amber-600 focus:ring-amber-500"
            checked={formData.estado_id === getIdEstado('sin uso')}
            onChange={() => setFormData(prev => ({ ...prev, estado_id: getIdEstado('sin uso') }))}
          />
          <span className="text-sm text-slate-600">Sin uso</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="estado_equipo"
            className="text-emerald-600 focus:ring-emerald-500"
            checked={formData.estado_id === getIdEstado('ubicado')}
            onChange={() => setFormData(prev => ({ ...prev, estado_id: getIdEstado('ubicado') }))}
            disabled={!formData.ubicacion_id}
          />
          <span className={`text-sm ${!formData.ubicacion_id ? 'text-slate-400' : 'text-slate-600'}`}>
            Ubicado {!formData.ubicacion_id && '(Requiere ubicación)'}
          </span>
        </label>
      </div>
    </div>
  );
};

export default SelectorEstadoActivo;
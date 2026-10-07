// src/components/modals/ModalAgregarItem.jsx
import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const ModalAgregarItem = ({ isOpen, onClose, onConfirm, titulo, valorInicial = '', placeholder = 'Ej: Servidor NAS-01' }) => {
  const [nombre, setNombre] = useState(valorInicial);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNombre(valorInicial);
      setError('');
    }
  }, [isOpen, valorInicial]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const valor = nombre.trim();
    if (!valor) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    onConfirm(valor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {titulo || 'Agregar Elemento'}
              </h2>
              <p className="text-xs text-slate-500">Ingrese el nombre del nuevo sistema o dispositivo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (error) setError('');
              }}
              placeholder={placeholder}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                error ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <span>⚠️</span> {error}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors"
            >
              <Plus size={16} /> Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAgregarItem;
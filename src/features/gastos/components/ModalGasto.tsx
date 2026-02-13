import React, { useState, useEffect } from 'react';
import { Gasto } from '../../../core/types';

interface ModalGastoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (costo: number, descripcion: string | null) => void;
  loading?: boolean;
  initialGasto?: Gasto | null;
}

export const ModalGasto: React.FC<ModalGastoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialGasto = null,
}) => {
  const [costo, setCosto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialGasto) {
        setCosto(String(initialGasto.costo));
        setDescripcion(initialGasto.descripcion || '');
      } else {
        setCosto('');
        setDescripcion('');
      }
    }
  }, [isOpen, initialGasto]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const costoNum = parseFloat(costo);
    if (isNaN(costoNum) || costoNum <= 0) {
      alert('Ingrese un costo válido');
      return;
    }

    onSubmit(costoNum, descripcion.trim() || null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>{initialGasto ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-minimal-body">
          <div className="form-group">
            <label>Costo *</label>
            <input
              type="number"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del gasto (opcional)"
              rows={3}
              disabled={loading}
            />
          </div>
        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : initialGasto ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};

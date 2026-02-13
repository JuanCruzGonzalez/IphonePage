import React, { useState, useEffect } from 'react';
import { Categoria } from '../../../core/types';

interface ModalCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nombre: string) => void;
  loading?: boolean;
  initialCategoria?: Categoria | null;
}

export const ModalCategoria: React.FC<ModalCategoriaProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialCategoria = null,
}) => {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialCategoria) {
        setNombre(initialCategoria.nombre);
      } else {
        setNombre('');
      }
    }
  }, [isOpen, initialCategoria]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const nombreTrimmed = nombre.trim();
    if (!nombreTrimmed) {
      alert('Ingrese un nombre para la categoría');
      return;
    }

    onSubmit(nombreTrimmed);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>{initialCategoria ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-minimal-body">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ej: Frutos Secos, Dietética, etc."
              disabled={loading}
              autoFocus
            />
          </div>
        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : initialCategoria ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};

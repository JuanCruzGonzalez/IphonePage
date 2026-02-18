import React, { useState, useEffect } from 'react';
import { Categoria } from '../../../core/types';

interface ModalCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nombre: string, id_categoria_padre?: number | null) => void;
  loading?: boolean;
  initialCategoria?: Categoria | null;
  categorias?: Categoria[];
}

export const ModalCategoria: React.FC<ModalCategoriaProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialCategoria = null,
  categorias = [],
}) => {
  const [nombre, setNombre] = useState('');
  const [idCategoriaPadre, setIdCategoriaPadre] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialCategoria) {
        setNombre(initialCategoria.nombre);
        setIdCategoriaPadre(initialCategoria.id_categoria_padre ?? null);
      } else {
        setNombre('');
        setIdCategoriaPadre(null);
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

    onSubmit(nombreTrimmed, idCategoriaPadre);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  // Filtrar categorías disponibles para ser padre (excluir la categoría actual si estamos editando)
  const categoriasDisponibles = categorias.filter(
    cat => !initialCategoria || cat.id_categoria !== initialCategoria.id_categoria
  );

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
          <div className="form-group">
            <label>Categoría Padre (opcional)</label>
            <select
              value={idCategoriaPadre ?? ''}
              onChange={(e) => setIdCategoriaPadre(e.target.value ? Number(e.target.value) : null)}
              disabled={loading}
            >
              <option value="">Sin categoría padre</option>
              {categoriasDisponibles.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre}
                </option>
              ))}
            </select>
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

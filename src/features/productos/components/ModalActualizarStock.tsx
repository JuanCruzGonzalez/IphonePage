import React, { useState } from 'react';
import { Producto } from '../../../core/types';

interface ModalActualizarStockProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  onSubmit: (productoId: number, cantidad: number) => void;
  showError?: (message: string) => void;
  showWarning?: (message: string) => void;
  loading?: boolean;
}

export const ModalActualizarStock: React.FC<ModalActualizarStockProps> = ({ isOpen, onClose, onSubmit, productos = [], showWarning, loading = false }) => {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');

  if (!isOpen) return null;

  const productoSeleccionado = productos.find(p => p.id_producto === parseInt(productoId));

  const handleSubmit = () => {
    if (!productoId || !cantidad) {
      showWarning?.('Complete todos los campos');
      return;
    }

    onSubmit(parseInt(productoId), parseInt(cantidad));
    setProductoId('');
    setCantidad('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>Actualizar Stock</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-minimal-body">
          <div className="form-group">
            <label>Producto</label>
            <select value={productoId} onChange={(e) => setProductoId(e.target.value)} disabled={loading}>
              <option value="">Seleccionar producto</option>
              {productos.map(p => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          {productoSeleccionado && (
            <div className="form-group">
              <label>Stock actual</label>
              <input
                type="text"
                value={productoSeleccionado.stock}
                readOnly
                className="readonly"
              />
            </div>
          )}
          <div className="form-group">
            <label>Cantidad a agregar</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              min="1"
              placeholder="0"
              disabled={loading}
            />
          </div>
        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Actualizando...' : 'Actualizar'}</button>
        </div>
      </div>
    </div>
  );
};

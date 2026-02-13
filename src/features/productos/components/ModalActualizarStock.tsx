import React, { useState } from 'react';
import { useProductos } from '../context/ProductosContext';

interface ModalActualizarStockProps {}

export const ModalActualizarStock: React.FC<ModalActualizarStockProps> = () => {
  const {
    modalActualizarStock,
    productos,
    handleActualizarStock,
    actualizarStockAsync,
  } = useProductos();

  const isOpen = modalActualizarStock.isOpen;
  const onClose = modalActualizarStock.close;
  const loading = actualizarStockAsync.loading;

  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');

  if (!isOpen) return null;

  const productoSeleccionado = productos.find(p => p.id_producto === parseInt(productoId));

  const handleSubmit = () => {
    if (!productoId || !cantidad) {
      return;
    }

    handleActualizarStock(parseInt(productoId), parseInt(cantidad));
    setProductoId('');
    setCantidad('');
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

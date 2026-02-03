import React, { useState } from 'react';
import { Producto } from '../types';

interface ModalNuevaVentaProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  onSubmit: (items: { id_producto: number; cantidad: number; precioUnitario: number }[], pagada: boolean) => void;
  showToast?: (message: string) => void;
  showError?: (message: string) => void;
  showWarning?: (message: string) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  loading?: boolean;
}

export const ModalNuevaVenta: React.FC<ModalNuevaVentaProps> = ({ 
  isOpen, 
  onClose, 
  productos, 
  onSubmit,
  showError,
  showWarning,
  loading = false,
}) => {
  const [items, setItems] = useState<{ id_producto: number; cantidad: number; nombre: string; precioventa: number; unidadMedidaId: number}[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [pagada, setPagada] = useState(true);

  if (!isOpen) return null;

  const agregarItem = () => {
    const productoId = parseInt(productoSeleccionado);
    const cant = parseInt(cantidad);

    if (!productoId || !cant || cant <= 0) {
      showWarning?.('Seleccione un producto y cantidad válida');
      return;
    }

    const producto = productos.find(p => p.id_producto === productoId);
    if (!producto) return;

    if (producto.stock < cant) {
      showError?.(`Stock insuficiente. Disponible: ${producto.stock}`);
      return;
    }

    if (items.find(i => i.id_producto === productoId)) {
      showWarning?.('Este producto ya está agregado');
      return;
    }

    setItems([...items, { 
      id_producto: productoId, 
      cantidad: cant, 
      nombre: producto.nombre,
      precioventa: producto.precioventa,
      unidadMedidaId: producto.id_unidad_medida
    }]);
    setProductoSeleccionado('');
    setCantidad('');
  };

  const calcularTotal = () => {
    return items.reduce((total, item) => total + (item.cantidad * item.precioventa), 0);
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      showWarning?.('Agregue al menos un producto');
      return;
    }

    onSubmit(items.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad, precioUnitario: i.precioventa })), pagada);
    setItems([]);
    setProductoSeleccionado('');
    setCantidad('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>Nueva Venta</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-minimal-body">
          <div className="form-group">
            <label>Producto</label>
            <select value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)}>
              <option value="">Seleccionar producto</option>
              {productos.map(p => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre} (Stock: {p.stock}) - ${p.id_unidad_medida === 1 ? p.precioventa * 100 : p.precioventa}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              min="1"
              placeholder="0"
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={pagada} onChange={(e) => setPagada(e.target.checked)} />
              <span>Pagada</span>
            </label>
          </div>
          <button className="btn-secondary" onClick={agregarItem} style={{ width: '100%' }} disabled={loading}>
            + Agregar Producto
          </button>

          {items.length > 0 && (
            <div className="items-list">
              <h3>Productos agregados:</h3>
              {items.map(item => (
                <div key={item.id_producto} className="item-row">
                  <div>
                    <span>{item.nombre} × {item.cantidad}</span>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      <input
                      style={{
                        width: '70px',
                        backgroundColor: 'transparent',
                        color: '#000',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        padding: '2px 6px',
                      }}
                      type="number"
                      value={item.unidadMedidaId === 1 ? String(item.precioventa * 100) : String(item.precioventa)}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        setItems(prev =>
                        prev.map(it =>
                          it.id_producto === item.id_producto
                          ? { ...it, precioventa: item.unidadMedidaId === 1 ? val / 100 : val }
                          : it
                        )
                        );
                      }}
                      min="0"
                      />
                      {item.unidadMedidaId === 1 ? ' x100gr' : ''}

                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: 'bold' }}>
                      ${item.cantidad * item.precioventa}
                    </span>
                    <button
                      className="btn-remove"
                      onClick={() => setItems(items.filter(i => i.id_producto !== item.id_producto))}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ 
                marginTop: '15px', 
                paddingTop: '15px', 
                borderTop: '2px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                <span>Total:</span>
                <span>${calcularTotal()}</span>
              </div>
            </div>
          )}
        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
};

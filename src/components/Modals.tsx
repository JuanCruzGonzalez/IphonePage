import React, { useState } from 'react';
import { Producto, UnidadMedida } from '../types';

// Modal para Nueva Venta
interface ModalNuevaVentaProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  onSubmit: (items: { id_producto: number; cantidad: number }[]) => void;
  showToast?: (message: string) => void;
  showError?: (message: string) => void;
  showWarning?: (message: string) => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
}

export const ModalNuevaVenta: React.FC<ModalNuevaVentaProps> = ({ 
  isOpen, 
  onClose, 
  productos, 
  onSubmit,
  showError,
  showWarning,
}) => {
  const [items, setItems] = useState<{ id_producto: number; cantidad: number; nombre: string }[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState('');

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

    setItems([...items, { id_producto: productoId, cantidad: cant, nombre: producto.nombre }]);
    setProductoSeleccionado('');
    setCantidad('');
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      showWarning?.('Agregue al menos un producto');
      return;
    }

    onSubmit(items.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad })));
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
                  {p.nombre} (Stock: {p.stock})
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
          <button className="btn-secondary" onClick={agregarItem} style={{ width: '100%' }}>
            + Agregar Producto
          </button>

          {items.length > 0 && (
            <div className="items-list">
              <h3>Productos agregados:</h3>
              {items.map(item => (
                <div key={item.id_producto} className="item-row">
                  <span>{item.nombre} × {item.cantidad}</span>
                  <button
                    className="btn-remove"
                    onClick={() => setItems(items.filter(i => i.id_producto !== item.id_producto))}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit}>Registrar Venta</button>
        </div>
      </div>
    </div>
  );
};

// Modal para Nuevo Producto
interface ModalNuevoProductoProps {
  isOpen: boolean;
  onClose: () => void;
  unidadesMedida: UnidadMedida[];
  onSubmit: (producto: { nombre: string; descripcion: string; stock: number; costo: number; precioventa: number; unidadMedida: number}) => void;
  showError?: (message: string) => void;
  showWarning?: (message: string) => void;
}

export const ModalNuevoProducto: React.FC<ModalNuevoProductoProps> = ({ 
  isOpen, 
  onClose, 
  unidadesMedida, 
  onSubmit,
  showWarning,
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [stock, setStock] = useState('');
  const [costo, setCosto] = useState('');
  const [precioventa, setPrecioventa] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!nombre.trim() || !stock) {
      showWarning?.('Complete los campos requeridos');
      return;
    }

    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      stock: parseInt(stock),
      costo: parseInt(costo),
      precioventa: parseInt(precioventa),
      unidadMedida: parseInt(unidadMedida),
    });

    setNombre('');
    setDescripcion('');
    setStock('');
    setCosto('');
    setPrecioventa('');
    setUnidadMedida('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>Nuevo Producto</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-minimal-body">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del producto"
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Stock inicial *</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Precio de Costo</label>
            <input
              type="number"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Precio de Venta</label>
            <input
              type="number"
              value={precioventa}
              onChange={(e) => setPrecioventa(e.target.value)}
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Unidad de Medida</label>
            <select value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)}>
              <option value="">Seleccionar Unidad de Medida</option>
              {unidadesMedida.map(p => (
                <option key={p.id_unidad_medida} value={p.id_unidad_medida}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit}>Crear Producto</button>
        </div>
      </div>
    </div>
  );
};

// Modal para Actualizar Stock
interface ModalActualizarStockProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  onSubmit: (productoId: number, cantidad: number) => void;
  showError?: (message: string) => void;
  showWarning?: (message: string) => void;
}

export const ModalActualizarStock: React.FC<ModalActualizarStockProps> = ({ 
  isOpen, 
  onClose, 
  productos, 
  onSubmit,
  showWarning,
}) => {
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
            <select value={productoId} onChange={(e) => setProductoId(e.target.value)}>
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
            />
          </div>
        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit}>Actualizar</button>
        </div>
      </div>
    </div>
  );
};
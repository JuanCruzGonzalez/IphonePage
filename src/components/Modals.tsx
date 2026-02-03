import React, { useState } from 'react';
import { Producto, UnidadMedida } from '../types';

// Modal para Nueva Venta
interface ModalNuevaVentaProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  // nuevos argumentos: items y si la venta está pagada
  onSubmit: (items: { id_producto: number; cantidad: number; precioUnitario: number }[], pagada: boolean) => void;
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

    // Pasamos también el flag `pagada` al handler
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
          <button className="btn-secondary" onClick={agregarItem} style={{ width: '100%' }}>
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
                      ${item.unidadMedidaId === 1 ? item.precioventa * 100 : item.precioventa} {item.unidadMedidaId === 1 ? 'x100gr' : ''}
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
  // onSubmit will be supplied by the parent; it can be a create or update handler.
  onSubmit: (producto: { nombre: string; descripcion: string; stock: number; costo: number; precioventa: number; unidadMedida: number; estado: boolean}) => void;
  // optional product to edit. If provided modal will prefill fields for editing.
  initialProduct?: {
    id_producto: number;
    nombre: string;
    descripcion: string | null;
    stock: number;
    costo: number;
    precioventa: number;
    id_unidad_medida: number;
    estado: boolean;
  } | null;
  showError?: (message: string) => void;
  showWarning?: (message: string) => void;
}

export const ModalNuevoProducto: React.FC<ModalNuevoProductoProps> = ({ 
  isOpen, 
  onClose, 
  unidadesMedida, 
  onSubmit,
  showWarning,
  initialProduct = null,
}) => {
  const [nombre, setNombre] = useState(initialProduct?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(initialProduct?.descripcion ?? '');
  const [stock, setStock] = useState(initialProduct ? String(initialProduct.stock) : '');
  const [costo, setCosto] = useState(initialProduct ? String(initialProduct.costo) : '');
  const [precioventa, setPrecioventa] = useState(initialProduct ? String(initialProduct.precioventa) : '');
  const [unidadMedida, setUnidadMedida] = useState(initialProduct ? String(initialProduct.id_unidad_medida) : '');
  const [estadoProducto, setEstadoProducto] = useState<string>(initialProduct ? (initialProduct.estado ? '1' : '2') : '1');

  React.useEffect(() => {
    // When initialProduct changes (open modal for edit), populate fields
    if (initialProduct) {
      setNombre(initialProduct.nombre ?? '');
      setDescripcion(initialProduct.descripcion ?? '');
      setStock(String(initialProduct.stock ?? ''));
      if (initialProduct.id_unidad_medida === 1) {
        // If unidad de medida is 1 (por 100 gramos) multiply costo by 100, guardando cuando costo sea null/undefined
        setCosto(initialProduct.costo != null ? String(initialProduct.costo * 100) : '');
      } else {
        setCosto(String(initialProduct.costo ?? ''));
      }
      if (initialProduct.id_unidad_medida === 1) {
        // If unidad de medida is 1 (por 100 gramos) multiply costo by 100, guardando cuando precio de venta sea null/undefined
        setPrecioventa(initialProduct.precioventa != null ? String(initialProduct.precioventa * 100) : '');
      } else {
        setPrecioventa(String(initialProduct.precioventa ?? ''));
      }
      setUnidadMedida(String(initialProduct.id_unidad_medida ?? ''));
      setEstadoProducto((initialProduct.estado ?? true) ? '1' : '2');
    } else {
      // reset when no initial product
      setNombre('');
      setDescripcion('');
      setStock('');
      setCosto('');
      setPrecioventa('');
      setUnidadMedida('');
      setEstadoProducto('1');
    }
  }, [initialProduct, isOpen]);

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
      costo: unidadMedida === '1' ? parseInt(costo)/100 : parseInt(costo),
      precioventa: unidadMedida === '1' ? parseInt(precioventa)/100 : parseInt(precioventa),
      unidadMedida: parseInt(unidadMedida),
      estado: estadoProducto === '1',
    });

    setNombre('');
    setDescripcion('');
    setStock('');
    setCosto('');
    setPrecioventa('');
    setUnidadMedida('');
  };
  const textoGramos = unidadMedida === '1' ? '(por 100 gramos)' : '';
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>{initialProduct ? 'Actualizar Producto' : 'Nuevo Producto'}</h2>
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
            <label>Precio de Costo {textoGramos}</label>
            <input
              type="number"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Precio de Venta {textoGramos}</label>
            <input
              type="number"
              value={precioventa}
              onChange={(e) => setPrecioventa(e.target.value)}
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select value={estadoProducto} onChange={(e) => setEstadoProducto(e.target.value)}>
              <option value="1">Activo</option>
              <option value="2">Inavilitado</option>
            </select>
          </div>
        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit}>
            {initialProduct ? 'Actualizar Producto' : 'Crear Producto'}
          </button>
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
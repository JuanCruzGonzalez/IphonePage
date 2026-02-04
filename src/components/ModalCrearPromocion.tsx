import React, { useState, useEffect } from 'react';
import { Producto, PromocionDetalleInput } from '../types';

interface ModalCrearPromocionProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  // initialPromotion used for editing
  initialPromotion?: { id_promocion: number; name: string; precio: number | null; productos: PromocionDetalleInput[]; estado: boolean } | null;
  onSubmit: (payload: { name: string; precio: number | null; productos: PromocionDetalleInput[]; estado: boolean }) => void;
  showError?: (message: string) => void;
  showWarning?: (message: string) => void;
  loading?: boolean;
}

export const ModalCrearPromocion: React.FC<ModalCrearPromocionProps> = ({ isOpen, onClose, productos, initialPromotion = null, onSubmit, showWarning, loading = false }) => {
  const [name, setName] = useState('');
  const [precio, setPrecio] = useState('');
  // items: productos agregados a la promoción (incluye nombre para mostrar)
  const [items, setItems] = useState<{ id_producto: number; cantidad: number; nombre?: string; unidadMedidaId?: number }[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadInput, setCantidadInput] = useState('1');
  const [estado, setEstado] = useState<'1' | '2'>('1');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setPrecio('');
      setItems([]);
      setEstado('1');
    } else {
      // populate when opening for edit
      if (initialPromotion) {
        setName(initialPromotion.name ?? '');
        setPrecio(initialPromotion.precio != null ? String(initialPromotion.precio) : '');
        setItems(Array.isArray(initialPromotion.productos) ? initialPromotion.productos.map(p => ({ id_producto: p.id_producto, cantidad: p.cantidad, nombre: productos.find(x => x.id_producto === p.id_producto)?.nombre })) : []);
        setEstado(initialPromotion.estado ? '1' : '2');
      } else {
        // creating new
        setName('');
        setPrecio('');
        setItems([]);
        setEstado('1');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const agregarItem = () => {
    const productoId = parseInt(productoSeleccionado);
    const cant = parseInt(cantidadInput) || 0;
    if (!productoId || cant <= 0) {
      showWarning?.('Seleccione un producto y cantidad válida');
      return;
    }
    const producto = productos.find(p => p.id_producto === productoId);
    if (!producto) return;

    if (items.find(i => i.id_producto === productoId)) {
      showWarning?.('Este producto ya está agregado');
      return;
    }
    setItems(prev => [...prev, { id_producto: productoId, cantidad: cant, nombre: producto.nombre, unidadMedidaId: producto.id_unidad_medida }]);
    setProductoSeleccionado('');
    setCantidadInput('1');
  };

  const setCantidad = (id: number, cantidad: number) => {
    setItems(prev => prev.map(it => it.id_producto === id ? { ...it, cantidad } : it));
  };

  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id_producto !== id));

  const handleSubmit = () => {
    if (!name.trim()) {
      showWarning?.('Ingrese un nombre para la promoción');
      return;
    }
    if (items.length === 0) {
      showWarning?.('Seleccione al menos un producto para la promoción');
      return;
    }

    const precioNum = precio === '' ? null : (isNaN(Number(precio)) ? null : Number(precio));

    onSubmit({ name: name.trim(), precio: precioNum, productos: items.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad })), estado: estado === '1' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>Nueva Promoción</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-minimal-body">
          <div className="form-group">
            <label>Nombre *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la promoción" />
          </div>
          <div className="form-group">
            <label>Precio (opcional)</label>
            <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio de la promoción" />
          </div>

          <div className="form-group">
            <label>Producto</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)} style={{ flex: 1 }}>
                <option value="">Seleccionar producto</option>
                {productos.map(p => (
                  <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                ))}
              </select>
              <input type="number" min={1} value={cantidadInput} onChange={(e) => setCantidadInput(e.target.value)} style={{ width: 90 }} />
              <button className="btn-secondary" onClick={agregarItem} disabled={loading}>+ Agregar Producto</button>
            </div>

            {items.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <h4>Productos agregados</h4>
                {items.map(it => (
                  <div key={it.id_producto} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px' }}>
                    <div>
                      <span>{it.nombre ?? ('#' + it.id_producto)} × </span>
                      <input type="number" min={1} value={String(it.cantidad)} onChange={(e) => setCantidad(it.id_producto, e.target.value === '' ? 1 : parseInt(e.target.value))} style={{ width: 80 }} />
                    </div>
                    <div>
                      <button className="btn-remove" onClick={() => removeItem(it.id_producto)}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value as any)}>
              <option value="1">Activo</option>
              <option value="2">Inactivo</option>
            </select>
          </div>
        </div>
          <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? (initialPromotion ? 'Actualizando...' : 'Guardando...') : (initialPromotion ? 'Actualizar Promoción' : 'Crear Promoción')}</button>
        </div>
      </div>
    </div>
  );
};

export default ModalCrearPromocion;

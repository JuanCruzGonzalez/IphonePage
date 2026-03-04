import React, { useState, useRef, useEffect } from 'react';
import { useProductos } from '../../productos/context/ProductosContext';
import { Producto } from '../../../core/types';
import ProductosDropDown from './ProductosDropDown';
import InputBusqueda from './InputBusqueda';

interface ModalActualizarStockProps { }

export const ModalActualizarStock = React.memo<ModalActualizarStockProps>(() => {
  const {
    modalActualizarStock,
    productosActivos,
    handleActualizarStock,
    isUpdatingStock,
  } = useProductos();

  const isOpen = modalActualizarStock.isOpen;
  const onClose = modalActualizarStock.close;
  const loading = isUpdatingStock;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [cantidad, setCantidad] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Limpiar estado al abrir/cerrar
  useEffect(() => {
    if (!isOpen) {
      setProducto(null);
      setBusqueda('');
      setCantidad('');
      setShowDropdown(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const productosFiltrados = productosActivos
    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .slice(0, 10);

  const productoSeleccionado = productosActivos.find(p => p.id_producto === producto?.id_producto) || null;

  const seleccionarProducto = (producto: Producto) => {
    setProducto(producto);
    setBusqueda(producto.nombre);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (!producto || !cantidad) return;
    handleActualizarStock(producto, parseInt(cantidad));
    setProducto(null);
    setBusqueda('');
    setCantidad('');
  };

  const handleSetDropDown = (show: boolean) => {
    setShowDropdown(show);
  };

  const handleSeleccionarProducto = (producto: Producto | null) => {
    setProducto(producto);
  }

  const handleSetBusqueda = (value: string) => {
    setBusqueda(value);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>Actualizar Stock</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-minimal-body">
          <div className="form-group" style={{ position: 'relative' }} ref={searchRef}>
            <label>Buscar Producto</label>
            <InputBusqueda
              busqueda={busqueda}
              handleSetBusqueda={handleSetBusqueda}
              handleSeleccionarProducto={handleSeleccionarProducto}
              handleSetDropDown={handleSetDropDown}
              loading={loading}
            />
            {showDropdown && busqueda && productosFiltrados.length > 0 && (
              <div className='item-buscador'>
                <ProductosDropDown productosFiltrados={productosFiltrados} seleccionarProducto={seleccionarProducto} />
              </div>
            )}
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
});

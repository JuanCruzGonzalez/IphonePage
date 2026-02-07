import React, { useState, useEffect } from 'react';
import { Producto } from '../types';
import { getProductosActivos } from '../api/productoService';
import { getProductImageUrl } from '../api/storageService';
import './ClientePage.css';

interface ItemCarrito {
  id_producto: number;
  nombre: string;
  precio: number;
  cantidad: number;
  unidadMedidaId: number;
  unidadMedidaNombre: string;
}

export const ClientePage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalCantidad, setModalCantidad] = useState<{
    isOpen: boolean;
    producto: Producto | null;
  }>({ isOpen: false, producto: null });
  const [cantidadGramos, setCantidadGramos] = useState('');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await getProductosActivos();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModalCantidad = (producto: Producto) => {
    setModalCantidad({ isOpen: true, producto });
    setCantidadGramos('');
  };

  const cerrarModalCantidad = () => {
    setModalCantidad({ isOpen: false, producto: null });
    setCantidadGramos('');
  };

  const agregarAlCarrito = (producto: Producto, cantidad: number = 1) => {
    const itemExistente = carrito.find(item => item.id_producto === producto.id_producto);

    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.id_producto === producto.id_producto
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: producto.precioventa,
        cantidad,
        unidadMedidaId: producto.id_unidad_medida,
        unidadMedidaNombre: producto.unidad_medida?.abreviacion || '',
      }]);
    }
  };

  const manejarAgregarProducto = (producto: Producto) => {
    if (producto.id_unidad_medida === 1) {
      abrirModalCantidad(producto);
    } else {
      agregarAlCarrito(producto, 1);
    }
  };

  const confirmarCantidadGramos = () => {
    if (!modalCantidad.producto) return;

    const gramos = parseFloat(cantidadGramos);
    if (isNaN(gramos) || gramos <= 0) {
      alert('Ingrese una cantidad válida');
      return;
    }

    agregarAlCarrito(modalCantidad.producto, gramos);
    cerrarModalCantidad();
  };

  const eliminarDelCarrito = (id_producto: number) => {
    setCarrito(carrito.filter(item => item.id_producto !== id_producto));
  };

  const actualizarCantidad = (id_producto: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id_producto);
      return;
    }

    setCarrito(carrito.map(item =>
      item.id_producto === id_producto
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const formatearPrecio = (precio: number) => {
    return `$${precio.toFixed(2)}`;
  };

  const obtenerItemEnCarrito = (id_producto: number): ItemCarrito | undefined => {
    return carrito.find(item => item.id_producto === id_producto);
  };

  if (loading) {
    return (
      <div className="cliente-loading">
        <div className="cliente-loading-content">
          <div className="cliente-loading-spinner" />
          <p className="cliente-loading-text">
            Cargando productos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cliente-page">
      {/* Header moderno */}
      <header className="cliente-header">
        <div className="cliente-header-content">
          <div className="cliente-header-logo">
            <div className="cliente-header-icon">
              🛍️
            </div>
            <h1 className="cliente-header-title">
              CHAÑAR
            </h1>
          </div>

          <button
            onClick={() => setMostrarCarrito(!mostrarCarrito)}
            className="cliente-header-cart-btn"
          >
            <span className="cliente-header-cart-icon">🛒</span>
            Carrito
            {carrito.length > 0 && (
              <span className="cliente-header-cart-badge">
                {carrito.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="cliente-main-content">
        {/* Buscador moderno */}
        <div className="cliente-search-container">
          <div className="cliente-search-icon">
            🔍
          </div>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="cliente-search-input"
          />
        </div>

        {/* Grid de productos modernizado */}
        <div className="cliente-products-grid">
          {productosFiltrados.map(producto => (
            <div key={producto.id_producto} className="cliente-product-card">
              {/* Imagen del producto con overlay */}
              <div className="cliente-product-image-container">
                {producto.imagen_path ? (
                  <img
                    src={getProductImageUrl(producto.imagen_path) || undefined}
                    alt={producto.nombre}
                    className="cliente-product-image"
                  />
                ) : (
                  <div className="cliente-product-image-placeholder">
                    📦
                  </div>
                )}
                
              </div>

              {/* Contenido */}
              <div className="cliente-product-content">
                <div className="cliente-product-info">
                <h3 className="cliente-product-title">
                  {producto.nombre}
                </h3>

                {producto.descripcion && (
                  <p className="cliente-product-description">
                    {producto.descripcion}
                  </p>
                )}

                <div className="cliente-product-price-container">
                  <div className="cliente-product-price">
                    {producto.id_unidad_medida === 1
                      ? `${formatearPrecio(producto.precioventa * 100)}`
                      : formatearPrecio(producto.precioventa)
                    }
                  </div>
                  {producto.id_unidad_medida === 1 && (
                    <span className="cliente-product-price-unit">
                      x 100gr
                    </span>
                  )}
                </div>
                </div>

                {/* Botón de agregar o controles de cantidad */}
                {(() => {
                  const itemEnCarrito = obtenerItemEnCarrito(producto.id_producto);
                  
                  if (itemEnCarrito) {
                    // Mostrar controles + y -
                    return (
                      <div className="cliente-product-quantity-controls">
                        <button
                          onClick={() => actualizarCantidad(
                            producto.id_producto,
                            itemEnCarrito.cantidad - (producto.id_unidad_medida === 1 ? 10 : 1)
                          )}
                          className="cliente-product-quantity-btn"
                        >
                          −
                        </button>
                        
                        <span className="cliente-product-quantity-display">
                          {producto.id_unidad_medida === 1
                            ? `${Math.round(itemEnCarrito.cantidad)}gr`
                            : `${itemEnCarrito.cantidad}`
                          }
                        </span>

                        <button
                          onClick={() => actualizarCantidad(
                            producto.id_producto,
                            itemEnCarrito.cantidad + (producto.id_unidad_medida === 1 ? 10 : 1)
                          )}
                          className="cliente-product-quantity-btn"
                        >
                          +
                        </button>
                      </div>
                    );
                  } else {
                    // Mostrar botón de agregar
                    return (
                      <button
                        onClick={() => manejarAgregarProducto(producto)}
                        disabled={producto.stock <= 0}
                        className={`cliente-product-add-btn ${producto.stock > 0 ? 'available' : 'unavailable'}`}
                      >
                        {producto.stock > 0 ? '+ Agregar al carrito' : 'Sin stock'}
                      </button>
                    );
                  }
                })()}
              </div>
            </div>
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <div className="cliente-empty-state">
            <div className="cliente-empty-state-icon">🔍</div>
            <p className="cliente-empty-state-text">
              No se encontraron productos
            </p>
          </div>
        )}
      </div>

      {/* Modal cantidad en gramos - modernizado */}
      {modalCantidad.isOpen && modalCantidad.producto && (
        <div onClick={cerrarModalCantidad} className="cliente-modal-overlay">
          <div onClick={(e) => e.stopPropagation()} className="cliente-modal-content">
            <h2 className="cliente-modal-title">
              {modalCantidad.producto.nombre}
            </h2>

            <p className="cliente-modal-subtitle">
              Precio: {formatearPrecio(modalCantidad.producto.precioventa * 100)} x 100gr
            </p>

            <div className="cliente-modal-form-group">
              <label className="cliente-modal-label">
                Cantidad en gramos:
              </label>
              <input
                type="number"
                value={cantidadGramos}
                onChange={(e) => setCantidadGramos(e.target.value)}
                placeholder="Ej: 250"
                min="1"
                className="cliente-modal-input"
                autoFocus
              />
            </div>

            {cantidadGramos && !isNaN(parseFloat(cantidadGramos)) && (
              <div className="cliente-modal-total-box">
                <span className="cliente-modal-total-label">
                  Total:
                </span>
                <span className="cliente-modal-total-value">
                  {formatearPrecio(parseFloat(cantidadGramos) * modalCantidad.producto.precioventa)}
                </span>
              </div>
            )}

            <div className="cliente-modal-actions">
              <button onClick={cerrarModalCantidad} className="cliente-modal-btn cancel">
                Cancelar
              </button>
              <button onClick={confirmarCantidadGramos} className="cliente-modal-btn confirm">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel lateral del carrito - modernizado */}
      {mostrarCarrito && (
        <>
          {/* Overlay */}
          <div onClick={() => setMostrarCarrito(false)} className="cliente-cart-overlay" />

          {/* Panel del carrito */}
          <div className="cliente-cart-panel">
            {/* Header del carrito */}
            <div className="cliente-cart-header">
              <div className="cliente-cart-header-info">
                <h2>Mi Carrito</h2>
                <p>
                  {carrito.length} {carrito.length === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              <button onClick={() => setMostrarCarrito(false)} className="cliente-cart-close-btn">
                <span>x</span>
              </button>
            </div>

            {/* Items del carrito */}
            <div className="cliente-cart-items">
              {carrito.length === 0 ? (
                <div className="cliente-cart-empty">
                  <div className="cliente-cart-empty-icon">🛒</div>
                  <p className="cliente-cart-empty-text">
                    Tu carrito está vacío
                  </p>
                </div>
              ) : (
                <div className="cliente-cart-items-list">
                  {carrito.map(item => (
                    <div key={item.id_producto} className="cliente-cart-item">
                      <div className="cliente-cart-item-header">
                        <h3 className="cliente-cart-item-title">
                          {item.nombre}
                        </h3>
                        <button onClick={() => eliminarDelCarrito(item.id_producto)} className="cliente-cart-item-delete">
                          🗑️
                        </button>
                      </div>

                      <div className="cliente-cart-item-footer">
                        {/* Controles de cantidad */}
                        <div className="cliente-cart-item-controls">
                          <button
                            onClick={() => actualizarCantidad(item.id_producto, item.cantidad - (item.unidadMedidaId === 1 ? 10 : 1))}
                            className="cliente-cart-item-btn"
                          >
                            −
                          </button>
                          
                          <span className="cliente-cart-item-quantity">
                            {item.unidadMedidaId === 1
                              ? `${Math.round(item.cantidad)}gr`
                              : `${item.cantidad} un`
                            }
                          </span>

                          <button
                            onClick={() => actualizarCantidad(item.id_producto, item.cantidad + (item.unidadMedidaId === 1 ? 10 : 1))}
                            className="cliente-cart-item-btn"
                          >
                            +
                          </button>
                        </div>

                        {/* Precio */}
                        <div className="cliente-cart-item-price">
                          {formatearPrecio(item.precio * item.cantidad)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer del carrito */}
            {carrito.length > 0 && (
              <div className="cliente-cart-footer">
                <div className="cliente-cart-total">
                  <span className="cliente-cart-total-label">
                    Total:
                  </span>
                  <span className="cliente-cart-total-value">
                    {formatearPrecio(calcularTotal())}
                  </span>
                </div>

                <div className="cliente-cart-actions">
                  <button onClick={vaciarCarrito} className="cliente-cart-clear-btn">
                    Vaciar carrito
                  </button>

                  <button
                    onClick={() => alert('Funcionalidad de checkout en desarrollo')}
                    className="cliente-cart-checkout-btn"
                  >
                    Finalizar compra 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
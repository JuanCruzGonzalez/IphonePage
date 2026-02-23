import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useCarrito } from './context/CarritoContext';
import { CarritoPanel } from './components/CarritoPanel';
import { DatosClienteModal } from './components/DatosClienteModal';
import { formatPrice } from '../../shared/utils';
import logo from '../../assets/log.png';
import './ClientePage.new.css';

export const TiendaLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    carrito,
    modalCantidad,
    cantidadGramos,
    modalDatosCliente,
    setCantidadGramos,
    toggleMostrarCarrito,
    cerrarModalCantidad,
    confirmarCantidadGramos,
    cerrarModalDatosCliente,
    confirmarPedidoCliente,
  } = useCarrito();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="modern-cliente-page">
      {/* Header */}
      <header className="modern-header">
        <div className="modern-header-container">
          {/* Logo */}
          <div className="modern-header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="Iphone Store Logo" style={{ width: '100px', height: 'auto' }} />
          </div>

          {/* Navegación */}
          <nav className="modern-header-nav">
            <Link
              to="/"
              className={`modern-header-nav-link ${isActive('/') && !isActive('/productos') && !isActive('/promociones') && !isActive('/producto') ? 'active' : ''}`}
            >
              Inicio
            </Link>
            <Link
              to="/productos"
              className={`modern-header-nav-link ${isActive('/productos') ? 'active' : ''}`}
            >
              Productos
            </Link>
            <Link
              to="/promociones"
              className={`modern-header-nav-link ${isActive('/promociones') ? 'active' : ''}`}
            >
              Promociones
            </Link>
          </nav>

          {/* Buscador */}
          <div className="modern-header-search">
            <svg className="modern-header-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Buscar productos..."
              className="modern-header-search-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  navigate(`/productos${value ? `?q=${encodeURIComponent(value)}` : ''}`);
                }
              }}
            />
          </div>

          {/* Acciones */}
          <div className="modern-header-actions">
            <button onClick={toggleMostrarCarrito} className="modern-header-cart-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3L2.26491 3.0883C3.58495 3.52832 4.24497 3.74832 4.62248 4.2721C5 4.79587 5 5.49159 5 6.88304V9.5C5 12.3284 5 13.7426 5.87868 14.6213C6.75736 15.5 8.17157 15.5 11 15.5H19"></path>
                <path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"></path>
                <path d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"></path>
                <path d="M5 6H16.4504C18.5054 6 19.5328 6 19.9775 6.67426C20.4221 7.34853 20.0173 8.29294 19.2078 10.1818L18.7792 11.1818C18.4013 12.0636 18.2123 12.5045 17.8366 12.7523C17.4609 13 16.9812 13 16.0218 13H5"></path>
              </svg>
              {carrito.length > 0 && (
                <span className="modern-header-cart-badge">{carrito.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Contenido de la ruta hija */}
      <Outlet />

      {/* Modal cantidad en gramos */}
      {modalCantidad.isOpen && modalCantidad.producto && (
        <div onClick={cerrarModalCantidad} className="modern-modal-overlay">
          <div onClick={(e) => e.stopPropagation()} className="modern-modal">
            <h2 className="modern-modal-title">{modalCantidad.producto.nombre}</h2>
            <p className="modern-modal-subtitle">
              Precio: {formatPrice(modalCantidad.producto.precioventa * 100)} x 100gr
            </p>
            <div className="modern-modal-input-group">
              <label className="modern-modal-label">Cantidad en gramos:</label>
              <input
                type="number"
                value={cantidadGramos}
                onChange={(e) => setCantidadGramos(e.target.value)}
                placeholder="Ej: 250"
                min="1"
                className="modern-modal-input"
                autoFocus
              />
            </div>
            {cantidadGramos && !isNaN(parseFloat(cantidadGramos)) && (
              <div className="modern-modal-total">
                <span>Total:</span>
                <span className="modern-modal-total-value">
                  {formatPrice(parseFloat(cantidadGramos) * modalCantidad.producto.precioventa)}
                </span>
              </div>
            )}
            <div className="modern-modal-actions">
              <button onClick={cerrarModalCantidad} className="modern-modal-btn cancel">
                Cancelar
              </button>
              <button onClick={confirmarCantidadGramos} className="modern-modal-btn confirm">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carrito Panel */}
      <CarritoPanel />

      {/* Modal de datos de cliente */}
      <DatosClienteModal
        isOpen={modalDatosCliente}
        onClose={cerrarModalDatosCliente}
        onConfirm={confirmarPedidoCliente}
      />
    </div>
  );
};

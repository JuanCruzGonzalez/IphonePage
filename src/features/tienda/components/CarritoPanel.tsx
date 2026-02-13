import React from 'react';

export interface ItemCarrito {
  id: string; // Identificador único: "producto-{id}" o "promocion-{id}"
  tipo: 'producto' | 'promocion';
  id_referencia: number; // id_producto o id_promocion
  nombre: string;
  precio: number;
  cantidad: number;
  unidadMedidaId?: number;
  unidadMedidaNombre?: string;
}

interface CarritoPanelProps {
  carrito: ItemCarrito[];
  mostrarCarrito: boolean;
  onClose: () => void;
  onEliminar: (id: string) => void;
  onActualizarCantidad: (id: string, nuevaCantidad: number) => void;
  onVaciar: () => void;
  onEnviarWhatsApp: () => void;
}

export const CarritoPanel: React.FC<CarritoPanelProps> = ({
  carrito,
  mostrarCarrito,
  onClose,
  onEliminar,
  onActualizarCantidad,
  onVaciar,
  onEnviarWhatsApp,
}) => {
  const formatearPrecio = (precio: number) => `$${precio.toFixed(2)}`;

  const calcularTotal = () =>
    carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  if (!mostrarCarrito) return null;

  return (
    <>
      <div className="home-cart-overlay" onClick={onClose} />
      <div className="home-cart-panel">
        <div className="home-cart-header">
          <div>
            <h2>Mi Carrito</h2>
            <p>{carrito.length} {carrito.length === 1 ? 'producto' : 'productos'}</p>
          </div>
          <button className="home-cart-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="home-cart-items">
          {carrito.length === 0 ? (
            <div className="home-cart-empty">
              <div className="home-cart-empty-icon">🛒</div>
              <p className="home-cart-empty-text">Tu carrito está vacío</p>
            </div>
          ) : (
            carrito.map(item => {
              const esProductoPorPeso = item.unidadMedidaId === 1;
              const incremento = esProductoPorPeso ? 10 : 1;
              
              return (
                <div key={item.id} className="home-cart-item">
                  <div className="home-cart-item-header">
                    <div>
                      <h3 className="home-cart-item-title">{item.nombre}</h3>
                      {item.tipo === 'promocion' && (
                        <span className="home-cart-item-badge">Promoción</span>
                      )}
                    </div>
                    <button className="home-cart-item-delete" onClick={() => onEliminar(item.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                  <div className="home-cart-item-footer">
                    <div className="home-cart-item-controls">
                      <button
                        className="home-cart-item-btn"
                        onClick={() => onActualizarCantidad(item.id, item.cantidad - incremento)}
                      >
                        −
                      </button>
                      <span className="home-cart-item-quantity">
                        {esProductoPorPeso
                          ? `${Math.round(item.cantidad)}gr`
                          : item.tipo === 'promocion'
                          ? `${item.cantidad} un`
                          : item.unidadMedidaNombre
                          ? `${item.cantidad} ${item.unidadMedidaNombre}`
                          : `${item.cantidad} un`
                        }
                      </span>
                      <button
                        className="home-cart-item-btn"
                        onClick={() => onActualizarCantidad(item.id, item.cantidad + incremento)}
                      >
                        +
                      </button>
                    </div>
                    <div className="home-cart-item-price">
                      {formatearPrecio(item.precio * item.cantidad)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {carrito.length > 0 && (
          <div className="home-cart-footer">
            <div className="home-cart-total">
              <span className="home-cart-total-label">Total:</span>
              <span className="home-cart-total-value">{formatearPrecio(calcularTotal())}</span>
            </div>
            <div className="home-cart-actions">
              <button className="home-cart-checkout-btn" onClick={onEnviarWhatsApp}>
                Hacer pedido por WhatsApp
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.6 6.32A7.85 7.85 0 0012 4a7.94 7.94 0 00-6.88 11.89L4 20l4.2-1.1a7.93 7.93 0 003.79.97 7.95 7.95 0 007.99-7.93 7.87 7.87 0 00-2.38-5.62zM12 18.53a6.58 6.58 0 01-3.36-.92l-.24-.14-2.49.66.66-2.43-.16-.25a6.6 6.6 0 0110.09-8.47 6.53 6.53 0 012 4.66 6.6 6.6 0 01-6.5 6.89z"/>
                </svg>
              </button>
              <button className="home-cart-clear-btn" onClick={onVaciar}>
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

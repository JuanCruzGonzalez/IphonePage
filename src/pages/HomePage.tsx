import React, { useState } from 'react';
import { Producto, Promocion } from '../types';
import { ClienteProductos } from '../components/ClienteProductos';
import { ClientePromociones } from '../components/ClientePromociones';
import { CarritoPanel, ItemCarrito } from '../components/CarritoPanel';
import './HomePage.css';

type VistaActiva = 'productos' | 'promociones';

export const HomePage: React.FC = () => {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('productos');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Funciones de Carrito
  const agregarProductoAlCarrito = (producto: Producto, cantidad: number = 1) => {
    const id = `producto-${producto.id_producto}`;
    const itemExistente = carrito.find(item => item.id === id);
    const precioUsar = (producto.promocion_activa && producto.precio_promocion != null)
      ? producto.precio_promocion
      : producto.precioventa;

    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.id === id
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        id,
        tipo: 'producto' as const,
        id_referencia: producto.id_producto,
        nombre: producto.nombre,
        precio: precioUsar,
        cantidad,
        unidadMedidaId: producto.id_unidad_medida,
        unidadMedidaNombre: producto.unidad_medida?.abreviacion || '',
      }]);
    }
  };

  const agregarPromocionAlCarrito = (promocion: Promocion, cantidad: number = 1) => {
    const id = `promocion-${promocion.id_promocion}`;
    const itemExistente = carrito.find(item => item.id === id);
    const precio = promocion.precio || 0;

    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.id === id
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        id,
        tipo: 'promocion' as const,
        id_referencia: promocion.id_promocion,
        nombre: promocion.name,
        precio,
        cantidad,
      }]);
    }
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const actualizarCantidad = (id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    setCarrito(carrito.map(item =>
      item.id === id
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const vaciarCarrito = () => setCarrito([]);

  const formatearPrecio = (precio: number) => `$${precio.toFixed(2)}`;

  const calcularTotal = () =>
    carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  const enviarPedidoWhatsApp = () => {
    const numeroWhatsApp = '5492616166624';
    let mensaje = 'Hola Chañar, quería hacer el siguiente pedido:\n\n';
    carrito.forEach(item => {
      let cantidad = '';
      if (item.tipo === 'promocion') {
        cantidad = `${item.cantidad} un`;
      } else if (item.unidadMedidaId === 1) {
        cantidad = `${Math.round(item.cantidad)}gr`;
      } else {
        cantidad = `${item.cantidad} ${item.unidadMedidaNombre || 'un'}`;
      }
      const tipo = item.tipo === 'promocion' ? '🎁 ' : '';
      mensaje += `${tipo}• ${item.nombre}: ${cantidad} - ${formatearPrecio(item.precio * item.cantidad)}\n`;
    });
    mensaje += `\n*Total: ${formatearPrecio(calcularTotal())}*`;
    const mensajeCodificado = encodeURIComponent(mensaje);
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`, '_blank');
  };

  // --- RENDER ---
  return (
    <div className="home-page">
      {/* ===== HEADER ===== */}
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-header-logo">
            <div className="home-header-logo-icon">
              <img src="/logo.png" alt="Chañar" />
            </div>
            <span className="home-header-logo-text">Chañar</span>
          </div>

          <nav className="home-header-nav">
            <button 
              className={`home-header-nav-link ${vistaActiva === 'productos' ? 'active' : ''}`}
              onClick={() => setVistaActiva('productos')}
            >
              Productos
            </button>
            <button 
              className={`home-header-nav-link ${vistaActiva === 'promociones' ? 'active' : ''}`}
              onClick={() => setVistaActiva('promociones')}
            >
              Promociones
            </button>
          </nav>

          <div className="home-header-search">
            <span className="home-header-search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="home-header-search-input"
            />
          </div>

          <div className="home-header-actions">
            <button
              className="home-header-action-btn"
              onClick={() => setMostrarCarrito(!mostrarCarrito)}
              title="Carrito"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {carrito.length > 0 && (
                <span className="home-header-cart-badge">{carrito.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== BREADCRUMB ===== */}
      <div className="home-breadcrumb">
        <span className="home-breadcrumb-link">Inicio</span>
        <span className="home-breadcrumb-separator">›</span>
        <span className="home-breadcrumb-current">
          {vistaActiva === 'productos' ? 'Productos' : 'Promociones'}
        </span>
      </div>

      {/* ===== CONTENIDO DINÁMICO ===== */}
      {vistaActiva === 'productos' ? (
        <ClienteProductos
          carrito={carrito}
          agregarAlCarrito={agregarProductoAlCarrito}
          actualizarCantidad={actualizarCantidad}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
        />
      ) : (
        <ClientePromociones
          busqueda={busqueda}
          agregarPromocionAlCarrito={agregarPromocionAlCarrito}
        />
      )}

      {/* ===== FOOTER ===== */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <div className="home-footer-logo">
              <div className="home-footer-logo-icon">
                <img src="/logo.png" alt="Chañar" />
              </div>
              <span className="home-footer-logo-text">Chañar</span>
            </div>
            <p className="home-footer-description">
              Los mejores productos naturales y saludables, directo a tu puerta. Calidad y frescura en cada pedido.
            </p>
            <div className="home-footer-social">
              <a href="https://www.instagram.com/ch_espacionatural/" className="home-footer-social-link" title="Instagram" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://wa.me/5491134567890" className="home-footer-social-link" title="WhatsApp" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.6 6.32A7.85 7.85 0 0012 4a7.94 7.94 0 00-6.88 11.89L4 20l4.2-1.1a7.93 7.93 0 003.79.97 7.95 7.95 0 007.99-7.93 7.87 7.87 0 00-2.38-5.62zM12 18.53a6.58 6.58 0 01-3.36-.92l-.24-.14-2.49.66.66-2.43-.16-.25a6.6 6.6 0 0110.09-8.47 6.53 6.53 0 012 4.66 6.6 6.6 0 01-6.5 6.89zm3.61-4.94c-.2-.1-1.17-.58-1.35-.64-.18-.06-.32-.1-.45.1a11.17 11.17 0 01-.63.77c-.12.14-.23.15-.43 0a5.43 5.43 0 01-1.6-1A6 6 0 019.64 11.5c-.14-.24.02-.36.11-.48l.33-.38c.1-.12.14-.2.2-.34.07-.13.04-.25-.01-.35-.05-.1-.45-.97-.62-1.33-.16-.36-.33-.3-.45-.31h-.39a.75.75 0 00-.53.25 2.24 2.24 0 00-.7 1.66c.06.75.34 1.48.81 2.05a8.07 8.07 0 003.5 2.75c1.76.68 1.76.45 2.08.42a2.05 2.05 0 001.35-1a1.64 1.64 0 00.11-.95c-.08-.1-.22-.15-.42-.25z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="home-footer-links">
            <div className="home-footer-col">
              <h4>Tienda</h4>
              <ul>
                <li><a href="#">Todos los Productos</a></li>
                <li><a href="#">Ofertas</a></li>
                <li><a href="#">Novedades</a></li>
              </ul>
            </div>
            <div className="home-footer-col">
              <h4>Empresa</h4>
              <ul>
                <li><a href="#">Nuestra Historia</a></li>
                <li><a href="#">Contacto</a></li>
              </ul>
            </div>
            <div className="home-footer-col">
              <h4>Soporte</h4>
              <ul>
                <li><a href="#">Envíos</a></li>
                <li><a href="#">Preguntas Frecuentes</a></li>
                <li><a href="#">Política de Privacidad</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="home-footer-bottom">
          © {new Date().getFullYear()} Chañar. Todos los derechos reservados.
        </div>
      </footer>

      {/* ===== CARRITO PANEL ===== */}
      <CarritoPanel
        carrito={carrito}
        mostrarCarrito={mostrarCarrito}
        onClose={() => setMostrarCarrito(false)}
        onEliminar={eliminarDelCarrito}
        onActualizarCantidad={actualizarCantidad}
        onVaciar={vaciarCarrito}
        onEnviarWhatsApp={enviarPedidoWhatsApp}
      />
    </div>
  );
};

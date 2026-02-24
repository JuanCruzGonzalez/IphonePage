import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Producto, Categoria } from '../../core/types';
import { getProductosActivos } from '../productos/services/productoService';
import { getCategoriasActivas } from '../categorias/services/categoriaService';
import { ProductImageSlider } from './components/ProductImageSlider';
import { ProductosDestacadosSlider } from './components/ProductosDestacadosSlider';
import { useProductosDestacados } from './hooks/useProductosDestacados';
import { formatPrice } from '../../shared/utils';
import { useCarrito } from './context/CarritoContext';
import prueba from '../../assets/prueba.webp';
import './ClientePage.new.css';

export const ClientePage: React.FC = () => {
  const {
    obtenerItemEnCarrito,
    actualizarCantidad,
    manejarAgregarProducto,
  } = useCarrito();

  const navigate = useNavigate();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await getProductosActivos();
      setProductos(data);
      const categs = await getCategoriasActivas();
      setCategorias(categs);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Productos destacados desde hook compartido
  const { productosDestacados } = useProductosDestacados();

  // Obtener accesorios (productos donde accesorio === true)
  const productosAccesorios = useMemo(() => {
    return productos
      .filter(p => p.accesorio === true && p.stock > 0)
      .slice(0, 8);
  }, [productos]);

  const handleCategoriaClick = (id_categoria: number) => {
    navigate(`/telefonos?cat=${id_categoria}`);
  };

  const handleVerCatalogo = () => {
    navigate('/telefonos');
  };

  const handleVerDetalleProducto = (producto: Producto) => {
    navigate(`/producto/${producto.id_producto}`);
  };

  if (loading) {
    return (
      <div className="modern-loading">
        <div className="modern-loading-spinner"></div>
        <p className="modern-loading-text">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="modern-home">
      {/* Hero Section */}
      <section className="modern-hero">
        <div className="modern-hero-container">
          <div className="modern-hero-content">
            <span className="modern-hero-badge">NUEVA COLECCIÓN 2025</span>
            <h2 className="modern-hero-title">
              Productos de calidad<br />a tu alcance.
            </h2>
            <p className="modern-hero-description">
              Encuentra los mejores productos con garantía oficial.<br />
              Stock actualizado y precios competitivos.
            </p>
            <div className="modern-hero-actions">
              <button onClick={handleVerCatalogo} className="modern-hero-btn primary">
                Ver Catálogo
              </button>
              <button onClick={() => navigate('/promociones')} className="modern-hero-btn secondary">
                Ver Promociones
              </button>
            </div>
          </div>
          <div className="modern-hero-image">
            <img src={prueba} alt="Productos" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="modern-features">
        <div className="modern-features-container">
          <div className="modern-feature-card">
            <div className="modern-feature-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 className="modern-feature-title">Stock Actualizado</h3>
            <p className="modern-feature-description">
              Inventario actualizado en tiempo real.
            </p>
          </div>
          <div className="modern-feature-card">
            <div className="modern-feature-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 className="modern-feature-title">Pedidos Rápidos</h3>
            <p className="modern-feature-description">
              Realiza tu pedido por WhatsApp al instante.
            </p>
          </div>
          <div className="modern-feature-card">
            <div className="modern-feature-icon purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className="modern-feature-title">Garantía Incluida</h3>
            <p className="modern-feature-description">
              Todos nuestros productos con garantía.
            </p>
          </div>
        </div>
      </section>

      {/* Destacados de la semana */}
      {productosDestacados.length > 0 && (
        <section className="modern-featured">
          <div className="modern-featured-container">
            <div className="modern-featured-header">
              <h2 className="modern-featured-title">Destacados de la semana</h2>
              <button onClick={handleVerCatalogo} className="modern-featured-link">
                Ver todo →
              </button>
            </div>
            <ProductosDestacadosSlider
              productos={productosDestacados}
              obtenerItemEnCarrito={obtenerItemEnCarrito}
              actualizarCantidad={actualizarCantidad}
              manejarAgregarProducto={manejarAgregarProducto}
              onVerDetalle={handleVerDetalleProducto}
            />
          </div>
        </section>
      )}

      {/* Sección de Accesorios */}
      {productosAccesorios.length > 0 && (
        <section className="modern-accessories">
          <div className="modern-accessories-container">
            <div className="modern-accessories-header">
              <h2 className="modern-accessories-title">Accesorios</h2>
              <p className="modern-accessories-subtitle">Complementa tu compra con los mejores accesorios</p>
            </div>
            <div className="modern-accessories-grid">
              {productosAccesorios.map(producto => (
                <div key={producto.id_producto} className="modern-accessory-card">
                  <div
                    className="modern-accessory-image"
                    onClick={() => handleVerDetalleProducto(producto)}
                    style={{ cursor: 'pointer' }}
                  >
                    <ProductImageSlider
                      imagenes={producto.imagenes || []}
                      nombreProducto={producto.nombre}
                      hasPromo={producto.promocion_activa && producto.precio_promocion != null}
                    />
                  </div>
                  <div className="modern-accessory-content">
                    <h3
                      className="modern-accessory-name"
                      onClick={() => handleVerDetalleProducto(producto)}
                      style={{ cursor: 'pointer' }}
                    >
                      {producto.nombre}
                    </h3>
                    <div className="modern-accessory-footer">
                      <div className="modern-accessory-pricing">
                        {producto.promocion_activa && producto.precio_promocion != null ? (
                          <>
                            <span className="modern-accessory-old-price">
                              {formatPrice(producto.precioventa)}
                            </span>
                            <span className="modern-accessory-price promo">
                              {formatPrice(producto.precio_promocion)}
                            </span>
                          </>
                        ) : (
                          <span className="modern-accessory-price">
                            {formatPrice(producto.precioventa)}
                          </span>
                        )}
                      </div>
                      {obtenerItemEnCarrito(producto.id_producto) ? (
                        <div className="modern-accessory-quantity">
                          <button
                            onClick={() => actualizarCantidad(
                              `producto-${producto.id_producto}`,
                              obtenerItemEnCarrito(producto.id_producto)!.cantidad - 1
                            )}
                            className="modern-quantity-btn mini">−</button>
                          <span className="modern-quantity-value mini">
                            {obtenerItemEnCarrito(producto.id_producto)!.cantidad}
                          </span>
                          <button
                            onClick={() => actualizarCantidad(
                              `producto-${producto.id_producto}`,
                              obtenerItemEnCarrito(producto.id_producto)!.cantidad + 1
                            )}
                            className="modern-quantity-btn mini">+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => manejarAgregarProducto(producto)}
                          disabled={producto.stock <= 0}
                          className="modern-add-btn mini">
                          Añadir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Navegar por Categoría */}
      {categorias.length > 0 && (
        <section className="modern-categories">
          <div className="modern-categories-container">
            <h2 className="modern-categories-title">Navegar por Categoría</h2>
            <div className="modern-categories-grid">
              {categorias.slice(0, 7).map(categoria => (
                <button
                  key={categoria.id_categoria}
                  onClick={() => handleCategoriaClick(categoria.id_categoria)}
                  className="modern-category-btn">
                  {categoria.nombre}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer con Garantías */}
      <section className="modern-guarantees">
        <div className="modern-guarantees-container">
          <div className="modern-guarantee-card">
            <div className="modern-guarantee-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className="modern-guarantee-title">Garantía de 12 Meses</h3>
            <p className="modern-guarantee-description">
              Todos nuestros productos incluyen garantía completa contra defectos.
            </p>
          </div>
          <div className="modern-guarantee-card">
            <div className="modern-guarantee-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <h3 className="modern-guarantee-title">Envío Gratis</h3>
            <p className="modern-guarantee-description">
              Envíos asegurados a todo el país en pedidos mayores a $50.
            </p>
          </div>
          <div className="modern-guarantee-card">
            <div className="modern-guarantee-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <h3 className="modern-guarantee-title">Pago Seguro</h3>
            <p className="modern-guarantee-description">
              Aceptamos todas las tarjetas de crédito y débito con máxima seguridad.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
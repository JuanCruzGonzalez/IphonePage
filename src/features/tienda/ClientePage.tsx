import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Producto } from '../../core/types';
import { getProductosActivos } from '../productos/services/productoService';
import { ProductImageSlider } from './components/ProductImageSlider';
import { ProductosDestacadosSlider } from './components/ProductosDestacadosSlider';
import { useProductosDestacados } from './hooks/useProductosDestacados';
import { formatPrice, generateProductUrl } from '../../shared/utils';
import { useCarrito } from './context/CarritoContext';
import prueba from '../../assets/prueba.webp';
import cel1 from '../../assets/D_NQ_NP_2X_605126-MLM51559383638_092022-T.webp';
import cel2 from '../../assets/8e4bb8815212cc66c9afe539f837.jpg';
import cel3 from '../../assets/15.jpg';
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

  // Productos destacados desde hook compartido
  const { productosDestacados } = useProductosDestacados();

  // Obtener accesorios (productos donde accesorio === true)
  const productosAccesorios = useMemo(() => {
    return productos
      .filter(p => p.accesorio === true && p.stock > 0)
      .slice(0, 8);
  }, [productos]);

  const handleVerCatalogo = () => {
    navigate('/telefonos');
  };

  const handleVerDetalleProducto = (producto: Producto) => {
    const productUrl = generateProductUrl(producto.id_producto, producto.nombre);
    navigate(`/producto/${productUrl}`);
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
          <Link to="/telefonos?condicion=nuevo" className="modern-feature-card">
            <div className="modern-feature-icon blue">
              <img src={cel1} alt="Productos" style={{ maxHeight: 190 }} />
            </div>
            <h3 className="modern-feature-title">Nuevos</h3>
            <p className="modern-feature-description">
              Productos nuevos y sellados
            </p>
          </Link>
          <Link to="/telefonos?condicion=usado_premium" className="modern-feature-card">
            <div className="modern-feature-icon green">
              <img src={cel2} alt="Productos" style={{ maxHeight: 190 }} />
            </div>
            <h3 className="modern-feature-title">Usados Premium</h3>
            <p className="modern-feature-description">
              Productos usados en excelente estado
            </p>
          </Link>
          <Link to="/telefonos?condicion=usado" className="modern-feature-card">
            <div className="modern-feature-icon purple">
              <img src={cel3} alt="Productos" style={{ maxHeight: 190 }} />
            </div>
            <h3 className="modern-feature-title">Usados</h3>
            <p className="modern-feature-description">
              Dispositivos usados
            </p>
          </Link>
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
      {/* {categorias.length > 0 && (
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
      )} */}

      {/* Footer con Garantías */}
      <section className="modern-guarantees">
        <div className="modern-guarantees-container">
          <div className="modern-guarantee-card">
            <div className="modern-guarantee-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className="modern-guarantee-title">Garantía Oficial de Apple</h3>
            <p className="modern-guarantee-description">
              Todos nuestros productos incluyen garantía oficial.
            </p>
          </div>
          <div className="modern-guarantee-card">
            <div className="modern-guarantee-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C11.3953 1.25 10.8384 1.40029 10.2288 1.65242C9.64008 1.89588 8.95633 2.25471 8.1049 2.70153L6.03739 3.78651C4.99242 4.33487 4.15616 4.77371 3.51047 5.20491C2.84154 5.65164 2.32632 6.12201 1.95112 6.75918C1.57718 7.39421 1.40896 8.08184 1.32829 8.90072C1.24999 9.69558 1.24999 10.6731 1.25 11.9026V12.0974C1.24999 13.3268 1.24999 14.3044 1.32829 15.0993C1.40896 15.9182 1.57718 16.6058 1.95112 17.2408C2.32632 17.878 2.84154 18.3484 3.51047 18.7951C4.15616 19.2263 4.99241 19.6651 6.03737 20.2135L8.10481 21.2984C8.95628 21.7453 9.64006 22.1041 10.2288 22.3476C10.8384 22.5997 11.3953 22.75 12 22.75C12.6047 22.75 13.1616 22.5997 13.7712 22.3476C14.3599 22.1041 15.0437 21.7453 15.8951 21.2985L17.9626 20.2135C19.0076 19.6651 19.8438 19.2263 20.4895 18.7951C21.1585 18.3484 21.6737 17.878 22.0489 17.2408C22.4228 16.6058 22.591 15.9182 22.6717 15.0993C22.75 14.3044 22.75 13.3269 22.75 12.0975V11.9025C22.75 10.6731 22.75 9.69557 22.6717 8.90072C22.591 8.08184 22.4228 7.39421 22.0489 6.75918C21.6737 6.12201 21.1585 5.65164 20.4895 5.20491C19.8438 4.77371 19.0076 4.33487 17.9626 3.7865L15.8951 2.70154C15.0437 2.25472 14.3599 1.89589 13.7712 1.65242C13.1616 1.40029 12.6047 1.25 12 1.25ZM8.7708 4.04608C9.66052 3.57917 10.284 3.2528 10.802 3.03856C11.3062 2.83004 11.6605 2.75 12 2.75C12.3395 2.75 12.6938 2.83004 13.198 3.03856C13.716 3.2528 14.3395 3.57917 15.2292 4.04608L17.2292 5.09563C18.3189 5.66748 19.0845 6.07032 19.6565 6.45232C19.9387 6.64078 20.1604 6.81578 20.3395 6.99174L17.0088 8.65708L8.50895 4.18349L8.7708 4.04608ZM6.94466 5.00439L6.7708 5.09563C5.68111 5.66747 4.91553 6.07032 4.34352 6.45232C4.06131 6.64078 3.83956 6.81578 3.66054 6.99174L12 11.1615L15.3572 9.48289L7.15069 5.16369C7.07096 5.12173 7.00191 5.06743 6.94466 5.00439ZM2.93768 8.30737C2.88718 8.52125 2.84901 8.76413 2.82106 9.04778C2.75084 9.7606 2.75 10.6644 2.75 11.9415V12.0585C2.75 13.3356 2.75084 14.2394 2.82106 14.9522C2.88974 15.6494 3.02022 16.1002 3.24367 16.4797C3.46587 16.857 3.78727 17.1762 4.34352 17.5477C4.91553 17.9297 5.68111 18.3325 6.7708 18.9044L8.7708 19.9539C9.66052 20.4208 10.284 20.7472 10.802 20.9614C10.9656 21.0291 11.1134 21.0832 11.25 21.1255V12.4635L2.93768 8.30737ZM12.75 21.1255C12.8866 21.0832 13.0344 21.0291 13.198 20.9614C13.716 20.7472 14.3395 20.4208 15.2292 19.9539L17.2292 18.9044C18.3189 18.3325 19.0845 17.9297 19.6565 17.5477C20.2127 17.1762 20.5341 16.857 20.7563 16.4797C20.9798 16.1002 21.1103 15.6494 21.1789 14.9522C21.2492 14.2394 21.25 13.3356 21.25 12.0585V11.9415C21.25 10.6644 21.2492 9.7606 21.1789 9.04778C21.151 8.76412 21.1128 8.52125 21.0623 8.30736L17.75 9.96352V13C17.75 13.4142 17.4142 13.75 17 13.75C16.5858 13.75 16.25 13.4142 16.25 13V10.7135L12.75 12.4635V21.1255Z" fill="#0066FF" />
              </svg>
            </div>
            <h3 className="modern-guarantee-title">Productos Originales</h3>
            <p className="modern-guarantee-description">
              Productos 100% originales, revisados y certificados.
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
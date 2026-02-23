import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Producto } from '../../core/types';
import { supabase } from '../../core/config/supabase';
import { formatPrice } from '../../shared/utils';
import { ProductDetailGallery } from './components/ProductDetailGallery';
import { ProductosDestacadosSlider } from './components/ProductosDestacadosSlider';
import { useCarrito } from './context/CarritoContext';
import { useProductosDestacados } from './hooks/useProductosDestacados';
import './ClientePage.new.css';

export const ProductoDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    manejarAgregarProducto,
    actualizarCantidad,
    obtenerItemEnCarrito,
  } = useCarrito();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  const { productosDestacados } = useProductosDestacados(
    producto?.id_producto
  );

  const handleVerDetalleProducto = (prod: Producto) => {
    navigate(`/tienda/producto/${prod.id_producto}`);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (id) {
      cargarProducto(parseInt(id));
    }
  }, [id]);

  const cargarProducto = async (idProducto: number) => {
    try {
      setLoading(true);

      const { data: prod, error } = await supabase
        .from('producto')
        .select('*')
        .eq('id_producto', idProducto)
        .eq('estado', true)
        .single();

      if (error || !prod) {
        navigate('/tienda');
        return;
      }

      const { data: imagenes } = await supabase
        .from('producto_imagen')
        .select('*')
        .eq('id_producto', idProducto)
        .order('orden', { ascending: true });

      const { data: promoData } = await supabase
        .from('detalle_promocion')
        .select(`
          cantidad,
          promocion:id_promocion (
            id_promocion,
            precio,
            estado
          )
        `)
        .eq('id_producto', idProducto);

      let precio_promocion: number | null = null;
      let promocion_activa = false;

      if (promoData && promoData.length > 0) {
        for (const dp of promoData) {
          const promo = dp.promocion as any;
          if (promo && promo.estado === true && promo.precio != null) {
            precio_promocion = promo.precio;
            promocion_activa = true;
            break;
          }
        }
      }

      setProducto({
        ...prod,
        imagenes: imagenes || [],
        precio_promocion,
        promocion_activa,
      });
    } catch (error) {
      console.error('Error al cargar producto:', error);
      navigate('/tienda');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate('/tienda/productos');
  };

  if (loading) {
    return (
      <div className="modern-loading">
        <div className="modern-loading-spinner"></div>
        <p className="modern-loading-text">Cargando producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="modern-loading">
        <p className="modern-loading-text">Producto no encontrado</p>
        <button onClick={handleVolver} className="pd-back" style={{ marginTop: 16 }}>
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="pd-page">
      <div className="pd-container">
        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <button onClick={handleVolver} className="pd-back">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M5 12L12 19M5 12L12 5"></path>
            </svg>
            Volver
          </button>
          <span className="pd-breadcrumb-text">
            <span onClick={() => navigate('/tienda')} style={{ cursor: 'pointer', color: '#3483fa' }}>Inicio</span>
            {' / '}
            <span onClick={handleVolver} style={{ cursor: 'pointer', color: '#3483fa' }}>Productos</span>
            {' / '}
            {producto.nombre}
          </span>
        </div>

        {/* Card principal */}
        <div className="pd-card">
          {/* Galería */}
          <div className="pd-gallery-col">
            <ProductDetailGallery
              imagenes={producto.imagenes || []}
              nombreProducto={producto.nombre}
            />
          </div>

          {/* Info */}
          <div className="pd-info-col">
            <h1 className="pd-title">{producto.nombre}</h1>

            {/* Badges */}
            <div className="pd-badges">
              <span className={producto.condicion === 'usado' ? 'pd-badge-used' : 'pd-badge-new'}>
                {producto.condicion === 'usado' ? 'Usado' : 'Nuevo'}
              </span>
              {producto.stock > 0 && (
                <span className="pd-badge-stock">En stock</span>
              )}
              {producto.promocion_activa && producto.precio_promocion && (
                <span className="pd-badge-promo">Oferta</span>
              )}
            </div>

            {/* Precio */}
            <div className="pd-pricing">
              {producto.promocion_activa && producto.precio_promocion != null ? (
                <>
                  <span className="pd-price">
                    {formatPrice(producto.precio_promocion)}
                  </span>
                  <div className="pd-price-old-row">
                    <span className="pd-old-price">
                      {formatPrice(producto.precioventa)}
                    </span>
                    <span className="pd-discount-badge">
                      Ahorrá {formatPrice(producto.precioventa - producto.precio_promocion)}
                    </span>
                  </div>
                </>
              ) : (
                <span className="pd-price">
                  {formatPrice(producto.precioventa)}
                </span>
              )}
            </div>

            {/* Stock info */}
            <div className="pd-stock-row">
              <span className={`pd-stock ${producto.stock > 0 ? 'available' : 'unavailable'}`}>
                {producto.stock > 0 ? 'Stock disponible' : 'Sin stock'}
              </span>
              {producto.stock > 0 && (
                <span className="pd-stock-qty">
                  Cantidad: <strong>{obtenerItemEnCarrito(producto.id_producto)?.cantidad || 1} unidad</strong> ({producto.stock} disponibles)
                </span>
              )}
            </div>

            {/* Cantidad si ya está en carrito */}
            {obtenerItemEnCarrito(producto.id_producto) && (
              <div className="pd-qty-control">
                <button
                  onClick={() => actualizarCantidad(
                    `producto-${producto.id_producto}`,
                    obtenerItemEnCarrito(producto.id_producto)!.cantidad - 1
                  )}
                  className="pd-qty-btn">−</button>
                <span className="pd-qty-value">
                  {obtenerItemEnCarrito(producto.id_producto)!.cantidad}
                </span>
                <button
                  onClick={() => actualizarCantidad(
                    `producto-${producto.id_producto}`,
                    obtenerItemEnCarrito(producto.id_producto)!.cantidad + 1
                  )}
                  className="pd-qty-btn">+</button>
              </div>
            )}

            {/* Botones de acción */}
            <div className="pd-actions">
              <button
                onClick={() => manejarAgregarProducto(producto)}
                disabled={producto.stock === 0}
                className="pd-btn-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3L2.26491 3.0883C3.58495 3.52832 4.24497 3.74832 4.62248 4.2721C5 4.79587 5 5.49159 5 6.88304V9.5C5 12.3284 5 13.7426 5.87868 14.6213C6.75736 15.5 8.17157 15.5 11 15.5H19"></path>
                  <path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"></path>
                  <path d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"></path>
                  <path d="M5 6H16.4504C18.5054 6 19.5328 6 19.9775 6.67426C20.4221 7.34853 20.0173 8.29294 19.2078 10.1818L18.7792 11.1818C18.4013 12.0636 18.2123 12.5045 17.8366 12.7523C17.4609 13 16.9812 13 16.0218 13H5"></path>
                </svg>
                Añadir al carrito
              </button>
              <button
                onClick={() => manejarAgregarProducto(producto)}
                disabled={producto.stock === 0}
                className="pd-btn-secondary"
              >
                Comprar ahora
              </button>
            </div>

            {/* Info extra */}
            <div className="pd-extras">
              <div className="pd-extra-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Garantía 12 meses incluida</span>
              </div>
              <div className="pd-extra-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span>Envío asegurado y seguimiento</span>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción debajo */}
        {producto.descripcion && (
          <div className="pd-description-card">
            <h3>Descripción</h3>
            <p>{producto.descripcion}</p>
          </div>
        )}

        {/* Productos destacados */}
        {productosDestacados.length > 0 && (
          <section className="pd-related-section">
            <div className="pd-related-header">
              <h2 className="pd-related-title">Productos destacados</h2>
              <button onClick={handleVolver} className="modern-featured-link">
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
          </section>
        )}
      </div>
    </div>
  );
};

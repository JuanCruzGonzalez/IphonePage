import React, { useState, useEffect, useMemo } from 'react';
import { Producto, Categoria } from '../types';
import { getProductosActivos } from '../api/productoService';
import { getProductImageUrl } from '../api/storageService';
import { getCategoriasActivas } from '../api/categoriaService';
import { supabase } from '../supabaseClient';
import './HomePage.css';

interface ItemCarrito {
  id_producto: number;
  nombre: string;
  precio: number;
  cantidad: number;
  unidadMedidaId: number;
  unidadMedidaNombre: string;
}

type SortOption = 'featured' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

const ITEMS_PER_PAGE = 15;

export const HomePage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [maxPrice, setMaxPrice] = useState(0);
  const [priceFilter, setPriceFilter] = useState(0);
  
  // Estados para categorías
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<number[]>([]);
  const [productosCategorias, setProductosCategorias] = useState<Map<number, number[]>>(new Map());

  // Modal gramos
  const [modalCantidad, setModalCantidad] = useState<{
    isOpen: boolean;
    producto: Producto | null;
  }>({ isOpen: false, producto: null });
  const [cantidadGramos, setCantidadGramos] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await getProductosActivos();
      setProductos(data);
      if (data.length > 0) {
        // Calcular max considerando precio display (x100 para gramos)
        const max = Math.max(...data.map(p => {
          const precio = p.id_unidad_medida === 1 ? p.precioventa * 1 : p.precioventa;
          return precio;
        }));
        setMaxPrice(Math.ceil(max));
        setPriceFilter(Math.ceil(max));
      }
      
      // Cargar categorías activas
      const categs = await getCategoriasActivas();
      setCategorias(categs);
      
      // Cargar relaciones producto-categoría
      const { data: relaciones, error } = await supabase
        .from('categoria_producto')
        .select('id_producto, id_categoria');
      
      if (!error && relaciones) {
        const mapa = new Map<number, number[]>();
        relaciones.forEach((rel: any) => {
          if (!mapa.has(rel.id_producto)) {
            mapa.set(rel.id_producto, []);
          }
          mapa.get(rel.id_producto)!.push(rel.id_categoria);
        });
        setProductosCategorias(mapa);
      }
      
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado y ordenamiento
  const productosFiltrados = useMemo(() => {
    let result = productos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Filtrar por categorías seleccionadas
    if (categoriasSeleccionadas.length > 0) {
      result = result.filter(p => {
        const categsDelProducto = productosCategorias.get(p.id_producto) || [];
        // El producto debe tener al menos una de las categorías seleccionadas
        return categsDelProducto.some(catId => categoriasSeleccionadas.includes(catId));
      });
    }

    // Filtrar por precio
    if (priceFilter < maxPrice) {
      result = result.filter(p => {
        let precio = (p.promocion_activa && p.precio_promocion != null)
          ? p.precio_promocion
          : p.precioventa;
        // Ajustar precio display para productos por gramos
        if (p.id_unidad_medida === 1) {
          precio = precio * 100;
        }
        return precio <= priceFilter;
      });
    }

    // Ordenar
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'name-desc':
        result.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'price-asc':
        result.sort((a, b) => a.precioventa - b.precioventa);
        break;
      case 'price-desc':
        result.sort((a, b) => b.precioventa - a.precioventa);
        break;
      default:
        // featured: promociiones primero, luego por nombre
        result.sort((a, b) => {
          if (a.promocion_activa && !b.promocion_activa) return -1;
          if (!a.promocion_activa && b.promocion_activa) return 1;
          return a.nombre.localeCompare(b.nombre);
        });
    }

    return result;
  }, [productos, busqueda, priceFilter, maxPrice, sortBy, categoriasSeleccionadas, productosCategorias]);

  // Paginación
  const totalPages = Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE);
  const productosEnPagina = productosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const startResult = productosFiltrados.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endResult = Math.min(currentPage * ITEMS_PER_PAGE, productosFiltrados.length);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, priceFilter, sortBy]);

  // Helpers precio
  const formatearPrecio = (precio: number) => `$${precio.toFixed(2)}`;

  const getPrecioDisplay = (producto: Producto) => {
    if (producto.id_unidad_medida === 1) {
      return producto.precioventa * 100;
    }
    return producto.precioventa;
  };

  const getPrecioPromoDisplay = (producto: Producto) => {
    if (producto.precio_promocion == null) return 0;
    if (producto.id_unidad_medida === 1) {
      return producto.precio_promocion * 100;
    }
    return producto.precio_promocion;
  };

  // Carrito
  const obtenerItemEnCarrito = (id_producto: number): ItemCarrito | undefined =>
    carrito.find(item => item.id_producto === id_producto);

  const agregarAlCarrito = (producto: Producto, cantidad: number = 1) => {
    const itemExistente = carrito.find(item => item.id_producto === producto.id_producto);
    const precioUsar = (producto.promocion_activa && producto.precio_promocion != null)
      ? producto.precio_promocion
      : producto.precioventa;

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
        precio: precioUsar,
        cantidad,
        unidadMedidaId: producto.id_unidad_medida,
        unidadMedidaNombre: producto.unidad_medida?.abreviacion || '',
      }]);
    }
  };

  const manejarAgregarProducto = (producto: Producto) => {
    if (producto.id_unidad_medida === 1) {
      setModalCantidad({ isOpen: true, producto });
      setCantidadGramos('');
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
    setModalCantidad({ isOpen: false, producto: null });
    setCantidadGramos('');
  };

  const cerrarModalCantidad = () => {
    setModalCantidad({ isOpen: false, producto: null });
    setCantidadGramos('');
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

  const calcularTotal = () =>
    carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  const vaciarCarrito = () => setCarrito([]);

  const enviarPedidoWhatsApp = () => {
    const numeroWhatsApp = '5492616166624';
    let mensaje = 'Hola Chañar, quería hacer el siguiente pedido:\n\n';
    carrito.forEach(item => {
      const cantidad = item.unidadMedidaId === 1
        ? `${Math.round(item.cantidad)}gr`
        : `${item.cantidad} un`;
      mensaje += `• ${item.nombre}: ${cantidad} - ${formatearPrecio(item.precio * item.cantidad)}\n`;
    });
    mensaje += `\n*Total: ${formatearPrecio(calcularTotal())}*`;
    const mensajeCodificado = encodeURIComponent(mensaje);
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`, '_blank');
  };

  const toggleCategoria = (id_categoria: number) => {
    setCategoriasSeleccionadas(prev => {
      if (prev.includes(id_categoria)) {
        return prev.filter(id => id !== id_categoria);
      } else {
        return [...prev, id_categoria];
      }
    });
    setCurrentPage(1); // Resetear a primera página al cambiar filtro
  };

  const resetFilters = () => {
    setBusqueda('');
    setPriceFilter(maxPrice);
    setSortBy('featured');
    setCurrentPage(1);
    setCategoriasSeleccionadas([]);
  };

  // Pagination helper
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="home-loading">
        <div className="home-loading-content">
          <div className="home-loading-spinner" />
          <p className="home-loading-text">Cargando productos...</p>
        </div>
      </div>
    );
  }

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

          {/* <nav className="home-header-nav">
            <button className="home-header-nav-link active">Productos</button>
            <button className="home-header-nav-link">Ofertas</button>
            <button className="home-header-nav-link">Nosotros</button>
          </nav> */}

          <div className="home-header-search">
            <span className="home-header-search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar productos..."
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
        <span className="home-breadcrumb-current">Productos</span>
      </div>

      {/* ===== TITLE SECTION ===== */}
      <div className="home-title-section">
        <div className="home-title-left">
          <h1>Todos los Productos</h1>
          <p className="home-title-results">
            Mostrando {startResult}-{endResult} de {productosFiltrados.length} resultados
          </p>
        </div>
        <div className="home-title-sort">
          <span>Ordenar:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
            <option value="featured">Destacados</option>
            <option value="name-asc">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
          </select>
        </div>
      </div>

      {/* ===== MAIN (SIDEBAR + GRID) ===== */}
      <div className="home-main">
        {/* Sidebar Filtros */}
        <aside className="home-sidebar">
          <div className="home-filters-header">
            <h3 className="home-filters-title">Filtros</h3>
            <button className="home-filters-reset" onClick={resetFilters}>Reset</button>
          </div>

          {/* Categoría */}
          <div className="home-filter-group">
            <h4 className="home-filter-group-title">Categorías</h4>
            {categorias.map(cat => (
              <label 
                key={cat.id_categoria} 
                className="home-filter-item" 
                onClick={() => toggleCategoria(cat.id_categoria)}
              >
                <span className={`home-filter-checkbox ${categoriasSeleccionadas.includes(cat.id_categoria) ? 'checked' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {cat.nombre}
              </label>
            ))}
          </div>

          {/* Rango de Precio */}
          <div className="home-filter-group">
            <h4 className="home-filter-group-title">Rango de Precio</h4>
            <div className="home-filter-price-range">
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceFilter}
                onChange={(e) => setPriceFilter(Number(e.target.value))}
                className="home-filter-price-slider"
              />
              <div className="home-filter-price-labels">
                <span>$0</span>
                <span>${priceFilter}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid de Productos */}
        <div className="home-products-area">
          <div className="home-products-grid">
            {productosEnPagina.length === 0 ? (
              <div className="home-empty-state">
                <div className="home-empty-state-icon">🔍</div>
                <p className="home-empty-state-text">No se encontraron productos</p>
              </div>
            ) : (
              productosEnPagina.map((producto) => {
                const itemEnCarrito = obtenerItemEnCarrito(producto.id_producto);
                const tienePromo = producto.promocion_activa && producto.precio_promocion != null;

                return (
                  <div key={producto.id_producto} className="home-product-card">
                    {/* Imagen */}
                    <div className="home-product-image-wrapper">
                      {producto.imagen_path ? (
                        <img
                          src={getProductImageUrl(producto.imagen_path) || undefined}
                          alt={producto.nombre}
                          className="home-product-image"
                        />
                      ) : (
                        <div className="home-product-image-placeholder">📦</div>
                      )}
                      {tienePromo && (
                        <span className="home-product-badge offer">Oferta</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="home-product-info">
                      <div className="home-product-name-row">
                        <h3 className="home-product-name">{producto.nombre}</h3>
                        {tienePromo ? (
                          <div className="home-product-price-promo">
                            <span className="home-product-price-original">
                              {formatearPrecio(getPrecioDisplay(producto))}
                            </span>
                            <span className="home-product-price-sale">
                              {formatearPrecio(getPrecioPromoDisplay(producto))}
                            </span>
                          </div>
                        ) : (
                          <span className="home-product-price">
                            {formatearPrecio(getPrecioDisplay(producto))}
                          </span>
                        )}
                      </div>

                      {producto.descripcion && (
                        <p className="home-product-description">{producto.descripcion}</p>
                      )}

                      {producto.id_unidad_medida === 1 && (
                        <span className="home-product-unit">Precio por 100gr</span>
                      )}

                      {/* Botón / Controles */}
                      {itemEnCarrito ? (
                        <div className="home-product-qty-controls">
                          <button
                            className="home-product-qty-btn"
                            onClick={() => actualizarCantidad(
                              producto.id_producto,
                              itemEnCarrito.cantidad - (producto.id_unidad_medida === 1 ? 10 : 1)
                            )}
                          >
                            −
                          </button>
                          <span className="home-product-qty-value">
                            {producto.id_unidad_medida === 1
                              ? `${Math.round(itemEnCarrito.cantidad)}gr`
                              : `${itemEnCarrito.cantidad}`
                            }
                          </span>
                          <button
                            className="home-product-qty-btn"
                            onClick={() => actualizarCantidad(
                              producto.id_producto,
                              itemEnCarrito.cantidad + (producto.id_unidad_medida === 1 ? 10 : 1)
                            )}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="home-product-add-btn"
                          onClick={() => manejarAgregarProducto(producto)}
                          disabled={producto.stock <= 0}
                        >
                          {producto.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="home-pagination">
              <button
                className="home-pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {getPageNumbers().map((page, i) =>
                page === 'ellipsis' ? (
                  <span key={`e-${i}`} className="home-pagination-ellipsis">…</span>
                ) : (
                  <button
                    key={page}
                    className={`home-pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="home-pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

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

      {/* ===== MODAL GRAMOS ===== */}
      {modalCantidad.isOpen && modalCantidad.producto && (
        <div className="home-modal-overlay" onClick={cerrarModalCantidad}>
          <div className="home-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="home-modal-title">{modalCantidad.producto.nombre}</h2>
            <p className="home-modal-subtitle">
              Precio: {formatearPrecio(modalCantidad.producto.precioventa * 100)} x 100gr
            </p>
            <label className="home-modal-label">Cantidad en gramos:</label>
            <input
              type="number"
              value={cantidadGramos}
              onChange={(e) => setCantidadGramos(e.target.value)}
              placeholder="Ej: 250"
              min="1"
              className="home-modal-input"
              autoFocus
            />
            {cantidadGramos && !isNaN(parseFloat(cantidadGramos)) && (
              <div className="home-modal-total">
                <span className="home-modal-total-label">Total:</span>
                <span className="home-modal-total-value">
                  {formatearPrecio(parseFloat(cantidadGramos) * modalCantidad.producto.precioventa)}
                </span>
              </div>
            )}
            <div className="home-modal-actions">
              <button onClick={cerrarModalCantidad} className="home-modal-btn cancel">Cancelar</button>
              <button onClick={confirmarCantidadGramos} className="home-modal-btn confirm">Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CARRITO PANEL ===== */}
      {mostrarCarrito && (
        <>
          <div className="home-cart-overlay" onClick={() => setMostrarCarrito(false)} />
          <div className="home-cart-panel">
            <div className="home-cart-header">
              <div>
                <h2>Mi Carrito</h2>
                <p>{carrito.length} {carrito.length === 1 ? 'producto' : 'productos'}</p>
              </div>
              <button className="home-cart-close-btn" onClick={() => setMostrarCarrito(false)}>✕</button>
            </div>

            <div className="home-cart-items">
              {carrito.length === 0 ? (
                <div className="home-cart-empty">
                  <div className="home-cart-empty-icon">🛒</div>
                  <p className="home-cart-empty-text">Tu carrito está vacío</p>
                </div>
              ) : (
                carrito.map(item => (
                  <div key={item.id_producto} className="home-cart-item">
                    <div className="home-cart-item-header">
                      <h3 className="home-cart-item-title">{item.nombre}</h3>
                      <button className="home-cart-item-delete" onClick={() => eliminarDelCarrito(item.id_producto)}>
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
                          onClick={() => actualizarCantidad(item.id_producto, item.cantidad - (item.unidadMedidaId === 1 ? 10 : 1))}
                        >
                          −
                        </button>
                        <span className="home-cart-item-quantity">
                          {item.unidadMedidaId === 1
                            ? `${Math.round(item.cantidad)}gr`
                            : `${item.cantidad} un`
                          }
                        </span>
                        <button
                          className="home-cart-item-btn"
                          onClick={() => actualizarCantidad(item.id_producto, item.cantidad + (item.unidadMedidaId === 1 ? 10 : 1))}
                        >
                          +
                        </button>
                      </div>
                      <div className="home-cart-item-price">
                        {formatearPrecio(item.precio * item.cantidad)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {carrito.length > 0 && (
              <div className="home-cart-footer">
                <div className="home-cart-total">
                  <span className="home-cart-total-label">Total:</span>
                  <span className="home-cart-total-value">{formatearPrecio(calcularTotal())}</span>
                </div>
                <div className="home-cart-actions">
                  <button className="home-cart-checkout-btn" onClick={enviarPedidoWhatsApp}>
                    Hacer pedido por WhatsApp
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M17.6 6.32A7.85 7.85 0 0012 4a7.94 7.94 0 00-6.88 11.89L4 20l4.2-1.1a7.93 7.93 0 003.79.97 7.95 7.95 0 007.99-7.93 7.87 7.87 0 00-2.38-5.62zM12 18.53a6.58 6.58 0 01-3.36-.92l-.24-.14-2.49.66.66-2.43-.16-.25a6.6 6.6 0 0110.09-8.47 6.53 6.53 0 012 4.66 6.6 6.6 0 01-6.5 6.89z"/>
                    </svg>
                  </button>
                  <button className="home-cart-clear-btn" onClick={vaciarCarrito}>
                    Vaciar carrito
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

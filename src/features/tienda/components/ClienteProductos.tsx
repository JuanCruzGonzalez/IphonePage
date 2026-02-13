import React, { useState, useEffect, useMemo } from 'react';
import { Producto, Categoria } from '../../../core/types';
import { getProductosActivos } from '../../productos/services/productoService';
import { getProductImageUrl } from '../../../shared/services/storageService';
import { getCategoriasActivas } from '../../categorias/services/categoriaService';
import { supabase } from '../../../core/config/supabase';
import { formatPrice, formatPrecioParaMostrar } from '../../../shared/utils';
import { ItemCarrito } from './CarritoPanel';

interface ClienteProductosProps {
  carrito: ItemCarrito[];
  agregarAlCarrito: (producto: Producto, cantidad: number) => void;
  actualizarCantidad: (id: string, nuevaCantidad: number) => void;
  busqueda: string;
  onBusquedaChange: (value: string) => void;
}

type SortOption = 'featured' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
const ITEMS_PER_PAGE = 15;

export const ClienteProductos: React.FC<ClienteProductosProps> = ({
  carrito,
  agregarAlCarrito,
  actualizarCantidad,
  busqueda,
  onBusquedaChange,
}) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState(1);
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
        const max = Math.max(...data.map(p => {
          const precio = p.id_unidad_medida === 1 ? p.precioventa * 1 : p.precioventa;
          return precio;
        }));
        setMaxPrice(Math.ceil(max));
        setPriceFilter(Math.ceil(max));
      }
      
      const categs = await getCategoriasActivas();
      setCategorias(categs);
      
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

  const productosFiltrados = useMemo(() => {
    let result = productos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (categoriasSeleccionadas.length > 0) {
      result = result.filter(p => {
        const categsDelProducto = productosCategorias.get(p.id_producto) || [];
        return categsDelProducto.some(catId => categoriasSeleccionadas.includes(catId));
      });
    }

    if (priceFilter < maxPrice) {
      result = result.filter(p => {
        let precio = (p.promocion_activa && p.precio_promocion != null)
          ? p.precio_promocion
          : p.precioventa;
        if (p.id_unidad_medida === 1) {
          precio = precio * 100;
        }
        return precio <= priceFilter;
      });
    }

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
        result.sort((a, b) => {
          if (a.promocion_activa && !b.promocion_activa) return -1;
          if (!a.promocion_activa && b.promocion_activa) return 1;
          return a.nombre.localeCompare(b.nombre);
        });
    }

    return result;
  }, [productos, busqueda, priceFilter, maxPrice, sortBy, categoriasSeleccionadas, productosCategorias]);

  const totalPages = Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE);
  const productosEnPagina = productosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const startResult = productosFiltrados.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endResult = Math.min(currentPage * ITEMS_PER_PAGE, productosFiltrados.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, priceFilter, sortBy]);

  const getPrecioDisplay = (producto: Producto) => {
    return formatPrecioParaMostrar(producto.precioventa, producto.id_unidad_medida);
  };

  const getPrecioPromoDisplay = (producto: Producto) => {
    if (producto.precio_promocion == null) return 0;
    return formatPrecioParaMostrar(producto.precio_promocion, producto.id_unidad_medida);
  };

  const obtenerItemEnCarrito = (id_producto: number): ItemCarrito | undefined =>
    carrito.find(item => item.id === `producto-${id_producto}`);

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

  const toggleCategoria = (id_categoria: number) => {
    setCategoriasSeleccionadas(prev => {
      if (prev.includes(id_categoria)) {
        return prev.filter(id => id !== id_categoria);
      } else {
        return [...prev, id_categoria];
      }
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    onBusquedaChange('');
    setPriceFilter(maxPrice);
    setSortBy('featured');
    setCurrentPage(1);
    setCategoriasSeleccionadas([]);
  };

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
    <>
      {/* TITLE SECTION */}
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

      {/* MAIN (SIDEBAR + GRID) */}
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

                    <div className="home-product-info">
                      <div className="home-product-name-row">
                        <h3 className="home-product-name">{producto.nombre}</h3>
                        {tienePromo ? (
                          <div className="home-product-price-promo">
                            <span className="home-product-price-original">
                              {formatPrice(getPrecioDisplay(producto))}
                            </span>
                            <span className="home-product-price-sale">
                              {formatPrice(getPrecioPromoDisplay(producto))}
                            </span>
                          </div>
                        ) : (
                          <span className="home-product-price">
                            {formatPrice(getPrecioDisplay(producto))}
                          </span>
                        )}
                      </div>

                      {producto.descripcion && (
                        <p className="home-product-description">{producto.descripcion}</p>
                      )}

                      {producto.id_unidad_medida === 1 && (
                        <span className="home-product-unit">Precio por 100gr</span>
                      )}

                      {itemEnCarrito ? (
                        <div className="home-product-qty-controls">
                          <button
                            className="home-product-qty-btn"
                            onClick={() => actualizarCantidad(
                              `producto-${producto.id_producto}`,
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
                              `producto-${producto.id_producto}`,
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

      {/* MODAL GRAMOS */}
      {modalCantidad.isOpen && modalCantidad.producto && (
        <div className="home-modal-overlay" onClick={cerrarModalCantidad}>
          <div className="home-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="home-modal-title">{modalCantidad.producto.nombre}</h2>
            <p className="home-modal-subtitle">
              Precio: {formatPrice(modalCantidad.producto.precioventa * 100)} x 100gr
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
                  {formatPrice(parseFloat(cantidadGramos) * modalCantidad.producto.precioventa)}
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
    </>
  );
};

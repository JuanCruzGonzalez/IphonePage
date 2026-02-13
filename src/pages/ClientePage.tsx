import React, { useState, useEffect, useMemo } from 'react';
import { Producto, Categoria, Promocion } from '../types';
import { getProductosActivos } from '../api/productoService';
import { getProductImageUrl } from '../api/storageService';
import { getCategoriasActivas } from '../api/categoriaService';
import { ClientePromociones } from '../components/ClientePromociones';
import { supabase } from '../supabaseClient';
import './ClientePage.css';

type VistaActiva = 'productos' | 'promociones';

interface ItemCarrito {
  id: string;
  tipo: 'producto' | 'promocion';
  id_referencia: number;
  nombre: string;
  precio: number;
  cantidad: number;
  unidadMedidaId?: number;
  unidadMedidaNombre?: string;
}

export const ClientePage: React.FC = () => {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('productos');
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

  // Estados para filtros
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<number[]>([]);
  const [productosCategorias, setProductosCategorias] = useState<Map<number, number[]>>(new Map());
  const [maxPrice, setMaxPrice] = useState(0);
  const [priceFilter, setPriceFilter] = useState(0);
  const [categoriasExpanded, setCategoriasExpanded] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await getProductosActivos();
      setProductos(data);

      if (data.length > 0) {
        // Calcular max precio considerando productos por gramos
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

  const productosFiltrados = useMemo(() => {
    let result = productos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Filtrar por categorías seleccionadas
    if (categoriasSeleccionadas.length > 0) {
      result = result.filter(p => {
        const categsDelProducto = productosCategorias.get(p.id_producto) || [];
        return categsDelProducto.some(catId => categoriasSeleccionadas.includes(catId));
      });
    }

    // Filtrar por precio
    if (priceFilter < maxPrice) {
      result = result.filter(p => {
        let precio = (p.promocion_activa && p.precio_promocion != null)
          ? p.precio_promocion
          : p.precioventa;
        // Ajustar precio para productos por gramos
        if (p.id_unidad_medida === 1) {
          precio = precio * 100;
        }
        return precio <= priceFilter;
      });
    }

    return result;
  }, [productos, busqueda, categoriasSeleccionadas, productosCategorias, priceFilter, maxPrice]);

  const toggleCategoria = (id_categoria: number) => {
    setCategoriasSeleccionadas(prev => {
      if (prev.includes(id_categoria)) {
        return prev.filter(id => id !== id_categoria);
      } else {
        return [...prev, id_categoria];
      }
    });
  };

  const resetFilters = () => {
    setBusqueda('');
    setPriceFilter(maxPrice);
    setCategoriasSeleccionadas([]);
  };

  const abrirModalCantidad = (producto: Producto) => {
    setModalCantidad({ isOpen: true, producto });
    setCantidadGramos('');
  };

  const cerrarModalCantidad = () => {
    setModalCantidad({ isOpen: false, producto: null });
    setCantidadGramos('');
  };

  const agregarAlCarrito = (producto: Producto, cantidad: number = 1) => {
    const id = `producto-${producto.id_producto}`;
    const itemExistente = carrito.find(item => item.id === id);

    // Usar precio promocional si está activo, sino precio normal
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
    return carrito.find(item => item.id === `producto-${id_producto}`);
  };

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
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;

    window.open(urlWhatsApp, '_blank');
  };

  return (
    <div className="cliente-page">
      {/* Header moderno */}
      <header className="cliente-header">
        <div className="cliente-header-content">
          <div className="cliente-header-logo">
            <div className="cliente-header-icon">
              <img src="/logo.png" alt="Logo Chañar" style={{ width: 105, height: 'auto' }} />
            </div>
            <h1 className="cliente-header-title">
              Chañar
            </h1>
          </div>

          {/* Navegación de vistas (desktop) */}
          <nav className="cliente-header-nav">
            <button 
              className={`cliente-header-nav-link ${vistaActiva === 'productos' ? 'active' : ''}`}
              onClick={() => setVistaActiva('productos')}
            >
              Productos
            </button>
            <button 
              className={`cliente-header-nav-link ${vistaActiva === 'promociones' ? 'active' : ''}`}
              onClick={() => setVistaActiva('promociones')}
            >
              Promociones
            </button>
          </nav>

          {/* Buscador en header */}
          <div className="cliente-header-search-container">
            <div className="cliente-header-search-icon">
              🔍
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="cliente-header-search-input"
            />
          </div>

          <button
            onClick={() => setMostrarCarrito(!mostrarCarrito)}
            className="cliente-header-cart-btn"
          >
            <span className="cliente-header-cart-icon">🛒</span>
            {carrito.length > 0 && (
              <span className="cliente-header-cart-badge">
                {carrito.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Navegación de vistas (mobile) */}
      <nav className="cliente-header-nav-container">
        <button 
          className={`cliente-header-nav-link ${vistaActiva === 'productos' ? 'active' : ''}`}
          onClick={() => setVistaActiva('productos')}
        >
          Productos
        </button>
        <button 
          className={`cliente-header-nav-link ${vistaActiva === 'promociones' ? 'active' : ''}`}
          onClick={() => setVistaActiva('promociones')}
        >
          Promociones
        </button>
      </nav>

      {/* Contenido Principal */}
      {vistaActiva === 'productos' ? (
        <>
          {loading ? (
            <div className="cliente-loading">
              <div className="cliente-loading-content">
                <div className="cliente-loading-spinner" />
                <p className="cliente-loading-text">
                  Cargando productos...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Contenido principal con sidebar */}
              <div className="cliente-main-content">
                <div className="cliente-content-with-sidebar">

                  {/* Sidebar de filtros */}
                  <aside className="cliente-sidebar">
                    <div className="cliente-filters-header">
                      <h3 className="cliente-filters-title">Filtros</h3>
                      <button className="cliente-filters-reset" onClick={resetFilters}>
                        Limpiar
                      </button>
                    </div>

                    {/* Categorías */}
                    <div className="cliente-filter-group">
                      <h4
                        className="cliente-filter-group-title cliente-filter-group-title-collapsible"
                        onClick={() => setCategoriasExpanded(!categoriasExpanded)}
                      >
                        Categorías
                        <span className={`cliente-filter-collapse-icon ${categoriasExpanded ? 'expanded' : ''}`}>
                          ▼
                        </span>
                      </h4>
                      {categoriasExpanded && (
                        <div className="cliente-filter-items">
                          {categorias.map(cat => (
                            <label
                              key={cat.id_categoria}
                              className="cliente-filter-item"
                            >
                              <input
                                type="checkbox"
                                checked={categoriasSeleccionadas.includes(cat.id_categoria)}
                                onChange={() => toggleCategoria(cat.id_categoria)}
                                className="cliente-filter-checkbox"
                              />
                              <span className="cliente-filter-label">{cat.nombre}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rango de Precio */}
                    <div className="cliente-filter-group">
                      <h4 className="cliente-filter-group-title">Rango de Precio</h4>
                      <div className="cliente-filter-price-range">
                        <input
                          type="range"
                          min={0}
                          max={maxPrice}
                          value={priceFilter}
                          onChange={(e) => setPriceFilter(Number(e.target.value))}
                          className="cliente-filter-price-slider"
                        />
                        <div className="cliente-filter-price-labels">
                          <span>$0</span>
                          <span>${priceFilter}</span>
                        </div>
                      </div>
                    </div>
                  </aside>

                  {/* Grid de productos */}
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
                  {producto.promocion_activa && producto.precio_promocion != null && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(231, 76, 60, 0.4)',
                      zIndex: 10,
                    }}>
                      OFERTA
                    </span>
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
                  </div>

                  {/* Botón de agregar o controles de cantidad */}
                  {(() => {
                    const itemEnCarrito = obtenerItemEnCarrito(producto.id_producto);

                    if (itemEnCarrito) {
                      // Mostrar controles + y -
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div className="cliente-product-price-container">
                            {producto.promocion_activa && producto.precio_promocion != null ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{
                                  fontSize: '14px',
                                  color: '#999',
                                  textDecoration: 'line-through'
                                }}>
                                  {producto.id_unidad_medida === 1
                                    ? `${formatearPrecio(producto.precioventa * 100)}`
                                    : formatearPrecio(producto.precioventa)
                                  }
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                  <div className="cliente-product-price" style={{ color: '#e74c3c' }}>
                                    {producto.id_unidad_medida === 1
                                      ? `${formatearPrecio(producto.precio_promocion * 100)}`
                                      : formatearPrecio(producto.precio_promocion)
                                    }
                                  </div>
                                  {producto.id_unidad_medida === 1 && (
                                    <span className="cliente-product-price-unit" style={{ fontWeight: 700 }}>
                                      x 100gr
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="cliente-product-price">
                                  {producto.id_unidad_medida === 1
                                    ? `${formatearPrecio(producto.precioventa * 100)}`
                                    : formatearPrecio(producto.precioventa)
                                  }
                                </div>
                                {producto.id_unidad_medida === 1 && (
                                  <span className="cliente-product-price-unit" style={{ fontWeight: 700 }}>
                                    x 100gr
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          <div className="cliente-product-quantity-controls">

                            <button
                              onClick={() => actualizarCantidad(
                                `producto-${producto.id_producto}`,
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
                                `producto-${producto.id_producto}`,
                                itemEnCarrito.cantidad + (producto.id_unidad_medida === 1 ? 10 : 1)
                              )}
                              className="cliente-product-quantity-btn"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      // Mostrar botón de agregar
                      return (
                        <>
                          <div>
                            <div className="cliente-product-price-container">
                              {producto.promocion_activa && producto.precio_promocion != null ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{
                                    fontSize: '14px',
                                    color: '#999',
                                    textDecoration: 'line-through'
                                  }}>
                                    {producto.id_unidad_medida === 1
                                      ? `${formatearPrecio(producto.precioventa * 100)}`
                                      : formatearPrecio(producto.precioventa)
                                    }
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                    <div className="cliente-product-price" style={{ color: '#e74c3c' }}>
                                      {producto.id_unidad_medida === 1
                                        ? `${formatearPrecio(producto.precio_promocion * 100)}`
                                        : formatearPrecio(producto.precio_promocion)
                                      }
                                    </div>
                                    {producto.id_unidad_medida === 1 && (
                                      <span className="cliente-product-price-unit" style={{ fontWeight: 700 }}>
                                        x 100gr
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="cliente-product-price">
                                    {producto.id_unidad_medida === 1
                                      ? `${formatearPrecio(producto.precioventa * 100)}`
                                      : formatearPrecio(producto.precioventa)
                                    }
                                  </div>
                                  {producto.id_unidad_medida === 1 && (
                                    <span className="cliente-product-price-unit" style={{ fontWeight: 700 }}>
                                      x 100gr
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            <button
                              onClick={() => manejarAgregarProducto(producto)}
                              disabled={producto.stock <= 0}
                              className={`cliente-product-add-btn ${producto.stock > 0 ? 'available' : 'unavailable'}`}
                            >
                              {producto.stock > 0 ? '+ Agregar al carrito' : 'Sin stock'}
                            </button>
                          </div>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>
            ))}

            {productosFiltrados.length === 0 && (
              <div className="cliente-empty-state">
                <div className="cliente-empty-state-icon">🔍</div>
                <p className="cliente-empty-state-text">
                  No se encontraron productos
                </p>
              </div>
            )}
                  </div>
                </div>
              </div>
              </>
            )}
        </>
      ) : (
        <ClientePromociones
          busqueda={busqueda}
          agregarPromocionAlCarrito={agregarPromocionAlCarrito}
        />
      )}

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
                    <div key={item.id} className="cliente-cart-item">
                      <div className="cliente-cart-item-header">
                        <h3 className="cliente-cart-item-title">
                          {item.nombre}
                        </h3>
                        <button onClick={() => eliminarDelCarrito(item.id)} className="cliente-cart-item-delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                          </svg>
                        </button>
                      </div>

                      <div className="cliente-cart-item-footer">
                        {/* Controles de cantidad */}
                        <div className="cliente-cart-item-controls">
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad - (item.unidadMedidaId === 1 ? 10 : 1))}
                            className="cliente-cart-item-btn"
                          >
                            −
                          </button>

                          <span className="cliente-cart-item-quantity">
                            {item.unidadMedidaId === 1
                              ? `${Math.round(item.cantidad)}gr`
                              : item.tipo === 'promocion'
                              ? `${item.cantidad} un`
                              : `${item.cantidad} un`
                            }
                          </span>

                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad + (item.unidadMedidaId === 1 ? 10 : 1))}
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
                      onClick={enviarPedidoWhatsApp}
                      className="cliente-cart-checkout-btn"
                    >
                      Hacer pedido por WhatsApp
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M17.6 6.31999C16.8669 5.58141 15.9943 4.99596 15.033 4.59767C14.0716 4.19938 13.0406 3.99622 12 3.99999C10.6089 4.00135 9.24248 4.36819 8.03771 5.06377C6.83294 5.75935 5.83208 6.75926 5.13534 7.96335C4.4386 9.16745 4.07046 10.5335 4.06776 11.9246C4.06507 13.3158 4.42793 14.6832 5.12 15.89L4 20L8.2 18.9C9.35975 19.5452 10.6629 19.8891 11.99 19.9C14.0997 19.9001 16.124 19.0668 17.6222 17.5816C19.1205 16.0965 19.9715 14.0796 19.99 11.97C19.983 10.9173 19.7682 9.87634 19.3581 8.9068C18.948 7.93725 18.3505 7.05819 17.6 6.31999ZM12 18.53C10.8177 18.5308 9.65701 18.213 8.64 17.61L8.4 17.46L5.91 18.12L6.57 15.69L6.41 15.44C5.55925 14.0667 5.24174 12.429 5.51762 10.8372C5.7935 9.24545 6.64361 7.81015 7.9069 6.80322C9.1702 5.79628 10.7589 5.28765 12.3721 5.37368C13.9853 5.4597 15.511 6.13441 16.66 7.26999C17.916 8.49818 18.635 10.1735 18.66 11.93C18.6442 13.6859 17.9355 15.3645 16.6882 16.6006C15.441 17.8366 13.756 18.5301 12 18.53ZM15.61 13.59C15.41 13.49 14.44 13.01 14.26 12.95C14.08 12.89 13.94 12.85 13.81 13.05C13.6144 13.3181 13.404 13.5751 13.18 13.82C13.07 13.96 12.95 13.97 12.75 13.82C11.6097 13.3694 10.6597 12.5394 10.06 11.47C9.85 11.12 10.26 11.14 10.64 10.39C10.6681 10.3359 10.6827 10.2759 10.6827 10.215C10.6827 10.1541 10.6681 10.0941 10.64 10.04C10.64 9.93999 10.19 8.95999 10.03 8.56999C9.87 8.17999 9.71 8.23999 9.58 8.22999H9.19C9.08895 8.23154 8.9894 8.25465 8.898 8.29776C8.8066 8.34087 8.72546 8.403 8.66 8.47999C8.43562 8.69817 8.26061 8.96191 8.14676 9.25343C8.03291 9.54495 7.98287 9.85749 8 10.17C8.0627 10.9181 8.34443 11.6311 8.81 12.22C9.6622 13.4958 10.8301 14.5293 12.2 15.22C12.9185 15.6394 13.7535 15.8148 14.58 15.72C14.8552 15.6654 15.1159 15.5535 15.345 15.3915C15.5742 15.2296 15.7667 15.0212 15.91 14.78C16.0428 14.4856 16.0846 14.1583 16.03 13.84C15.94 13.74 15.81 13.69 15.61 13.59Z" fill="#fff" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
};
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Producto, Categoria } from '../../core/types';
import { getProductosActivos } from '../productos/services/productoService';
import { getCategoriasActivas } from '../categorias/services/categoriaService';
import { generateProductUrl } from '../../shared/utils';
import { ProductosGrid } from './components/ProductosGrid';
import { useCarrito } from './context/CarritoContext';
import { supabase } from '../../core/config/supabase';

export const TiendaProductosPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const busqueda = searchParams.get('q') || '';

  const {
    obtenerItemEnCarrito,
    actualizarCantidad,
    manejarAgregarProducto,
  } = useCarrito();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [productosCategorias, setProductosCategorias] = useState<Map<number, number[]>>(new Map());
  const [ordenPrecio, setOrdenPrecio] = useState<'none' | 'asc' | 'desc'>('none');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await getProductosActivos();
      // Solo accesorios
      setProductos(data.filter(p => p.accesorio === true));

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

  // Solo categorías hijas que tienen al menos un producto accesorio
  const categoriasDisponibles = useMemo(() => {
    const idsProductosAccesorios = new Set(productos.map(p => p.id_producto));
    const idsCategoriasConProductos = new Set<number>();

    productosCategorias.forEach((catIds, prodId) => {
      if (idsProductosAccesorios.has(prodId)) {
        catIds.forEach(catId => idsCategoriasConProductos.add(catId));
      }
    });

    return categorias.filter(
      cat => cat.id_categoria_padre != null && idsCategoriasConProductos.has(cat.id_categoria)
    );
  }, [categorias, productos, productosCategorias]);

  const productosFiltrados = useMemo(() => {
    let result = productos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (categoriaSeleccionada !== null) {
      result = result.filter(p => {
        const categsDelProducto = productosCategorias.get(p.id_producto) || [];
        return categsDelProducto.includes(categoriaSeleccionada);
      });
    }

    if (ordenPrecio === 'asc') {
      result = [...result].sort((a, b) => a.precioventa - b.precioventa);
    } else if (ordenPrecio === 'desc') {
      result = [...result].sort((a, b) => b.precioventa - a.precioventa);
    }

    return result;
  }, [productos, busqueda, categoriaSeleccionada, productosCategorias, ordenPrecio]);

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
    <div className="modern-products-page">
      <div className="modern-products-container">
        <div className="modern-products-header">
          <h2 className="modern-products-title">
            {categoriaSeleccionada
              ? categoriasDisponibles.find(c => c.id_categoria === categoriaSeleccionada)?.nombre
              : 'Accesorios'}
          </h2>
          {(categoriaSeleccionada || ordenPrecio !== 'none') && (
            <button onClick={() => { setCategoriaSeleccionada(null); setOrdenPrecio('none'); }} className="modern-clear-filter">
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
          {/* Filtro por categorías */}
          {categoriasDisponibles.length > 0 && (
            <select
              value={categoriaSeleccionada ?? ''}
              onChange={(e) => setCategoriaSeleccionada(e.target.value ? Number(e.target.value) : null)}
              className="modern-category-btn"
              style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', cursor: 'pointer' }}
            >
              <option value="">Todas las categorías</option>
              {categoriasDisponibles.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          )}

          <select
            value={ordenPrecio}
            onChange={(e) => setOrdenPrecio(e.target.value as 'none' | 'asc' | 'desc')}
            className="modern-category-btn"
            style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', cursor: 'pointer' }}
          >
            <option value="none">Ordenar por precio</option>
            <option value="asc">Menor a Mayor</option>
            <option value="desc">Mayor a Menor</option>
          </select>
        </div>

        <ProductosGrid
          productos={productosFiltrados}
          obtenerItemEnCarrito={obtenerItemEnCarrito}
          actualizarCantidad={actualizarCantidad}
          manejarAgregarProducto={manejarAgregarProducto}
          onVerDetalle={handleVerDetalleProducto}
        />
      </div>
    </div>
  );
};

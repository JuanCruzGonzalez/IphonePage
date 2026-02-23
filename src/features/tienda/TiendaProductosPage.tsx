import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Producto, Categoria } from '../../core/types';
import { getProductosActivos } from '../productos/services/productoService';
import { getCategoriasActivas } from '../categorias/services/categoriaService';
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

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await getProductosActivos();
      setProductos(data);

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

    if (categoriaSeleccionada !== null) {
      result = result.filter(p => {
        const categsDelProducto = productosCategorias.get(p.id_producto) || [];
        return categsDelProducto.includes(categoriaSeleccionada);
      });
    }

    return result;
  }, [productos, busqueda, categoriaSeleccionada, productosCategorias]);

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
    <div className="modern-products-page">
      <div className="modern-products-container">
        <div className="modern-products-header">
          <h2 className="modern-products-title">
            {categoriaSeleccionada
              ? categorias.find(c => c.id_categoria === categoriaSeleccionada)?.nombre
              : 'Todos los Productos'}
          </h2>
          {categoriaSeleccionada && (
            <button onClick={() => setCategoriaSeleccionada(null)} className="modern-clear-filter">
              Ver todos los productos
            </button>
          )}
        </div>

        {/* Filtro por categorías */}
        {categorias.length > 0 && (
          <div className="modern-categories-filter" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {categorias.map(cat => (
              <button
                key={cat.id_categoria}
                onClick={() => setCategoriaSeleccionada(
                  categoriaSeleccionada === cat.id_categoria ? null : cat.id_categoria
                )}
                className={`modern-category-btn ${categoriaSeleccionada === cat.id_categoria ? 'active' : ''}`}
                style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        )}

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

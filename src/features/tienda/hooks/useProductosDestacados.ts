import { useState, useEffect } from 'react';
import { Producto } from '../../../core/types';
import { getProductosDestacados } from '../../productos/services/productoService';

/**
 * Hook compartido para obtener productos destacados.
 * Se usa tanto en ClientePage como en ProductoDetallePage.
 */
export function useProductosDestacados(excludeProductoId?: number) {
  const [productosDestacados, setProductosDestacados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const cargar = async () => {
      try {
        setLoading(true);
        const data = await getProductosDestacados();
        if (!cancelled) {
          // Excluir el producto actual si se proporciona un ID
          const filtrados = excludeProductoId
            ? data.filter(p => p.id_producto !== excludeProductoId)
            : data;
          setProductosDestacados(filtrados);
        }
      } catch (error) {
        console.error('Error al cargar productos destacados:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    cargar();
    return () => { cancelled = true; };
  }, [excludeProductoId]);

  return { productosDestacados, loading };
}

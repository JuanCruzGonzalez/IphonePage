import React from 'react';
import { Producto } from '../../../core/types';
import { ProductoCard } from './ProductoCard';

interface ProductosGridProps {
  productos: Producto[];
  obtenerItemEnCarrito: (id: number) => any;
  actualizarCantidad: (itemId: string, cantidad: number) => void;
  manejarAgregarProducto: (producto: Producto) => void;
  onVerDetalle?: (producto: Producto) => void;
}

export const ProductosGrid: React.FC<ProductosGridProps> = ({
  productos,
  obtenerItemEnCarrito,
  actualizarCantidad,
  manejarAgregarProducto,
  onVerDetalle,
}) => {
  return (
    <>
      <div className="modern-products-grid">
        {productos.map(producto => (
          <ProductoCard
            key={producto.id_producto}
            producto={producto}
            obtenerItemEnCarrito={obtenerItemEnCarrito}
            actualizarCantidad={actualizarCantidad}
            manejarAgregarProducto={manejarAgregarProducto}
            onVerDetalle={onVerDetalle}
          />
        ))}
      </div>

      {productos.length === 0 && (
        <div className="modern-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <p>No se encontraron productos</p>
        </div>
      )}
    </>
  );
};

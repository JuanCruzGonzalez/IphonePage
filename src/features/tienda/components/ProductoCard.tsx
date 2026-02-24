import React from 'react';
import { Producto } from '../../../core/types';
import { formatPriceDolares } from '../../../shared/utils/formatters';
import { getProductImageUrl } from '../../../shared/services/storageService';

interface ProductoCardProps {
  producto: Producto;
  obtenerItemEnCarrito: (id: number) => any;
  actualizarCantidad: (itemId: string, cantidad: number) => void;
  manejarAgregarProducto: (producto: Producto) => void;
  onVerDetalle?: (producto: Producto) => void;
  categoriasProducto?: string[];
}

export const ProductoCard: React.FC<ProductoCardProps> = ({
  producto,
  obtenerItemEnCarrito,
  actualizarCantidad,
  manejarAgregarProducto,
  onVerDetalle,
  categoriasProducto = [],
}) => {
  const itemEnCarrito = obtenerItemEnCarrito(producto.id_producto);

  return (
    <div className="modern-product-card">
      {producto.condicion === 'usado' && (
        <span className="modern-product-badge used">
          {categoriasProducto.some(c => c.toLowerCase().includes('premium')) ? 'Usado Premium' : 'Usado'}
        </span>
      )}
      {producto.promocion_activa && producto.precio_promocion && (
        <span className={`modern-product-badge${producto.condicion === 'usado' ? ' with-used' : ''}`}>Oferta</span>
      )}
      <div
        className="modern-product-image"
        onClick={() => onVerDetalle?.(producto)}
        style={{ cursor: onVerDetalle ? 'pointer' : 'default' }}
      >
        <img 
        className="product-slider-image"
        src={getProductImageUrl(producto.imagenes?.[0]?.imagen_path || null) || undefined} alt={producto.nombre} />
      </div>
      <div className="modern-product-content">
        <span className="modern-product-stock">
          {producto.stock > 0 ? 'En stock' : 'Sin stock'}
        </span>
        <h3
          className="modern-product-name"
          onClick={() => onVerDetalle?.(producto)}
          style={{ cursor: onVerDetalle ? 'pointer' : 'default' }}
        >
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p className="modern-product-desc">{producto.descripcion}</p>
        )}
        <div className="modern-product-footer">
          <div className="modern-product-pricing">
            {producto.promocion_activa && producto.precio_promocion != null ? (
              <>
                <span className="modern-product-old-price">
                  {formatPriceDolares(producto.precioventa, producto.dolares)}
                </span>
                <span className="modern-product-price promo">
                  {formatPriceDolares(producto.precio_promocion, producto.dolares)}
                </span>
              </>
            ) : (
              <span className="modern-product-price">
                {formatPriceDolares(producto.precioventa, producto.dolares)}
              </span>
            )}
          </div>
          {itemEnCarrito ? (
            <div className="modern-product-quantity">
              <button
                onClick={() => actualizarCantidad(
                  `producto-${producto.id_producto}`,
                  itemEnCarrito.cantidad - 1
                )}
                className="modern-quantity-btn">−</button>
              <span className="modern-quantity-value">
                {itemEnCarrito.cantidad}
              </span>
              <button
                onClick={() => actualizarCantidad(
                  `producto-${producto.id_producto}`,
                  itemEnCarrito.cantidad + 1
                )}
                className="modern-quantity-btn">+</button>
            </div>
          ) : (
            <button
              onClick={() => manejarAgregarProducto(producto)}
              disabled={producto.stock <= 0}
              className="modern-add-btn">
              Añadir al carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

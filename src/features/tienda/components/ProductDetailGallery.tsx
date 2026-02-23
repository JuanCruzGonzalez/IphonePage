import React, { useState } from 'react';
import { ProductoImagen } from '../../../core/types';
import { getProductImageUrl } from '../../../shared/services/storageService';

interface ProductDetailGalleryProps {
  imagenes: ProductoImagen[];
  nombreProducto: string;
}

export const ProductDetailGallery: React.FC<ProductDetailGalleryProps> = ({
  imagenes,
  nombreProducto,
}) => {
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);

  const imagenesOrdenadas = [...imagenes].sort((a, b) => a.orden - b.orden);

  if (imagenesOrdenadas.length === 0) {
    return (
      <div className="pdg">
        <div className="pdg-main">
          <div className="pdg-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <p>Sin imagen</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pdg">
      {/* Imagen principal grande */}
      <div className="pdg-main">
        <img
          src={getProductImageUrl(imagenesOrdenadas[imagenSeleccionada].imagen_path) || undefined}
          alt={nombreProducto}
          className="pdg-main-img"
        />
      </div>

      {/* Miniaturas debajo */}
      {imagenesOrdenadas.length > 1 && (
        <div className="pdg-thumbs">
          {imagenesOrdenadas.map((imagen, index) => (
            <button
              key={imagen.id_producto_imagen}
              className={`pdg-thumb ${index === imagenSeleccionada ? 'active' : ''}`}
              onClick={() => setImagenSeleccionada(index)}
              onMouseEnter={() => setImagenSeleccionada(index)}
            >
              <img
                src={getProductImageUrl(imagen.imagen_path) || undefined}
                alt={`${nombreProducto} ${index + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
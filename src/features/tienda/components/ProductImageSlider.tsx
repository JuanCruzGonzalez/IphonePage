import React, { useState } from 'react';
import { ProductoImagen } from '../../../core/types';
import { getProductImageUrl } from '../../../shared/services/storageService';

interface ProductImageSliderProps {
  imagenes: ProductoImagen[];
  nombreProducto: string;
  hasPromo?: boolean;
}

export const ProductImageSlider: React.FC<ProductImageSliderProps> = ({
  imagenes,
  nombreProducto,
  hasPromo = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Si no hay imágenes, mostrar placeholder
  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="product-slider-wrapper">
        <div className="product-slider-placeholder">📦</div>
        {hasPromo && <span className="product-slider-badge offer">Oferta</span>}
      </div>
    );
  }

  // Ordenar imágenes por orden
  const imagenesOrdenadas = [...imagenes].sort((a, b) => a.orden - b.orden);

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imagenesOrdenadas.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === imagenesOrdenadas.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  // Si solo hay una imagen, no mostrar controles
  const showControls = imagenesOrdenadas.length > 1;

  return (
    <div className="product-slider-wrapper">
      <div className="product-slider-container">
        <img
          src={getProductImageUrl(imagenesOrdenadas[currentIndex].imagen_path) || undefined}
          alt={`${nombreProducto} - imagen ${currentIndex + 1}`}
          className="product-slider-image"
        />

        {showControls && (
          <>
            <button
              className="product-slider-btn product-slider-btn-prev"
              onClick={handlePrevious}
              aria-label="Imagen anterior"
            >
              <span>‹</span>
            </button>
            <button
              className="product-slider-btn product-slider-btn-next"
              onClick={handleNext}
              aria-label="Imagen siguiente"
            >
              <span>›</span>
            </button>

            <div className="product-slider-dots">
              {imagenesOrdenadas.map((_, index) => (
                <button
                  key={index}
                  className={`product-slider-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={(e) => handleDotClick(e, index)}
                  aria-label={`Ver imagen ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
};

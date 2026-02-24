import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Producto } from '../../../core/types';
import { ProductoCard } from './ProductoCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductosDestacadosSliderProps {
  productos: Producto[];
  obtenerItemEnCarrito: (id: number) => any;
  actualizarCantidad: (itemId: string, cantidad: number) => void;
  manejarAgregarProducto: (producto: Producto) => void;
  onVerDetalle?: (producto: Producto) => void;
}

export const ProductosDestacadosSlider: React.FC<ProductosDestacadosSliderProps> = ({
  productos,
  obtenerItemEnCarrito,
  actualizarCantidad,
  manejarAgregarProducto,
  onVerDetalle,
}) => {
  if (productos.length === 0) return null;

  return (
    <div className="featured-swiper-container">
      <Swiper
        modules={[Navigation]}
        spaceBetween={30}
        slidesPerView={4}
        navigation={{
            addIcons: true,
        }}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          900: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1200: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
        }}
      >
        {productos.map((producto) => (
          <SwiperSlide key={producto.id_producto}>
            <ProductoCard
              producto={producto}
              obtenerItemEnCarrito={obtenerItemEnCarrito}
              actualizarCantidad={actualizarCantidad}
              manejarAgregarProducto={manejarAgregarProducto}
              onVerDetalle={onVerDetalle}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

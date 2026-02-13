import React, { useState, useEffect } from 'react';
import { Promocion, PromocionConDetallesCompletos } from '../../../core/types';
import { getPromocionesActivasConDetalles } from '../services/promocionService';
import { getPromocionImageUrl } from '../../../shared/services/storageService';
import { formatPriceLocale } from '../../../shared/utils';

interface ClientePromocionesProps {
  busqueda: string;
  agregarPromocionAlCarrito: (promocion: Promocion, cantidad: number) => void;
}

export const ClientePromociones: React.FC<ClientePromocionesProps> = ({
  busqueda,
  agregarPromocionAlCarrito,
}) => {
  const [promociones, setPromociones] = useState<PromocionConDetallesCompletos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPromociones();
  }, []);

  const cargarPromociones = async () => {
    try {
      const data = await getPromocionesActivasConDetalles();
      setPromociones(data);
    } catch (error) {
      console.error('Error al cargar promociones:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearPrecioPromocion = (precio: number | null) => {
    if (precio === null) return 'Consultar';
    return formatPriceLocale(precio);
  };

  const promocionesFiltradas = promociones.filter(promo =>
    promo.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="home-loading">
        <div className="home-loading-content">
          <div className="home-loading-spinner" />
          <p className="home-loading-text">Cargando promociones...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* TITLE SECTION */}
      <div className="home-title-section">
        <div className="home-title-left">
          <h1>Promociones Especiales</h1>
          <p className="home-title-results">
            {promocionesFiltradas.length} {promocionesFiltradas.length === 1 ? 'promoción disponible' : 'promociones disponibles'}
          </p>
        </div>
      </div>

      {/* GRID DE PROMOCIONES */}
      <div className="promociones-container">
        <div className="promociones-grid">
          {promocionesFiltradas.length === 0 ? (
            <div className="home-empty-state">
              <div className="home-empty-state-icon">🎁</div>
              <p className="home-empty-state-text">No hay promociones disponibles</p>
            </div>
          ) : (
            promocionesFiltradas.map((promocion) => (
              <div key={promocion.id_promocion} className="promocion-card">
                {/* Imagen de fondo */}
                <div
                  className="promocion-card-image"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('${getPromocionImageUrl(promocion.imagen_path ?? null) || 'https://images.unsplash.com/photo-1573821663912-6df460f9c684?w=500&h=400&fit=crop'}')`
                  }}
                />

                {/* Contenido */}
                <div className="promocion-card-content">
                  <h3 className="promocion-card-title">{promocion.name}</h3>

                  {/* Productos incluidos */}
                  {promocion.productos && promocion.productos.length > 0 && (
                    <div className="promocion-card-productos">
                      <p className="promocion-card-productos-label">Incluye:</p>
                      <ul className="promocion-card-productos-list">
                        {promocion.productos.map((detalle) => (
                          <li key={detalle.id_detalle_promocion} className="promocion-card-producto-item">
                            <span className="promocion-card-producto-icon">•</span>
                            <span className="promocion-card-producto-nombre">
                              {detalle.producto?.nombre}
                            </span>
                            <span className="promocion-card-producto-cantidad">
                              x{detalle.cantidad}{detalle.producto?.id_unidad_medida === 1 ? ' gr' : ' und'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Precio */}
                  <div className="promocion-card-price">
                    {formatearPrecioPromocion(promocion.precio)}
                  </div>

                  {/* Botón agregar */}
                  <button
                    className="promocion-card-button"
                    onClick={() => agregarPromocionAlCarrito(promocion, 1)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

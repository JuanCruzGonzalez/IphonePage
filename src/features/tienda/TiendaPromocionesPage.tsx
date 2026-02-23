import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClientePromociones } from '../promociones/components/ClientePromociones';
import { useCarrito } from './context/CarritoContext';

export const TiendaPromocionesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const busqueda = searchParams.get('q') || '';
  const { agregarPromocionAlCarrito } = useCarrito();

  return (
    <ClientePromociones
      busqueda={busqueda}
      agregarPromocionAlCarrito={agregarPromocionAlCarrito}
    />
  );
};

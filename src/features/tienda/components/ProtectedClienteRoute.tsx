import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useClienteAuth } from '../context/ClienteAuthContext';

interface ProtectedClienteRouteProps {
  children: React.ReactNode;
}

/**
 * Ruta protegida para clientes de la tienda.
 * Redirige a /login-cliente si el usuario no está autenticado como cliente.
 * Guarda la ruta original para redirigir al volver.
 */
export const ProtectedClienteRoute: React.FC<ProtectedClienteRouteProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useClienteAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          color: '#64748b',
        }}
      >
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login-cliente"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};

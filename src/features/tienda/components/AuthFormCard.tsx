import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/log.png';

interface AuthFormCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkTo?: string;
}

/**
 * Tarjeta reutilizable para los formularios de autenticación de la tienda
 * (login, signup, perfil). Mantiene el estilo consistente entre páginas
 * sin repetir el layout contenedor.
 *
 * Local a la feature tienda porque usa el logo y estilo propio de la tienda.
 */
export const AuthFormCard: React.FC<AuthFormCardProps> = ({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}) => (
  <div className="login-container">
    <div className="login-box" style={{ maxWidth: 440 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Link to="/">
          <img src={logo} alt="Logo" style={{ width: 80, height: 'auto' }} />
        </Link>
      </div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
      {footerText && footerLinkText && footerLinkTo && (
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
          {footerText}{' '}
          <Link
            to={footerLinkTo}
            style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}
          >
            {footerLinkText}
          </Link>
        </p>
      )}
    </div>
  </div>
);

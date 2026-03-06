import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useClienteAuth } from '../context/ClienteAuthContext';

/**
 * Menú de usuario para el header de la tienda.
 * - Si no está autenticado: muestra botón "Ingresar".
 * - Si está autenticado: muestra nombre + dropdown con Mi cuenta / Cerrar sesión.
 *
 * Local a la feature tienda porque depende de ClienteAuthContext.
 */
export const ClienteUserMenu: React.FC = () => {
  const { isAuthenticated, isLoading, clientePerfil, signOut } = useClienteAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <Link
        to="/login-cliente"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          color: '#1e293b',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 500,
          background: '#fff',
          transition: 'border-color .2s',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Ingresar
      </Link>
    );
  }

  const displayName = clientePerfil?.nombre
    ? clientePerfil.nombre
    : clientePerfil?.email ?? 'Mi cuenta';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 12px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          background: '#fff',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          color: '#1e293b',
        }}
      >
        {/* Avatar inicial */}
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#2563eb',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {displayName[0].toUpperCase()}
        </span>
        <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,.1)',
            minWidth: 180,
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{clientePerfil?.email}</p>
          </div>
          <Link
            to="/mi-cuenta"
            onClick={() => setOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              color: '#1e293b',
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Mi cuenta
          </Link>
          <button
            onClick={() => { signOut(); setOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              color: '#dc2626',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              width: '100%',
              textAlign: 'left',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

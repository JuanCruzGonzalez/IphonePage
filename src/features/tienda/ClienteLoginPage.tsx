import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useClienteAuth } from './context/ClienteAuthContext';
import { AuthFormCard } from './components/AuthFormCard';
import { FormField } from '../../shared/components/FormField';
import '../../auth/login.css';

/**
 * Página de inicio de sesión para clientes de la tienda.
 * Ruta: /login-cliente
 */
const ClienteLoginPage: React.FC = () => {
  const { signIn, isAuthenticated, isLoading } = useClienteAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/mi-cuenta';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirigir si ya está autenticado
  if (!isLoading && isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err?.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos'
          : err?.message ?? 'Error al iniciar sesión',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormCard
      title="Iniciar Sesión"
      subtitle="Accede a tu cuenta para hacer pedidos"
      footerText="¿No tenés cuenta?"
      footerLinkText="Registrate acá"
      footerLinkTo="/registro"
    >
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <FormField id="email" label="Email" required>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            required
          />
        </FormField>

        <FormField id="password" label="Contraseña" required>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </FormField>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ width: '100%', padding: '10px', marginTop: 8 }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
        <Link
          to="/"
          style={{ color: '#64748b', textDecoration: 'none' }}
        >
          ← Volver a la tienda
        </Link>
      </p>
    </AuthFormCard>
  );
};

export default ClienteLoginPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClienteAuth } from './context/ClienteAuthContext';
import { AuthFormCard } from './components/AuthFormCard';
import { FormField } from '../../shared/components/FormField';
import '../../auth/login.css';

/**
 * Página de registro de nuevos clientes de la tienda.
 * Ruta: /registro
 */
const ClienteSignupPage: React.FC = () => {
  const { signUp, isAuthenticated, isLoading } = useClienteAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form & { general: string }>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isLoading && isAuthenticated) {
    navigate('/mi-cuenta', { replace: true });
    return null;
  }

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!form.email.trim()) newErrors.email = 'El email es requerido';
    if (form.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (form.password !== form.passwordConfirm) newErrors.passwordConfirm = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      await signUp(
        form.email.trim(),
        form.password,
        form.nombre.trim(),
        form.apellido.trim(),
        form.telefono.trim() || undefined,
      );
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.message ?? 'Error al registrarse';
      setErrors({ general: msg.includes('already') ? 'Ese email ya está registrado' : msg });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthFormCard title="¡Registrado!" subtitle="Revisá tu email para confirmar tu cuenta">
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 8, padding: '16px 20px', textAlign: 'center',
          color: '#15803d', marginBottom: 20,
        }}>
          Te enviamos un email de confirmación. Una vez confirmado podés iniciar sesión.
        </div>
        <p style={{ textAlign: 'center' }}>
          <Link to="/login-cliente" style={{ color: '#2563eb', fontWeight: 500 }}>
            Ir a iniciar sesión
          </Link>
        </p>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard
      title="Crear Cuenta"
      subtitle="Registrate para hacer pedidos online"
      footerText="¿Ya tenés cuenta?"
      footerLinkText="Iniciá sesión"
      footerLinkTo="/login-cliente"
    >
      {errors.general && <div className="error-message">{errors.general}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <FormField id="nombre" label="Nombre" required error={errors.nombre}>
            <input
              id="nombre"
              type="text"
              value={form.nombre}
              onChange={update('nombre')}
              placeholder="Juan"
              autoComplete="given-name"
            />
          </FormField>
          <FormField id="apellido" label="Apellido" required error={errors.apellido}>
            <input
              id="apellido"
              type="text"
              value={form.apellido}
              onChange={update('apellido')}
              placeholder="Pérez"
              autoComplete="family-name"
            />
          </FormField>
        </div>

        <FormField id="email" label="Email" required error={errors.email}>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="tu@email.com"
            autoComplete="email"
          />
        </FormField>

        <FormField id="telefono" label="Teléfono" error={errors.telefono}>
          <input
            id="telefono"
            type="tel"
            value={form.telefono}
            onChange={update('telefono')}
            placeholder="2614000000"
            autoComplete="tel"
          />
        </FormField>

        <FormField id="password" label="Contraseña" required error={errors.password}>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={update('password')}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
          />
        </FormField>

        <FormField id="passwordConfirm" label="Repetir contraseña" required error={errors.passwordConfirm}>
          <input
            id="passwordConfirm"
            type="password"
            value={form.passwordConfirm}
            onChange={update('passwordConfirm')}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </FormField>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ width: '100%', padding: '10px', marginTop: 4 }}
        >
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>
    </AuthFormCard>
  );
};

export default ClienteSignupPage;

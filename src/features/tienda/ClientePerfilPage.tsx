import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClienteAuth } from './context/ClienteAuthContext';
import { FormField } from '../../shared/components/FormField';
import '../../auth/login.css';

/**
 * Página de perfil del cliente.
 * Ruta: /mi-cuenta  (requiere ProtectedClienteRoute)
 *
 * Muestra datos del cliente y permite editarlos.
 */
const ClientePerfilPage: React.FC = () => {
  const { clientePerfil, updatePerfil, signOut } = useClienteAuth();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nombre: clientePerfil?.nombre ?? '',
    apellido: clientePerfil?.apellido ?? '',
    telefono: clientePerfil?.telefono ?? '',
    direccion: clientePerfil?.direccion ?? '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!clientePerfil) return null;

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setSaved(false);
    };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await updatePerfil({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: form.telefono.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
      });
      setSaved(true);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      nombre: clientePerfil.nombre ?? '',
      apellido: clientePerfil.apellido ?? '',
      telefono: clientePerfil.telefono ?? '',
      direccion: clientePerfil.direccion ?? '',
    });
    setEditMode(false);
    setErrors({});
  };

  return (
    <div className="login-container" style={{ alignItems: 'flex-start', paddingTop: 60 }}>
      <div className="login-box" style={{ maxWidth: 520, width: '100%' }}>
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Mi Cuenta</h1>
          <Link to="/" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>
            ← Volver a la tienda
          </Link>
        </div>

        {saved && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 8, padding: '10px 16px', color: '#15803d',
            fontSize: 14, marginBottom: 16,
          }}>
            Datos actualizados correctamente
          </div>
        )}

        {/* Datos del perfil */}
        {editMode ? (
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <FormField id="nombre" label="Nombre" required error={errors.nombre}>
                <input
                  id="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={update('nombre')}
                />
              </FormField>
              <FormField id="apellido" label="Apellido" required error={errors.apellido}>
                <input
                  id="apellido"
                  type="text"
                  value={form.apellido}
                  onChange={update('apellido')}
                />
              </FormField>
            </div>
            <FormField id="telefono" label="Teléfono">
              <input
                id="telefono"
                type="tel"
                value={form.telefono}
                onChange={update('telefono')}
                placeholder="2614000000"
              />
            </FormField>
            <FormField id="direccion" label="Dirección habitual de entrega">
              <textarea
                id="direccion"
                value={form.direccion}
                onChange={update('direccion')}
                rows={2}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', resize: 'vertical' }}
                placeholder="Calle, número..."
              />
            </FormField>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving} style={{ flex: 1, padding: '10px' }}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, padding: '10px' }}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <ProfileRow label="Email" value={clientePerfil.email} />
            <ProfileRow label="Nombre" value={`${clientePerfil.nombre ?? ''} ${clientePerfil.apellido ?? ''}`.trim() || '—'} />
            <ProfileRow label="Teléfono" value={clientePerfil.telefono ?? '—'} />
            <ProfileRow label="Dirección" value={clientePerfil.direccion ?? '—'} />
            <ProfileRow label="Cuenta creada" value={new Date(clientePerfil.created_at).toLocaleDateString('es-AR')} />

            <button
              className="btn-primary"
              onClick={() => setEditMode(true)}
              style={{ width: '100%', padding: '10px', marginTop: 20 }}
            >
              Editar datos
            </button>
          </>
        )}

        {/* Logout */}
        {!editMode && (
          <button
            className="btn-secondary"
            onClick={signOut}
            style={{ width: '100%', padding: '10px', marginTop: 12, color: '#dc2626', borderColor: '#dc2626' }}
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </div>
  );
};

// ── subcomponente local: fila de dato del perfil ──────────────────────────────
const ProfileRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '10px 0', borderBottom: '1px solid #f1f5f9',
  }}>
    <span style={{ fontSize: 13, color: '#64748b', minWidth: 120 }}>{label}</span>
    <span style={{ fontSize: 14, color: '#1e293b', textAlign: 'right' }}>{value}</span>
  </div>
);

export default ClientePerfilPage;

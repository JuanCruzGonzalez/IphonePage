import React from 'react';
import Modal from '../../../shared/components/Modal';
import { Cliente } from '../../../core/types';

interface ModalDetalleClienteProps {
  isOpen: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onToggleEstado: (cliente: Cliente) => void;
}

/**
 * Modal con el detalle completo de un cliente en el panel de administración.
 */
export const ModalDetalleCliente: React.FC<ModalDetalleClienteProps> = ({
  isOpen,
  cliente,
  onClose,
  onToggleEstado,
}) => {
  if (!isOpen || !cliente) return null;

  const nombreCompleto =
    [cliente.nombre, cliente.apellido].filter(Boolean).join(' ') || '—';

  return (
    <Modal close={onClose} title="Detalle del Cliente">
      <div className="modal-minimal-body">
        {/* Estado badge */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <span
            style={{
              padding: '3px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: cliente.estado ? '#dcfce7' : '#fee2e2',
              color: cliente.estado ? '#16a34a' : '#dc2626',
            }}
          >
            {cliente.estado ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Datos personales */}
        <Section title="Datos personales">
          <Row label="Nombre" value={nombreCompleto} />
          <Row label="Email" value={cliente.email} />
          <Row label="Teléfono" value={cliente.telefono ?? '—'} />
          <Row label="Dirección" value={cliente.direccion ?? '—'} />
        </Section>

        {/* Auditoría */}
        <Section title="Información de cuenta">
          <Row
            label="Registrado"
            value={new Date(cliente.created_at).toLocaleDateString('es-AR', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          />
          <Row
            label="Última actualización"
            value={new Date(cliente.updated_at).toLocaleDateString('es-AR', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          />
          <Row label="ID" value={cliente.id_cliente} mono />
        </Section>
      </div>

      <div className="modal-minimal-footer">
        <button className="btn-secondary" onClick={onClose}>
          Cerrar
        </button>
        <button
          className={cliente.estado ? 'btn-danger' : 'btn-primary'}
          onClick={() => { onToggleEstado(cliente); onClose(); }}
          style={cliente.estado ? { background: '#dc2626', color: '#fff', border: 'none' } : undefined}
        >
          {cliente.estado ? 'Desactivar cliente' : 'Activar cliente'}
        </button>
      </div>
    </Modal>
  );
};

// ── subcomponentes locales ────────────────────────────────────────────────────

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div style={{ marginBottom: 20 }}>
    <h4 style={{ margin: '0 0 8px', fontSize: 12, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '.05em' }}>
      {title}
    </h4>
    <div style={{ border: '1px solid #f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
      {children}
    </div>
  </div>
);

const Row: React.FC<{ label: string; value: string; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '9px 14px',
      borderBottom: '1px solid #f8fafc',
      gap: 16,
    }}
  >
    <span style={{ fontSize: 13, color: '#64748b', flexShrink: 0 }}>{label}</span>
    <span
      style={{
        fontSize: 13,
        color: '#1e293b',
        textAlign: 'right',
        wordBreak: 'break-all',
        fontFamily: mono ? 'monospace' : undefined,
      }}
    >
      {value}
    </span>
  </div>
);

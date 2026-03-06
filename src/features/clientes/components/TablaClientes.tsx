import React from 'react';
import { Cliente } from '../../../core/types';
import BotonAccion from '../../promociones/components/BotonAccion';
import { IconEliminar, IconVer, IconAlta } from '../../../shared/components/Iconos';

interface TablaClientesProps {
  clientes: Cliente[];
  onVerDetalle: (cliente: Cliente) => void;
  onToggleEstado: (cliente: Cliente) => void;
}

/**
 * Tabla de clientes para el panel de administración.
 */
export const TablaClientes: React.FC<TablaClientesProps> = ({
  clientes,
  onVerDetalle,
  onToggleEstado,
}) => {
  if (clientes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
        No hay clientes registrados
      </div>
    );
  }

  return (
    <div className='table-wripper'>
      <table className='table'>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Desde</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr
              key={c.id_cliente}
              style={{ borderBottom: '1px solid #f1f5f9' }}
            >
              <td>
                {c.nombre || c.apellido
                  ? `${c.nombre ?? ''} ${c.apellido ?? ''}`.trim()
                  : <span style={{ color: '#94a3b8' }}>—</span>}
              </td>
              <td>{c.email}</td>
              <td>{c.telefono ?? <span style={{ color: '#94a3b8' }}>—</span>}</td>
              <td>
                {new Date(c.created_at).toLocaleDateString('es-AR')}
              </td>
              <td>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: c.estado ? '#dcfce7' : '#fee2e2',
                    color: c.estado ? '#16a34a' : '#dc2626',
                  }}
                >
                  {c.estado ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <BotonAccion handle={() => onVerDetalle(c)} icon={<IconVer />} tipo="ver" p={c} />
                  {c.estado
                    ? (
                      <BotonAccion handle={() => onToggleEstado(c)} icon={<IconEliminar />} tipo="eliminar" p={c} />
                    )
                    : (
                      <BotonAccion handle={() => onToggleEstado(c)} icon={<IconAlta />} tipo="cambiar-estado" p={c} />
                    )
                  }
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
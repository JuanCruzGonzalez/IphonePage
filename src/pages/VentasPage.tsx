import React, { useState } from 'react';
import { VentaConDetalles } from '../types';

interface VentasPageProps {
  ventas: VentaConDetalles[];
  onNuevaVenta: () => void;
  onTogglePago?: (id_venta: number, currentEstado: boolean) => void;
}

export const VentasPage: React.FC<VentasPageProps> = ({ ventas, onNuevaVenta, onTogglePago }) => {

  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaConDetalles | null>(null);

  const calcularTotalVenta = (venta: VentaConDetalles) => {
    return venta.detalle_venta.reduce((total, detalle) => {
      return total + (detalle.cantidad * detalle.precio_unitario); // ✅ Usa el precio guardado
    }, 0);
  };

  const totalVentas = ventas.length;
  const hoy = new Date().toISOString().split('T')[0];
  const ventasHoy = ventas.filter(v => v.fecha === hoy).length;
  const totalRecaudado = ventas.reduce((total, venta) => total + calcularTotalVenta(venta), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ventas</h1>
          <p className="page-subtitle">Gestiona el historial de ventas</p>
        </div>
        <button className="btn-primary" onClick={onNuevaVenta}>
          + Nueva Venta
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card-minimal">
          <div className="stat-label">Total Ventas</div>
          <div className="stat-value">{totalVentas}</div>
        </div>
        <div className="stat-card-minimal">
          <div className="stat-label">Ventas Hoy</div>
          <div className="stat-value">{ventasHoy}</div>
        </div>
        <div className="stat-card-minimal">
          <div className="stat-label">Total Recaudado</div>
          <div className="stat-value">${totalRecaudado}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                ventas.map(venta => (
                  <tr key={venta.id_venta}>
                    <td className="text-muted">#{venta.id_venta}</td>
                    <td>{new Date(venta.fecha).toLocaleDateString('es-ES')}</td>
                    <td>{venta.detalle_venta.length} producto(s)</td>
                    <td><strong>${calcularTotalVenta(venta)}</strong></td>
                    <td>
                      <span className={`status-badge ${venta.estado ? 'active' : 'inactive'}`}>
                        {venta.estado ? 'Pagada' : 'Se debe'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {onTogglePago && (
                      <button
                        className={venta.estado ? 'btn-secondary' : 'btn-primary'}
                        onClick={() => onTogglePago(venta.id_venta, venta.estado)}
                        aria-label={venta.estado ? 'Marcar pendiente' : 'Marcar pagada'}
                        title={venta.estado ? 'Marcar pendiente' : 'Marcar pagada'}
                        style={{ padding: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {venta.estado ? (
                        // Clock / pendiente icon
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        ) : (
                        // Check / pagada icon
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        )}
                      </button>
                      )}
                      <button
                      className="btn-link"
                      onClick={() => setVentaSeleccionada(venta)}
                      aria-label={`Ver detalle venta ${venta.id_venta}`}
                      title="Ver detalle"
                      style={{ padding: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                      {/* Eye / ver detalle icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle */}
      {ventaSeleccionada && (
        <div className="modal-overlay" onClick={() => setVentaSeleccionada(null)}>
          <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-minimal-header">
              <h2>Detalle de Venta #{ventaSeleccionada.id_venta}</h2>
              <button className="btn-close" onClick={() => setVentaSeleccionada(null)}>×</button>
            </div>
            <div className="modal-minimal-body">
              <div className="detail-row">
                <span className="detail-label">Fecha:</span>
                <span>{new Date(ventaSeleccionada.fecha).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estado:</span>
                <span className={`status-badge ${ventaSeleccionada.estado ? 'active' : 'inactive'}`}>
                  {ventaSeleccionada.estado ? 'Pagada' : 'Se debe'}
                </span>
              </div>

              <h3 className="detail-section-title">Productos</h3>
              <div className="detail-list">
                {ventaSeleccionada.detalle_venta.map((detalle) => (
                  <div key={detalle.id_detalle_venta} className="detail-item">
                    <div>
                      <span>{detalle.producto.nombre}</span>
                      <span className="text-muted"> ×{detalle.cantidad}</span>
                      <span style={{ marginLeft: '10px', color: '#666' }}>
                        ${detalle.precio_unitario} c/u
                      </span>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>
                      ${detalle.cantidad * detalle.precio_unitario}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '20px',
                paddingTop: '15px',
                borderTop: '2px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                <span>Total:</span>
                <span>${calcularTotalVenta(ventaSeleccionada)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
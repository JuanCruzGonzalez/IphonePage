import React, { useState } from 'react';
import { VentaConDetalles } from '../types';

interface VentasPageProps {
  ventas: VentaConDetalles[];
  onNuevaVenta: () => void;
}

export const VentasPage: React.FC<VentasPageProps> = ({ ventas, onNuevaVenta }) => {
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaConDetalles | null>(null);

  const totalVentas = ventas.length;
  const hoy = new Date().toISOString().split('T')[0];
  const ventasHoy = ventas.filter(v => v.fecha === hoy).length;

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
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                ventas.map(venta => (
                  <tr key={venta.id_venta}>
                    <td className="text-muted">#{venta.id_venta}</td>
                    <td>{new Date(venta.fecha).toLocaleDateString('es-ES')}</td>
                    <td>{venta.detalle_venta.length} producto(s)</td>
                    <td>
                      <span className={`status-badge ${venta.estado ? 'active' : 'inactive'}`}>
                        {venta.estado ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-link"
                        onClick={() => setVentaSeleccionada(venta)}
                      >
                        Ver detalle →
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
                  {ventaSeleccionada.estado ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              
              <h3 className="detail-section-title">Productos</h3>
              <div className="detail-list">
                {ventaSeleccionada.detalle_venta.map((detalle) => (
                  <div key={detalle.id_detalle_venta} className="detail-item">
                    <span>{detalle.producto.nombre}</span>
                    <span className="text-muted">×{detalle.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
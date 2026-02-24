import React from 'react';
import { VentasMetricsConDolares } from '../../../shared/utils/calculations';
import { formatCurrency } from '../../../shared/utils';

interface VentasMetricsDisplayProps {
  metrics: VentasMetricsConDolares;
  showUSD?: boolean; // Si se muestra la información en dólares
}

/**
 * Componente para mostrar las métricas de ventas con desglose de pesos y dólares
 */
export const VentasMetricsDisplay: React.FC<VentasMetricsDisplayProps> = ({
  metrics,
  showUSD = true,
}) => {
  return (
    <div className="stats-grid">
      {/* Ingresos */}
      <div className="stat-card-minimal">
        <div className="stat-label">Ingreso Total</div>
        <div className="stat-value">{formatCurrency(metrics.revenue)}</div>
        {showUSD && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            ≈ USD {metrics.revenueUSD.toFixed(2)}
          </div>
        )}
        {(metrics.revenueDolares > 0 || metrics.revenuePesos > 0) && (
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            {metrics.revenuePesos > 0 && (
              <div>Pesos: {formatCurrency(metrics.revenuePesos)}</div>
            )}
            {metrics.revenueDolares > 0 && (
              <div>USD: {formatCurrency(metrics.revenueDolares)}</div>
            )}
          </div>
        )}
      </div>

      {/* Costos */}
      <div className="stat-card-minimal">
        <div className="stat-label">Costo Total</div>
        <div className="stat-value">{formatCurrency(metrics.cost)}</div>
        {showUSD && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            ≈ USD {metrics.costUSD.toFixed(2)}
          </div>
        )}
        {(metrics.costDolares > 0 || metrics.costPesos > 0) && (
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            {metrics.costPesos > 0 && (
              <div>Pesos: {formatCurrency(metrics.costPesos)}</div>
            )}
            {metrics.costDolares > 0 && (
              <div>USD: {formatCurrency(metrics.costDolares)}</div>
            )}
            {metrics.gastos > 0 && (
              <div>Gastos: {formatCurrency(metrics.gastos)}</div>
            )}
          </div>
        )}
      </div>

      {/* Ganancia */}
      <div className="stat-card-minimal">
        <div className="stat-label">Ganancia</div>
        <div 
          className="stat-value" 
          style={{ color: metrics.profit >= 0 ? '#22c55e' : '#ef4444' }}
        >
          {formatCurrency(metrics.profit)}
        </div>
        {showUSD && (
          <div style={{ 
            fontSize: '0.75rem', 
            color: metrics.profitUSD >= 0 ? '#16a34a' : '#dc2626',
            marginTop: '0.25rem',
            fontWeight: 500 
          }}>
            ≈ USD {metrics.profitUSD.toFixed(2)}
          </div>
        )}
        {metrics.revenue > 0 && (
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>
            Margen: {((metrics.profit / metrics.revenue) * 100).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};

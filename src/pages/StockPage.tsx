import React from 'react';
import { Producto } from '../types';

interface StockPageProps {
  productos: Producto[];
  onActualizarStock: () => void;
}

export const StockPage: React.FC<StockPageProps> = ({ productos, onActualizarStock }) => {
  const productosOrdenados = [...productos].sort((a, b) => a.stock - b.stock);
  const stockBajo = productos.filter(p => p.stock < 10);
  const stockMedio = productos.filter(p => p.stock >= 10 && p.stock < 30);
  const stockAlto = productos.filter(p => p.stock >= 30);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Control de Stock</h1>
          <p className="page-subtitle">Monitorea el inventario de productos</p>
        </div>
        <button className="btn-primary" onClick={onActualizarStock}>
          + Actualizar Stock
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card-minimal danger">
          <div className="stat-label">Stock Bajo (&lt;10)</div>
          <div className="stat-value">{stockBajo.length}</div>
        </div>
        <div className="stat-card-minimal warning">
          <div className="stat-label">Stock Medio (10-29)</div>
          <div className="stat-value">{stockMedio.length}</div>
        </div>
        <div className="stat-card-minimal success">
          <div className="stat-label">Stock Alto (≥30)</div>
          <div className="stat-value">{stockAlto.length}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Inventario por Stock</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Descripción</th>
                <th>Stock Actual</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {productosOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No hay productos para mostrar
                  </td>
                </tr>
              ) : (
                productosOrdenados.map(producto => (
                  <tr key={producto.id_producto}>
                    <td className="font-medium">{producto.nombre}</td>
                    <td className="text-muted">{producto.descripcion || '—'}</td>
                    <td>
                      <span className={`stock-badge ${producto.stock < 10 ? 'low' : producto.stock < 30 ? 'medium' : 'high'}`}>
                        {producto.stock} {producto.unidad_medida!.abreviacion}
                      </span>
                    </td>
                    <td>
                      {producto.stock < 10 ? (
                        <span className="status-badge danger">⚠️ Reponer</span>
                      ) : producto.stock < 30 ? (
                        <span className="status-badge warning">⚡ Atención</span>
                      ) : (
                        <span className="status-badge success">✓ Óptimo</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerta de stock bajo */}
      {stockBajo.length > 0 && (
        <div className="alert alert-warning">
          <strong>⚠️ Atención:</strong> {stockBajo.length} producto(s) con stock bajo requieren reposición.
        </div>
      )}
    </div>
  );
};
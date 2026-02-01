import React from 'react';
import { Producto } from '../types';

interface ProductosPageProps {
  productos: Producto[];
  onNuevoProducto: () => void;
}

export const ProductosPage: React.FC<ProductosPageProps> = ({ productos, onNuevoProducto }) => {
  const totalProductos = productos.length;
  const stockTotal = productos.reduce((sum, p) => sum + p.stock, 0);
  const stockBajo = productos.filter(p => p.stock < 10).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-subtitle">Administra tu catálogo de productos</p>
        </div>
        <button className="btn-primary" onClick={onNuevoProducto}>
          + Nuevo Producto
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card-minimal">
          <div className="stat-label">Total Productos</div>
          <div className="stat-value">{totalProductos}</div>
        </div>
        <div className="stat-card-minimal">
          <div className="stat-label">Stock Total</div>
          <div className="stat-value">{stockTotal}</div>
        </div>
        <div className="stat-card-minimal">
          <div className="stat-label">Stock Bajo</div>
          <div className="stat-value stat-warning">{stockBajo}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map(producto => (
                  <tr key={producto.id_producto}>
                    <td className="text-muted">#{producto.id_producto}</td>
                    <td className="font-medium">{producto.nombre}</td>
                    <td className="text-muted">{producto.descripcion || '—'}</td>
                    <td>
                      <span className={`stock-badge ${producto.stock < 10 ? 'low' : producto.stock < 30 ? 'medium' : 'high'}`}>
                        {producto.stock}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Producto } from '../types';

interface ProductosPageProps {
  productos: Producto[];
  onNuevoProducto: () => void;
  onEditarProducto?: (producto: Producto) => void;
  onToggleProductoEstado?: (id_producto: number, currentEstado: boolean, nombre?: string) => void;
}

export const ProductosPage: React.FC<ProductosPageProps> = ({ productos, onNuevoProducto, onEditarProducto, onToggleProductoEstado }) => {
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
                <th>Precio de Costo</th>
                <th>Precio de Venta</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
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
                    <td className="text-muted">{producto.costo || '—'}</td>
                    <td className="text-muted">{producto.precioventa || '—'}</td>
                    <td>
                      <span className={`stock-badge ${producto.stock < 10 ? 'low' : producto.stock < 30 ? 'medium' : 'high'}`}>
                        {producto.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${producto.estado ? 'active' : 'inactive'}`}>
                        {producto.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{display: 'flex'}}>
                      <button
                        className="btn-sm btn-secondary mr-2"
                        aria-label="Editar"
                        onClick={() => onEditarProducto?.(producto)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="icon-pencil"
                        >
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                          <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.41l-2.34-2.34a1.003 1.003 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      {onToggleProductoEstado && (
                        producto.estado ? (
                          <button
                            className="btn-sm btn-danger"
                            aria-label="Dar de baja"
                            onClick={() => onToggleProductoEstado?.(producto.id_producto, producto.estado, producto.nombre)}
                            style={{ marginLeft: 8 }}
                          >
                            {/* Trash icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                              <path d="M10 11v6"></path>
                              <path d="M14 11v6"></path>
                            </svg>
                          </button>
                        ) : (
                          <button
                            className="btn-sm btn-primary"
                            aria-label="Dar de alta"
                            onClick={() => onToggleProductoEstado?.(producto.id_producto, producto.estado, producto.nombre)}
                            style={{ marginLeft: 8 , width: '50px', display: 'flex', justifyContent: 'center' }}
                          >
                            {/* Arrow up icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 19V6"></path>
                              <path d="M5 12l7-7 7 7"></path>
                            </svg>
                          </button>
                        )
                      )}
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
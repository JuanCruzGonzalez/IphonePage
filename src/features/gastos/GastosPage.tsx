import React, { useState } from 'react';
import { Gasto } from '../../core/types';

interface GastosPageProps {
  gastos: Gasto[];
  onNuevoGasto: () => void;
  onEditarGasto: (gasto: Gasto) => void;
  onToggleEstado: (id_gasto: number, estadoActual: boolean, descripcion: string | null) => void;
}

export const GastosPage: React.FC<GastosPageProps> = ({
  gastos,
  onNuevoGasto,
  onEditarGasto,
  onToggleEstado,
}) => {
  const [filtroEstado, setFiltroEstado] = useState<'all' | 'activo' | 'inactivo'>('all');

  const gastosFiltrados = gastos.filter(g => {
    if (filtroEstado === 'activo') return g.estado === true;
    if (filtroEstado === 'inactivo') return g.estado === false;
    return true;
  });

  const gastosActivos = gastos.filter(g => g.estado === true);
  const totalGastosActivos = gastosActivos.reduce((sum, g) => sum + g.costo, 0);

  const formatCurrency = (n: number) => {
    try {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
    } catch {
      return `$${n.toFixed(2)}`;
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gastos</h1>
          <p className="page-subtitle">Gestiona los gastos del negocio</p>
        </div>
        <button className="btn-primary" onClick={onNuevoGasto}>
          + Nuevo Gasto
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card-minimal">
          <div className="stat-label">Total Gastos Activos</div>
          <div className="stat-value">{formatCurrency(totalGastosActivos)}</div>
        </div>
        <div className="stat-card-minimal">
          <div className="stat-label">Gastos Activos</div>
          <div className="stat-value">{gastosActivos.length}</div>
        </div>
        <div className="stat-card-minimal">
          <div className="stat-label">Total de Gastos</div>
          <div className="stat-value">{gastos.length}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingRight: '24px' }}>
          <h2 className="card-title">Lista de Gastos</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value as 'all' | 'activo' | 'inactivo')}
              style={{ padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}
            >
              <option value="all">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Costo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {gastosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No hay gastos para mostrar
                  </td>
                </tr>
              ) : (
                gastosFiltrados.map(gasto => (
                  <tr key={gasto.id_gasto}>
                    <td className="font-medium">#{gasto.id_gasto}</td>
                    <td>{gasto.descripcion || <span className="text-muted">Sin descripción</span>}</td>
                    <td className="font-medium">{formatCurrency(gasto.costo)}</td>
                    <td>
                      <span className={`status-badge ${gasto.estado ? 'active' : 'inactive'}`}>
                        {gasto.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        className="btn-sm btn-secondary"
                        aria-label="Editar"
                        onClick={() => onEditarGasto(gasto)}
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
                        >
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                          <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.41l-2.34-2.34a1.003 1.003 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      {gasto.estado ? (
                        <button
                          className="btn-sm btn-danger"
                          aria-label="Desactivar"
                          onClick={() => onToggleEstado(gasto.id_gasto, gasto.estado, gasto.descripcion)}
                          style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                          </svg>
                        </button>
                      ) : (
                        <button
                          className="btn-sm btn-primary"
                          aria-label="Activar"
                          onClick={() => onToggleEstado(gasto.id_gasto, gasto.estado, gasto.descripcion)}
                          style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
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

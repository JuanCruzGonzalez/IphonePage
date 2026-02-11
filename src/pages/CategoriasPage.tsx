import React, { useState } from 'react';
import { Categoria } from '../types';

interface CategoriasPageProps {
  categorias: Categoria[];
  onNuevaCategoria: () => void;
  onEditarCategoria: (categoria: Categoria) => void;
  onToggleEstado: (id_categoria: number, estadoActual: boolean, nombre: string) => void;
}

export const CategoriasPage: React.FC<CategoriasPageProps> = ({
  categorias,
  onNuevaCategoria,
  onEditarCategoria,
  onToggleEstado,
}) => {
  const [filtroEstado, setFiltroEstado] = useState<'all' | 'activo' | 'inactivo'>('all');

  const categoriasFiltradas = categorias.filter(c => {
    if (filtroEstado === 'activo') return c.estado === true;
    if (filtroEstado === 'inactivo') return c.estado === false;
    return true;
  });

  const categoriasActivas = categorias.filter(c => c.estado === true);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-subtitle">Gestiona las categorías de productos</p>
        </div>
        <button className="btn-primary" onClick={onNuevaCategoria}>
          + Nueva Categoría
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card-minimal">
          <div className="stat-label">Categorías Activas</div>
          <div className="stat-value">{categoriasActivas.length}</div>
        </div>
        <div className="stat-card-minimal">
          <div className="stat-label">Total de Categorías</div>
          <div className="stat-value">{categorias.length}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingRight: '24px' }}>
          <h2 className="card-title">Lista de Categorías</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value as 'all' | 'activo' | 'inactivo')}
              style={{ padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}
            >
              <option value="all">Todos</option>
              <option value="activo">Activas</option>
              <option value="inactivo">Inactivas</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No hay categorías para mostrar
                  </td>
                </tr>
              ) : (
                categoriasFiltradas.map(categoria => (
                  <tr key={categoria.id_categoria}>
                    <td className="font-medium">#{categoria.id_categoria}</td>
                    <td className="font-medium">{categoria.nombre}</td>
                    <td>
                      <span className={`status-badge ${categoria.estado ? 'active' : 'inactive'}`}>
                        {categoria.estado ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        className="btn-sm btn-secondary"
                        aria-label="Editar"
                        onClick={() => onEditarCategoria(categoria)}
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
                      {categoria.estado ? (
                        <button
                          className="btn-sm btn-danger"
                          aria-label="Desactivar"
                          onClick={() => onToggleEstado(categoria.id_categoria, categoria.estado, categoria.nombre)}
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
                          onClick={() => onToggleEstado(categoria.id_categoria, categoria.estado, categoria.nombre)}
                          style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 11l3 3L22 4"></path>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
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

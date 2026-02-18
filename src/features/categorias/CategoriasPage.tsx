import React, { useState, useMemo } from 'react';
import { Categoria } from '../../core/types';
import { construirArbolCategorias } from './services/categoriaService';
import { ArbolCategorias } from './components/ArbolCategorias';

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

  // Construir árbol de categorías
  const arbolCategorias = useMemo(() => {
    return construirArbolCategorias(categoriasFiltradas);
  }, [categoriasFiltradas]);

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
                <ArbolCategorias
                  categorias={arbolCategorias}
                  onEditar={onEditarCategoria}
                  onToggleEstado={onToggleEstado}
                />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

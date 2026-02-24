import React, { useState, useMemo } from 'react';
import { usePedidos } from './context/PedidosContext';
import { ModalDetallePedido } from './components/ModalDetallePedido';
import { formatPrice, formatDate } from '../../shared/utils';
import { EstadoPedido } from '../../core/types';

export const PedidosPage: React.FC = () => {
  const {
    pedidos,
    isLoading,
    contadorPendientes,
    metricasHoy,
    handleVerPedido,
    handleCambiarEstado,
    handleBuscarPedidos,
    handleAutoCancelar,
  } = usePedidos();

  const [filtroEstado, setFiltroEstado] = useState<'all' | EstadoPedido>('all');
  const [busqueda, setBusqueda] = useState('');
  const [pedidosFiltrados, setPedidosFiltrados] = useState(pedidos);

  // Filtrar pedidos
  useMemo(() => {
    let resultado = pedidos;

    // Filtro por estado
    if (filtroEstado !== 'all') {
      resultado = resultado.filter(p => p.estado === filtroEstado);
    }

    setPedidosFiltrados(resultado);
  }, [pedidos, filtroEstado]);

  // Buscar
  const handleBuscar = async () => {
    if (busqueda.trim()) {
      const resultados = await handleBuscarPedidos(busqueda);
      setPedidosFiltrados(filtroEstado === 'all' 
        ? resultados 
        : resultados.filter(p => p.estado === filtroEstado)
      );
    } else {
      setPedidosFiltrados(filtroEstado === 'all' 
        ? pedidos 
        : pedidos.filter(p => p.estado === filtroEstado)
      );
    }
  };

  const getEstadoBadgeClass = (estado: EstadoPedido) => {
    const clases = {
      RECIBIDO: 'status-badge-pedido recibido',
      ACEPTADO: 'status-badge-pedido aceptado',
      ENTREGADO: 'status-badge-pedido entregado',
      CANCELADO: 'status-badge-pedido cancelado',
    };
    return clases[estado];
  };

  const getEstadoTexto = (estado: EstadoPedido) => {
    const textos = {
      RECIBIDO: 'Recibido',
      ACEPTADO: 'Aceptado',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };
    return textos[estado];
  };

  const getBotonesAccion = (pedido: any) => {
    const { id_pedido, estado } = pedido;

    if (estado === 'RECIBIDO') {
      return (
        <>
          <button
            className="btn-sm btn-success"
            onClick={() => handleCambiarEstado(id_pedido, 'ACEPTADO')}
            title="Aceptar pedido"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          <button
            className="btn-sm btn-danger"
            onClick={() => handleCambiarEstado(id_pedido, 'CANCELADO')}
            title="Cancelar pedido"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </>
      );
    }

    if (estado === 'ACEPTADO') {
      return (
        <>
          <button
            className="btn-sm btn-primary"
            onClick={() => handleCambiarEstado(id_pedido, 'ENTREGADO')}
            title="Marcar como entregado"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </button>
          <button
            className="btn-sm btn-danger"
            onClick={() => handleCambiarEstado(id_pedido, 'CANCELADO')}
            title="Cancelar pedido"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </>
      );
    }

    return null; // ENTREGADO y CANCELADO no tienen acciones
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <p className="page-subtitle">Gestiona los pedidos de clientes</p>
        </div>
        <button className="btn-secondary" onClick={handleAutoCancelar}>
          🗑️ Auto-cancelar Vencidos
        </button>
      </div>

      {/* Métricas */}
      {metricasHoy && (
        <div className="stats-grid">
          <div className="stat-card-minimal">
            <div className="stat-label">Pedidos Pendientes</div>
            <div className="stat-value stat-warning">{contadorPendientes}</div>
          </div>
          <div className="stat-card-minimal">
            <div className="stat-label">Pedidos Hoy</div>
            <div className="stat-value">{metricasHoy.total}</div>
          </div>
          <div className="stat-card-minimal">
            <div className="stat-label">Entregados Hoy</div>
            <div className="stat-value stat-success">{metricasHoy.entregados}</div>
          </div>
          <div className="stat-card-minimal">
            <div className="stat-label">Ventas Hoy</div>
            <div className="stat-value">{formatPrice(metricasHoy.totalVentas)}</div>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingRight: '24px', padding: '24px' }}>
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value as any)}
            style={{ padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}
          >
            <option value="all">Todos los estados</option>
            <option value="RECIBIDO">Recibidos</option>
            <option value="ACEPTADO">Aceptados</option>
            <option value="ENTREGADO">Entregados</option>
            <option value="CANCELADO">Cancelados</option>
          </select>

          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Buscar por #pedido, teléfono o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
              style={{ flex: 1, padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}
            />
            <button className="btn-primary" onClick={handleBuscar}>
              Buscar
            </button>
            {busqueda && (
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setBusqueda('');
                  setPedidosFiltrados(filtroEstado === 'all' ? pedidos : pedidos.filter(p => p.estado === filtroEstado));
                }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No hay pedidos para mostrar
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map(pedido => (
                  <tr key={pedido.id_pedido}>
                    <td className="font-medium">#{pedido.id_pedido}</td>
                    <td>{formatDate(pedido.fecha_pedido)}</td>
                    <td>{pedido.cliente_nombre}</td>
                    <td>{pedido.cliente_telefono}</td>
                    <td className="font-medium">{formatPrice(pedido.total)}</td>
                    <td>
                      <span className={getEstadoBadgeClass(pedido.estado)}>
                        {getEstadoTexto(pedido.estado)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn-sm btn-secondary"
                          onClick={() => handleVerPedido(pedido)}
                          title="Ver detalle"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        {getBotonesAccion(pedido)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalDetallePedido />
    </div>
  );
};

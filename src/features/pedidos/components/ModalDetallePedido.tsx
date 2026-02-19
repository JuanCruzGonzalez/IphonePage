import React from 'react';
import { usePedidos } from '../context/PedidosContext';
import { formatPrice, formatDate } from '../../../shared/utils';
import { EstadoPedido } from '../../../core/types';

export const ModalDetallePedido: React.FC = () => {
  const { 
    modalDetallePedido, 
    pedidoSeleccionado, 
    handleCambiarEstado 
  } = usePedidos();

  if (!modalDetallePedido.isOpen || !pedidoSeleccionado) return null;

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

  const getMetodoPagoTexto = (metodo: string) => {
    const textos: Record<string, string> = {
      'EFECTIVO': 'Efectivo',
      'TRANSFERENCIA': 'Transferencia',
      'MERCADOPAGO': 'MercadoPago',
    };
    return textos[metodo] || metodo;
  };

  const puedeModificarEstado = (estadoActual: EstadoPedido): boolean => {
    return estadoActual !== 'ENTREGADO' && estadoActual !== 'CANCELADO';
  };

  return (
    <div className="modal-overlay" onClick={modalDetallePedido.close}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>Detalle del Pedido #{pedidoSeleccionado.id_pedido}</h2>
          <button className="modal-close" onClick={modalDetallePedido.close}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Estado y Fecha */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ marginBottom: '4px', color: '#666', fontSize: '14px' }}>Estado actual</div>
              <span className={getEstadoBadgeClass(pedidoSeleccionado.estado)} style={{ fontSize: '16px', padding: '8px 16px' }}>
                {getEstadoTexto(pedidoSeleccionado.estado)}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: '4px', color: '#666', fontSize: '14px' }}>Fecha de pedido</div>
              <div style={{ fontSize: '15px', fontWeight: 500 }}>{formatDate(pedidoSeleccionado.fecha_pedido)}</div>
            </div>
          </div>

          {/* Cliente */}
          <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>👤 Información del Cliente</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
              <div>
                <span style={{ color: '#666' }}>Nombre:</span>
                <div style={{ fontWeight: 500, marginTop: '2px' }}>{pedidoSeleccionado.cliente_nombre}</div>
              </div>
              <div>
                <span style={{ color: '#666' }}>Teléfono:</span>
                <div style={{ fontWeight: 500, marginTop: '2px' }}>{pedidoSeleccionado.cliente_telefono}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#666' }}>Dirección:</span>
                <div style={{ fontWeight: 500, marginTop: '2px' }}>{pedidoSeleccionado.cliente_direccion}</div>
              </div>
              <div>
                <span style={{ color: '#666' }}>Método de Pago:</span>
                <div style={{ fontWeight: 500, marginTop: '2px' }}>{getMetodoPagoTexto(pedidoSeleccionado.metodo_pago || '')}</div>
              </div>
              {pedidoSeleccionado.notas && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: '#666' }}>Notas:</span>
                  <div style={{ fontWeight: 500, marginTop: '2px', fontStyle: 'italic' }}>{pedidoSeleccionado.notas}</div>
                </div>
              )}
            </div>
          </div>

          {/* Productos */}
          <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>📦 Productos</h3>
            <table style={{ width: '100%', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ paddingBottom: '8px', textAlign: 'left', color: '#666', fontWeight: 500 }}>Producto</th>
                  <th style={{ paddingBottom: '8px', textAlign: 'center', color: '#666', fontWeight: 500 }}>Cant.</th>
                  <th style={{ paddingBottom: '8px', textAlign: 'right', color: '#666', fontWeight: 500 }}>Precio Unit.</th>
                  <th style={{ paddingBottom: '8px', textAlign: 'right', color: '#666', fontWeight: 500 }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pedidoSeleccionado.detalles?.map((detalle: any, index: number) => {
                  const subtotal = (detalle.cantidad || 0) * (detalle.precio_unitario || 0);
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                        <div style={{ fontWeight: 500 }}>{detalle.nombre_item || 'Sin nombre'}</div>
                        {detalle.tipo === 'promocion' && (
                          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '2px' }}>🎉 Promoción</div>
                        )}
                      </td>
                      <td style={{ paddingTop: '12px', paddingBottom: '12px', textAlign: 'center' }}>{detalle.cantidad || 0}</td>
                      <td style={{ paddingTop: '12px', paddingBottom: '12px', textAlign: 'right' }}>{formatPrice(detalle.precio_unitario || 0)}</td>
                      <td style={{ paddingTop: '12px', paddingBottom: '12px', textAlign: 'right', fontWeight: 500 }}>{formatPrice(subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ paddingTop: '12px', textAlign: 'right', fontSize: '16px', fontWeight: 600 }}>Total:</td>
                  <td style={{ paddingTop: '12px', textAlign: 'right', fontSize: '18px', fontWeight: 700, color: '#10b981' }}>
                    {formatPrice(pedidoSeleccionado.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Acciones de estado */}
          {puedeModificarEstado(pedidoSeleccionado.estado) && (
            <div className="card" style={{ padding: '16px', backgroundColor: '#f9fafb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>🔄 Cambiar Estado</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {pedidoSeleccionado.estado === 'RECIBIDO' && (
                  <>
                    <button
                      className="btn-success"
                      style={{ flex: 1 }}
                      onClick={() => {
                        handleCambiarEstado(pedidoSeleccionado.id_pedido, 'ACEPTADO');
                        modalDetallePedido.close();
                      }}
                    >
                      ✅ Aceptar Pedido
                    </button>
                    <button
                      className="btn-danger"
                      style={{ flex: 1 }}
                      onClick={() => {
                        handleCambiarEstado(pedidoSeleccionado.id_pedido, 'CANCELADO');
                        modalDetallePedido.close();
                      }}
                    >
                      ❌ Cancelar Pedido
                    </button>
                  </>
                )}
                {pedidoSeleccionado.estado === 'ACEPTADO' && (
                  <>
                    <button
                      className="btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => {
                        handleCambiarEstado(pedidoSeleccionado.id_pedido, 'ENTREGADO');
                        modalDetallePedido.close();
                      }}
                    >
                      🚚 Marcar como Entregado
                    </button>
                    <button
                      className="btn-danger"
                      style={{ flex: 1 }}
                      onClick={() => {
                        handleCambiarEstado(pedidoSeleccionado.id_pedido, 'CANCELADO');
                        modalDetallePedido.close();
                      }}
                    >
                      ❌ Cancelar Pedido
                    </button>
                  </>
                )}
              </div>
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                {pedidoSeleccionado.estado === 'RECIBIDO' && (
                  <p><strong>Nota:</strong> Al aceptar el pedido, podrás marcarlo como entregado después. Al cancelar, se descartará definitivamente.</p>
                )}
                {pedidoSeleccionado.estado === 'ACEPTADO' && (
                  <p><strong>Nota:</strong> Al marcar como entregado se creará automáticamente una venta y se descontará el stock. Esta acción no se puede deshacer.</p>
                )}
              </div>
            </div>
          )}

          {/* Mensaje para estados finales */}
          {!puedeModificarEstado(pedidoSeleccionado.estado) && (
            <div className="card" style={{ padding: '16px', backgroundColor: '#f3f4f6', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {pedidoSeleccionado.estado === 'ENTREGADO' 
                  ? '✅ Este pedido ya fue entregado y procesado como venta.'
                  : '❌ Este pedido fue cancelado.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { VentaConDetalles, Gasto } from '../../core/types';

interface VentasPageProps {
  ventas: VentaConDetalles[];
  gastos?: Gasto[];
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number, opts?: { desde?: string; hasta?: string; estado?: boolean; baja?: boolean }) => void;
  onNuevaVenta: () => void;
  onToggleVentaFlag?: (id_venta: number, field: 'estado' | 'baja', currentValue: boolean, label?: string) => void;
  onSearch?: (opts?: { desde?: string; hasta?: string; estado?: boolean; baja?: boolean }) => void;
}

export const VentasPage: React.FC<VentasPageProps> = ({ ventas, gastos = [], total = 0, page = 1, pageSize = 10, onPageChange, onNuevaVenta, onToggleVentaFlag, onSearch }) => {

  const [desde, setDesde] = useState<string>('');
  const [hasta, setHasta] = useState<string>('');
  const [estadoFilter, setEstadoFilter] = useState<'all' | 'pagada' | 'pendiente' | 'baja'>('all');

  const doSearch = () => {
    if (!onSearch) return;
    const opts: { desde?: string; hasta?: string; estado?: boolean; baja?: boolean } = {};
    if (desde) opts.desde = desde;
    if (hasta) opts.hasta = hasta;
    if (estadoFilter === 'pagada') opts.estado = true;
    if (estadoFilter === 'pendiente') opts.estado = false;
    // si el filtro selecciona las ventas dadas de baja, enviamos baja=true
    // Mostrar ventas dadas de baja SOLO si el filtro es 'baja'.
    // En cualquier otro caso (all/pagada/pendiente) solicitamos baja=false.
    if (estadoFilter === 'baja') opts.baja = true;
    else opts.baja = false;
    onSearch(opts);
  };

  const resetFilters = () => {
    setDesde('');
    setHasta('');
    // Al limpiar queremos traer solamente ventas activas (baja == false)
    setEstadoFilter('all');
    if (onSearch) onSearch({ baja: false });
  };


  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaConDetalles | null>(null);

  const calcularTotalVenta = (venta: VentaConDetalles) => {
    return venta.detalle_venta.reduce((total, detalle) => {
      return total + (detalle.cantidad * detalle.precio_unitario); // ✅ Usa el precio guardado
    }, 0);
  };

  // Formateo de fechas sin efecto de zona horaria (evita -1 día)
  const fechaToYMD = (fecha: string | null | undefined) => {
    if (!fecha) return '';
    const m = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatDate = (fecha: string | null | undefined) => {
    const ymd = fechaToYMD(fecha);
    if (!ymd) return '';
    const [y, m, d] = ymd.split('-').map(Number);
    // Construir Date con componentes locales (evita convertir desde UTC)
    const local = new Date(y, m - 1, d);
    return local.toLocaleDateString('es-ES');
  };

  // const totalVentas = ventas.length; // no longer displayed directly; kept for compatibility if needed
  const hoy = new Date().toISOString().split('T')[0];
  const ventasHoy = ventas.filter(v => fechaToYMD(v.fecha) === hoy).length;

  const formatCurrency = (n: number) => {
    try { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n); } catch { return `$${n.toFixed(2)}`; }
  };

  const computeMetrics = (list: VentaConDetalles[], gastosActivos: Gasto[]) => {
    let revenue = 0;
    let cost = 0;
    for (const venta of list) {
      for (const d of venta.detalle_venta) {
        const qty = d.cantidad || 0;
        const price = d.precio_unitario || 0;
        const prodCost = d.producto?.costo ?? 0;
        revenue += qty * price;
        cost += qty * prodCost;
      }
    }
    // Agregar gastos activos al costo
    const totalGastos = gastosActivos.reduce((sum, g) => sum + g.costo, 0);
    cost += totalGastos;
    
    const profit = revenue - cost;
    return { revenue, cost, profit, gastos: totalGastos };
  };

  // ventas del mes actual
  const ventasMesActual = (() => {
    const now = new Date();
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstYMD = `${firstOfThisMonth.getFullYear()}-${String(firstOfThisMonth.getMonth() + 1).padStart(2, '0')}-01`;
    const lastYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return ventas.filter(v => {
      const ymd = fechaToYMD(v.fecha);
      return ymd >= firstYMD && ymd <= lastYMD;
    });
  })();
  const gastosActivos = gastos.filter(g => g.estado === true);
  const metricsMesActual = computeMetrics(ventasMesActual, gastosActivos);

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
          <div className="stat-label">Ingreso (mes actual)</div>
          <div className="stat-value">{formatCurrency(metricsMesActual.revenue)}</div>
        </div>
        <div className="stat-card-minimal">
          <div className="stat-label">Costo (mes actual)</div>
          <div className="stat-value">{formatCurrency(metricsMesActual.cost)}</div>
        </div>
        <div className="stat-card-minimal">
          <div className="stat-label">Ganancia (mes actual)</div>
          <div className="stat-value">{formatCurrency(metricsMesActual.profit)}</div>
        </div>
        <div className="stat-card-minimal">
          <div className="stat-label">Ventas Hoy</div>
          <div className="stat-value">{ventasHoy}</div>
        </div>
      </div>
      <div className="stats-grid ventas-filters">
        <div className="ventas-filters-row">
          <div className="filter-column">
            <label>Fecha desde</label>
            <input className='inputFlilter' type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="filter-column">
            <label>Fecha hasta</label>
            <input className='inputFlilter' type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <div className="filter-column">
            <label>Estado</label>
            <select className='inputFlilter' value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value as any)}>
              <option value="all">Todos</option>
              <option value="pagada">Pagadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="baja">Dadas de baja</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn-secondary" onClick={doSearch}>Buscar</button>
            <button className="btn-link" onClick={resetFilters}>Limpiar</button>
          </div>
        </div>
      </div>
      {/* Pager */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 12 }}>
        <div>
          Mostrando {total === 0 ? 0 : Math.min((page - 1) * pageSize + 1, total)} - {total === 0 ? 0 : Math.min(page * pageSize, total)} de {total}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {(() => {
            const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
            return (
              <>
                <button className="btn-sm" onClick={() => onPageChange?.(Math.max(1, page - 1), { desde: desde || undefined, hasta: hasta || undefined, estado: estadoFilter === 'pagada' ? true : estadoFilter === 'pendiente' ? false : undefined, baja: estadoFilter === 'baja' ? true : false })} disabled={page <= 1}>◀︎</button>
                <div style={{ padding: '6px 10px' }}>{page} / {totalPages}</div>
                <button className="btn-sm" onClick={() => onPageChange?.(Math.min(totalPages, page + 1), { desde: desde || undefined, hasta: hasta || undefined, estado: estadoFilter === 'pagada' ? true : estadoFilter === 'pendiente' ? false : undefined, baja: estadoFilter === 'baja' ? true : false })} disabled={page >= totalPages}>▶︎</button>
              </>
            );
          })()}
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
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                ventas.map(venta => (
                  <tr key={venta.id_venta}>
                    <td className="text-muted">#{venta.id_venta}</td>
                    <td>{formatDate(venta.fecha)}</td>
                    <td>{venta.detalle_venta.length} producto(s)</td>
                    <td><strong>${calcularTotalVenta(venta)}</strong></td>
                    <td>
                      <span className={`status-badge ${venta.estado ? 'active' : 'inactive'}`}>
                        {venta.estado ? 'Pagada' : 'Se debe'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        className="btn-link"
                        onClick={() => setVentaSeleccionada(venta)}
                        aria-label={`Ver detalle venta ${venta.id_venta}`}
                        title="Ver detalle"
                        style={{ padding: 6, width: '40px', display: 'flex', justifyContent: 'center', height: '40px', alignItems: 'center', border: '1px solid #ddd' }}
                      >
                        {/* Eye / ver detalle icon */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {onToggleVentaFlag && (
                        // Pago toggle (estado)
                        venta.estado ? (
                          <button
                            className="btn-sm btn-secondary"
                            aria-label="Marcar pendiente"
                            title="Marcar pendiente"
                            onClick={() => onToggleVentaFlag(venta.id_venta, 'estado', venta.estado, `Venta #${venta.id_venta}`)}
                            style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd' }}
                          >
                            {/* Clock icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            className="btn-sm btn-secondary"
                            aria-label="Marcar pagada"
                            title="Marcar pagada"
                            onClick={() => onToggleVentaFlag(venta.id_venta, 'estado', venta.estado, `Venta #${venta.id_venta}`)}
                            style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px' }}
                          >
                            {/* Check icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        )
                      )}

                      {onToggleVentaFlag && (
                        // Baja toggle
                        venta.baja ? (
                          <button
                            className="btn-sm btn-primary"
                            aria-label="Dar de alta"
                            title="Dar de alta"
                            onClick={() => onToggleVentaFlag(venta.id_venta, 'baja', venta.baja, `Venta #${venta.id_venta}`)}
                            style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px' }}
                          >
                            {/* Arrow up icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z" fill="#fff" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            className="btn-sm btn-danger"
                            aria-label="Dar de baja"
                            title="Dar de baja"
                            onClick={() => onToggleVentaFlag(venta.id_venta, 'baja', venta.baja, `Venta #${venta.id_venta}`)}
                            style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10 }}
                          >
                            {/* Trash icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                              <path d="M10 11v6"></path>
                              <path d="M14 11v6"></path>
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

      {/* Pager */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <div>
          Mostrando {total === 0 ? 0 : Math.min((page - 1) * pageSize + 1, total)} - {total === 0 ? 0 : Math.min(page * pageSize, total)} de {total}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {(() => {
            const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
            return (
              <>
                <button className="btn-sm" onClick={() => onPageChange?.(Math.max(1, page - 1), { desde: desde || undefined, hasta: hasta || undefined, estado: estadoFilter === 'pagada' ? true : estadoFilter === 'pendiente' ? false : undefined, baja: estadoFilter === 'baja' ? true : false })} disabled={page <= 1}>◀︎</button>
                <div style={{ padding: '6px 10px' }}>{page} / {totalPages}</div>
                <button className="btn-sm" onClick={() => onPageChange?.(Math.min(totalPages, page + 1), { desde: desde || undefined, hasta: hasta || undefined, estado: estadoFilter === 'pagada' ? true : estadoFilter === 'pendiente' ? false : undefined, baja: estadoFilter === 'baja' ? true : false })} disabled={page >= totalPages}>▶︎</button>
              </>
            );
          })()}
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
                <span>{formatDate(ventaSeleccionada.fecha)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estado:</span>
                <span className={`status-badge ${ventaSeleccionada.estado ? 'active' : 'inactive'}`}>
                  {ventaSeleccionada.estado ? 'Pagada' : 'Se debe'}
                </span>
              </div>

              <h3 className="detail-section-title">Productos / Promociones</h3>
              <div className="detail-list">
                {ventaSeleccionada.detalle_venta.map((detalle) => (
                  <div key={detalle.id_detalle_venta} className="detail-item">
                    <div>
                      {detalle.promocion ? (
                        <>
                          <span>{detalle.promocion.name} (Promoción)</span>
                          <span className="text-muted"> ×{detalle.cantidad}</span>
                          <span style={{ marginLeft: '10px', color: '#666' }}>
                            ${detalle.precio_unitario}
                          </span>
                        </>
                      ) : detalle.producto ? (
                        <>
                          <span>{detalle.producto.nombre}</span>
                          <span className="text-muted"> ×{detalle.cantidad}</span>
                          <span style={{ marginLeft: '10px', color: '#666' }}>
                            ${detalle.producto.id_unidad_medida === 1 ? detalle.precio_unitario * 100 : detalle.precio_unitario} {detalle.producto.id_unidad_medida === 1 ? 'x100gr' : ''}
                          </span>
                        </>
                      ) : (
                        <span>Ítem desconocido</span>
                      )}
                    </div>
                    <span style={{ fontWeight: 'bold' }}>
                      ${detalle.cantidad * detalle.precio_unitario}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '20px',
                paddingTop: '15px',
                borderTop: '2px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                <span>Total:</span>
                <span>${calcularTotalVenta(ventaSeleccionada)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
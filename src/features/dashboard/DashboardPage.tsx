import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import './DashboardPage.css';
import { getVentasPage } from '../ventas/services/ventaService';
import { getGastosActivos } from '../gastos/services/gastoService';
import { getCotizacionActual } from '../ventas/services/cotizacionService';
import { calculateMetricsConDolares } from '../../shared/utils/calculations';
import { getCurrentMonthRange, getTodayYMD } from '../../shared/utils/dates';
import { formatCurrency } from '../../shared/utils/formatters';
import { supabase } from '../../core/config/supabase';
import type { VentaConDetalles } from '../../core/types';

// ────────────────────────────────────────────────
//  Small icon helpers (inline SVG)
// ────────────────────────────────────────────────
const IconRevenue = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconTrend = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconCart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const IconGasto = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const IconDolar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" />
    <path d="M8 12h8" />
  </svg>
);
const IconBox = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconPedidos = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);
const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCosto = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

// ────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function getNombreMes(): string {
  const now = new Date();
  return `${MESES[now.getMonth()]} ${now.getFullYear()}`;
}

function calcTopProductos(ventas: VentaConDetalles[]): Array<{ nombre: string; unidades: number; revenue: number }> {
  const map: Record<number, { nombre: string; unidades: number; revenue: number }> = {};
  for (const venta of ventas) {
    for (const d of venta.detalle_venta) {
      const id = d.id_producto;
      if (!id) continue;
      const nombre = d.producto?.nombre ?? `Producto #${id}`;
      const qty = d.cantidad || 0;
      const rev = (d.precio_unitario || 0) * qty;
      if (!map[id]) map[id] = { nombre, unidades: 0, revenue: 0 };
      map[id].unidades += qty;
      map[id].revenue += rev;
    }
  }
  return Object.values(map)
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 5);
}

function calcVentaTotal(venta: VentaConDetalles): number {
  return venta.detalle_venta.reduce((s, d) => s + (d.precio_unitario || 0) * (d.cantidad || 0), 0);
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
const STOCK_CRITICO_UMBRAL = 5;

export const DashboardPage: React.FC = () => {
  const monthRange = useMemo(() => getCurrentMonthRange(), []);
  const hoy = useMemo(() => getTodayYMD(), []);

  // ─── Queries ─────────────────────────────────
  const { data: ventasMesData, isLoading: loadingMes } = useQuery({
    queryKey: ['dashboard', 'ventas-mes', monthRange.start, monthRange.end],
    queryFn: () => getVentasPage(1, 1000, { desde: monthRange.start, hasta: monthRange.end, baja: false }),
    staleTime: 1000 * 60 * 3,
  });

  const { data: ventasHoyData, isLoading: loadingHoy } = useQuery({
    queryKey: ['dashboard', 'ventas-hoy', hoy],
    queryFn: () => getVentasPage(1, 100, { desde: hoy, hasta: hoy, baja: false }),
    staleTime: 1000 * 60 * 2,
  });

  const { data: gastosActivos = [], isLoading: loadingGastos } = useQuery({
    queryKey: ['dashboard', 'gastos-activos'],
    queryFn: getGastosActivos,
    staleTime: 1000 * 60 * 5,
  });

  const { data: cotizacion = 1000, isLoading: loadingCotiz } = useQuery({
    queryKey: ['dashboard', 'cotizacion'],
    queryFn: getCotizacionActual,
    staleTime: 1000 * 60 * 10,
  });

  const { data: stockCritico = [], isLoading: loadingStock } = useQuery({
    queryKey: ['dashboard', 'stock-critico'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('producto')
        .select('id_producto, nombre, stock')
        .eq('estado', true)
        .lte('stock', STOCK_CRITICO_UMBRAL)
        .order('stock', { ascending: true })
        .limit(8);
      if (error) throw error;
      return (data || []) as Array<{ id_producto: number; nombre: string; stock: number }>;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: pedidosPendientes = [], isLoading: loadingPedidos } = useQuery({
    queryKey: ['dashboard', 'pedidos-pendientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('id_pedido, cliente_nombre, estado, total')
        .in('estado', ['RECIBIDO', 'ACEPTADO'])
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data || []) as Array<{ id_pedido: number; cliente_nombre: string; estado: string; total: number | null }>;
    },
    staleTime: 1000 * 60 * 3,
  });

  // ─── Derived ─────────────────────────────────
  const ventasMes: VentaConDetalles[] = ventasMesData?.ventas ?? [];
  const ventasHoy: VentaConDetalles[] = ventasHoyData?.ventas ?? [];

  const metricsMes = useMemo(
    () => calculateMetricsConDolares(ventasMes, gastosActivos, cotizacion),
    [ventasMes, gastosActivos, cotizacion]
  );

  const totalVentasHoy = useMemo(
    () => ventasHoy.reduce((s, v) => s + calcVentaTotal(v), 0),
    [ventasHoy]
  );

  const totalGastos = useMemo(
    () => gastosActivos.reduce((s, g) => s + g.costo, 0),
    [gastosActivos]
  );

  const topProductos = useMemo(() => calcTopProductos(ventasMes), [ventasMes]);
  const maxUnidades = topProductos[0]?.unidades ?? 1;

  const isLoading = loadingMes || loadingGastos || loadingCotiz;

  // ─── Render helpers ──────────────────────────
  const renderKPI = (
    value: string,
    label: string,
    sub: string | null,
    subClass: '' | 'positive' | 'negative',
    iconEl: React.ReactNode,
    iconClass: string,
    cardClass: string,
    loading = false,
  ) => (
    <div className={`kpi-card ${cardClass}`}>
      <div className={`kpi-icon ${iconClass}`}>{iconEl}</div>
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value${loading ? ' loading' : ''}`}>{loading ? '\u00a0' : value}</div>
      {sub && <div className={`kpi-sub ${subClass}`}>{sub}</div>}
    </div>
  );

  const margenPct = metricsMes.revenue > 0
    ? ((metricsMes.profit / metricsMes.revenue) * 100).toFixed(1)
    : '0';
  const margenClass: '' | 'positive' | 'negative' = metricsMes.profit >= 0 ? 'positive' : 'negative';

  return (
    <div className="dashboard-page">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen general del negocio</p>
        </div>
        <span className="dashboard-badge-mes">{getNombreMes()}</span>
      </div>

      {/* ── KPI Row 1: financiero del mes ── */}
      <div className="dashboard-kpi-grid">
        {renderKPI(
          formatCurrency(metricsMes.revenue),
          'Ingresos del mes',
          `USD ${(metricsMes.revenue / cotizacion).toFixed(0)}`,
          '',
          <IconRevenue />, 'blue', 'ingresos', isLoading,
        )}
        {renderKPI(
          formatCurrency(metricsMes.profit),
          'Ganancia del mes',
          `Margen: ${margenPct}%`,
          margenClass,
          <IconTrend />, 'green', 'ganancia', isLoading,
        )}
        {renderKPI(
          formatCurrency(metricsMes.cost - metricsMes.gastos),
          'Costo de ventas',
          `Gastos fijos: ${formatCurrency(metricsMes.gastos)}`,
          '',
          <IconCosto />, 'gray', 'costo', isLoading,
        )}
        {renderKPI(
          String(ventasMes.length),
          'Ventas del mes',
          ventasMes.length === 1 ? '1 registro' : `${ventasMes.length} registros`,
          '',
          <IconCart />, 'purple', 'ventas', loadingMes,
        )}
      </div>

      {/* ── KPI Row 2: hoy + cotización + gastos ── */}
      <div className="dashboard-kpi-grid">
        {renderKPI(
          formatCurrency(totalVentasHoy),
          'Ventas de hoy',
          `${ventasHoy.length} venta${ventasHoy.length !== 1 ? 's' : ''}`,
          ventasHoy.length > 0 ? 'positive' : '',
          <IconClock />, 'orange', 'hoy-monto', loadingHoy,
        )}
        {renderKPI(
          formatCurrency(totalGastos),
          'Gastos fijos activos',
          `${gastosActivos.length} concepto${gastosActivos.length !== 1 ? 's' : ''}`,
          '',
          <IconGasto />, 'red', 'gastos', loadingGastos,
        )}
        {renderKPI(
          loadingCotiz ? '…' : `$${Number(cotizacion).toLocaleString('es-AR')}`,
          'Cotización dólar',
          'Precio de referencia',
          '',
          <IconDolar />, 'yellow', 'cotizacion', loadingCotiz,
        )}
        {renderKPI(
          String(stockCritico.length),
          'Productos sin stock',
          stockCritico.length > 0 ? 'Requieren reposición' : 'Sin alertas',
          stockCritico.length > 0 ? 'negative' : 'positive',
          <IconBox />, 'red', 'gastos', loadingStock,
        )}
      </div>

      {/* ── Pedidos + Stock crítico ── */}
      <div className="dashboard-mid-grid">
        {/* Pedidos pendientes */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <h3>
              <span className="header-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}><IconPedidos /></span>
              Pedidos pendientes
            </h3>
            {pedidosPendientes.length > 0 && (
              <span className="badge-count warning">{pedidosPendientes.length}</span>
            )}
          </div>
          <div className="section-card-body">
            {loadingPedidos ? (
              <div className="empty-state">Cargando…</div>
            ) : pedidosPendientes.length === 0 ? (
              <div className="empty-state">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <div>Sin pedidos pendientes</div>
              </div>
            ) : (
              <ul className="pending-list">
                {pedidosPendientes.map((p) => (
                  <li key={p.id_pedido}>
                    <span className="pending-name">{p.cliente_nombre || `Pedido #${p.id_pedido}`}</span>
                    <span className={`pending-estado ${p.estado.toLowerCase()}`}>{p.estado}</span>
                    {p.total != null && (
                      <span className="pending-monto">{formatCurrency(p.total)}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Stock crítico */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <h3>
              <span className="header-icon" style={{ background: '#fee2e2', color: '#dc2626' }}><IconBox /></span>
              Stock crítico
            </h3>
            {stockCritico.length > 0 && (
              <span className="badge-count danger">{stockCritico.length}</span>
            )}
          </div>
          <div className="section-card-body">
            {loadingStock ? (
              <div className="empty-state">Cargando…</div>
            ) : stockCritico.length === 0 ? (
              <div className="empty-state">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <div>Todos los productos tienen stock suficiente</div>
              </div>
            ) : (
              <ul className="stock-list">
                {stockCritico.map((p) => {
                  const pct = Math.min((p.stock / STOCK_CRITICO_UMBRAL) * 100, 100);
                  const cls = p.stock === 0 ? 'low' : p.stock <= 2 ? 'low' : 'medium';
                  return (
                    <li key={p.id_producto}>
                      <span className="stock-nombre">{p.nombre}</span>
                      <div className="stock-amount">
                        <div className="stock-bar-wrap">
                          <div className={`stock-bar-fill ${cls}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`stock-num ${cls}`}>{p.stock}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ── Top productos + Últimas ventas ── */}
      <div className="dashboard-bottom-grid">
        {/* Top productos del mes */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <h3>
              <span className="header-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><IconStar /></span>
              Top productos del mes
            </h3>
          </div>
          <div className="section-card-body">
            {loadingMes ? (
              <div className="empty-state">Cargando…</div>
            ) : topProductos.length === 0 ? (
              <div className="empty-state">Sin ventas este mes</div>
            ) : (
              <table className="top-productos-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th style={{ textAlign: 'center' }}>Uds.</th>
                    <th>Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductos.map((p, i) => (
                    <tr key={p.nombre + i}>
                      <td><span className={`top-rank r${i + 1}`}>{i + 1}</span></td>
                      <td><span className="top-nombre" title={p.nombre}>{p.nombre}</span></td>
                      <td className="top-unidades">{p.unidades}</td>
                      <td>
                        <div className="revenue-bar-wrap">
                          <div className="revenue-bar-fill" style={{ width: `${(p.unidades / maxUnidades) * 100}%` }} />
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{formatCurrency(p.revenue)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Últimas ventas */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <h3>
              <span className="header-icon" style={{ background: '#d1fae5', color: '#059669' }}><IconCart /></span>
              Últimas ventas
            </h3>
          </div>
          <div className="section-card-body">
            {loadingMes ? (
              <div className="empty-state">Cargando…</div>
            ) : ventasMes.length === 0 ? (
              <div className="empty-state">Sin ventas este mes</div>
            ) : (
              <ul className="ultimas-ventas-list">
                {[...ventasMes]
                  .sort((a, b) => b.id_venta - a.id_venta)
                  .slice(0, 7)
                  .map((v) => {
                    const total = calcVentaTotal(v);
                    const items = v.detalle_venta.length;
                    return (
                      <li key={v.id_venta}>
                        <div className="venta-dot" />
                        <div className="venta-info">
                          <div className="venta-titulo">
                            Venta #{v.id_venta} — {items} ítem{items !== 1 ? 's' : ''}
                          </div>
                          <div className="venta-fecha">{v.fecha}</div>
                        </div>
                        <div className="venta-monto">{formatCurrency(total)}</div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

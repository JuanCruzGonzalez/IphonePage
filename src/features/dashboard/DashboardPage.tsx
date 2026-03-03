import React, { useMemo } from 'react';
import './DashboardPage.css';
import { calculateMetricsConDolares } from '../../shared/utils/calculations';
import { formatCurrency } from '../../shared/utils/formatters';
import type { VentaConDetalles } from '../../core/types';
import { IconBox, IconCart, IconClock, IconCosto, IconDolar, IconGasto, IconRevenue, IconTrend } from './componentes/iconos';
import { calcTopProductos, calcVentaTotal, getNombreMes } from './funciones';
import { useDashboardData } from './queryes';
import RenderKPI from './componentes/KPI';
import PedidosPendientes from './componentes/PedidosPendientes';
import StockCritico from './componentes/StockCritico';
import ProductosMes from './componentes/ProductosMes';
import UltimasVentas from './componentes/UltimasVentas';

export const DashboardPage: React.FC = () => {
  const {
    ventasMesData,
    loadingMes,
    ventasHoyData,
    loadingHoy,
    gastosActivos,
    loadingGastos,
    cotizacion,
    loadingCotiz,
    stockCritico,
    loadingStock,
    pedidosPendientes,
    loadingPedidos,
  } = useDashboardData();

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

  const margenPct = metricsMes.revenue > 0
    ? ((metricsMes.profit / metricsMes.revenue) * 100).toFixed(1)
    : '0';
  const margenClass: '' | 'positive' | 'negative' = metricsMes.profit >= 0 ? 'positive' : 'negative';

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen general del negocio</p>
        </div>
        <span className="dashboard-badge-mes">{getNombreMes()}</span>
      </div>

      <div className="dashboard-kpi-grid">
        <RenderKPI
          value={formatCurrency(metricsMes.revenue)}
          label="Ingresos del mes" sub={`USD ${(metricsMes.revenue / cotizacion).toFixed(0)}`}
          subClass="" iconEl={<IconRevenue />}
          iconClass="blue"
          cardClass="ingresos"
          loading={isLoading}
        />

        <RenderKPI
          value={formatCurrency(metricsMes.profit)}
          label="Ganancia del mes" sub={`Margen: ${margenPct}%`}
          subClass={margenClass} iconEl={<IconTrend />}
          iconClass="green"
          cardClass="ganancia"
          loading={isLoading}
        />

        <RenderKPI
          value={formatCurrency(metricsMes.cost - metricsMes.gastos)}
          label="Costo de ventas" sub={`Gastos fijos: ${formatCurrency(metricsMes.gastos)}`}
          subClass="" iconEl={<IconCosto />}
          iconClass="gray"
          cardClass="costo"
          loading={isLoading}
        />

        <RenderKPI
          value={String(ventasMes.length)}
          label="Ventas del mes" sub={ventasMes.length === 1 ? '1 registro' : `${ventasMes.length} registros`}
          subClass="" iconEl={<IconCart />}
          iconClass="purple"
          cardClass="ventas"
          loading={loadingMes}
        />
      </div>

      <div className="dashboard-kpi-grid">
        <RenderKPI
          value={formatCurrency(totalVentasHoy)}
          label="Ventas de hoy"
          sub={`${ventasHoy.length} venta${ventasHoy.length !== 1 ? 's' : ''}`}
          subClass={ventasHoy.length > 0 ? 'positive' : ''}
          iconEl={<IconClock />}
          iconClass="orange" cardClass="hoy-monto"
          loading={loadingHoy}
        />

        <RenderKPI
          value={formatCurrency(totalGastos)}
          label="Gastos fijos activos"
          sub={`${gastosActivos.length} concepto${gastosActivos.length !== 1 ? 's' : ''}`}
          subClass="" iconEl={<IconGasto />}
          iconClass="red"
          cardClass="gastos"
          loading={loadingGastos}
        />

        <RenderKPI
          value={loadingCotiz ? '…' : `$${Number(cotizacion).toLocaleString('es-AR')}`}
          label="Cotización dólar"
          sub="Precio de referencia"
          subClass="" iconEl={<IconDolar />}
          iconClass="yellow"
          cardClass="cotizacion"
          loading={loadingCotiz}
        />

        <RenderKPI
          value={String(stockCritico.length)}
          label="Productos sin stock"
          sub={stockCritico.length > 0 ? 'Requieren reposición' : 'Sin alertas'}
          subClass={stockCritico.length > 0 ? 'negative' : 'positive'} iconEl={<IconBox />}
          iconClass="red"
          cardClass="gastos"
          loading={loadingStock}
        />
      </div>

      <div className="dashboard-mid-grid">
        <PedidosPendientes pedidosPendientes={pedidosPendientes} loadingPedidos={loadingPedidos}/>
        <StockCritico stockCritico={stockCritico} loadingStock={loadingStock}/>
      </div>

      <div className="dashboard-bottom-grid">
        <ProductosMes topProductos={topProductos} maxUnidades={maxUnidades} loadingMes={loadingMes} />
        <UltimasVentas ventasMes={ventasMes} loadingMes={loadingMes} />
      </div>
    </div>
  );
};

export default DashboardPage;

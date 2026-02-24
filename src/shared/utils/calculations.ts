/**
 * Utilidades para cálculos (totales, métricas, ganancias, etc.)
 */

import type { VentaConDetalles, Gasto } from '../../core/types';

/**
 * Interfaz para items del carrito
 */
export interface CartItem {
  precio: number;
  cantidad: number;
}

/**
 * Calcula el total de un carrito
 * @param items - Array de items del carrito con precio y cantidad
 * @returns Total del carrito
 */
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
};

/**
 * Calcula el total de una venta basado en sus detalles
 * @param venta - Venta con detalles
 * @returns Total de la venta
 */
export const calculateVentaTotal = (venta: VentaConDetalles): number => {
  return venta.detalle_venta.reduce((total, detalle) => {
    return total + (detalle.cantidad * detalle.precio_unitario);
  }, 0);
};

/**
 * Interfaz para métricas de ventas
 */
export interface VentasMetrics {
  revenue: number;    // Ingresos totales en pesos
  cost: number;       // Costos totales en pesos (productos + gastos)
  profit: number;     // Ganancia en pesos (ingresos - costos)
  gastos: number;     // Total de gastos
}

/**
 * Interfaz para métricas de ventas con información de dólares
 */
export interface VentasMetricsConDolares extends VentasMetrics {
  revenueUSD: number;   // Ingresos en dólares
  costUSD: number;      // Costos en dólares
  profitUSD: number;    // Ganancia en dólares
  // Desglose por moneda
  revenuePesos: number;  // Ingresos solo de productos en pesos
  revenueDolares: number; // Ingresos de productos en dólares (convertido a pesos)
  costPesos: number;     // Costos solo de productos en pesos
  costDolares: number;   // Costos de productos en dólares (convertido a pesos)
}

/**
 * Calcula métricas completas de un conjunto de ventas
 * VERSIÓN LEGACY - No considera productos en dólares
 * @param ventas - Array de ventas con detalles
 * @param gastosActivos - Array de gastos activos
 * @returns Métricas calculadas (ingresos, costos, ganancias, gastos)
 */
export const calculateMetrics = (
  ventas: VentaConDetalles[],
  gastosActivos: Gasto[]
): VentasMetrics => {
  let revenue = 0;
  let cost = 0;

  // Calcular ingresos y costos de productos vendidos
  for (const venta of ventas) {
    const cotizacion = venta.cotizacion_dolar || 1000; // Usar cotización de la venta o default

    for (const detalle of venta.detalle_venta) {
      const qty = detalle.cantidad || 0;
      const price = detalle.precio_unitario || 0;
      const productCost = detalle.producto?.costo ?? 0;
      const esProductoEnDolares = detalle.producto?.dolares ?? false;
      
      // Si el producto está en dólares, convertir a pesos usando la cotización de la venta
      const precioEnPesos = esProductoEnDolares ? price * cotizacion : price;
      const costoEnPesos = esProductoEnDolares ? productCost * cotizacion : productCost;

      revenue += qty * precioEnPesos;
      cost += qty * costoEnPesos;
    }
  }

  // Agregar gastos activos al costo
  const totalGastos = gastosActivos.reduce((sum, gasto) => sum + gasto.costo, 0);
  cost += totalGastos;

  const profit = revenue - cost;

  return {
    revenue,
    cost,
    profit,
    gastos: totalGastos,
  };
};

/**
 * Calcula métricas completas de un conjunto de ventas incluyendo información de dólares
 * @param ventas - Array de ventas con detalles
 * @param gastosActivos - Array de gastos activos
 * @param cotizacionActual - Cotización actual del dólar para mostrar equivalente en USD
 * @returns Métricas calculadas con desglose por moneda
 */
export const calculateMetricsConDolares = (
  ventas: VentaConDetalles[],
  gastosActivos: Gasto[],
  cotizacionActual: number = 1000
): VentasMetricsConDolares => {
  let revenuePesos = 0;
  let revenueDolares = 0;
  let costPesos = 0;
  let costDolares = 0;

  // Calcular ingresos y costos de productos vendidos
  for (const venta of ventas) {
    const cotizacionVenta = venta.cotizacion_dolar || cotizacionActual;

    for (const detalle of venta.detalle_venta) {
      const qty = detalle.cantidad || 0;
      const price = detalle.precio_unitario || 0;
      const productCost = detalle.producto?.costo ?? 0;
      const esProductoEnDolares = detalle.producto?.dolares ?? false;
      
      if (esProductoEnDolares) {
        // Producto en dólares: convertir usando la cotización de la venta
        const precioEnPesos = price * cotizacionVenta;
        const costoEnPesos = productCost * cotizacionVenta;
        
        revenueDolares += qty * precioEnPesos;
        costDolares += qty * costoEnPesos;
      } else {
        // Producto en pesos
        revenuePesos += qty * price;
        costPesos += qty * productCost;
      }
    }
  }

  // Totales en pesos
  const revenue = revenuePesos + revenueDolares;
  const cost = costPesos + costDolares;
  
  // Agregar gastos activos al costo
  const totalGastos = gastosActivos.reduce((sum, gasto) => sum + gasto.costo, 0);
  const totalCost = cost + totalGastos;

  const profit = revenue - totalCost;

  // Convertir totales a dólares usando cotización actual
  const revenueUSD = revenue / cotizacionActual;
  const costUSD = totalCost / cotizacionActual;
  const profitUSD = profit / cotizacionActual;

  return {
    revenue,
    cost: totalCost,
    profit,
    gastos: totalGastos,
    revenueUSD,
    costUSD,
    profitUSD,
    revenuePesos,
    revenueDolares,
    costPesos,
    costDolares,
  };
};

/**
 * Calcula el subtotal de una lista de items (productos o promociones)
 * @param items - Array de items con cantidad y precio
 * @returns Subtotal calculado
 */
export const calculateSubtotal = (
  items: Array<{ cantidad: number; precio?: number | null; precioventa?: number }>
): number => {
  return items.reduce((total, item) => {
    const precio = item.precio ?? item.precioventa ?? 0;
    return total + (item.cantidad * precio);
  }, 0);
};

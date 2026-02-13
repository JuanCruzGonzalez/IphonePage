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
  revenue: number;    // Ingresos totales
  cost: number;       // Costos totales (productos + gastos)
  profit: number;     // Ganancia (ingresos - costos)
  gastos: number;     // Total de gastos
}

/**
 * Calcula métricas completas de un conjunto de ventas
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
    for (const detalle of venta.detalle_venta) {
      const qty = detalle.cantidad || 0;
      const price = detalle.precio_unitario || 0;
      const productCost = detalle.producto?.costo ?? 0;
      
      revenue += qty * price;
      cost += qty * productCost;
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

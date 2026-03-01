import type { VentaConDetalles, Gasto } from '../../core/types';

export interface CartItem {
  precio: number;
  cantidad: number;
}

export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
};

export const calculateVentaTotal = (venta: VentaConDetalles): number => {
  return venta.detalle_venta.reduce((total, detalle) => {
    return total + (detalle.cantidad * detalle.precio_unitario);
  }, 0);
};

export interface VentaTotalesPorMoneda {
  totalPesos: number;      // Total de productos en pesos
  totalDolares: number;    // Total de productos en dólares (en USD, no convertido)
  tienePesos: boolean;     // Si hay productos en pesos
  tieneDolares: boolean;   // Si hay productos en dólares
}

export const calculateVentaTotalesPorMoneda = (venta: VentaConDetalles): VentaTotalesPorMoneda => {
  let totalPesos = 0;
  let totalDolares = 0;

  venta.detalle_venta.forEach((detalle) => {
    const subtotal = detalle.cantidad * detalle.precio_unitario;
    const esProductoEnDolares = detalle.producto?.dolares ?? false;

    if (esProductoEnDolares) {
      totalDolares += subtotal;
    } else {
      totalPesos += subtotal;
    }
  });

  return {
    totalPesos,
    totalDolares,
    tienePesos: totalPesos > 0,
    tieneDolares: totalDolares > 0,
  };
};

export interface VentasMetrics {
  revenue: number;    
  cost: number;       
  profit: number;     
  gastos: number;     
}

export interface VentasMetricsConDolares extends VentasMetrics {
  revenueUSD: number;   
  costUSD: number;      
  profitUSD: number;    
  revenuePesos: number;  
  revenueDolares: number; 
  costPesos: number;    
  costDolares: number;  
}

export const calculateMetrics = (
  ventas: VentaConDetalles[],
  gastosActivos: Gasto[]
): VentasMetrics => {
  let revenue = 0;
  let cost = 0;

  for (const venta of ventas) {
    const cotizacion = venta.cotizacion_dolar || 1000;

    for (const detalle of venta.detalle_venta) {
      const qty = detalle.cantidad || 0;
      const price = detalle.precio_unitario || 0;
      const productCost = detalle.producto?.costo ?? 0;
      const esProductoEnDolares = detalle.producto?.dolares ?? false;
      
      const precioEnPesos = esProductoEnDolares ? price * cotizacion : price;
      const costoEnPesos = esProductoEnDolares ? productCost * cotizacion : productCost;

      revenue += qty * precioEnPesos;
      cost += qty * costoEnPesos;
    }
  }

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

export const calculateMetricsConDolares = (
  ventas: VentaConDetalles[],
  gastosActivos: Gasto[],
  cotizacionActual: number = 1000
): VentasMetricsConDolares => {
  let revenuePesos = 0;
  let revenueDolares = 0;
  let costPesos = 0;
  let costDolares = 0;

  for (const venta of ventas) {
    const cotizacionVenta = venta.cotizacion_dolar || cotizacionActual;

    for (const detalle of venta.detalle_venta) {
      const qty = detalle.cantidad || 0;
      const price = detalle.precio_unitario || 0;
      const productCost = detalle.producto?.costo ?? 0;
      const esProductoEnDolares = detalle.producto?.dolares ?? false;
      
      if (esProductoEnDolares) {
        const precioEnPesos = price * cotizacionVenta;
        const costoEnPesos = productCost * cotizacionVenta;
        
        revenueDolares += qty * precioEnPesos;
        costDolares += qty * costoEnPesos;
      } else {
        revenuePesos += qty * price;
        costPesos += qty * productCost;
      }
    }
  }

  const revenue = revenuePesos + revenueDolares;
  const cost = costPesos + costDolares;
  
  const totalGastos = gastosActivos.reduce((sum, gasto) => sum + gasto.costo, 0);
  const totalCost = cost + totalGastos;

  const profit = revenue - totalCost;

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

export const calculateSubtotal = (
  items: Array<{ cantidad: number; precio?: number | null; precioventa?: number }>
): number => {
  return items.reduce((total, item) => {
    const precio = item.precio ?? item.precioventa ?? 0;
    return total + (item.cantidad * precio);
  }, 0);
};

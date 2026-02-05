// types.ts
export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  stock: number;
  costo: number;
  precioventa: number;
  id_unidad_medida: number;
  unidad_medida?: UnidadMedida;
  estado: boolean;
  vencimiento?: Date;
}

export interface UnidadMedida {
  id_unidad_medida: number;
  nombre: string;
  abreviacion: string;
}

export interface Promocion {
  id_promocion: number;
  name: string;
  precio: number | null;
  estado: boolean;
}

// Promoción con detalles en memoria (solo para uso en el cliente cuando editamos)
export interface PromocionConDetalles extends Promocion {
  productos?: PromocionDetalleInput[];
}

export interface DetallePromocion {
  id_detalle_promocion: number;
  id_promocion: number;
  id_producto: number;
}

// Si la tabla detalle_promocion tiene cantidad, la modelamos aquí.
export interface DetallePromocionConCantidad {
  id_detalle_promocion: number;
  id_promocion: number;
  id_producto: number;
  cantidad: number;
}

// Para crear/editar promociones necesitamos enviar id_producto + cantidad
export interface PromocionDetalleInput {
  id_producto: number;
  cantidad: number;
}

export interface Venta {
  id_venta: number;
  fecha: string;
  estado: boolean;
  baja: boolean;
}

export interface DetalleVenta {
  id_detalle_venta: number;
  id_producto: number;
  id_venta: number;
  cantidad: number;
  precio_unitario: number; // ✅ NUEVO
  producto?: Producto;
  promocion?: Promocion;
}

// Tipos para crear ventas: puede ser un item de producto o una referencia a promocion
export interface DetalleVentaProductoInput {
  id_producto: number;
  cantidad: number;
  precioUnitario?: number;
}

export interface DetalleVentaPromocionInput {
  id_promocion: number;
  cantidad: number;
  // precioUnitario should be number or undefined to match createVenta param expectations
  precioUnitario?: number | undefined;
}

export type DetalleVentaInput = DetalleVentaProductoInput | DetalleVentaPromocionInput;

export interface VentaConDetalles extends Venta {
  detalle_venta: (DetalleVenta & { producto?: Producto; promocion?: Promocion })[];
}

export interface Gasto {
  id_gasto: number;
  costo: number;
  descripcion: string | null;
  estado: boolean;
}
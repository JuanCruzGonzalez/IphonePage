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
}

export interface UnidadMedida {
  id_unidad_medida: number;
  nombre: string;
  abreviacion: string;
}

export interface Venta {
  id_venta: number;
  fecha: string;
  estado: boolean;
}

export interface DetalleVenta {
  id_detalle_venta: number;
  id_producto: number;
  id_venta: number;
  cantidad: number;
  producto?: Producto; // Para cuando hacemos JOIN
}

export interface VentaConDetalles extends Venta {
  detalle_venta: (DetalleVenta & { producto: Producto })[];
}
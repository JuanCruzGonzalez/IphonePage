// types.ts
export interface Producto {
  id_producto?: number;
  nombre: string;
  descripcion: string | null;
  stock: number;
  costo: number;
  precioventa: number;
  precio_promocion?: number | null;
  promocion_activa?: boolean;
  estado: boolean;
  imagenes?: ProductoImagen[]; 
  accesorio?: boolean; 
  destacado?: boolean; 
  orden_destacado?: number | null; 
  condicion?: 'nuevo' | 'usado_premium' | 'usado'; 
  dolares?: boolean;
  categorias?: Categoria[];
}

export interface ProductoImagen {
  id_producto_imagen: number;
  id_producto: number;
  imagen_path: string;
  orden: number;
  es_principal: boolean;
  created_at?: string;
}

export interface Promocion {
  id_promocion: number;
  name: string;
  precio: number | null;
  estado: boolean;
  imagen_path?: string | null;
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

// Detalle de promoción con información del producto embebida (para vista del cliente)
export interface DetallePromocionConProducto extends DetallePromocionConCantidad {
  producto: {
    id_producto: number;
    nombre: string;
    imagen_path?: string | null;
  };
}

// Promoción con detalles completos (incluyendo productos)
export interface PromocionConDetallesCompletos extends Promocion {
  productos: DetallePromocionConProducto[];
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
  cotizacion_dolar?: number | null;
  metodo_pago?: string;
  detalle_venta: DetalleVenta[];
  total?: number;
}

export interface DetalleVenta {
  id_detalle_venta: number;
  id_venta: number;
  cantidad: number;
  precio_unitario: number;
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
  precioUnitario?: number | undefined;
}

export type DetalleVentaInput = DetalleVentaProductoInput | DetalleVentaPromocionInput;

export interface Gasto {
  id_gasto: number;
  costo: number;
  descripcion: string | null;
  estado: boolean;
}

// =============================================
// COTIZACIÓN DEL DÓLAR
// =============================================

export interface CotizacionDolar {
  id_cotizacion: number;
  fecha: string;
  valor: number; // Cuántos pesos vale 1 dólar
  observaciones?: string | null;
  created_at?: string;
}

export interface CotizacionDolarInput {
  valor: number;
  observaciones?: string;
}

// =============================================
// FIN COTIZACIÓN DEL DÓLAR
// =============================================

export interface Categoria {
  id_categoria: number;
  nombre: string;
  estado: boolean;
  id_categoria_padre?: number | null;
}

export interface CategoriaConHijos extends Categoria {
  hijos?: CategoriaConHijos[];
}

export interface CategoriaProducto {
  id_categoria_producto: number;
  id_categoria: number;
  id_producto: number;
}

// =============================================
// PEDIDOS
// =============================================

export type EstadoPedido = 'RECIBIDO' | 'ACEPTADO' | 'ENTREGADO' | 'CANCELADO';
export type MetodoPagoPedido = 'efectivo' | 'transferencia' | 'mercadopago' | 'plan_de_pago';

export interface Pedido {
  id_pedido: number;
  fecha_pedido: string;
  estado: EstadoPedido;
  id_venta: number | null;
  id_cliente: string | null; // UUID del cliente registrado (si aplica)

  // Datos del cliente
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_direccion: string | null;

  // Detalles del pedido
  total: number;
  metodo_pago: MetodoPagoPedido | null;
  notas: string | null;
  plan_cuotas: number | null; // Número de cuotas si metodo_pago = 'plan_de_pago'

  // Auditoría
  created_at: string;
  updated_at: string;
}

export interface PedidoDetalle {
  id_pedido_detalle: number;
  id_pedido: number;
  tipo: 'producto' | 'promocion';
  id_producto: number | null;
  id_promocion: number | null;
  cantidad: number;
  precio_unitario: number;
}

export interface PedidoDetalleConInfo extends PedidoDetalle {
  producto?: Producto;
  promocion?: Promocion;
}

export interface PedidoConDetalles extends Pedido {
  detalles: PedidoDetalleConInfo[];
}

// Para crear pedido desde el cliente
export interface CrearPedidoInput {
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_direccion: string | null;
  metodo_pago: MetodoPagoPedido | null;
  notas: string | null;
  plan_cuotas?: number; // Solo cuando metodo_pago = 'plan_de_pago'
  id_cliente?: string;  // UUID del cliente registrado (tienda)
  items: {
    tipo: 'producto' | 'promocion';
    id: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}

export interface Empleado {
  user_id: string;
  email: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  dni: string;
  estado: string;
  created_at: string;
}

// =============================================
// CLIENTES
// =============================================

export interface Cliente {
  id_cliente: string; // UUID de auth.users
  email: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClienteInput {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
}

// =============================================
// PLANES DE PAGO
// =============================================

export type EstadoPlanDePago = 'activo' | 'completado' | 'cancelado';

export interface PlanDePago {
  id_plan: number;
  venta: Venta;
  cliente: Cliente;
  numero_cuotas: number;
  cuotas_pagadas: number;
  monto_total: number;
  monto_cuota: number;
  fecha_inicio: string;
  estado: EstadoPlanDePago;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanDePagoInput {
  id_venta: number;
  id_cliente?: string;
  cliente_nombre: string;
  cliente_telefono: string;
  numero_cuotas: number;
  monto_total: number;
  monto_cuota: number;
  fecha_inicio?: string;
  notas?: string;
}
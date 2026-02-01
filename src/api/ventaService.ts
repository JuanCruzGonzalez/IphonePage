// api/ventasService.ts
import { supabase } from '../supabaseClient';
import { Producto, DetalleVenta, VentaConDetalles, UnidadMedida } from '../types';

// ============= PRODUCTOS =============
export async function getProductos() {
  const { data, error } = await supabase
    .from('producto')
    .select(`
    id_producto,
    nombre,
    descripcion,
    stock,
    costo,
    precioventa,
    id_unidad_medida,
    unidad_medida (
      id_unidad_medida,
      nombre,
      abreviacion
    )
  `)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
  if (!data) return [];

  // Supabase returns related rows as arrays even for 1:1 relationships.
  // Normalize `unidad_medida` to a single object (or null) to match `Producto` type.
  const productos = (data as any[]).map((p) => ({
    id_producto: p.id_producto,
    nombre: p.nombre,
    descripcion: p.descripcion,
    stock: p.stock,
    costo: p.costo,
    precioventa: p.precioventa,
    id_unidad_medida: p.id_unidad_medida,
    unidad_medida: Array.isArray(p.unidad_medida)
      ? (p.unidad_medida[0] ?? null)
      : (p.unidad_medida ?? null),
  })) as Producto[];

  return productos;
}

export async function createProducto(producto: Omit<Producto, 'id_producto'>) {
  const { data, error } = await supabase
    .from('producto')
    .insert([producto])
    .select()
    .single();

  if (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }

  return data as Producto;
}

export async function updateStockProducto(id_producto: number, nuevoStock: number) {
  const { data, error } = await supabase
    .from('producto')
    .update({ stock: nuevoStock })
    .eq('id_producto', id_producto)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar stock:', error);
    throw error;
  }

  return data as Producto;
}

// ============= VENTAS =============
export async function getVentas() {

  const { data, error } = await supabase
    .from('venta')
    .select(`
      *,
      detalle_venta (
        *,
        producto (*)
      )
    `)
    .order('fecha', { ascending: false });


  if (error) {
    console.error('❌ Error al obtener ventas:', error);
    console.error('Detalles del error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  if (!data) {
    console.warn('⚠️ No se obtuvieron datos');
    return [];
  }

  // Normalize nested producto.unidad_medida in each detalle_venta
  const ventas = (data as any[]).map((v) => ({
    ...v,
    detalle_venta: Array.isArray(v.detalle_venta)
      ? v.detalle_venta.map((d: any) => ({
          ...d,
          producto: d.producto
            ? {
                ...d.producto,
                unidad_medida: Array.isArray(d.producto.unidad_medida)
                  ? (d.producto.unidad_medida[0] ?? null)
                  : (d.producto.unidad_medida ?? null),
              }
            : d.producto,
        }))
      : v.detalle_venta,
  })) as VentaConDetalles[];

  return ventas;
}

export async function createVenta(
  fecha: string,
  detalles: { id_producto: number; cantidad: number }[]
) {
  // 1. Crear la venta
  const { data: venta, error: ventaError } = await supabase
    .from('venta')
    .insert([{ fecha, estado: true }])
    .select()
    .single();

  if (ventaError) {
    console.error('Error al crear venta:', ventaError);
    throw ventaError;
  }

  // 2. Crear los detalles de venta
  const detallesConVenta = detalles.map(detalle => ({
    id_venta: venta.id_venta,
    id_producto: detalle.id_producto,
    cantidad: detalle.cantidad
  }));

  const { data: detallesCreados, error: detallesError } = await supabase
    .from('detalle_venta')
    .insert(detallesConVenta)
    .select();

  if (detallesError) {
    console.error('Error al crear detalles de venta:', detallesError);
    console.log('Detalles que se intentaron crear:', detallesCreados);
    throw detallesError;
  }
  return venta;
}

// ============= DETALLES DE VENTA =============
export async function getDetallesVenta(id_venta: number) {
  const { data, error } = await supabase
    .from('detalle_venta')
    .select(`
      *,
      producto (*)
    `)
    .eq('id_venta', id_venta);

  if (error) {
    console.error('Error al obtener detalles de venta:', error);
    throw error;
  }

  if (!data) return [];

  // Normalize producto.unidad_medida to match Producto type
  const detalles = (data as any[]).map((d) => ({
    ...d,
    producto: d.producto
      ? {
          ...d.producto,
          unidad_medida: Array.isArray(d.producto.unidad_medida)
            ? (d.producto.unidad_medida[0] ?? null)
            : (d.producto.unidad_medida ?? null),
        }
      : d.producto,
  })) as (DetalleVenta & { producto: Producto })[];

  return detalles;
}

// ============= UNIDADES DE MEDIDA =============

export async function getUnidadesMedidas() {

  const { data, error } = await supabase
    .from('unidad_medida')
    .select(`
      *
    `)

  if (error) {
    console.error('❌ Error al obtener ventas:', error);
    console.error('Detalles del error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  if (!data) {
    console.warn('⚠️ No se obtuvieron datos');
    return [];
  }

  return data as UnidadMedida[];
}
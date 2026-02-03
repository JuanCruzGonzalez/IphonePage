// api/ventasService.ts
import { supabase } from '../supabaseClient';
import { DetalleVenta, VentaConDetalles } from '../types';

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
    .eq('baja', false)
    .order('id_venta', { ascending: false });

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

/**
 * Busca ventas con filtros opcionales: fecha desde, fecha hasta, estado y baja.
 * fechas deben ser strings en formato YYYY-MM-DD
 */
export async function buscarVentas(options?: { desde?: string; hasta?: string; estado?: boolean; baja?: boolean }) {
  const { desde, hasta, estado, baja } = options || {};

  let query = supabase
    .from('venta')
    .select(`
      *,
      detalle_venta (
        *,
        producto (*)
      )
    `)
    .order('fecha', { ascending: false });

  if (desde) query = query.gte('fecha', desde);
  if (hasta) {
    try {
      const d = new Date(hasta);
      d.setDate(d.getDate() + 1);
      const nextDay = d.toISOString().split('T')[0];
      query = query.lt('fecha', nextDay);
    } catch (e) {
      query = query.lte('fecha', hasta);
    }
  }
  if (typeof estado === 'boolean') query = query.eq('estado', estado);
  if (typeof baja === 'boolean') query = query.eq('baja', baja);

  const { data, error } = await query;

  if (error) {
    console.error('❌ Error al buscar ventas:', error);
    throw error;
  }

  if (!data) return [];

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
  detalles: { id_producto: number; cantidad: number; precioUnitario: number; }[],
  estado: boolean
) {
  const { data: venta, error: ventaError } = await supabase
    .from('venta')
    .insert([{ fecha, estado }])
    .select()
    .single();

  if (ventaError) {
    console.error('Error al crear venta:', ventaError);
    throw ventaError;
  }

  const detallesConVenta = detalles.map(detalle => ({
    id_venta: venta.id_venta,
    id_producto: detalle.id_producto,
    cantidad: detalle.cantidad,
    precio_unitario: detalle.precioUnitario
  }));

  const {  error: detallesError } = await supabase
    .from('detalle_venta')
    .insert(detallesConVenta)
    .select();

  if (detallesError) {
    console.error('Error al crear detalles de venta:', detallesError);
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
  })) as (DetalleVenta & { producto: any })[];

  return detalles;
}

// ============= MUTACIONES ADICIONALES =============
export async function updateVentaEstado(id_venta: number, pagada: boolean) {
  const updated = await updateVentaFlag(id_venta, 'estado', pagada);
  if (!updated) return null;
  return { id_venta: updated.id_venta, fecha: updated.fecha, estado: updated.estado } as { id_venta: number; fecha: string; estado: boolean };
}

export async function updateVentaBaja(id_venta: number, baja: boolean) {
  const updated = await updateVentaFlag(id_venta, 'baja', baja);
  if (!updated) return null;
  return updated as { id_venta: number; fecha: string; estado: boolean; baja: boolean };
}

export async function updateVentaFlag(id_venta: number, field: 'estado' | 'baja', value: boolean) {
  try {
    const changes: any = {};
    changes[field] = value;
    const { data, error } = await supabase
      .from('venta')
      .update(changes)
      .eq('id_venta', id_venta)
      .select('id_venta,fecha,estado,baja')
      .maybeSingle();

    if (error) {
      console.error(`Error al actualizar ${field} de venta:`, error);
      throw error;
    }

    if (!data) return null;
    return data;
  } catch (err) {
    throw err;
  }
}
// api/ventasService.ts
import { supabase, handleAuthError } from '../../../core/config/supabase';
import { DetalleVenta } from '../../../core/types';
import { getCotizacionActual } from './cotizacionService';

// ============= VENTAS =============
export async function getVentas() {
  const { data, error } = await supabase
    .from('venta')
    .select(`
      *,
      detalle_venta (
        *,
        producto (*),
        promocion (*)
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
    await handleAuthError(error);
    throw error;
  }

  if (!data) {
    console.warn('⚠️ No se obtuvieron datos');
    return [];
  }

  return data;
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
        producto (*),
        promocion (*)
      )
    `)
    .order('id_venta', { ascending: false });

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
    await handleAuthError(error);
    throw error;
  }

  if (!data) return [];

  return data;
}

/**
 * Devuelve una página de ventas con contador total (server-side paging).
 * Opcionalmente acepta los mismos filtros que buscarVentas.
 */
export async function getVentasPage(
  page = 1,
  pageSize = 10,
  options?: { desde?: string; hasta?: string; estado?: boolean; baja?: boolean }
) {
  const { desde, hasta, estado, baja } = options || {};
  const from = (page - 1) * pageSize;
  const to = page * pageSize - 1;

  let query = supabase
    .from('venta')
    .select(`
      *,
      detalle_venta (
        *,
        producto (*),
        promocion (*)
      )
    `, { count: 'exact' })
      .eq('baja', options?.baja)
    .order('id_venta', { ascending: false });

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

  const { data, error, count } = await query.range(from, to) as any;
  if (error) {
    console.error('❌ Error al obtener página de ventas:', error);
    await handleAuthError(error);
    throw error;
  }

  if (!data) return { ventas: [], total: count || 0 };

  return { ventas: data, total: count || 0 };
}


export async function createVenta(
  fecha: string,
  detalles: any[],
  estado: boolean,
  cotizacion_dolar?: number
): Promise<number> {
  // Si no se proporciona cotización, obtener la actual
  const cotizacion = cotizacion_dolar ?? await getCotizacionActual();

  // Transformar detalles de camelCase a snake_case para el RPC
  const detallesTransformados = detalles.map(detalle => {
    const transformado: any = { ...detalle };
    
    // Convertir precioUnitario a precio_unitario si existe
    if ('precioUnitario' in detalle) {
      transformado.precio_unitario = detalle.precioUnitario;
      delete transformado.precioUnitario;
    }
    
    return transformado;
  });

  const { data, error } = await supabase.rpc('create_venta_transaction', {
    p_venta: { fecha, estado, cotizacion_dolar: cotizacion },
    p_detalles: detallesTransformados,
  });

  if (error) {
    console.error('Error al crear venta via RPC:', error);
    await handleAuthError(error);
    throw error;
  }

  // Extraer id_venta del resultado del RPC (puede ser int, objeto, o array)
  let idVenta: number | null = null;
  if (typeof data === 'number') idVenta = data;
  else if (data && typeof data === 'object' && !Array.isArray(data) && 'id_venta' in data) idVenta = (data as any).id_venta;
  else if (Array.isArray(data) && data.length > 0) idVenta = (data[0] as any)?.id_venta ?? null;

  // Fallback: buscar la venta más reciente para esa fecha
  if (!idVenta) {
    const { data: latest } = await supabase
      .from('venta')
      .select('id_venta')
      .eq('fecha', fecha)
      .eq('baja', false)
      .order('id_venta', { ascending: false })
      .limit(1)
      .single();
    idVenta = latest?.id_venta ?? null;
  }

  return idVenta as number;
}


// ============= DETALLES DE VENTA =============
export async function updateVentaMetodoPago(id_venta: number, metodo_pago: string) {
  const { error } = await supabase
    .from('venta')
    .update({ metodo_pago })
    .eq('id_venta', id_venta);

  if (error) throw error;
}

export async function getDetallesVenta(id_venta: number) {
  const { data, error } = await supabase
    .from('detalle_venta')
    .select(`
      *,
      producto (*),
      promocion (*)
    `)
    .eq('id_venta', id_venta);

  if (error) {
    console.error('Error al obtener detalles de venta:', error);
    await handleAuthError(error);
    throw error;
  }

  if (!data) return [];

  const detalles = (data as any[]).map((d) => ({
    ...d,
    producto: d.producto || null,
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
  if (baja === false) {
    const { data, error } = await supabase.rpc('reactivar_venta_transaction', {
      p_id_venta: id_venta,
    });
    if (error) throw error;
    return data;
  }

  // Baja de venta (solo restaurar stock)
  const { data, error } = await supabase
    .from('venta')
    .update({ baja: true })
    .eq('id_venta', id_venta)
    .select();

  if (error) {
    console.error('Error en update venta baja:', error);
    await handleAuthError(error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('No se pudo actualizar la venta. Verifica que la venta existe y que tienes permisos.');
  }

  return data[0];
}

export async function reactivarVenta(id_venta: number) {
  const { data, error } = await supabase.rpc(
    'reactivar_venta_transaction',
    { p_id_venta: id_venta }
  );

  if (error) {
    console.error('Error al reactivar venta:', error);
    await handleAuthError(error);
    throw error;
  }

  return data;
}


export async function updateVentaFlag(
  id_venta: number,
  field: 'estado' | 'baja',
  value: boolean
) {
  if (field === 'baja') {
    const { data, error } = await supabase.rpc('toggle_venta_baja', {
      p_id_venta: id_venta,
      p_baja: value,
    });

    if (error) {
      console.error('Error al ejecutar RPC toggle_venta_baja:', error);
      await handleAuthError(error);
      throw error;
    }

    return data;
  }

  // estado no afecta stock → update normal
  const changes: any = {};
  changes[field] = value;
  const { data, error } = await supabase
    .from('venta')
    .update(changes)
    .eq('id_venta', id_venta)
    .select()
    .maybeSingle();

  if (error) {
    await handleAuthError(error);
    throw error;
  }
  return data;
}

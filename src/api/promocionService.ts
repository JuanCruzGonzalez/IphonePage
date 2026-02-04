import { supabase } from '../supabaseClient';
import { Promocion, PromocionDetalleInput, DetallePromocionConCantidad } from '../types';

export async function getPromociones() {
  const { data, error } = await supabase
    .from('promocion')
    .select(`id_promocion,name,precio,estado`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error al obtener promociones:', error);
    throw error;
  }

  if (!data) return [];

  return (data as any[]).map(p => ({
    id_promocion: p.id_promocion,
    name: p.name,
    precio: p.precio,
    estado: p.estado,
  })) as Promocion[];
}

export async function getPromocionesActivas() {
  const { data, error } = await supabase
    .from('promocion')
    .select(`id_promocion,name,precio,estado`)
    .eq('estado', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error al obtener promociones:', error);
    throw error;
  }

  if (!data) return [];

  return (data as any[]).map(p => ({
    id_promocion: p.id_promocion,
    name: p.name,
    precio: p.precio,
    estado: p.estado,
  })) as Promocion[];
}


export async function createPromocion(name: string, precio: number | null, productos: PromocionDetalleInput[], estado = true) {
  // Prefer server-side transactional RPC
  try {
    const payload = {
      p_nombre: name,
      p_precio: precio,
      p_productos: productos,
      p_estado: estado,
    };

    const { data: rpcData, error: rpcError } = await supabase.rpc('create_promocion_transaction', payload as any);
    if (rpcError) throw rpcError;
    return rpcData;
  } catch (e) {
    // fallback to client-side implementation
  }

  const { data: promocion, error: promoError } = await supabase
    .from('promocion')
    .insert([{ name, precio, estado }])
    .select()
    .single();

  if (promoError) {
    console.error('Error al crear promocion:', promoError);
    throw promoError;
  }

  const id_promocion = promocion.id_promocion;

  if (Array.isArray(productos) && productos.length > 0) {
    const detalles = productos.map((p: PromocionDetalleInput) => ({ id_promocion, id_producto: p.id_producto, cantidad: p.cantidad }));
    const { error: detallesError } = await supabase.from('detalle_promocion').insert(detalles);
    if (detallesError) {
      console.error('Error al crear detalles de promocion:', detallesError);
      throw detallesError;
    }
  }

  return promocion as Promocion;
}

export async function getDetallePromocion(id_promocion: number) {
  const { data, error } = await supabase
    .from('detalle_promocion')
    .select('id_detalle_promocion,id_promocion,id_producto,cantidad')
    .eq('id_promocion', id_promocion);

  if (error) {
    console.error('Error al obtener detalle promocion:', error);
    throw error;
  }

  if (!data) return [];

  return data as DetallePromocionConCantidad[];
}

export async function updatePromocion(id_promocion: number, name: string, precio: number | null, productos: PromocionDetalleInput[], estado = true) {
  // Try server-side transactional RPC (recommended)
  try {
    const payload = {
      p_id_promocion: id_promocion,
      p_nombre: name,
      p_precio: precio,
      p_productos: productos,
      p_estado: estado,
    };

    const { data: rpcData, error: rpcError } = await supabase.rpc('update_promocion_transaction', payload as any);
    if (rpcError) throw rpcError;
    return rpcData;
  } catch (e) {
    // fallback to client-side implementation
  }

  // Update main promocion record
  const { data: promo, error: promoError } = await supabase
    .from('promocion')
    .update({ name, precio, estado })
    .eq('id_promocion', id_promocion)
    .select()
    .single();

  if (promoError) {
    console.error('Error al actualizar promocion:', promoError);
    throw promoError;
  }

  // Get existing detalles with cantidad
  const existentes = await getDetallePromocion(id_promocion);
  const existentesMap = new Map<number, DetallePromocionConCantidad>();
  existentes.forEach((d) => existentesMap.set(d.id_producto, d));

  // Track which existing ids we keep
  const keepProductoIds = new Set<number>();

  // For each producto in new payload: insert or update if needed
  for (const p of productos || []) {
    const existente = existentesMap.get(p.id_producto);
    if (existente) {
      keepProductoIds.add(p.id_producto);
      if (existente.cantidad !== p.cantidad) {
        // update cantidad
        const { error: updErr } = await supabase
          .from('detalle_promocion')
          .update({ cantidad: p.cantidad })
          .eq('id_detalle_promocion', existente.id_detalle_promocion);
        if (updErr) {
          console.error('Error al actualizar detalle promocion:', updErr);
          throw updErr;
        }
      }
    } else {
      // insert new detalle
      const { error: insErr } = await supabase.from('detalle_promocion').insert([{ id_promocion, id_producto: p.id_producto, cantidad: p.cantidad }]);
      if (insErr) {
        console.error('Error al insertar detalle promocion nuevo:', insErr);
        throw insErr;
      }
    }
  }

  // Delete detalles that are not in the new payload
  const toDelete = existentes.filter(d => !keepProductoIds.has(d.id_producto));
  if (toDelete.length > 0) {
    const ids = toDelete.map(d => d.id_detalle_promocion);
    const { error: delErr } = await supabase.from('detalle_promocion').delete().in('id_detalle_promocion', ids);
    if (delErr) {
      console.error('Error al borrar detalles removidos:', delErr);
      throw delErr;
    }
  }

  return promo as any;
}

export async function deletePromocion(id_promocion: number, estado: boolean) {
  // Soft-delete: marcar estado = false en la promoción en vez de eliminar filas
  try {
    const { data, error } = await supabase
      .from('promocion')
      .update({ estado })
      .eq('id_promocion', id_promocion)
      .select()
      .single();

    if (error) {
      console.error('Error al desactivar promocion:', error);
      throw error;
    }

    return data as Promocion;
  } catch (err) {
    throw err;
  }
}
import { supabase, handleAuthError } from '../../../core/config/supabase';
import { Producto, ProductoImagen } from '../../../core/types';

// Helper para cargar imágenes de múltiples productos de forma eficiente
const cargarImagenesProductos = async (productos: Producto[]): Promise<Producto[]> => {
  if (productos.length === 0) return productos;

  const ids = productos.map(p => p.id_producto);

  const { data: imagenes, error } = await supabase
    .from('producto_imagen')
    .select('*')
    .in('id_producto', ids)
    .order('orden', { ascending: true });

  if (error) {
    console.warn('Error al cargar imágenes de productos:', error);
    return productos;
  }

  // Agrupar imágenes por producto
  const imagenesPorProducto = new Map<number, ProductoImagen[]>();
  (imagenes || []).forEach((img: any) => {
    if (!imagenesPorProducto.has(img.id_producto)) {
      imagenesPorProducto.set(img.id_producto, []);
    }
    imagenesPorProducto.get(img.id_producto)!.push(img as ProductoImagen);
  });

  // Asignar imágenes a cada producto
  return productos.map(p => ({
    ...p,
    imagenes: imagenesPorProducto.get(p.id_producto) || [],
  }));
};


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
    precio_promocion,
    promocion_activa,
    estado,
    accesorio,
    destacado,
    orden_destacado,
    condicion,
      dolares
  `)
    .order('nombre', { ascending: true })
    .range(0, 999);

  if (error) {
    console.error('Error al obtener productos:', error);
    await handleAuthError(error);
    throw error;
  }
  if (!data) return [];

  const productos = (data as any[]).map((p) => ({
    id_producto: p.id_producto,
    nombre: p.nombre,
    descripcion: p.descripcion,
    stock: p.stock,
    costo: p.costo,
    precioventa: p.precioventa,
    precio_promocion: p.precio_promocion,
    promocion_activa: p.promocion_activa,
    estado: p.estado,
    accesorio: p.accesorio,
    destacado: p.destacado,
    orden_destacado: p.orden_destacado,
    condicion: p.condicion || 'nuevo',
    dolares: p.dolares || false,
  })) as Producto[];

  return await cargarImagenesProductos(productos);
}
export async function getProductosActivos() {
  const { data, error } = await supabase
    .from('producto')
    .select(`
    id_producto,
    nombre,
    descripcion,
    stock,
    costo,
    precioventa,
    precio_promocion,
    promocion_activa,
    estado,
    accesorio,
    destacado,
    orden_destacado,
    condicion,
      dolares
  `).eq('estado', true)
    .order('nombre', { ascending: true })
    .range(0, 999);


  if (error) {
    console.error('Error al obtener productos:', error);
    await handleAuthError(error);
    throw error;
  }
  if (!data) return [];

  const productos = (data as any[]).map((p) => ({
    id_producto: p.id_producto,
    nombre: p.nombre,
    descripcion: p.descripcion,
    stock: p.stock,
    costo: p.costo,
    precioventa: p.precioventa,
    precio_promocion: p.precio_promocion,
    promocion_activa: p.promocion_activa,
    estado: p.estado,
    accesorio: p.accesorio,
    destacado: p.destacado,
    orden_destacado: p.orden_destacado,
    condicion: p.condicion || 'nuevo',
    dolares: p.dolares || false,
  })) as Producto[];

  return await cargarImagenesProductos(productos);
}

/**
 * Obtiene solo los productos destacados activos con stock > 0,
 * ordenados por orden_destacado.
 */
export async function getProductosDestacados() {
  const { data, error } = await supabase
    .from('producto')
    .select(`
      id_producto,
      nombre,
      descripcion,
      stock,
      costo,
      precioventa,
      precio_promocion,
      promocion_activa,
      estado,
      accesorio,
      destacado,
      orden_destacado,
      condicion,
      dolares
    `)
    .eq('estado', true)
    .eq('destacado', true)
    .gt('stock', 0)
    .order('orden_destacado', { ascending: true, nullsFirst: false })
    .range(0, 49);

  if (error) {
    console.error('Error al obtener productos destacados:', error);
    await handleAuthError(error);
    throw error;
  }
  if (!data) return [];

  const productos = (data as any[]).map((p) => ({
    id_producto: p.id_producto,
    nombre: p.nombre,
    descripcion: p.descripcion,
    stock: p.stock,
    costo: p.costo,
    precioventa: p.precioventa,
    precio_promocion: p.precio_promocion,
    promocion_activa: p.promocion_activa,
    estado: p.estado,
    accesorio: p.accesorio,
    destacado: p.destacado,
    orden_destacado: p.orden_destacado,
    condicion: p.condicion || 'nuevo',
    dolares: p.dolares || false,
  })) as Producto[];

  return await cargarImagenesProductos(productos);
}

export async function buscarProductos(q: string) {
  const qTrim = (q || '').trim();
  if (!qTrim) return getProductos();

  const { data, error } = await supabase
    .from('producto')
    .select(`
    id_producto,
    nombre,
    descripcion,
    stock,
    costo,
    precioventa,
    precio_promocion,
    promocion_activa,
    estado,
    accesorio,
    destacado,
    orden_destacado,
    condicion,
    dolares
  `)
    .or(`nombre.ilike.%${qTrim}%,descripcion.ilike.%${qTrim}%`)
    .order('nombre', { ascending: true })
    .range(0, 999);

  if (error) {
    console.error('Error al buscar productos:', error);
    await handleAuthError(error);
    throw error;
  }

  if (!data) return [];

  const productos = (data as any[]).map((p) => ({
    id_producto: p.id_producto,
    nombre: p.nombre,
    descripcion: p.descripcion,
    stock: p.stock,
    costo: p.costo,
    precioventa: p.precioventa,
    precio_promocion: p.precio_promocion,
    promocion_activa: p.promocion_activa,
    estado: p.estado,
    accesorio: p.accesorio,
    destacado: p.destacado,
    orden_destacado: p.orden_destacado,
    condicion: p.condicion || 'nuevo',
    dolares: p.dolares || false,
  })) as Producto[];

  return await cargarImagenesProductos(productos);
}

// Paginado: devuelve una página de productos y el total (count exacto)
export async function getProductosPage(page = 1, pageSize = 5, q = '', tipoProducto?: 'telefono' | 'accesorio') {
  const from = (page - 1) * pageSize;
  const to = page * pageSize - 1;

  const selectFields = `
    id_producto,
    nombre,
    descripcion,
    stock,
    costo,
    precioventa,
    precio_promocion,
    promocion_activa,
    estado,
    accesorio,
    destacado,
    orden_destacado,
    condicion,
      dolares
  `;

  let query: any = supabase
    .from('producto')
    .select(selectFields, { count: 'exact' })
    .order('nombre', { ascending: true });

  // Filtrar por tipo de producto
  if (tipoProducto === 'telefono') {
    query = query.eq('accesorio', false);
  } else if (tipoProducto === 'accesorio') {
    query = query.eq('accesorio', true);
  }

  if (q && q.trim()) {
    const qTrim = q.trim();
    query = query.or(`nombre.ilike.%${qTrim}%,descripcion.ilike.%${qTrim}%`);
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error('Error al obtener página de productos:', error);
    await handleAuthError(error);
    throw error;
  }

  const productos = (data || []).map((p: any) => ({
    id_producto: p.id_producto,
    nombre: p.nombre,
    descripcion: p.descripcion,
    stock: p.stock,
    costo: p.costo,
    precioventa: p.precioventa,
    precio_promocion: p.precio_promocion,
    promocion_activa: p.promocion_activa,
    estado: p.estado,
    accesorio: p.accesorio,
    destacado: p.destacado,
    orden_destacado: p.orden_destacado,
    condicion: p.condicion || 'nuevo',
    dolares: p.dolares || false,
  })) as Producto[];

  // Cargar imágenes de todos los productos
  const productosConImagenes = await cargarImagenesProductos(productos);

  return { productos: productosConImagenes, total: (count ?? 0) as number };
}

export async function createProducto(producto: Omit<Producto, 'id_producto'>) {
  const { data, error } = await supabase
    .from('producto')
    .insert([producto])
    .select()
    .single();

  if (error) {
    console.error('Error al crear producto:', error);
    console.log('Producto que se intentó crear:', producto);
    await handleAuthError(error);
    throw error;
  }

  return data as Producto;
}

export async function updateStockProducto(id_producto: number, nuevoStock: number) {
  // Prefer server-side transaction RPC if available
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('update_producto_stock_transaction', { p_id_producto: id_producto, p_nuevo_stock: nuevoStock });
    if (!rpcError && rpcData) {
      return rpcData as Producto;
    }
  } catch (e) {
    // fallthrough to client-side update
  }

  const { data, error } = await supabase
    .from('producto')
    .update({ stock: nuevoStock })
    .eq('id_producto', id_producto)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar stock:', error);
    await handleAuthError(error);
    throw error;
  }

  return data as Producto;
}

export async function updateProducto(
  id_producto: number,
  changes: Partial<{
    nombre: string;
    descripcion: string | null;
    stock: number;
    costo: number;
    precioventa: number;
    precio_promocion?: number | null;
    promocion_activa?: boolean;
    estado: boolean;
    accesorio?: boolean;
    destacado?: boolean;
    orden_destacado?: number | null;
    condicion?: 'nuevo' | 'usado_premium' | 'usado';
    dolares?: boolean;
  }>
) {
  // Try RPC transaction first
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('update_producto_transaction', { p_id_producto: id_producto, p_changes: changes });
    if (!rpcError && rpcData) {
      const p: any = rpcData;
      return {
        id_producto: p.id_producto,
        nombre: p.nombre,
        descripcion: p.descripcion,
        stock: p.stock,
        costo: p.costo,
        precioventa: p.precioventa,
        precio_promocion: p.precio_promocion,
        promocion_activa: p.promocion_activa,
        estado: p.estado,
        accesorio: p.accesorio,
        destacado: p.destacado,
        orden_destacado: p.orden_destacado,
        condicion: p.condicion || 'nuevo',
        dolares: p.dolares || false,
      } as Producto;
    }
  } catch (e) {
    // fallback to client-side update
  }

  const { data, error } = await supabase
    .from('producto')
    .update(changes)
    .eq('id_producto', id_producto)
    .select(
      `id_producto,nombre,descripcion,stock,costo,precioventa,precio_promocion,promocion_activa,estado,accesorio,destacado,orden_destacado,condicion`
    )
    .single();

  if (error) {
    console.error('Error al actualizar producto:', error);
    await handleAuthError(error);
    throw error;
  }

  if (!data) return null;

  const p: any = data;
  const producto = {
    id_producto: p.id_producto,
    nombre: p.nombre,
    descripcion: p.descripcion,
    stock: p.stock,
    costo: p.costo,
    precioventa: p.precioventa,
    precio_promocion: p.precio_promocion,
    promocion_activa: p.promocion_activa,
    estado: p.estado,
    accesorio: p.accesorio,
    destacado: p.destacado,
    orden_destacado: p.orden_destacado,
    condicion: p.condicion || 'nuevo',
    dolares: p.dolares || false,
  } as Producto;

  return producto;
}

export async function updateProductoEstado(id_producto: number, activo: boolean) {
  // Try RPC transaction
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('update_producto_estado_transaction', { p_id_producto: id_producto, p_activo: activo });
    if (!rpcError && rpcData) {
      const p: any = rpcData;
      return {
        id_producto: p.id_producto,
        nombre: p.nombre,
        descripcion: p.descripcion,
        stock: p.stock,
        costo: p.costo,
        precioventa: p.precioventa,
        precio_promocion: p.precio_promocion,
        promocion_activa: p.promocion_activa,
        estado: p.estado,
      } as Producto;
    }
  } catch (e) {
    // fallback
  }

  const { data, error } = await supabase
    .from('producto')
    .update({ estado: activo })
    .eq('id_producto', id_producto)
    .select(
      `id_producto,nombre,descripcion,stock,costo,precioventa,precio_promocion,promocion_activa,estado`
    )
    .maybeSingle();

  if (error) {
    console.error('Error al actualizar estado de producto:', error);
    await handleAuthError(error);
    throw error;
  }

  if (!data) return null;

  const p: any = data;
  const producto = {
    id_producto: p.id_producto,
    nombre: p.nombre,
    descripcion: p.descripcion,
    stock: p.stock,
    costo: p.costo,
    precioventa: p.precioventa,
    precio_promocion: p.precio_promocion,
    promocion_activa: p.promocion_activa,
    estado: p.estado,
  } as Producto;

  return producto;
}

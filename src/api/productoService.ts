import { supabase } from '../supabaseClient';
import { Producto, UnidadMedida } from '../types';

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
    ),
    estado
  `)
    .order('nombre', { ascending: true });
      
      
  if (error) {
    console.error('Error al obtener productos:', error);
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
    id_unidad_medida: p.id_unidad_medida,
    unidad_medida: Array.isArray(p.unidad_medida)
      ? (p.unidad_medida[0] ?? null)
      : (p.unidad_medida ?? null),
    estado: p.estado,
  })) as Producto[];

  return productos;
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
    id_unidad_medida,
    estado,
    unidad_medida (
      id_unidad_medida,
      nombre,
      abreviacion
    )
  `)
    .or(`nombre.ilike.%${qTrim}%,descripcion.ilike.%${qTrim}%`)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al buscar productos:', error);
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
    id_unidad_medida: p.id_unidad_medida,
    estado: p.estado,
    unidad_medida: Array.isArray(p.unidad_medida) ? (p.unidad_medida[0] ?? null) : (p.unidad_medida ?? null),
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

export async function getUnidadesMedidas() {
  const { data, error } = await supabase
    .from('unidad_medida')
    .select(`
      *
    `)

  if (error) {
    console.error('❌ Error al obtener unidades de medida:', error);
    throw error;
  }

  if (!data) return [];

  return data as UnidadMedida[];
}

export async function updateProducto(
  id_producto: number,
  changes: Partial<{
    nombre: string;
    descripcion: string | null;
    stock: number;
    costo: number;
    precioventa: number;
    id_unidad_medida: number;
    estado: boolean;
  }>
) {
  const { data, error } = await supabase
    .from('producto')
    .update(changes)
    .eq('id_producto', id_producto)
    .select(
      `id_producto,nombre,descripcion,stock,costo,precioventa,id_unidad_medida,estado,unidad_medida(id_unidad_medida,nombre,abreviacion)`
    )
    .single();

  if (error) {
    console.error('Error al actualizar producto:', error);
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
    id_unidad_medida: p.id_unidad_medida,
    estado: p.estado,
    unidad_medida: Array.isArray(p.unidad_medida) ? (p.unidad_medida[0] ?? null) : (p.unidad_medida ?? null),
  } as Producto;

  return producto;
}

export async function updateProductoEstado(id_producto: number, activo: boolean) {
  const { data, error } = await supabase
    .from('producto')
    .update({ estado: activo })
    .eq('id_producto', id_producto)
    .select(
      `id_producto,nombre,descripcion,stock,costo,precioventa,id_unidad_medida,estado,unidad_medida(id_unidad_medida,nombre,abreviacion)`
    )
    .maybeSingle();

  if (error) {
    console.error('Error al actualizar estado de producto:', error);
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
    id_unidad_medida: p.id_unidad_medida,
    estado: p.estado,
    unidad_medida: Array.isArray(p.unidad_medida) ? (p.unidad_medida[0] ?? null) : (p.unidad_medida ?? null),
  } as Producto;

  return producto;
}

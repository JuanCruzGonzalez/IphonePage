import { supabase, handleAuthError } from '../supabaseClient';
import { Categoria, CategoriaProducto } from '../types';

/**
 * Obtener todas las categorías
 */
export async function getCategorias() {
  const { data, error } = await supabase
    .from('categoria')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener categorías:', error);
    await handleAuthError(error);
    throw error;
  }

  return (data || []) as Categoria[];
}

/**
 * Obtener categorías activas
 */
export async function getCategoriasActivas() {
  const { data, error } = await supabase
    .from('categoria')
    .select('*')
    .eq('estado', true)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener categorías activas:', error);
    await handleAuthError(error);
    throw error;
  }

  return (data || []) as Categoria[];
}

/**
 * Crear una nueva categoría
 */
export async function createCategoria(nombre: string) {
  const { data, error } = await supabase
    .from('categoria')
    .insert({
      nombre,
      estado: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear categoría:', error);
    await handleAuthError(error);
    throw error;
  }

  return data as Categoria;
}

/**
 * Actualizar una categoría existente
 */
export async function updateCategoria(
  id_categoria: number,
  changes: Partial<{
    nombre: string;
    estado: boolean;
  }>
) {
  const { data, error } = await supabase
    .from('categoria')
    .update(changes)
    .eq('id_categoria', id_categoria)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar categoría:', error);
    await handleAuthError(error);
    throw error;
  }

  return data as Categoria;
}

/**
 * Cambiar el estado de una categoría (activa/inactiva)
 */
export async function updateCategoriaEstado(id_categoria: number, estado: boolean) {
  return updateCategoria(id_categoria, { estado });
}

/**
 * Obtener categorías de un producto
 */
export async function getCategoriasDeProducto(id_producto: number): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categoria_producto')
    .select(`
      categoria (
        id_categoria,
        nombre,
        estado
      )
    `)
    .eq('id_producto', id_producto);

  if (error) {
    console.error('Error al obtener categorías del producto:', error);
    await handleAuthError(error);
    throw error;
  }

  // Extraer las categorías del resultado
  return (data || [])
    .map((item: any) => item.categoria)
    .filter((cat: any) => cat !== null) as Categoria[];
}

/**
 * Asignar categorías a un producto
 * Primero elimina todas las categorías previas y luego asigna las nuevas
 */
export async function asignarCategoriasAProducto(
  id_producto: number,
  id_categorias: number[]
) {
  // Eliminar categorías previas
  const { error: deleteError } = await supabase
    .from('categoria_producto')
    .delete()
    .eq('id_producto', id_producto);

  if (deleteError) {
    console.error('Error al eliminar categorías previas:', deleteError);
    await handleAuthError(deleteError);
    throw deleteError;
  }

  // Si no hay categorías nuevas, terminar aquí
  if (id_categorias.length === 0) {
    return [];
  }

  // Insertar nuevas categorías
  const inserts = id_categorias.map(id_categoria => ({
    id_producto,
    id_categoria,
  }));

  const { data, error } = await supabase
    .from('categoria_producto')
    .insert(inserts)
    .select();

  if (error) {
    console.error('Error al asignar categorías:', error);
    await handleAuthError(error);
    throw error;
  }

  return (data || []) as CategoriaProducto[];
}

/**
 * Obtener productos de una categoría
 */
export async function getProductosDeCategoria(id_categoria: number): Promise<number[]> {
  const { data, error } = await supabase
    .from('categoria_producto')
    .select('id_producto')
    .eq('id_categoria', id_categoria);

  if (error) {
    console.error('Error al obtener productos de la categoría:', error);
    await handleAuthError(error);
    throw error;
  }

  return (data || []).map((item: any) => item.id_producto);
}

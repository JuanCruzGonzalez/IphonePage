import { supabase, handleAuthError } from '../../../core/config/supabase';
import { Categoria, CategoriaProducto, CategoriaConHijos } from '../../../core/types';

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
export async function createCategoria(nombre: string, id_categoria_padre?: number | null) {
  const { data, error } = await supabase
    .from('categoria')
    .insert({
      nombre,
      estado: true,
      id_categoria_padre: id_categoria_padre || null,
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
    id_categoria_padre: number | null;
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
 * Construir un árbol de categorías a partir de una lista plana
 */
export function construirArbolCategorias(categorias: Categoria[]): CategoriaConHijos[] {
  const categoriasMap = new Map<number, CategoriaConHijos>();
  const raices: CategoriaConHijos[] = [];

  // Crear mapa de categorías con array de hijos
  categorias.forEach(cat => {
    categoriasMap.set(cat.id_categoria, { ...cat, hijos: [] });
  });

  // Construir el árbol
  categorias.forEach(cat => {
    const nodo = categoriasMap.get(cat.id_categoria)!;
    
    if (cat.id_categoria_padre === null || cat.id_categoria_padre === undefined) {
      // Es una categoría raíz
      raices.push(nodo);
    } else {
      // Es una categoría hija
      const padre = categoriasMap.get(cat.id_categoria_padre);
      if (padre) {
        padre.hijos!.push(nodo);
      } else {
        // Si no se encuentra el padre, tratarla como raíz
        raices.push(nodo);
      }
    }
  });

  return raices;
}

/**
 * Obtener todas las categorías con sus subcategorías en forma de árbol
 */
export async function getCategoriasArbol() {
  const categorias = await getCategorias();
  return construirArbolCategorias(categorias);
}

/**
 * Obtener categorías que no tienen padre (categorías raíz)
 */
export async function getCategoriasRaiz() {
  const { data, error } = await supabase
    .from('categoria')
    .select('*')
    .is('id_categoria_padre', null)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener categorías raíz:', error);
    await handleAuthError(error);
    throw error;
  }

  return (data || []) as Categoria[];
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

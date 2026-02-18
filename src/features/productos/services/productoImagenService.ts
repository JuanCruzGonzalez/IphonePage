import { supabase, handleAuthError } from '../../../core/config/supabase';
import { ProductoImagen } from '../../../core/types';

/**
 * Obtener todas las imágenes de un producto
 */
export async function getImagenesProducto(id_producto: number): Promise<ProductoImagen[]> {
  const { data, error } = await supabase
    .from('producto_imagen')
    .select('*')
    .eq('id_producto', id_producto)
    .order('orden', { ascending: true });

  if (error) {
    console.error('Error al obtener imágenes del producto:', error);
    await handleAuthError(error);
    throw error;
  }

  return (data || []) as ProductoImagen[];
}

/**
 * Obtener la imagen principal de un producto
 */
export async function getImagenPrincipal(id_producto: number): Promise<ProductoImagen | null> {
  const { data, error } = await supabase
    .from('producto_imagen')
    .select('*')
    .eq('id_producto', id_producto)
    .eq('es_principal', true)
    .single();

  if (error) {
    // Si no hay imagen principal, no es un error crítico
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al obtener imagen principal:', error);
    await handleAuthError(error);
    throw error;
  }

  return data as ProductoImagen;
}

/**
 * Agregar una imagen a un producto
 */
export async function agregarImagenProducto(
  id_producto: number,
  imagen_path: string,
  es_principal: boolean = false
): Promise<ProductoImagen> {
  // Obtener el orden máximo actual para este producto
  const { data: maxOrden } = await supabase
    .from('producto_imagen')
    .select('orden')
    .eq('id_producto', id_producto)
    .order('orden', { ascending: false })
    .limit(1)
    .single();

  const nuevoOrden = maxOrden ? maxOrden.orden + 1 : 0;

  const { data, error } = await supabase
    .from('producto_imagen')
    .insert({
      id_producto,
      imagen_path,
      orden: nuevoOrden,
      es_principal,
    })
    .select()
    .single();

  if (error) {
    console.error('Error al agregar imagen:', error);
    await handleAuthError(error);
    throw error;
  }

  return data as ProductoImagen;
}

/**
 * Actualizar una imagen
 */
export async function actualizarImagenProducto(
  id_producto_imagen: number,
  cambios: Partial<Pick<ProductoImagen, 'imagen_path' | 'orden' | 'es_principal'>>
): Promise<ProductoImagen> {
  const { data, error } = await supabase
    .from('producto_imagen')
    .update(cambios)
    .eq('id_producto_imagen', id_producto_imagen)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar imagen:', error);
    await handleAuthError(error);
    throw error;
  }

  return data as ProductoImagen;
}

/**
 * Marcar una imagen como principal
 */
export async function marcarImagenPrincipal(
  id_producto_imagen: number
): Promise<ProductoImagen> {
  return actualizarImagenProducto(id_producto_imagen, { es_principal: true });
}

/**
 * Eliminar una imagen
 */
export async function eliminarImagenProducto(id_producto_imagen: number): Promise<void> {
  const { error } = await supabase
    .from('producto_imagen')
    .delete()
    .eq('id_producto_imagen', id_producto_imagen);

  if (error) {
    console.error('Error al eliminar imagen:', error);
    await handleAuthError(error);
    throw error;
  }
}

/**
 * Reordenar imágenes de un producto
 */
export async function reordenarImagenes(
  imagenesConOrden: { id_producto_imagen: number; orden: number }[]
): Promise<void> {
  const promises = imagenesConOrden.map(({ id_producto_imagen, orden }) =>
    supabase
      .from('producto_imagen')
      .update({ orden })
      .eq('id_producto_imagen', id_producto_imagen)
  );

  const results = await Promise.all(promises);
  
  const errorResult = results.find(r => r.error);
  if (errorResult?.error) {
    console.error('Error al reordenar imágenes:', errorResult.error);
    await handleAuthError(errorResult.error);
    throw errorResult.error;
  }
}

/**
 * Reemplazar todas las imágenes de un producto
 */
export async function reemplazarImagenesProducto(
  id_producto: number,
  nuevasImagenes: { imagen_path: string; es_principal?: boolean }[]
): Promise<ProductoImagen[]> {
  // Eliminar imágenes existentes
  await supabase
    .from('producto_imagen')
    .delete()
    .eq('id_producto', id_producto);

  // Si no hay nuevas imágenes, terminar aquí
  if (nuevasImagenes.length === 0) {
    return [];
  }

  // Asegurar que solo haya una imagen principal
  let tienePrincipal = nuevasImagenes.some(img => img.es_principal);
  
  // Insertar nuevas imágenes
  const imagenesParaInsertar = nuevasImagenes.map((img, index) => ({
    id_producto,
    imagen_path: img.imagen_path,
    orden: index,
    es_principal: tienePrincipal ? (img.es_principal || false) : index === 0,
  }));

  const { data, error } = await supabase
    .from('producto_imagen')
    .insert(imagenesParaInsertar)
    .select();

  if (error) {
    console.error('Error al reemplazar imágenes:', error);
    await handleAuthError(error);
    throw error;
  }

  return (data || []) as ProductoImagen[];
}

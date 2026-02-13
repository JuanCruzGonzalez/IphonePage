import { supabase, handleAuthError } from '../supabaseClient';

const BUCKET_NAME = 'productos';
const PROMOCIONES_BUCKET_NAME = 'productos'; // Usando el mismo bucket

/**
 * Subir una imagen al storage de Supabase
 */
export async function uploadProductImage(file: File, productId: number): Promise<string> {
  // Generar nombre único para el archivo
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Subir archivo
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error al subir imagen:', error);
    await handleAuthError(error);
    throw error;
  }

  // Retornar la ruta del archivo
  return filePath;
}

/**
 * Obtener la URL pública de una imagen
 */
export function getProductImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(imagePath);

  return data.publicUrl;
}

/**
 * Eliminar una imagen del storage
 */
export async function deleteProductImage(imagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([imagePath]);

  if (error) {
    console.error('Error al eliminar imagen:', error);
    await handleAuthError(error);
    throw error;
  }
}

/**
 * Actualizar imagen de un producto (elimina la anterior si existe y sube la nueva)
 */
export async function updateProductImage(
  file: File,
  productId: number,
  oldImagePath?: string | null
): Promise<string> {
  // Eliminar imagen anterior si existe
  if (oldImagePath) {
    try {
      await deleteProductImage(oldImagePath);
    } catch (error) {
      console.warn('No se pudo eliminar la imagen anterior:', error);
    }
  }

  // Subir nueva imagen
  return uploadProductImage(file, productId);
}

// ========== Funciones para Promociones ==========

/**
 * Subir una imagen de promoción al storage de Supabase
 */
export async function uploadPromocionImage(file: File, promocionId: number): Promise<string> {
  // Generar nombre único para el archivo con prefijo 'promo_'
  const fileExt = file.name.split('.').pop();
  const fileName = `promo_${promocionId}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Subir archivo
  const { error } = await supabase.storage
    .from(PROMOCIONES_BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error al subir imagen de promoción:', error);
    await handleAuthError(error);
    throw error;
  }

  // Retornar la ruta del archivo
  return filePath;
}

/**
 * Obtener la URL pública de una imagen de promoción
 */
export function getPromocionImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;

  const { data } = supabase.storage
    .from(PROMOCIONES_BUCKET_NAME)
    .getPublicUrl(imagePath);

  return data.publicUrl;
}

/**
 * Eliminar una imagen de promoción del storage
 */
export async function deletePromocionImage(imagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(PROMOCIONES_BUCKET_NAME)
    .remove([imagePath]);

  if (error) {
    console.error('Error al eliminar imagen de promoción:', error);
    await handleAuthError(error);
    throw error;
  }
}

/**
 * Actualizar imagen de una promoción (elimina la anterior si existe y sube la nueva)
 */
export async function updatePromocionImage(
  file: File,
  promocionId: number,
  oldImagePath?: string | null
): Promise<string> {
  // Eliminar imagen anterior si existe
  if (oldImagePath) {
    try {
      await deletePromocionImage(oldImagePath);
    } catch (error) {
      console.warn('No se pudo eliminar la imagen anterior de promoción:', error);
    }
  }

  // Subir nueva imagen
  return uploadPromocionImage(file, promocionId);
}

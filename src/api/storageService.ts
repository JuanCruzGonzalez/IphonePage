import { supabase } from '../supabaseClient';

const BUCKET_NAME = 'productos';

/**
 * Subir una imagen al storage de Supabase
 */
export async function uploadProductImage(file: File, productId: number): Promise<string> {
  // Generar nombre único para el archivo
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Subir archivo
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error al subir imagen:', error);
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

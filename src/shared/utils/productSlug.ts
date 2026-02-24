/**
 * Utilidades para generar y decodificar slugs de productos
 * Oculta el ID del producto en la URL usando slugs amigables
 */

/**
 * Genera un slug desde el nombre del producto
 * Elimina caracteres especiales y reemplaza espacios con guiones
 */
export function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normaliza caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Elimina los acentos
    .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/-+/g, '-') // Reemplaza múltiples guiones con uno solo
    .replace(/^-|-$/g, ''); // Elimina guiones al inicio y final
}

/**
 * Codifica el ID del producto en base64
 */
export function encodeProductId(id: number): string {
  // Convertir a string y agregar un prefijo para mayor ofuscación
  const str = `p${id}x`;
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decodifica el ID del producto desde base64
 */
export function decodeProductId(encoded: string): number | null {
  try {
    // Revertir los reemplazos
    const base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Agregar padding si es necesario
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    
    const decoded = atob(padded);
    // Remover prefijo "p" y sufijo "x"
    const match = decoded.match(/^p(\d+)x$/);
    
    if (match) {
      return parseInt(match[1], 10);
    }
    
    return null;
  } catch (error) {
    console.error('Error decodificando ID del producto:', error);
    return null;
  }
}

/**
 * Genera la URL completa del producto (slug + ID codificado)
 */
export function generateProductUrl(id: number, nombre: string): string {
  const slug = generateSlug(nombre);
  const encodedId = encodeProductId(id);
  return `${slug}-${encodedId}`;
}

/**
 * Extrae el ID del producto desde una URL slug
 * Intenta decodificar la última parte después del último guión
 */
export function extractProductIdFromSlug(urlSlug: string): number | null {
  // Intentar extraer la última parte después del último guión
  const parts = urlSlug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Intentar decodificar
  const id = decodeProductId(lastPart);
  
  if (id !== null) {
    return id;
  }
  
  // Si falla, intentar con las últimas 2 partes (por si el slug tiene guiones)
  if (parts.length >= 2) {
    const lastTwo = parts.slice(-2).join('-');
    return decodeProductId(lastTwo);
  }
  
  return null;
}

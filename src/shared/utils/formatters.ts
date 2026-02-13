/**
 * Utilidades para formatear datos (precios, fechas, etc.)
 */

/**
 * Formatea un número como precio en pesos argentinos
 * @param n - Número a formatear
 * @returns Precio formateado (ej: "$1.234,56" o "$1234.56" como fallback)
 */
export const formatCurrency = (n: number): string => {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
};

/**
 * Formatea un precio simple sin símbolo de moneda
 * @param precio - Precio a formatear
 * @returns Precio formateado como string (ej: "$123.45")
 */
export const formatPrice = (precio: number): string => {
  return `$${precio.toFixed(2)}`;
};

/**
 * Formatea un precio con locale español argentino
 * @param precio - Precio a formatear
 * @returns Precio formateado con separadores de miles
 */
export const formatPriceLocale = (precio: number): string => {
  return `$${precio.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Convierte una fecha a formato YYYY-MM-DD sin efectos de zona horaria
 * @param fecha - Fecha en formato string o null/undefined
 * @returns Fecha en formato YYYY-MM-DD o string vacío si es inválida
 */
export const dateToYMD = (fecha: string | null | undefined): string => {
  if (!fecha) return '';
  
  // Intentar extraer fecha directamente del string si ya está en formato ISO
  const match = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  
  // Parsear fecha y formatear
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Formatea una fecha para mostrar en formato local (español)
 * @param fecha - Fecha en formato string
 * @returns Fecha formateada en formato local (ej: "13/02/2026")
 */
export const formatDate = (fecha: string | null | undefined): string => {
  const ymd = dateToYMD(fecha);
  if (!ymd) return '';
  
  const [y, m, d] = ymd.split('-').map(Number);
  // Construir Date con componentes locales (evita conversión desde UTC)
  const local = new Date(y, m - 1, d);
  return local.toLocaleDateString('es-ES');
};

/**
 * Formatea una fecha para mostrar en formato local usando el patrón nativo
 * @param fecha - Fecha en formato string o Date
 * @returns Fecha formateada (ej: "13/2/2026")
 */
export const formatDateSimple = (fecha: string | Date): string => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return date.toLocaleDateString();
};

/**
 * Obtiene la fecha actual en formato ISO (YYYY-MM-DD)
 * @returns Fecha actual en formato YYYY-MM-DD
 */
export const getTodayISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Convierte una fecha Date a formato para input de formulario (YYYY-MM-DD)
 * @param date - Objeto Date
 * @returns Fecha en formato YYYY-MM-DD
 */
export const dateToFormInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

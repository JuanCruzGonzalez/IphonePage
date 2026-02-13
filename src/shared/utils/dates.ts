/**
 * Utilidades para manejo de fechas y rangos de fechas
 */

/**
 * Interfaz para rango de fechas en formato YYYY-MM-DD
 */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * Obtiene el rango de fechas del mes actual
 * @returns Objeto con fecha de inicio y fin en formato YYYY-MM-DD
 */
export const getCurrentMonthRange = (): DateRange => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Último día del mes
  const lastDay = new Date(year, month + 1, 0).getDate();
  
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  
  return { start, end };
};

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD
 * @returns Fecha actual en formato YYYY-MM-DD
 */
export const getTodayYMD = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Verifica si una fecha está dentro de un rango
 * @param fecha - Fecha a verificar en formato YYYY-MM-DD
 * @param range - Rango de fechas
 * @returns true si la fecha está dentro del rango
 */
export const isDateInRange = (fecha: string, range: DateRange): boolean => {
  return fecha >= range.start && fecha <= range.end;
};

/**
 * Filtra una lista por fechas dentro de un rango específico
 * @param items - Array de items con propiedad fecha
 * @param range - Rango de fechas
 * @param dateExtractor - Función para extraer la fecha de cada item
 * @returns Array filtrado
 */
export const filterByDateRange = <T>(
  items: T[],
  range: DateRange,
  dateExtractor: (item: T) => string
): T[] => {
  return items.filter(item => {
    const fecha = dateExtractor(item);
    return isDateInRange(fecha, range);
  });
};

/**
 * Obtiene el primer día del mes actual
 * @returns Objeto Date con el primer día del mes
 */
export const getFirstDayOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Obtiene el último día del mes actual
 * @returns Objeto Date con el último día del mes
 */
export const getLastDayOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
};

/**
 * Compara dos fechas y determina si son el mismo día
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns true si son el mismo día
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

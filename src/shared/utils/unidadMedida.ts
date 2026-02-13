/**
 * ID de la unidad de medida para productos por peso (gramos)
 */
export const UNIDAD_GRAMOS_ID = 1;

/**
 * Verifica si una unidad de medida es por peso (gramos)
 * @param unidadId - ID de la unidad de medida
 * @returns true si es medido en gramos
 */
export const isPorPeso = (unidadId: number): boolean => {
  return unidadId === UNIDAD_GRAMOS_ID;
};

/**
 * Obtiene el incremento apropiado para la cantidad según la unidad
 * @param unidadId - ID de la unidad de medida
 * @returns Incremento (10 para gramos, 1 para otras unidades)
 */
export const getIncremento = (unidadId?: number): number => {
  return isPorPeso(unidadId ?? 0) ? 10 : 1;
};

/**
 * Formatea el precio de un producto considerando su unidad de medida
 * Los productos por peso se muestran con precio por 100gr
 * @param precio - Precio base del producto
 * @param unidadId - ID de la unidad de medida
 * @returns Precio ajustado para mostrar
 */
export const formatPrecioParaMostrar = (precio: number, unidadId: number): number => {
  return isPorPeso(unidadId) ? precio * 100 : precio;
};

/**
 * Convierte el precio mostrado al usuario al precio real para guardar
 * Los productos por peso se dividen entre 100
 * @param precioMostrado - Precio ingresado por el usuario
 * @param unidadId - ID de la unidad de medida
 * @returns Precio real para guardar en la base de datos
 */
export const formatPrecioParaGuardar = (precioMostrado: number, unidadId: number): number => {
  return isPorPeso(unidadId) ? precioMostrado / 100 : precioMostrado;
};

/**
 * Obtiene el sufijo de unidad para mostrar en el precio
 * @param unidadId - ID de la unidad de medida
 * @param unidadAbreviacion - Abreviación de la unidad (opcional)
 * @returns Sufijo para mostrar (ej: "x100gr", "xkg", etc.)
 */
export const getUnidadSufijo = (unidadId: number, unidadAbreviacion?: string): string => {
  if (isPorPeso(unidadId)) {
    return 'x100gr';
  }
  return unidadAbreviacion ? `x${unidadAbreviacion}` : '';
};

/**
 * Formatea la cantidad con su unidad de medida para mostrar
 * @param cantidad - Cantidad numérica
 * @param unidadId - ID de la unidad de medida
 * @param unidadNombre - Nombre de la unidad (opcional)
 * @param tipo - Tipo de item ('producto' o 'promocion')
 * @returns String formateado con cantidad y unidad
 */
export const formatCantidadConUnidad = (
  cantidad: number,
  unidadId?: number,
  unidadNombre?: string,
  tipo?: 'producto' | 'promocion'
): string => {
  // Si es por peso (gramos)
  if (unidadId && isPorPeso(unidadId)) {
    return `${Math.round(cantidad)}gr`;
  }
  
  // Si es promoción
  if (tipo === 'promocion') {
    return `${cantidad} un`;
  }
  
  // Si tiene nombre de unidad
  if (unidadNombre) {
    return `${cantidad} ${unidadNombre}`;
  }
  
  // Por defecto, unidades
  return `${cantidad} un`;
};

/**
 * Servicio para gestionar la cotización del dólar
 */

import { supabase } from '../../../core/config/supabase';
import { CotizacionDolar, CotizacionDolarInput } from '../../../core/types';

/**
 * Obtiene la cotización actual del dólar (la más reciente)
 */
export async function getCotizacionActual(): Promise<number> {
  try {
    // Intentar usar la función RPC primero
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_cotizacion_actual');
    
    if (!rpcError && rpcData != null) {
      return Number(rpcData);
    }

    // Fallback: obtener la última cotización directamente
    const { data, error } = await supabase
      .from('cotizacion_dolar')
      .select('valor')
      .order('fecha', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error al obtener cotización actual:', error);
      // Valor por defecto si hay error
      return 1000;
    }

    return data?.valor ?? 1000;
  } catch (error) {
    console.error('Error inesperado al obtener cotización actual:', error);
    return 1000;
  }
}

/**
 * Obtiene el historial completo de cotizaciones
 */
export async function getHistorialCotizaciones(): Promise<CotizacionDolar[]> {
  const { data, error } = await supabase
    .from('cotizacion_dolar')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al obtener historial de cotizaciones:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtiene el historial de cotizaciones con paginación
 */
export async function getHistorialCotizacionesPaginado(
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: CotizacionDolar[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('cotizacion_dolar')
    .select('*', { count: 'exact' })
    .order('fecha', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error al obtener historial paginado de cotizaciones:', error);
    throw error;
  }

  return {
    data: data || [],
    total: count || 0,
  };
}

/**
 * Registra una nueva cotización del dólar
 * Solo se registra si el valor es diferente al actual
 */
export async function registrarCotizacion(
  input: CotizacionDolarInput
): Promise<CotizacionDolar | null> {
  try {
    // Intentar usar la función RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'registrar_cotizacion_dolar',
      {
        p_valor: input.valor,
        p_observaciones: input.observaciones || null,
      }
    );

    if (!rpcError && rpcData != null) {
      const id = Number(rpcData);
      
      // Si retorna -1, significa que no cambió el valor
      if (id === -1) {
        return null;
      }

      // Obtener el registro recién creado
      const { data: nuevaCotizacion } = await supabase
        .from('cotizacion_dolar')
        .select('*')
        .eq('id_cotizacion', id)
        .single();

      return nuevaCotizacion;
    }

    // Fallback: insertar directamente
    // Primero verificar si el valor es diferente
    const cotizacionActual = await getCotizacionActual();
    
    if (Math.abs(cotizacionActual - input.valor) < 0.01) {
      // No cambió significativamente
      return null;
    }

    const { data, error } = await supabase
      .from('cotizacion_dolar')
      .insert({
        valor: input.valor,
        observaciones: input.observaciones || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error al registrar cotización:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error inesperado al registrar cotización:', error);
    throw error;
  }
}

/**
 * Actualiza una cotización existente
 */
export async function actualizarCotizacion(
  id: number,
  input: Partial<CotizacionDolarInput>
): Promise<CotizacionDolar> {
  const { data, error } = await supabase
    .from('cotizacion_dolar')
    .update({
      ...(input.valor !== undefined && { valor: input.valor }),
      ...(input.observaciones !== undefined && { observaciones: input.observaciones }),
    })
    .eq('id_cotizacion', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar cotización:', error);
    throw error;
  }

  return data;
}

/**
 * Elimina una cotización
 * NOTA: Se recomienda no eliminar cotizaciones para mantener el historial
 */
export async function eliminarCotizacion(id: number): Promise<void> {
  const { error } = await supabase
    .from('cotizacion_dolar')
    .delete()
    .eq('id_cotizacion', id);

  if (error) {
    console.error('Error al eliminar cotización:', error);
    throw error;
  }
}

/**
 * Obtiene las últimas N cotizaciones
 */
export async function getUltimasCotizaciones(limit: number = 5): Promise<CotizacionDolar[]> {
  const { data, error } = await supabase
    .from('cotizacion_dolar')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error al obtener últimas cotizaciones:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtiene la cotización del dólar en una fecha específica
 * Retorna la cotización vigente más cercana a esa fecha (hacia atrás)
 */
export async function getCotizacionEnFecha(fecha: string): Promise<number> {
  const { data, error } = await supabase
    .from('cotizacion_dolar')
    .select('valor')
    .lte('fecha', fecha)
    .order('fecha', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.warn('No se encontró cotización para la fecha, usando actual');
    return getCotizacionActual();
  }

  return data.valor;
}

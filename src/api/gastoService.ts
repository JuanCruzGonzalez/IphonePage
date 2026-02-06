import { supabase, handleAuthError } from '../supabaseClient';
import { Gasto } from '../types';

/**
 * Obtener todos los gastos
 */
export async function getGastos() {
  const { data, error } = await supabase
    .from('gasto')
    .select('*')
    .order('id_gasto', { ascending: false });

  if (error) {
    console.error('Error al obtener gastos:', error);
    await handleAuthError(error);
    throw error;
  }

  return (data || []) as Gasto[];
}

/**
 * Obtener gastos activos
 */
export async function getGastosActivos() {
  const { data, error } = await supabase
    .from('gasto')
    .select('*')
    .eq('estado', true)
    .order('id_gasto', { ascending: false });

  if (error) {
    console.error('Error al obtener gastos activos:', error);
    await handleAuthError(error);
    throw error;
  }

  return (data || []) as Gasto[];
}

/**
 * Crear un nuevo gasto
 */
export async function createGasto(costo: number, descripcion: string | null) {
  const { data, error } = await supabase
    .from('gasto')
    .insert({
      costo,
      descripcion,
      estado: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear gasto:', error);
    await handleAuthError(error);
    throw error;
  }

  return data as Gasto;
}

/**
 * Actualizar un gasto existente
 */
export async function updateGasto(
  id_gasto: number,
  changes: Partial<{
    costo: number;
    descripcion: string | null;
    estado: boolean;
  }>
) {
  const { data, error } = await supabase
    .from('gasto')
    .update(changes)
    .eq('id_gasto', id_gasto)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar gasto:', error);
    await handleAuthError(error);
    throw error;
  }

  return data as Gasto;
}

/**
 * Cambiar el estado de un gasto (activo/inactivo)
 */
export async function updateGastoEstado(id_gasto: number, estado: boolean) {
  return updateGasto(id_gasto, { estado });
}

/**
 * Eliminar un gasto (opcional, si quieres borrado físico)
 */
export async function deleteGasto(id_gasto: number) {
  const { error } = await supabase
    .from('gasto')
    .delete()
    .eq('id_gasto', id_gasto);

  if (error) {
    console.error('Error al eliminar gasto:', error);
    await handleAuthError(error);
    throw error;
  }

  return true;
}

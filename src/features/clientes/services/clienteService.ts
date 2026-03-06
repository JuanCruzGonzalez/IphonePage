import { supabase } from '../../../core/config/supabase';
import { Cliente, ClienteInput } from '../../../core/types';

/** Obtener todos los clientes para el panel de administración. */
export async function getClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Cliente[];
}

/** Buscar clientes por nombre, apellido, email o teléfono. */
export async function buscarClientes(query: string): Promise<Cliente[]> {
  const q = query.trim();
  if (!q) return getClientes();

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .or(
      `nombre.ilike.%${q}%,apellido.ilike.%${q}%,email.ilike.%${q}%,telefono.ilike.%${q}%`,
    )
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as Cliente[];
}

/** Actualizar datos del cliente desde el panel (admin). */
export async function updateCliente(
  idCliente: string,
  input: ClienteInput & { estado?: boolean },
): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .update(input)
    .eq('id_cliente', idCliente)
    .select()
    .single();

  if (error) throw error;
  return data as Cliente;
}

/** Cambiar estado activo/inactivo de un cliente. */
export async function toggleEstadoCliente(
  idCliente: string,
  estado: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('clientes')
    .update({ estado })
    .eq('id_cliente', idCliente);

  if (error) throw error;
}

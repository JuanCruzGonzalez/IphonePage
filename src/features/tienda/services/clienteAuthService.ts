import { supabase } from '../../../core/config/supabase';
import { Cliente, ClienteInput } from '../../../core/types';

/** Registrar un nuevo cliente con email + password.
 *  Pasa `tipo: 'cliente'` en user_metadata para que el trigger
 *  de Supabase cree la fila en la tabla `clientes` y asigne
 *  app_metadata.role = 'cliente'.
 */
export async function signUpCliente(
  email: string,
  password: string,
  nombre: string,
  apellido: string,
  telefono?: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        tipo: 'cliente',
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono?.trim() ?? '',
      },
    },
  });
  if (error) throw error;
  return data;
}

/** Iniciar sesión como cliente con email + password. */
export async function signInCliente(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/** Cerrar sesión. */
export async function signOutCliente() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Obtener el perfil del cliente desde la tabla `clientes`. */
export async function getClientePerfil(userId: string): Promise<Cliente | null> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id_cliente', userId)
    .single();

  if (error) {
    // PGRST116 = no rows found, no es un error real
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Cliente;
}

/** Actualizar el perfil del cliente en sesión. */
export async function updateClientePerfil(
  userId: string,
  input: ClienteInput,
): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .update({ ...input })
    .eq('id_cliente', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Cliente;
}

/** Enviar email de recuperación de contraseña. */
export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/mi-cuenta`,
  });
  if (error) throw error;
}

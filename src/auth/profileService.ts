import { supabase } from '../core/config/supabase';

export async function getProfileById(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('nombre, apellido')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

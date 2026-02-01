import { supabase } from './supabaseClient'

export async function getProductos() {
  const { data, error } = await supabase
    .from('producto')
    .select('*')

  if (error) {
    console.error(error)
    throw error
  }

  return data
}

export async function darDeAltaEmpleado(id: string) {
	const { data, error } = await supabase
		.from('profiles')
		.update({ estado: 'activo' })
		.eq('user_id', id)
		.select();
	if (error) throw error;
	return data;
}
import { handleAuthError, supabase } from '../../../core/config/supabase';
import { Empleado } from '../../../core/types';

export async function createEmpleado({ email, password, nombre, apellido, fecha_nacimiento, dni, estado }: { 
	email: string; 
	password: string;
	nombre?: string;
	apellido?: string;
	fecha_nacimiento?: string;
	dni?: string;
	estado?: string;
}) {
	// Forzar refresh del token para asegurar que app_metadata esté actualizado
	const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
	if (refreshError || !refreshed.session) throw new Error('No hay sesión activa');

	const { data, error } = await supabase.functions.invoke('create-empleado', {
		body: { email, password, nombre, apellido, fecha_nacimiento, dni, estado },
		headers: {
			Authorization: `Bearer ${refreshed.session.access_token}`,
		},
	});

	if (error) throw error;
	if (data?.error) throw new Error(data.error);

	return true;
}
export async function getEmpleadoById(id: string) {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('user_id', id)
		.single();
	if (error) throw error;
	return data;
}

export async function updateEmpleado(user_id: string, updates: {
	nombre: string;
	apellido: string;
	fecha_nacimiento: string;
	dni: string;
	estado: string;
}) {
	const { error } = await supabase.rpc('actualizar_empleado', {
		p_user_id: user_id,
		p_nombre: updates.nombre,
		p_apellido: updates.apellido,
		p_fecha_nacimiento: updates.fecha_nacimiento,
		p_dni: updates.dni,
		p_estado: updates.estado
	});
	if (error) throw error;
	// Consultar el empleado actualizado
	  const { data, error: fetchError } = await supabase
		.from('profiles')
		.select('*')
		.eq('user_id', user_id)
		.single();
	
	  if (fetchError) {
		console.error('Error al actualizar empleado:', fetchError);
		await handleAuthError(fetchError);
		throw fetchError;
	  }
	
	  if (!data) return null;
	
	  const p: any = data;
	  const empleado = {
		user_id: p.user_id,
		nombre: p.nombre,
		apellido: p.apellido,
		fecha_nacimiento: p.fecha_nacimiento,
		dni: p.dni,
		estado: p.estado,
	  } as Empleado;
	  return empleado;
}

export async function darDeBajaEmpleado(id: string) {
	const { data, error } = await supabase
		.from('profiles')
		.update({ estado: 'baja' })
		.eq('user_id', id)
		.select();
	if (error) throw error;
	return data;
}

export async function getEmpleados() {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('role', 'empleado');
	if (error) throw error;
	return data || [];
}
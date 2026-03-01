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
	// Guardar la sesión del admin antes del signup
	const { data: sessionData } = await supabase.auth.getSession();
	const adminSession = sessionData?.session;

	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: { role: 'empleado' }
		}
	});
	if (error) throw error;

	const userId = data?.user?.id;

	// Restaurar la sesión del admin inmediatamente
	if (adminSession) {
		await supabase.auth.setSession({
			access_token: adminSession.access_token,
			refresh_token: adminSession.refresh_token,
		});
	}

	// Guardar datos del perfil del nuevo empleado usando la sesión del admin
	if (userId && (nombre || apellido || fecha_nacimiento || dni)) {
		await supabase
			.from('profiles')
			.update({ nombre, apellido, fecha_nacimiento, dni, estado: estado || 'activo' })
			.eq('user_id', userId);
	}

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
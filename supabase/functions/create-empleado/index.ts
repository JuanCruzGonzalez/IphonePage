import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar que viene con Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verificar JWT usando el service role client
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError?.message, '| token prefix:', token.substring(0, 20))
      return new Response(JSON.stringify({ error: 'Unauthorized', detail: authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('User role from app_metadata:', user.app_metadata?.role)

    // Solo admin puede crear empleados
    if (user.app_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: se requiere rol admin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, password, nombre, apellido, fecha_nacimiento, dni, estado } = await req.json()

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email y password son requeridos' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Crear el usuario con app_metadata (no editable por el usuario final)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      app_metadata: { role: 'empleado' },
      email_confirm: true,
    })

    if (error) {
      let mensaje = error.message
      if (error.message === 'User already registered') {
        mensaje = 'El email ya está registrado en el sistema'
      } else if (error.message === 'Unable to validate email address: invalid format') {
        mensaje = 'El formato del email no es válido'
      } else if (error.message === 'Password should be at least 6 characters') {
        mensaje = 'La contraseña debe tener al menos 6 caracteres'
      }
      return new Response(JSON.stringify({ error: mensaje }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = data.user.id

    // Actualizar perfil del nuevo empleado
    if (nombre || apellido || fecha_nacimiento || dni) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ nombre, apellido, fecha_nacimiento, dni, estado: estado || 'activo' })
        .eq('user_id', userId)

      if (profileError) {
        console.error('Error actualizando perfil:', profileError)
      }
    }

    return new Response(JSON.stringify({ ok: true, userId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

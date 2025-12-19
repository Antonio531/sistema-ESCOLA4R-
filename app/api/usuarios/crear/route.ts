import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Cliente con service role para operaciones admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, nombre, rolNombre, datosExtra } = body

    // Validaciones
    if (!email || !password || !nombre || !rolNombre) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Obtener rol
    const { data: rol } = await supabaseAdmin
      .from('rol')
      .select('id')
      .eq('nombre', rolNombre)
      .single()

    if (!rol) {
      return NextResponse.json(
        { error: `Rol "${rolNombre}" no encontrado` },
        { status: 400 }
      )
    }

    // Crear usuario en Auth usando admin API (no afecta sesión actual)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: { nombre }
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'Este correo ya está registrado' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Error al crear usuario: ' + authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      )
    }

    // Crear registro en tabla usuario
    const { data: nuevoUsuario, error: usuarioError } = await supabaseAdmin
      .from('usuario')
      .insert({
        nombre,
        correo: email,
        rolid: rol.id,
        auth_id: authData.user.id,
        activo: true,
      })
      .select('id')
      .single()

    if (usuarioError) {
      // Rollback: eliminar usuario de auth si falla
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Error al crear usuario: ' + usuarioError.message },
        { status: 500 }
      )
    }

    // Crear registro en tabla específica según el rol
    if (rolNombre === 'maestro') {
      const { error: maestroError } = await supabaseAdmin
        .from('maestro')
        .insert({
          nombre,
          correo: email,
          telefono: datosExtra?.telefono || null,
          especialidad: datosExtra?.especialidad || null,
          usuarioid: nuevoUsuario.id,
          activo: true,
        })

      if (maestroError) {
        return NextResponse.json(
          { error: 'Error al crear maestro: ' + maestroError.message },
          { status: 500 }
        )
      }
    } else if (rolNombre === 'alumno') {
      const { error: alumnoError } = await supabaseAdmin
        .from('alumno')
        .insert({
          nombre,
          correo: email,
          matricula: datosExtra?.matricula || null,
          telefono: datosExtra?.telefono || null,
          grado: datosExtra?.grado || null,
          usuarioid: nuevoUsuario.id,
          activo: true,
        })

      if (alumnoError) {
        return NextResponse.json(
          { error: 'Error al crear alumno: ' + alumnoError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      usuario: {
        id: nuevoUsuario.id,
        auth_id: authData.user.id,
      }
    })

  } catch (error) {
    console.error('Error en API crear usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

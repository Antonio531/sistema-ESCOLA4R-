import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'administrador' | 'maestro' | 'alumno'

export interface AuthUser {
  id: string
  email: string
  usuarioId: number
  nombre: string
  rol: UserRole
  rolId: number
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient()

  // Usar getSession() - lee de cookies sin llamar a la API
  // El middleware ya validó la sesión con getUser()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return null
  }

  const user = session.user

  // Obtener información del usuario con su rol
  const { data: usuario } = await supabase
    .from('usuario')
    .select(`
      id,
      nombre,
      rolid,
      rol:rol(nombre)
    `)
    .eq('auth_id', user.id)
    .single() as { data: { id: number; nombre: string; rolid: number; rol: { nombre: string } | null } | null }

  if (!usuario) {
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    usuarioId: usuario.id,
    nombre: usuario.nombre,
    rol: usuario.rol?.nombre as UserRole,
    rolId: usuario.rolid,
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.rol)) {
    redirect('/dashboard')
  }

  return user
}

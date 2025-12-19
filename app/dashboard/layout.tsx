import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { WelcomeToast } from '@/components/dashboard/welcome-toast'
import type { AuthUser } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Usar getSession() en vez de getUser() para evitar llamadas extra a la API
  // El middleware ya validó la sesión con getUser()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const authUser = session.user

  // Obtener datos del usuario de la base de datos
  const { data: usuario } = await supabase
    .from('usuario')
    .select('id, nombre, correo, rolid, rol:rol(nombre)')
    .eq('auth_id', authUser.id)
    .single() as { data: { id: number; nombre: string; correo: string; rolid: number; rol: { nombre: string } | null } | null }

  if (!usuario) {
    redirect('/login')
  }

  const user: AuthUser = {
    id: authUser.id,
    email: usuario.correo,
    usuarioId: usuario.id,
    nombre: usuario.nombre,
    rol: usuario.rol?.nombre as 'administrador' | 'maestro' | 'alumno',
    rolId: usuario.rolid,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomeToast nombre={user.nombre} rol={user.rol} />
      <Sidebar user={user} />
      <div className="lg:pl-64">
        <Header user={user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

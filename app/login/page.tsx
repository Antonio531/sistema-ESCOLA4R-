import { createClient } from '@/lib/supabase/server'
import LoginForm from './login-form'

export default async function LoginPage() {
  const supabase = await createClient()

  // Verificar si ya existe un admin (rolid = 1) en la base de datos
  const { count } = await supabase
    .from('usuario')
    .select('id', { count: 'exact', head: true })
    .eq('rolid', 1)

  // Solo mostrar el botón de setup si no hay ningún administrador
  const showSetupButton = !count || count === 0

  return <LoginForm showSetupButton={showSetupButton} />
}

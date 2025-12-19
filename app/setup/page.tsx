import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SetupForm from './setup-form'

export default async function SetupPage() {
  const supabase = await createClient()

  // Verificar si ya existe un administrador (rolid = 1)
  const { count } = await supabase
    .from('usuario')
    .select('id', { count: 'exact', head: true })
    .eq('rolid', 1)

  // Si ya hay un administrador, no permitir acceso a setup
  if (count && count > 0) {
    redirect('/login')
  }

  return <SetupForm />
}

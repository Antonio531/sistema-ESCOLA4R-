import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClipboardList } from 'lucide-react'
import AsistenciaClient from './asistencia-client'

interface GrupoAsignatura {
  id: number
  aula: string | null
  grupo: {
    id: number
    nombre: string
    grado: number | null
    turno: string | null
  }
  asignatura: {
    id: number
    nombre: string
    clave: string | null
  }
}

export default async function AsistenciaPage({
  searchParams,
}: {
  searchParams: Promise<{ grupo?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  // Obtener el usuario y verificar que es maestro
  const { data: usuario } = await supabase
    .from('usuario')
    .select('id, rolid, rol:rol(nombre)')
    .eq('auth_id', session.user.id)
    .single() as { data: { id: number; rolid: number; rol: { nombre: string } } | null }

  if (!usuario || usuario.rol.nombre !== 'maestro') {
    redirect('/dashboard')
  }

  // Obtener el maestro vinculado al usuario
  const { data: maestro } = await supabase
    .from('maestro')
    .select('id')
    .eq('usuarioid', usuario.id)
    .single() as { data: { id: number } | null }

  if (!maestro) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No se encontró tu perfil de maestro. Contacta al administrador.</p>
        </div>
      </div>
    )
  }

  // Obtener los grupos/asignaturas asignados al maestro
  const { data: gruposAsignaturas } = await supabase
    .from('grupoasignatura')
    .select(`
      id,
      aula,
      grupo:grupo(id, nombre, grado, turno),
      asignatura:asignatura(id, nombre, clave)
    `)
    .eq('maestroid', maestro.id)
    .eq('activo', true) as { data: GrupoAsignatura[] | null }

  if (!gruposAsignaturas || gruposAsignaturas.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asistencia</h1>
          <p className="text-gray-600">Registra la asistencia de tus alumnos</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin materias asignadas</h3>
          <p className="text-gray-500">No tienes materias asignadas para pasar lista.</p>
        </div>
      </div>
    )
  }

  return (
    <AsistenciaClient
      gruposAsignaturas={gruposAsignaturas}
      grupoIdInicial={params.grupo ? parseInt(params.grupo) : undefined}
    />
  )
}

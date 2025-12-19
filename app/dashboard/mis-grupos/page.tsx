import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FolderOpen, Users, BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'

interface GrupoAsignatura {
  id: number
  aula: string | null
  grupo: {
    id: number
    nombre: string
    grado: number | null
    turno: string | null
    periodo: {
      nombre: string
      activo: boolean
    }
  }
  asignatura: {
    id: number
    nombre: string
    clave: string | null
  }
  alumnos_count: number
}

export default async function MisGruposPage() {
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
      grupo:grupo(
        id,
        nombre,
        grado,
        turno,
        periodo:periodo(nombre, activo)
      ),
      asignatura:asignatura(id, nombre, clave)
    `)
    .eq('maestroid', maestro.id)
    .eq('activo', true) as { data: GrupoAsignatura[] | null }

  // Contar alumnos por grupo
  const gruposConAlumnos = await Promise.all(
    (gruposAsignaturas || []).map(async (ga) => {
      const { count } = await supabase
        .from('grupoalumno')
        .select('*', { count: 'exact', head: true })
        .eq('grupoid', ga.grupo.id)
        .eq('activo', true)

      return { ...ga, alumnos_count: count || 0 }
    })
  )

  // Agrupar por grupo
  const gruposMap = new Map<number, { grupo: GrupoAsignatura['grupo']; asignaturas: { id: number; nombre: string; clave: string | null; aula: string | null; grupoAsignaturaId: number }[]; alumnosCount: number }>()

  gruposConAlumnos.forEach((ga) => {
    if (!gruposMap.has(ga.grupo.id)) {
      gruposMap.set(ga.grupo.id, {
        grupo: ga.grupo,
        asignaturas: [],
        alumnosCount: ga.alumnos_count
      })
    }
    gruposMap.get(ga.grupo.id)!.asignaturas.push({
      id: ga.asignatura.id,
      nombre: ga.asignatura.nombre,
      clave: ga.asignatura.clave,
      aula: ga.aula,
      grupoAsignaturaId: ga.id
    })
  })

  const grupos = Array.from(gruposMap.values())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Grupos</h1>
        <p className="text-gray-600">Grupos y materias que tienes asignados</p>
      </div>

      {/* Lista de grupos */}
      {grupos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin grupos asignados</h3>
          <p className="text-gray-500">Aún no tienes grupos o materias asignadas. Contacta al administrador.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {grupos.map(({ grupo, asignaturas, alumnosCount }) => (
            <div key={grupo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Header del grupo */}
              <div className="bg-indigo-600 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{grupo.nombre}</h3>
                  {grupo.periodo.activo && (
                    <span className="px-2 py-0.5 text-xs bg-green-400 text-green-900 rounded-full">Activo</span>
                  )}
                </div>
                <p className="text-indigo-200 text-sm">{grupo.periodo.nombre}</p>
              </div>

              {/* Info del grupo */}
              <div className="p-4">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  {grupo.grado && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {grupo.grado}° Grado
                    </span>
                  )}
                  {grupo.turno && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {grupo.turno.charAt(0).toUpperCase() + grupo.turno.slice(1)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {alumnosCount} alumnos
                  </span>
                </div>

                {/* Materias */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase">Materias que impartes:</p>
                  {asignaturas.map((asig) => (
                    <div key={asig.id} className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-gray-900">{asig.nombre}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        {asig.clave && <span>Clave: {asig.clave}</span>}
                        {asig.aula && <span>Aula: {asig.aula}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Acciones */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <Link
                    href={`/dashboard/calificaciones?grupo=${grupo.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    Calificaciones
                  </Link>
                  <Link
                    href={`/dashboard/asistencia?grupo=${grupo.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Asistencia
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

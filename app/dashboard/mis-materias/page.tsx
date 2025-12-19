import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookOpen, Users, User, Clock } from 'lucide-react'

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
    creditos: number | null
  }
  maestro: {
    id: number
    nombre: string
  } | null
}

export default async function MisMateriasPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  // Obtener el usuario y verificar que es alumno
  const { data: usuario } = await supabase
    .from('usuario')
    .select('id, rolid, rol:rol(nombre)')
    .eq('auth_id', session.user.id)
    .single() as { data: { id: number; rolid: number; rol: { nombre: string } } | null }

  if (!usuario || usuario.rol.nombre !== 'alumno') {
    redirect('/dashboard')
  }

  // Obtener el alumno vinculado al usuario
  const { data: alumno } = await supabase
    .from('alumno')
    .select('id')
    .eq('usuarioid', usuario.id)
    .single() as { data: { id: number } | null }

  if (!alumno) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No se encontró tu perfil de alumno. Contacta al administrador.</p>
        </div>
      </div>
    )
  }

  // Obtener los grupos en los que está inscrito
  const { data: inscripciones } = await supabase
    .from('grupoalumno')
    .select('grupoid')
    .eq('alumnoid', alumno.id)
    .eq('activo', true) as { data: { grupoid: number }[] | null }

  if (!inscripciones || inscripciones.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Materias</h1>
          <p className="text-gray-600">Materias en las que estás inscrito</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin materias asignadas</h3>
          <p className="text-gray-500">Aún no estás inscrito en ningún grupo. Contacta al administrador.</p>
        </div>
      </div>
    )
  }

  const grupoIds = inscripciones.map(i => i.grupoid)

  // Obtener las asignaturas de esos grupos
  const { data: gruposAsignaturas } = await supabase
    .from('grupoasignatura')
    .select(`
      id,
      aula,
      grupo:grupo(id, nombre, grado, turno),
      asignatura:asignatura(id, nombre, clave, creditos),
      maestro:maestro(id, nombre)
    `)
    .in('grupoid', grupoIds)
    .eq('activo', true) as { data: GrupoAsignatura[] | null }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Materias</h1>
        <p className="text-gray-600">Materias en las que estás inscrito</p>
      </div>

      {/* Grid de materias */}
      {gruposAsignaturas && gruposAsignaturas.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gruposAsignaturas.map((ga) => (
            <div key={ga.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="bg-indigo-600 px-4 py-3">
                <h3 className="text-lg font-semibold text-white">{ga.asignatura.nombre}</h3>
                {ga.asignatura.clave && (
                  <p className="text-indigo-200 text-sm">Clave: {ga.asignatura.clave}</p>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Grupo */}
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Grupo</p>
                    <p className="text-sm font-medium text-gray-900">{ga.grupo.nombre}</p>
                  </div>
                </div>

                {/* Maestro */}
                {ga.maestro && (
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Maestro</p>
                      <p className="text-sm font-medium text-gray-900">{ga.maestro.nombre}</p>
                    </div>
                  </div>
                )}

                {/* Aula */}
                {ga.aula && (
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Aula</p>
                      <p className="text-sm font-medium text-gray-900">{ga.aula}</p>
                    </div>
                  </div>
                )}

                {/* Turno */}
                {ga.grupo.turno && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Turno</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{ga.grupo.turno}</p>
                    </div>
                  </div>
                )}

                {/* Créditos */}
                {ga.asignatura.creditos && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {ga.asignatura.creditos} créditos
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin materias asignadas</h3>
          <p className="text-gray-500">Aún no tienes materias asignadas en tus grupos.</p>
        </div>
      )}
    </div>
  )
}

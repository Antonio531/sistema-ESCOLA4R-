import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AsignarAlumnoModal from './asignar-alumno-modal'
import AsignarMateriaModal from './asignar-materia-modal'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GrupoDetallePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Obtener información del grupo
  const { data: grupo } = await supabase
    .from('grupo')
    .select(`
      id,
      nombre,
      grado,
      turno,
      periodo:periodo(id, nombre)
    `)
    .eq('id', id)
    .single() as { data: {
      id: number
      nombre: string
      grado: number | null
      turno: string | null
      periodo: { id: number; nombre: string } | null
    } | null }

  if (!grupo) {
    notFound()
  }

  // Obtener alumnos del grupo
  const { data: alumnosGrupo } = await supabase
    .from('grupoalumno')
    .select(`
      id,
      alumno:alumno(id, nombre, matricula, correo)
    `)
    .eq('grupoid', id)
    .eq('activo', true) as { data: Array<{
      id: number
      alumno: { id: number; nombre: string; matricula: string | null; correo: string | null } | null
    }> | null }

  // Obtener materias del grupo con sus maestros
  const { data: materiasGrupo } = await supabase
    .from('grupoasignatura')
    .select(`
      id,
      aula,
      asignatura:asignatura(id, nombre, clave),
      maestro:maestro(id, nombre)
    `)
    .eq('grupoid', id)
    .eq('activo', true) as { data: Array<{
      id: number
      aula: string | null
      asignatura: { id: number; nombre: string; clave: string | null } | null
      maestro: { id: number; nombre: string } | null
    }> | null }

  // Obtener todos los alumnos disponibles (para el modal)
  const { data: todosAlumnos } = await supabase
    .from('alumno')
    .select('id, nombre, matricula, grado')
    .eq('activo', true)
    .order('nombre') as { data: Array<{ id: number; nombre: string; matricula: string | null; grado: number | null }> | null }

  // Obtener todas las asignaturas disponibles (para el modal)
  const { data: todasAsignaturas } = await supabase
    .from('asignatura')
    .select('id, nombre, clave')
    .eq('activo', true)
    .order('nombre') as { data: Array<{ id: number; nombre: string; clave: string | null }> | null }

  // Obtener todos los maestros disponibles (para el modal)
  const { data: todosMaestros } = await supabase
    .from('maestro')
    .select('id, nombre, especialidad')
    .eq('activo', true)
    .order('nombre') as { data: Array<{ id: number; nombre: string; especialidad: string | null }> | null }

  // IDs de alumnos ya asignados
  const alumnosAsignadosIds = alumnosGrupo?.map(ag => ag.alumno?.id).filter(Boolean) || []

  // IDs de asignaturas ya asignadas
  const asignaturasAsignadasIds = materiasGrupo?.map(mg => mg.asignatura?.id).filter(Boolean) || []

  const getTurnoLabel = (turno: string | null) => {
    switch (turno) {
      case 'matutino': return 'Matutino'
      case 'vespertino': return 'Vespertino'
      case 'nocturno': return 'Nocturno'
      default: return 'Sin turno'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/grupos"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a grupos
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{grupo.nombre}</h1>
            <div className="flex items-center gap-3 mt-1 text-gray-600">
              {grupo.grado && <span>{grupo.grado}° Grado</span>}
              <span>•</span>
              <span>{getTurnoLabel(grupo.turno)}</span>
              {grupo.periodo && (
                <>
                  <span>•</span>
                  <span>{grupo.periodo.nombre}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección de Alumnos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold text-gray-900">
                Alumnos ({alumnosGrupo?.length || 0})
              </h2>
            </div>
            <AsignarAlumnoModal
              grupoId={grupo.id}
              alumnosDisponibles={todosAlumnos?.filter(a => !alumnosAsignadosIds.includes(a.id)) || []}
            />
          </div>

          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {alumnosGrupo && alumnosGrupo.length > 0 ? (
              alumnosGrupo.map((ag) => (
                <div key={ag.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{ag.alumno?.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {ag.alumno?.matricula || 'Sin matrícula'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No hay alumnos asignados</p>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Materias */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-gray-900">
                Materias ({materiasGrupo?.length || 0})
              </h2>
            </div>
            <AsignarMateriaModal
              grupoId={grupo.id}
              asignaturasDisponibles={todasAsignaturas?.filter(a => !asignaturasAsignadasIds.includes(a.id)) || []}
              maestrosDisponibles={todosMaestros || []}
            />
          </div>

          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {materiasGrupo && materiasGrupo.length > 0 ? (
              materiasGrupo.map((mg) => (
                <div key={mg.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{mg.asignatura?.nombre}</p>
                      {mg.asignatura?.clave && (
                        <p className="text-xs text-gray-400">{mg.asignatura.clave}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      mg.maestro
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {mg.maestro?.nombre || 'Sin maestro asignado'}
                    </span>
                    {mg.aula && (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        Aula: {mg.aula}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No hay materias asignadas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

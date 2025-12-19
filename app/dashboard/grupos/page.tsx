import { createClient } from '@/lib/supabase/server'
import { Search, Users, Calendar } from 'lucide-react'
import Link from 'next/link'
import NuevoGrupoModal from './nuevo-grupo-modal'
import GrupoActions from './grupo-actions'
import GenerarReporteGrupos from '@/components/reportes/generar-reporte-grupos'

export default async function GruposPage() {
  const supabase = await createClient()

  // Obtener todos los periodos
  const { data: periodos } = await supabase
    .from('periodo')
    .select('id, nombre')
    .order('nombre') as { data: Array<{ id: number; nombre: string }> | null }

  // Obtener todos los grupos con su periodo
  const { data: grupos } = await supabase
    .from('grupo')
    .select(`
      id,
      nombre,
      grado,
      turno,
      periodoid,
      created_at,
      periodo:periodo(id, nombre, activo)
    `)
    .order('created_at', { ascending: false }) as { data: Array<{
      id: number
      nombre: string
      grado: number | null
      turno: string | null
      periodoid: number
      created_at: string
      periodo: { id: number; nombre: string; activo: boolean } | null
    }> | null }

  // Contar alumnos por grupo
  const { data: conteoAlumnos } = await supabase
    .from('grupoalumno')
    .select('grupoid')
    .eq('activo', true) as { data: Array<{ grupoid: number }> | null }

  const alumnosPorGrupo: Record<number, number> = {}
  conteoAlumnos?.forEach(item => {
    alumnosPorGrupo[item.grupoid] = (alumnosPorGrupo[item.grupoid] || 0) + 1
  })

  const getTurnoLabel = (turno: string | null) => {
    switch (turno) {
      case 'matutino':
        return { label: 'Matutino', color: 'bg-yellow-100 text-yellow-800' }
      case 'vespertino':
        return { label: 'Vespertino', color: 'bg-orange-100 text-orange-800' }
      case 'nocturno':
        return { label: 'Nocturno', color: 'bg-purple-100 text-purple-800' }
      default:
        return { label: 'Sin turno', color: 'bg-gray-100 text-gray-800' }
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grupos</h1>
          <p className="text-gray-600 mt-1">Gestiona los grupos de la preparatoria</p>
        </div>
        <div className="flex gap-2">
          <GenerarReporteGrupos grupos={grupos || []} alumnosPorGrupo={alumnosPorGrupo} />
          <NuevoGrupoModal />
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar grupos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B2323] focus:border-[#8B2323]"
          />
        </div>
      </div>

      {/* Grid de grupos */}
      {grupos && grupos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grupos.map((grupo) => {
            const turnoInfo = getTurnoLabel(grupo.turno)
            const cantidadAlumnos = alumnosPorGrupo[grupo.id] || 0

            return (
              <div
                key={grupo.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#8B2323]/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#8B2323]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${turnoInfo.color}`}>
                      {turnoInfo.label}
                    </span>
                    <GrupoActions
                      grupo={{ id: grupo.id, nombre: grupo.nombre, periodoid: grupo.periodoid, grado: grupo.grado, turno: grupo.turno }}
                      periodos={periodos || []}
                    />
                  </div>
                </div>

                <Link href={`/dashboard/grupos/${grupo.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-[#8B2323] transition-colors">{grupo.nombre}</h3>
                </Link>

                {grupo.grado && (
                  <p className="text-gray-600 text-sm mb-3">
                    {grupo.grado}° Grado
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{cantidadAlumnos} alumnos</span>
                  </div>
                </div>

                {grupo.periodo && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{grupo.periodo.nombre}</span>
                    {grupo.periodo.activo && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                        Activo
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-2">No hay grupos registrados</p>
          <p className="text-sm text-gray-400">Usa el botón &quot;Nuevo Grupo&quot; para crear el primero</p>
        </div>
      )}
    </div>
  )
}

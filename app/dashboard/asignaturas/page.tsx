import { createClient } from '@/lib/supabase/server'
import { Search, BookOpen, Hash, Award } from 'lucide-react'
import NuevaAsignaturaModal from './nueva-asignatura-modal'
import AsignaturaActions from './asignatura-actions'

export default async function AsignaturasPage() {
  const supabase = await createClient()

  // Obtener todas las asignaturas
  const { data: asignaturas } = await supabase
    .from('asignatura')
    .select(`
      id,
      nombre,
      clave,
      creditos,
      descripcion,
      activo
    `)
    .order('nombre', { ascending: true }) as { data: Array<{
      id: number
      nombre: string
      clave: string | null
      creditos: number | null
      descripcion: string | null
      activo: boolean
    }> | null }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asignaturas</h1>
          <p className="text-gray-600 mt-1">Gestiona las materias del plan de estudios</p>
        </div>
        <NuevaAsignaturaModal />
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar asignaturas..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B2323] focus:border-[#8B2323]"
          />
        </div>
      </div>

      {/* Grid de asignaturas */}
      {asignaturas && asignaturas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asignaturas.map((asignatura) => (
            <div
              key={asignatura.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    asignatura.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {asignatura.activo ? 'Activa' : 'Inactiva'}
                  </span>
                  <AsignaturaActions asignatura={asignatura} />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">{asignatura.nombre}</h3>

              {asignatura.descripcion && (
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                  {asignatura.descripcion}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                {asignatura.clave && (
                  <div className="flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    <span>{asignatura.clave}</span>
                  </div>
                )}
                {asignatura.creditos && (
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>{asignatura.creditos} créditos</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-2">No hay asignaturas registradas</p>
          <p className="text-sm text-gray-400">Usa el botón &quot;Nueva Asignatura&quot; para crear la primera</p>
        </div>
      )}
    </div>
  )
}

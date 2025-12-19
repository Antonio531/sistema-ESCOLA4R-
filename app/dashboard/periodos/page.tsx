import { createClient } from '@/lib/supabase/server'
import { Calendar, CheckCircle } from 'lucide-react'
import NuevoPeriodoModal from './nuevo-periodo-modal'
import PeriodoActions from './periodo-actions'

export default async function PeriodosPage() {
  const supabase = await createClient()

  // Obtener todos los periodos
  const { data: periodos } = await supabase
    .from('periodo')
    .select(`
      id,
      nombre,
      fechainicio,
      fechafin,
      activo,
      created_at
    `)
    .order('created_at', { ascending: false }) as { data: Array<{
      id: number
      nombre: string
      fechainicio: string | null
      fechafin: string | null
      activo: boolean
      created_at: string
    }> | null }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha'
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Periodos Escolares</h1>
          <p className="text-gray-600 mt-1">Gestiona los ciclos escolares</p>
        </div>
        <NuevoPeriodoModal />
      </div>

      {/* Lista de periodos */}
      {periodos && periodos.length > 0 ? (
        <div className="space-y-4">
          {periodos.map((periodo) => (
            <div
              key={periodo.id}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    periodo.activo ? 'bg-[#8B2323]/10' : 'bg-gray-100'
                  }`}>
                    <Calendar className={`w-6 h-6 ${
                      periodo.activo ? 'text-[#8B2323]' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{periodo.nombre}</h3>
                      {periodo.activo && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Activo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatDate(periodo.fechainicio)} - {formatDate(periodo.fechafin)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    Creado el {new Date(periodo.created_at).toLocaleDateString('es-MX')}
                  </span>
                  <PeriodoActions periodo={periodo} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-2">No hay periodos registrados</p>
          <p className="text-sm text-gray-400">Usa el botón &quot;Nuevo Periodo&quot; para crear el primero</p>
        </div>
      )}
    </div>
  )
}

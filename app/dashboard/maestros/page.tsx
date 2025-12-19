import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import NuevoMaestroModal from './nuevo-maestro-modal'
import GenerarReporteMaestros from '@/components/reportes/generar-reporte-maestros'
import MaestrosTable from './maestros-table'

export default async function MaestrosPage() {
  const supabase = await createClient()

  // Obtener todos los maestros
  const { data: maestros } = await supabase
    .from('maestro')
    .select(`
      id,
      nombre,
      correo,
      telefono,
      especialidad,
      activo,
      created_at
    `)
    .order('nombre', { ascending: true }) as { data: Array<{
      id: number
      nombre: string
      correo: string | null
      telefono: string | null
      especialidad: string | null
      activo: boolean
      created_at: string
    }> | null }

  // Estadísticas rápidas
  const totalMaestros = maestros?.length || 0
  const maestrosActivos = maestros?.filter(m => m.activo).length || 0

  return (
    <div className="space-y-6">
      {/* Header mejorado */}
      <div className="relative bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl p-6 shadow-lg animate-fade-in">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Maestros</h1>
              <p className="text-gray-300">
                {totalMaestros} maestros registrados • {maestrosActivos} activos
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <GenerarReporteMaestros maestros={maestros || []} />
            <NuevoMaestroModal />
          </div>
        </div>
      </div>

      {/* Tabla con búsqueda */}
      <MaestrosTable maestros={maestros || []} />
    </div>
  )
}

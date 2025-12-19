import { createClient } from '@/lib/supabase/server'
import { GraduationCap } from 'lucide-react'
import NuevoAlumnoModal from './nuevo-alumno-modal'
import GenerarReporteAlumnos from '@/components/reportes/generar-reporte-alumnos'
import AlumnosTable from './alumnos-table'

export default async function AlumnosPage() {
  const supabase = await createClient()

  // Obtener todos los alumnos
  const { data: alumnos } = await supabase
    .from('alumno')
    .select(`
      id,
      nombre,
      matricula,
      correo,
      telefono,
      curp,
      fechanacimiento,
      direccion,
      activo,
      created_at
    `)
    .order('nombre', { ascending: true }) as { data: Array<{
      id: number
      nombre: string
      matricula: string | null
      correo: string | null
      telefono: string | null
      curp: string | null
      fechanacimiento: string | null
      direccion: string | null
      activo: boolean
      created_at: string
    }> | null }

  // Estadísticas rápidas
  const totalAlumnos = alumnos?.length || 0
  const alumnosActivos = alumnos?.filter(a => a.activo).length || 0

  return (
    <div className="space-y-6">
      {/* Header mejorado */}
      <div className="relative bg-gradient-to-r from-[#8B2323] to-[#6B1A1A] rounded-2xl p-6 shadow-lg animate-fade-in">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Alumnos</h1>
              <p className="text-white/80">
                {totalAlumnos} alumnos registrados • {alumnosActivos} activos
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <GenerarReporteAlumnos alumnos={alumnos || []} />
            <NuevoAlumnoModal />
          </div>
        </div>
      </div>

      {/* Tabla con búsqueda */}
      <AlumnosTable alumnos={alumnos || []} />
    </div>
  )
}

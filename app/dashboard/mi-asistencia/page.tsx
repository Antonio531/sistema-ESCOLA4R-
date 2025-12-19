import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClipboardList, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Asistencia {
  id: number
  fecha: string
  presente: boolean
  justificada: boolean
  observaciones: string | null
  grupoasignatura: {
    asignatura: {
      nombre: string
      clave: string | null
    }
  }
}

export default async function MiAsistenciaPage() {
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

  // Obtener todas las asistencias del alumno
  const { data: asistencias } = await supabase
    .from('asistencia')
    .select(`
      id,
      fecha,
      presente,
      justificada,
      observaciones,
      grupoasignatura:grupoasignatura(
        asignatura:asignatura(nombre, clave)
      )
    `)
    .eq('alumnoid', alumno.id)
    .order('fecha', { ascending: false })
    .limit(100) as { data: Asistencia[] | null }

  // Calcular estadísticas
  const totalAsistencias = asistencias?.length || 0
  const presentes = asistencias?.filter(a => a.presente).length || 0
  const ausentes = asistencias?.filter(a => !a.presente && !a.justificada).length || 0
  const justificadas = asistencias?.filter(a => !a.presente && a.justificada).length || 0
  const porcentajeAsistencia = totalAsistencias > 0 ? ((presentes / totalAsistencias) * 100).toFixed(1) : '0'

  // Agrupar por mes
  const asistenciasPorMes = new Map<string, Asistencia[]>()
  asistencias?.forEach((a) => {
    const fecha = new Date(a.fecha)
    const mesKey = fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
    if (!asistenciasPorMes.has(mesKey)) {
      asistenciasPorMes.set(mesKey, [])
    }
    asistenciasPorMes.get(mesKey)!.push(a)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Asistencia</h1>
        <p className="text-gray-600">Consulta tu historial de asistencias</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">% Asistencia</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{porcentajeAsistencia}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Presente</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{presentes}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ausente</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{ausentes}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Justificadas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{justificadas}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Historial por mes */}
      {asistenciasPorMes.size > 0 ? (
        <div className="space-y-6">
          {Array.from(asistenciasPorMes.entries()).map(([mes, asistenciasMes]) => (
            <div key={mes} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header del mes */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">{mes}</h3>
                <p className="text-sm text-gray-500">{asistenciasMes.length} registros</p>
              </div>

              {/* Lista de asistencias */}
              <div className="divide-y divide-gray-100">
                {asistenciasMes.map((asist) => (
                  <div key={asist.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          asist.presente ? 'bg-green-100' :
                          asist.justificada ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          {asist.presente ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : asist.justificada ? (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{asist.grupoasignatura.asignatura.nombre}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(asist.fecha).toLocaleDateString('es-MX', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          asist.presente ? 'bg-green-100 text-green-800' :
                          asist.justificada ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {asist.presente ? 'Presente' : asist.justificada ? 'Justificada' : 'Ausente'}
                        </span>
                        {asist.observaciones && (
                          <p className="text-xs text-gray-500 mt-1 italic">{asist.observaciones}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin registro de asistencias</h3>
          <p className="text-gray-500">Aún no hay asistencias registradas.</p>
        </div>
      )}
    </div>
  )
}

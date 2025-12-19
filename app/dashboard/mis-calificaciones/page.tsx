import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileSpreadsheet, TrendingUp } from 'lucide-react'

interface Calificacion {
  id: number
  calificacion: number | null
  observaciones: string | null
  parcial: {
    nombre: string
    numero: number
  }
  grupoasignatura: {
    asignatura: {
      nombre: string
      clave: string | null
    }
  }
}

export default async function MisCalificacionesPage() {
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

  // Obtener todas las calificaciones del alumno
  const { data: calificaciones } = await supabase
    .from('calificacion')
    .select(`
      id,
      calificacion,
      observaciones,
      parcial:parcial(nombre, numero),
      grupoasignatura:grupoasignatura(
        asignatura:asignatura(nombre, clave)
      )
    `)
    .eq('alumnoid', alumno.id)
    .order('id', { ascending: false }) as { data: Calificacion[] | null }

  // Agrupar por materia
  const materiaMap = new Map<string, { nombre: string; clave: string | null; califs: { parcial: string; numero: number; calif: number | null; obs: string | null }[] }>()

  calificaciones?.forEach((c) => {
    const materiaKey = c.grupoasignatura.asignatura.nombre
    if (!materiaMap.has(materiaKey)) {
      materiaMap.set(materiaKey, {
        nombre: c.grupoasignatura.asignatura.nombre,
        clave: c.grupoasignatura.asignatura.clave,
        califs: []
      })
    }
    materiaMap.get(materiaKey)!.califs.push({
      parcial: c.parcial.nombre,
      numero: c.parcial.numero,
      calif: c.calificacion,
      obs: c.observaciones
    })
  })

  const materias = Array.from(materiaMap.values())

  // Calcular promedio general
  let promedioGeneral = 0
  if (calificaciones && calificaciones.length > 0) {
    const suma = calificaciones.reduce((acc, c) => acc + (c.calificacion || 0), 0)
    promedioGeneral = suma / calificaciones.length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Calificaciones</h1>
        <p className="text-gray-600">Consulta tus calificaciones por materia</p>
      </div>

      {/* Promedio general */}
      {calificaciones && calificaciones.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Promedio General</p>
              <p className="text-4xl font-bold mt-1">{promedioGeneral.toFixed(1)}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>
      )}

      {/* Calificaciones por materia */}
      {materias.length > 0 ? (
        <div className="space-y-4">
          {materias.map((materia) => {
            // Calcular promedio de la materia
            const califs = materia.califs.filter(c => c.calif !== null)
            const promedio = califs.length > 0
              ? califs.reduce((acc, c) => acc + (c.calif || 0), 0) / califs.length
              : 0

            // Ordenar por número de parcial
            materia.califs.sort((a, b) => a.numero - b.numero)

            return (
              <div key={materia.nombre} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header de materia */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{materia.nombre}</h3>
                      {materia.clave && (
                        <p className="text-sm text-gray-500">Clave: {materia.clave}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Promedio</p>
                      <p className={`text-2xl font-bold ${
                        promedio >= 8 ? 'text-green-600' :
                        promedio >= 7 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {promedio > 0 ? promedio.toFixed(1) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Calificaciones por parcial */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materia.califs.map((calif, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs font-medium text-gray-500 uppercase">{calif.parcial}</p>
                        <p className={`text-3xl font-bold mt-1 ${
                          calif.calif === null ? 'text-gray-400' :
                          calif.calif >= 8 ? 'text-green-600' :
                          calif.calif >= 7 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {calif.calif !== null ? calif.calif.toFixed(1) : 'N/A'}
                        </p>
                        {calif.obs && (
                          <p className="text-xs text-gray-500 mt-2 italic">{calif.obs}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin calificaciones</h3>
          <p className="text-gray-500">Aún no tienes calificaciones capturadas. Espera a que tus maestros las registren.</p>
        </div>
      )}
    </div>
  )
}

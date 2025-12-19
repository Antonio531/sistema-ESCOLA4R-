import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Clock, MapPin, BookOpen, Users } from 'lucide-react'

interface HorarioItem {
  id: number
  dia: string
  horainicio: string
  horafin: string
  aula: string | null
  grupoasignatura: {
    id: number
    grupo: {
      id: number
      nombre: string
      grado: number | null
    }
    asignatura: {
      nombre: string
      clave: string | null
    }
  }
}

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const DIAS_DISPLAY: { [key: string]: string } = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
}

export default async function HorarioPage() {
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

  // Obtener los horarios del maestro
  const { data: horarios } = await supabase
    .from('horario')
    .select(`
      id,
      dia,
      horainicio,
      horafin,
      aula,
      grupoasignatura:grupoasignatura(
        id,
        grupo:grupo(id, nombre, grado),
        asignatura:asignatura(nombre, clave)
      )
    `)
    .eq('grupoasignatura.maestroid', maestro.id)
    .order('horainicio') as { data: HorarioItem[] | null }

  // Filtrar horarios nulos (por el join con grupoasignatura)
  const horariosValidos = (horarios || []).filter(h => h.grupoasignatura)

  // Agrupar horarios por día
  const horariosPorDia = DIAS_SEMANA.reduce((acc, dia) => {
    acc[dia] = horariosValidos
      .filter(h => h.dia.toLowerCase() === dia)
      .sort((a, b) => a.horainicio.localeCompare(b.horainicio))
    return acc
  }, {} as { [key: string]: HorarioItem[] })

  // Colores para las materias
  const colores = [
    'bg-blue-100 border-blue-300 text-blue-800',
    'bg-green-100 border-green-300 text-green-800',
    'bg-purple-100 border-purple-300 text-purple-800',
    'bg-orange-100 border-orange-300 text-orange-800',
    'bg-pink-100 border-pink-300 text-pink-800',
    'bg-teal-100 border-teal-300 text-teal-800',
  ]

  // Asignar colores a cada grupo-asignatura
  const grupoAsignaturaIds = [...new Set(horariosValidos.map(h => h.grupoasignatura.id))]
  const colorMap = new Map<number, string>()
  grupoAsignaturaIds.forEach((id, index) => {
    colorMap.set(id, colores[index % colores.length])
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Horario</h1>
        <p className="text-gray-600">Tu horario de clases semanal</p>
      </div>

      {horariosValidos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin horario configurado</h3>
          <p className="text-gray-500">Aún no tienes horarios asignados. El administrador debe configurar tu horario.</p>
        </div>
      ) : (
        <>
          {/* Vista de escritorio - Tabla */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-6 divide-x divide-gray-200">
              {DIAS_SEMANA.map((dia) => (
                <div key={dia} className="min-h-[400px]">
                  <div className="bg-indigo-600 text-white text-center py-3 font-medium">
                    {DIAS_DISPLAY[dia]}
                  </div>
                  <div className="p-2 space-y-2">
                    {horariosPorDia[dia].length > 0 ? (
                      horariosPorDia[dia].map((horario) => (
                        <div
                          key={horario.id}
                          className={`p-3 rounded-lg border ${colorMap.get(horario.grupoasignatura.id)}`}
                        >
                          <div className="flex items-center gap-1 text-xs font-medium mb-1">
                            <Clock className="w-3 h-3" />
                            {horario.horainicio.slice(0, 5)} - {horario.horafin.slice(0, 5)}
                          </div>
                          <p className="font-medium text-sm">{horario.grupoasignatura.asignatura.nombre}</p>
                          <p className="text-xs opacity-80">{horario.grupoasignatura.grupo.nombre}</p>
                          {horario.aula && (
                            <div className="flex items-center gap-1 text-xs mt-1 opacity-70">
                              <MapPin className="w-3 h-3" />
                              {horario.aula}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm text-gray-400 py-4">Sin clases</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vista móvil - Lista por día */}
          <div className="lg:hidden space-y-4">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-indigo-600 text-white px-4 py-2 font-medium">
                  {DIAS_DISPLAY[dia]}
                </div>
                <div className="p-4 space-y-3">
                  {horariosPorDia[dia].length > 0 ? (
                    horariosPorDia[dia].map((horario) => (
                      <div
                        key={horario.id}
                        className={`p-4 rounded-lg border ${colorMap.get(horario.grupoasignatura.id)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {horario.horainicio.slice(0, 5)} - {horario.horafin.slice(0, 5)}
                            </span>
                          </div>
                          {horario.aula && (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="w-4 h-4" />
                              {horario.aula}
                            </div>
                          )}
                        </div>
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-5 h-5 mt-0.5" />
                          <div>
                            <p className="font-medium">{horario.grupoasignatura.asignatura.nombre}</p>
                            <p className="text-sm opacity-80 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {horario.grupoasignatura.grupo.nombre}
                              {horario.grupoasignatura.grupo.grado && ` - ${horario.grupoasignatura.grupo.grado}° Grado`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Sin clases este día</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Leyenda */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Mis Materias</h3>
            <div className="flex flex-wrap gap-2">
              {grupoAsignaturaIds.map((id) => {
                const horario = horariosValidos.find(h => h.grupoasignatura.id === id)
                if (!horario) return null
                return (
                  <div
                    key={id}
                    className={`px-3 py-1 rounded-full text-sm border ${colorMap.get(id)}`}
                  >
                    {horario.grupoasignatura.asignatura.nombre} - {horario.grupoasignatura.grupo.nombre}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

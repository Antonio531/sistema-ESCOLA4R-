import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Clock, MapPin, User } from 'lucide-react'

interface Horario {
  id: number
  dia: string
  horainicio: string
  horafin: string
  aula: string | null
  grupoasignatura: {
    asignatura: {
      nombre: string
      clave: string | null
    }
    maestro: {
      nombre: string
    } | null
    grupo: {
      nombre: string
    }
  }
}

const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const diasMap: Record<string, string> = {
  'lunes': 'Lunes',
  'martes': 'Martes',
  'miércoles': 'Miércoles',
  'jueves': 'Jueves',
  'viernes': 'Viernes',
  'sábado': 'Sábado'
}

export default async function MiHorarioPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Mi Horario</h1>
          <p className="text-gray-600">Consulta tu horario de clases</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin horario asignado</h3>
          <p className="text-gray-500">No estás inscrito en ningún grupo.</p>
        </div>
      </div>
    )
  }

  const grupoIds = inscripciones.map(i => i.grupoid)

  // Obtener los IDs de grupoasignatura
  const { data: gruposAsig } = await supabase
    .from('grupoasignatura')
    .select('id')
    .in('grupoid', grupoIds) as { data: { id: number }[] | null }

  const grupoAsigIds = gruposAsig?.map(ga => ga.id) || []

  if (grupoAsigIds.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Horario</h1>
          <p className="text-gray-600">Consulta tu horario de clases</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin horario configurado</h3>
          <p className="text-gray-500">Aún no hay horarios configurados para tus grupos.</p>
        </div>
      </div>
    )
  }

  // Obtener el horario
  const { data: horarios } = await supabase
    .from('horario')
    .select(`
      id,
      dia,
      horainicio,
      horafin,
      aula,
      grupoasignatura:grupoasignatura(
        asignatura:asignatura(nombre, clave),
        maestro:maestro(nombre),
        grupo:grupo(nombre)
      )
    `)
    .in('grupoasignaturaid', grupoAsigIds)
    .order('dia')
    .order('horainicio') as { data: Horario[] | null }

  // Agrupar por día
  const horarioPorDia = new Map<string, Horario[]>()
  diasSemana.forEach(dia => {
    horarioPorDia.set(dia, [])
  })

  horarios?.forEach((h) => {
    const dia = h.dia.toLowerCase()
    if (horarioPorDia.has(dia)) {
      horarioPorDia.get(dia)!.push(h)
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Horario</h1>
        <p className="text-gray-600">Consulta tu horario de clases semanal</p>
      </div>

      {/* Horario */}
      {horarios && horarios.length > 0 ? (
        <div className="space-y-4">
          {diasSemana.map((dia) => {
            const clasesDelDia = horarioPorDia.get(dia) || []
            if (clasesDelDia.length === 0) return null

            return (
              <div key={dia} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header del día */}
                <div className="bg-indigo-600 px-6 py-3">
                  <h3 className="text-lg font-semibold text-white">{diasMap[dia]}</h3>
                </div>

                {/* Clases del día */}
                <div className="divide-y divide-gray-100">
                  {clasesDelDia.map((clase) => (
                    <div key={clase.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className="bg-indigo-100 p-3 rounded-lg">
                            <Clock className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="font-semibold text-gray-900">{clase.grupoasignatura.asignatura.nombre}</p>
                              {clase.grupoasignatura.asignatura.clave && (
                                <p className="text-xs text-gray-500">Clave: {clase.grupoasignatura.asignatura.clave}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {clase.grupoasignatura.maestro && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{clase.grupoasignatura.maestro.nombre}</span>
                                </div>
                              )}
                              {clase.aula && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{clase.aula}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-lg font-semibold text-indigo-600">
                            {clase.horainicio.substring(0, 5)} - {clase.horafin.substring(0, 5)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{clase.grupoasignatura.grupo.nombre}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin horario configurado</h3>
          <p className="text-gray-500">Aún no hay horarios configurados para tus materias.</p>
        </div>
      )}
    </div>
  )
}

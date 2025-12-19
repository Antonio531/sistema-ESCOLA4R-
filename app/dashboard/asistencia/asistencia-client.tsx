'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ClipboardList, Save, Loader2, Check, X, Calendar } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface GrupoAsignatura {
  id: number
  aula: string | null
  grupo: {
    id: number
    nombre: string
    grado: number | null
    turno: string | null
  }
  asignatura: {
    id: number
    nombre: string
    clave: string | null
  }
}

interface Alumno {
  id: number
  nombre: string
  matricula: string | null
}

interface Asistencia {
  alumnoid: number
  presente: boolean
  justificada: boolean
  observaciones: string | null
}

interface Props {
  gruposAsignaturas: GrupoAsignatura[]
  grupoIdInicial?: number
}

export default function AsistenciaClient({ gruposAsignaturas, grupoIdInicial }: Props) {
  const [selectedGrupoAsignatura, setSelectedGrupoAsignatura] = useState<number | ''>('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [asistencias, setAsistencias] = useState<Map<number, { presente: boolean; justificada: boolean; observaciones: string }>>(new Map())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const supabase = createClient()
  const toast = useToast()

  // Si hay grupo inicial, seleccionar la primera asignatura de ese grupo
  useEffect(() => {
    if (grupoIdInicial) {
      const ga = gruposAsignaturas.find(g => g.grupo.id === grupoIdInicial)
      if (ga) {
        setSelectedGrupoAsignatura(ga.id)
      }
    }
  }, [grupoIdInicial, gruposAsignaturas])

  // Cargar alumnos cuando se selecciona grupo/asignatura
  useEffect(() => {
    async function loadAlumnos() {
      if (!selectedGrupoAsignatura) {
        setAlumnos([])
        return
      }

      setLoading(true)
      const ga = gruposAsignaturas.find(g => g.id === selectedGrupoAsignatura)
      if (!ga) return

      // Obtener alumnos del grupo
      const { data: grupoAlumnos } = await supabase
        .from('grupoalumno')
        .select('alumno:alumno(id, nombre, matricula)')
        .eq('grupoid', ga.grupo.id)
        .eq('activo', true) as { data: { alumno: Alumno }[] | null }

      const alumnosList = grupoAlumnos?.map(ga => ga.alumno) || []
      setAlumnos(alumnosList.sort((a, b) => a.nombre.localeCompare(b.nombre)))
      setLoading(false)
    }

    loadAlumnos()
  }, [selectedGrupoAsignatura, gruposAsignaturas, supabase])

  // Cargar asistencias cuando cambia la fecha o grupo
  useEffect(() => {
    async function loadAsistencias() {
      if (!selectedGrupoAsignatura || alumnos.length === 0) {
        setAsistencias(new Map())
        return
      }

      const { data } = await supabase
        .from('asistencia')
        .select('alumnoid, presente, justificada, observaciones')
        .eq('grupoasignaturaid', selectedGrupoAsignatura)
        .eq('fecha', fecha) as { data: Asistencia[] | null }

      const asistMap = new Map<number, { presente: boolean; justificada: boolean; observaciones: string }>()
      alumnos.forEach(alumno => {
        const asist = data?.find(a => a.alumnoid === alumno.id)
        asistMap.set(alumno.id, {
          presente: asist?.presente ?? true,
          justificada: asist?.justificada ?? false,
          observaciones: asist?.observaciones || ''
        })
      })
      setAsistencias(asistMap)
      setHasChanges(false)
    }

    loadAsistencias()
  }, [selectedGrupoAsignatura, fecha, alumnos, supabase])

  const handlePresenteChange = (alumnoid: number, presente: boolean) => {
    const newAsist = new Map(asistencias)
    const current = newAsist.get(alumnoid) || { presente: true, justificada: false, observaciones: '' }
    newAsist.set(alumnoid, { ...current, presente })
    setAsistencias(newAsist)
    setHasChanges(true)
  }

  const handleJustificadaChange = (alumnoid: number, justificada: boolean) => {
    const newAsist = new Map(asistencias)
    const current = newAsist.get(alumnoid) || { presente: true, justificada: false, observaciones: '' }
    newAsist.set(alumnoid, { ...current, justificada })
    setAsistencias(newAsist)
    setHasChanges(true)
  }

  const handleObservacionChange = (alumnoid: number, observaciones: string) => {
    const newAsist = new Map(asistencias)
    const current = newAsist.get(alumnoid) || { presente: true, justificada: false, observaciones: '' }
    newAsist.set(alumnoid, { ...current, observaciones })
    setAsistencias(newAsist)
    setHasChanges(true)
  }

  const marcarTodos = (presente: boolean) => {
    const newAsist = new Map(asistencias)
    alumnos.forEach(alumno => {
      const current = newAsist.get(alumno.id) || { presente: true, justificada: false, observaciones: '' }
      newAsist.set(alumno.id, { ...current, presente })
    })
    setAsistencias(newAsist)
    setHasChanges(true)
  }

  const handleGuardar = async () => {
    if (!selectedGrupoAsignatura) return

    setSaving(true)
    try {
      const upserts = Array.from(asistencias.entries()).map(([alumnoid, data]) => ({
        alumnoid,
        grupoasignaturaid: selectedGrupoAsignatura,
        fecha,
        presente: data.presente,
        justificada: data.justificada,
        observaciones: data.observaciones || null,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('asistencia')
        .upsert(upserts, { onConflict: 'alumnoid,grupoasignaturaid,fecha' })

      if (error) {
        toast.error('Error al guardar asistencia: ' + error.message)
        return
      }

      toast.success('Asistencia guardada exitosamente')
      setHasChanges(false)
    } catch {
      toast.error('Error al guardar la asistencia')
    } finally {
      setSaving(false)
    }
  }

  const selectedGA = gruposAsignaturas.find(g => g.id === selectedGrupoAsignatura)

  // Contar presentes y ausentes
  const presentes = Array.from(asistencias.values()).filter(a => a.presente).length
  const ausentes = alumnos.length - presentes

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asistencia</h1>
          <p className="text-gray-600">Registra la asistencia de tus alumnos</p>
        </div>
        {hasChanges && selectedGrupoAsignatura && (
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Asistencia
          </button>
        )}
      </div>

      {/* Selectores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selector de Grupo/Materia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo y Materia</label>
            <select
              value={selectedGrupoAsignatura}
              onChange={(e) => setSelectedGrupoAsignatura(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar grupo y materia</option>
              {gruposAsignaturas.map((ga) => (
                <option key={ga.id} value={ga.id}>
                  {ga.grupo.nombre} - {ga.asignatura.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info del grupo seleccionado */}
      {selectedGA && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ClipboardList className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="font-medium text-indigo-900">{selectedGA.grupo.nombre} - {selectedGA.asignatura.nombre}</p>
                <p className="text-sm text-indigo-700">
                  Fecha: {new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                Presentes: {presentes}
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">
                Ausentes: {ausentes}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de asistencia */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-gray-500 mt-2">Cargando alumnos...</p>
        </div>
      ) : selectedGrupoAsignatura && alumnos.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Acciones rápidas */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex gap-2">
            <button
              onClick={() => marcarTodos(true)}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Marcar todos presentes
            </button>
            <button
              onClick={() => marcarTodos(false)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Marcar todos ausentes
            </button>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alumno
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrícula
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asistencia
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Justificada
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alumnos.map((alumno, index) => {
                const asist = asistencias.get(alumno.id) || { presente: true, justificada: false, observaciones: '' }
                return (
                  <tr key={alumno.id} className={`hover:bg-gray-50 ${!asist.presente ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{alumno.nombre}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {alumno.matricula || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handlePresenteChange(alumno.id, true)}
                          className={`p-2 rounded-lg transition-colors ${
                            asist.presente
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-green-50'
                          }`}
                          title="Presente"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handlePresenteChange(alumno.id, false)}
                          className={`p-2 rounded-lg transition-colors ${
                            !asist.presente
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-red-50'
                          }`}
                          title="Ausente"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={asist.justificada}
                        onChange={(e) => handleJustificadaChange(alumno.id, e.target.checked)}
                        disabled={asist.presente}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={asist.observaciones}
                        onChange={(e) => handleObservacionChange(alumno.id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder="Observaciones..."
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : selectedGrupoAsignatura ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin alumnos</h3>
          <p className="text-gray-500">No hay alumnos inscritos en este grupo.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un grupo</h3>
          <p className="text-gray-500">Elige un grupo y materia para pasar lista de asistencia.</p>
        </div>
      )}
    </div>
  )
}

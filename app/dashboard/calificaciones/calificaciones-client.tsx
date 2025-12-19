'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileSpreadsheet, Save, Loader2, Check } from 'lucide-react'
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

interface Parcial {
  id: number
  nombre: string
  numero: number
  activo: boolean
}

interface Alumno {
  id: number
  nombre: string
  matricula: string | null
}

interface Calificacion {
  alumnoid: number
  calificacion: number | null
  observaciones: string | null
}

interface Props {
  gruposAsignaturas: GrupoAsignatura[]
  parciales: Parcial[]
  grupoIdInicial?: number
}

export default function CalificacionesClient({ gruposAsignaturas, parciales, grupoIdInicial }: Props) {
  const [selectedGrupoAsignatura, setSelectedGrupoAsignatura] = useState<number | ''>('')
  const [selectedParcial, setSelectedParcial] = useState<number | ''>('')
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [calificaciones, setCalificaciones] = useState<Map<number, { calificacion: string; observaciones: string }>>( new Map())
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

  // Cargar calificaciones cuando cambia el parcial o grupo
  useEffect(() => {
    async function loadCalificaciones() {
      if (!selectedGrupoAsignatura || !selectedParcial || alumnos.length === 0) {
        setCalificaciones(new Map())
        return
      }

      const { data } = await supabase
        .from('calificacion')
        .select('alumnoid, calificacion, observaciones')
        .eq('grupoasignaturaid', selectedGrupoAsignatura)
        .eq('parcialid', selectedParcial) as { data: Calificacion[] | null }

      const calMap = new Map<number, { calificacion: string; observaciones: string }>()
      alumnos.forEach(alumno => {
        const cal = data?.find(c => c.alumnoid === alumno.id)
        calMap.set(alumno.id, {
          calificacion: cal?.calificacion?.toString() || '',
          observaciones: cal?.observaciones || ''
        })
      })
      setCalificaciones(calMap)
      setHasChanges(false)
    }

    loadCalificaciones()
  }, [selectedGrupoAsignatura, selectedParcial, alumnos, supabase])

  const handleCalificacionChange = (alumnoid: number, value: string) => {
    const newCals = new Map(calificaciones)
    const current = newCals.get(alumnoid) || { calificacion: '', observaciones: '' }
    newCals.set(alumnoid, { ...current, calificacion: value })
    setCalificaciones(newCals)
    setHasChanges(true)
  }

  const handleObservacionChange = (alumnoid: number, value: string) => {
    const newCals = new Map(calificaciones)
    const current = newCals.get(alumnoid) || { calificacion: '', observaciones: '' }
    newCals.set(alumnoid, { ...current, observaciones: value })
    setCalificaciones(newCals)
    setHasChanges(true)
  }

  const handleGuardar = async () => {
    if (!selectedGrupoAsignatura || !selectedParcial) return

    setSaving(true)
    try {
      const upserts = Array.from(calificaciones.entries())
        .filter(([, data]) => data.calificacion !== '')
        .map(([alumnoid, data]) => ({
          alumnoid,
          grupoasignaturaid: selectedGrupoAsignatura,
          parcialid: selectedParcial,
          calificacion: parseFloat(data.calificacion) || null,
          observaciones: data.observaciones || null,
        }))

      if (upserts.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('calificacion')
          .upsert(upserts, { onConflict: 'alumnoid,grupoasignaturaid,parcialid' })

        if (error) {
          toast.error('Error al guardar calificaciones: ' + error.message)
          return
        }
      }

      toast.success('Calificaciones guardadas exitosamente')
      setHasChanges(false)
    } catch {
      toast.error('Error al guardar las calificaciones')
    } finally {
      setSaving(false)
    }
  }

  const selectedGA = gruposAsignaturas.find(g => g.id === selectedGrupoAsignatura)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calificaciones</h1>
          <p className="text-gray-600">Captura las calificaciones de tus alumnos</p>
        </div>
        {hasChanges && selectedGrupoAsignatura && selectedParcial && (
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
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

          {/* Selector de Parcial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parcial</label>
            <select
              value={selectedParcial}
              onChange={(e) => setSelectedParcial(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              disabled={!selectedGrupoAsignatura}
            >
              <option value="">Seleccionar parcial</option>
              {parciales.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.activo && '(Activo)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Info del grupo seleccionado */}
      {selectedGA && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="font-medium text-indigo-900">{selectedGA.grupo.nombre} - {selectedGA.asignatura.nombre}</p>
              <p className="text-sm text-indigo-700">
                {selectedGA.grupo.grado && `${selectedGA.grupo.grado}° Grado`}
                {selectedGA.grupo.turno && ` | ${selectedGA.grupo.turno}`}
                {selectedGA.aula && ` | Aula: ${selectedGA.aula}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de calificaciones */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-gray-500 mt-2">Cargando alumnos...</p>
        </div>
      ) : selectedGrupoAsignatura && selectedParcial && alumnos.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Calificación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alumnos.map((alumno, index) => {
                const cal = calificaciones.get(alumno.id) || { calificacion: '', observaciones: '' }
                return (
                  <tr key={alumno.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{alumno.nombre}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {alumno.matricula || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={cal.calificacion}
                        onChange={(e) => handleCalificacionChange(alumno.id, e.target.value)}
                        className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0-100"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={cal.observaciones}
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
      ) : selectedGrupoAsignatura && selectedParcial ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin alumnos</h3>
          <p className="text-gray-500">No hay alumnos inscritos en este grupo.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un grupo y parcial</h3>
          <p className="text-gray-500">Elige un grupo, materia y parcial para capturar calificaciones.</p>
        </div>
      )}

      {/* Parciales sin crear */}
      {parciales.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800">
            <strong>Nota:</strong> No hay parciales configurados para el periodo activo.
            El administrador debe crear los parciales primero.
          </p>
        </div>
      )}
    </div>
  )
}

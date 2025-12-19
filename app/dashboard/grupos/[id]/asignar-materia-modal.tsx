'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, BookOpen } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Asignatura {
  id: number
  nombre: string
  clave: string | null
}

interface Maestro {
  id: number
  nombre: string
  especialidad: string | null
}

interface Props {
  grupoId: number
  asignaturasDisponibles: Asignatura[]
  maestrosDisponibles: Maestro[]
}

export default function AsignarMateriaModal({ grupoId, asignaturasDisponibles, maestrosDisponibles }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [asignaturaId, setAsignaturaId] = useState<number | ''>('')
  const [maestroId, setMaestroId] = useState<number | ''>('')
  const [aula, setAula] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  const handleAsignar = async () => {
    if (!asignaturaId) {
      setError('Selecciona una materia')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('grupoasignatura')
        .insert({
          grupoid: grupoId,
          asignaturaid: asignaturaId,
          maestroid: maestroId || null,
          aula: aula || null,
          activo: true,
        })

      if (insertError) {
        setError('Error al asignar la materia: ' + insertError.message)
        return
      }

      const asignaturaNombre = asignaturasDisponibles.find(a => a.id === asignaturaId)?.nombre || 'Materia'
      setIsOpen(false)
      setAsignaturaId('')
      setMaestroId('')
      setAula('')
      toast.success(`${asignaturaNombre} asignada al grupo exitosamente`)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAsignaturaId('')
    setMaestroId('')
    setAula('')
    setError(null)
  }

  return (
    <>
      <button
        onClick={() => { resetForm(); setIsOpen(true) }}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Agregar Materia al Grupo</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              {/* Materia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Materia *
                </label>
                <select
                  value={asignaturaId}
                  onChange={(e) => setAsignaturaId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Seleccionar materia</option>
                  {asignaturasDisponibles.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} {a.clave ? `(${a.clave})` : ''}
                    </option>
                  ))}
                </select>
                {asignaturasDisponibles.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Todas las materias ya están asignadas
                  </p>
                )}
              </div>

              {/* Maestro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maestro (opcional)
                </label>
                <select
                  value={maestroId}
                  onChange={(e) => setMaestroId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Sin maestro asignado</option>
                  {maestrosDisponibles.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} {m.especialidad ? `- ${m.especialidad}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aula */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aula (opcional)
                </label>
                <input
                  type="text"
                  value={aula}
                  onChange={(e) => setAula(e.target.value)}
                  placeholder="Ej: A-101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAsignar}
                disabled={loading || !asignaturaId}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Agregar Materia
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

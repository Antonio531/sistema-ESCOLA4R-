'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X, Users, Calendar, Clock, Hash, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Periodo {
  id: number
  nombre: string
  activo: boolean
}

export default function NuevoGrupoModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [grado, setGrado] = useState<number | ''>('')
  const [turno, setTurno] = useState('')
  const [periodoId, setPeriodoId] = useState<number | ''>('')
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    async function loadPeriodos() {
      const { data } = await supabase
        .from('periodo')
        .select('id, nombre, activo')
        .order('created_at', { ascending: false }) as { data: Periodo[] | null }

      if (data) {
        setPeriodos(data)
        const periodoActivo = data.find(p => p.activo)
        if (periodoActivo) {
          setPeriodoId(periodoActivo.id)
        }
      }
    }
    if (isOpen) {
      loadPeriodos()
    }
  }, [supabase, isOpen])

  const resetForm = () => {
    setNombre('')
    setGrado('')
    setTurno('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!periodoId) {
      setError('Selecciona un periodo')
      return
    }

    setLoading(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: grupoError } = await (supabase as any)
        .from('grupo')
        .insert({
          nombre,
          grado: grado || null,
          turno: turno || null,
          periodoid: periodoId,
        })

      if (grupoError) {
        setError('Error al crear el grupo: ' + grupoError.message)
        setLoading(false)
        return
      }

      setIsOpen(false)
      resetForm()
      toast.success(`Grupo "${nombre}" creado exitosamente`)
      router.refresh()

    } catch {
      setError('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => { resetForm(); setIsOpen(true) }}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Nuevo Grupo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Nuevo Grupo</h3>
                <p className="text-sm text-gray-500">Crea un nuevo grupo escolar</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del grupo *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: 1A, 2B, 3C..."
                  />
                </div>
              </div>

              {/* Grado y Turno */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={grado}
                      onChange={(e) => setGrado(e.target.value ? Number(e.target.value) : '')}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="1">1° Grado</option>
                      <option value="2">2° Grado</option>
                      <option value="3">3° Grado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={turno}
                      onChange={(e) => setTurno(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="matutino">Matutino</option>
                      <option value="vespertino">Vespertino</option>
                      <option value="nocturno">Nocturno</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Periodo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periodo escolar *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={periodoId}
                    onChange={(e) => setPeriodoId(e.target.value ? Number(e.target.value) : '')}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seleccionar periodo</option>
                    {periodos.map((periodo) => (
                      <option key={periodo.id} value={periodo.id}>
                        {periodo.nombre} {periodo.activo ? '(Activo)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {periodos.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">No hay periodos. Crea uno primero.</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !nombre || !periodoId}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear Grupo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

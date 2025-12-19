'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, FolderOpen, GraduationCap, Clock, Calendar, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface EditarGrupoModalProps {
  grupo: {
    id: number
    nombre: string
    periodoid: number
    grado: number | null
    turno: string | null
  }
  periodos: Array<{ id: number; nombre: string }>
  isOpen: boolean
  onClose: () => void
}

export default function EditarGrupoModal({ grupo, periodos, isOpen, onClose }: EditarGrupoModalProps) {
  const [nombre, setNombre] = useState(grupo.nombre)
  const [grado, setGrado] = useState<number | ''>(grupo.grado || '')
  const [turno, setTurno] = useState(grupo.turno || '')
  const [periodoId, setPeriodoId] = useState<number | ''>(grupo.periodoid)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    setNombre(grupo.nombre)
    setGrado(grupo.grado || '')
    setTurno(grupo.turno || '')
    setPeriodoId(grupo.periodoid)
  }, [grupo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: grupoError } = await (supabase as any)
        .from('grupo')
        .update({
          nombre,
          grado: grado || null,
          turno: turno || null,
          periodoid: periodoId,
        })
        .eq('id', grupo.id)

      if (grupoError) {
        setError('Error al actualizar el grupo: ' + grupoError.message)
        setLoading(false)
        return
      }

      toast.success(`Grupo "${nombre}" actualizado exitosamente`)
      onClose()
      router.refresh()

    } catch {
      setError('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Editar Grupo</h3>
            <p className="text-sm text-gray-500">Actualiza la información del grupo</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del grupo *</label>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: 1-A, Matemáticas Avanzadas..."
              />
            </div>
          </div>

          {/* Grado y Turno */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={grado}
                  onChange={(e) => setGrado(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="1-6"
                />
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
                  <option value="">Sin turno</option>
                  <option value="matutino">Matutino</option>
                  <option value="vespertino">Vespertino</option>
                </select>
              </div>
            </div>
          </div>

          {/* Periodo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={periodoId}
                onChange={(e) => setPeriodoId(e.target.value ? Number(e.target.value) : '')}
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Seleccionar periodo</option>
                {periodos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
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
            onClick={onClose}
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
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}

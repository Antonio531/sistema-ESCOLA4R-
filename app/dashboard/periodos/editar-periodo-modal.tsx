'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Calendar, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface EditarPeriodoModalProps {
  periodo: {
    id: number
    nombre: string
    fechainicio: string | null
    fechafin: string | null
    activo: boolean
  }
  isOpen: boolean
  onClose: () => void
}

export default function EditarPeriodoModal({ periodo, isOpen, onClose }: EditarPeriodoModalProps) {
  const [nombre, setNombre] = useState(periodo.nombre)
  const [fechaInicio, setFechaInicio] = useState(periodo.fechainicio || '')
  const [fechaFin, setFechaFin] = useState(periodo.fechafin || '')
  const [activo, setActivo] = useState(periodo.activo)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    setNombre(periodo.nombre)
    setFechaInicio(periodo.fechainicio || '')
    setFechaFin(periodo.fechafin || '')
    setActivo(periodo.activo)
  }, [periodo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio')
      return
    }

    setLoading(true)

    try {
      // Si el periodo será activo, desactivar los demás
      if (activo && !periodo.activo) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('periodo')
          .update({ activo: false })
          .eq('activo', true)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: periodoError } = await (supabase as any)
        .from('periodo')
        .update({
          nombre,
          fechainicio: fechaInicio || null,
          fechafin: fechaFin || null,
          activo,
        })
        .eq('id', periodo.id)

      if (periodoError) {
        setError('Error al actualizar el periodo: ' + periodoError.message)
        setLoading(false)
        return
      }

      toast.success(`Periodo "${nombre}" actualizado exitosamente`)
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
            <h3 className="font-semibold text-gray-900">Editar Periodo</h3>
            <p className="text-sm text-gray-500">Actualiza el ciclo escolar</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del periodo *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: Agosto 2024 - Enero 2025"
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Activo */}
          <div className="bg-gray-50 rounded-lg p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Marcar como periodo activo</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Los demás periodos se desactivarán automáticamente.
            </p>
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
            disabled={loading || !nombre}
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

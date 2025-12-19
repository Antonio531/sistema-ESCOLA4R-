'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, BookOpen, Hash, Award, FileText, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface EditarAsignaturaModalProps {
  asignatura: {
    id: number
    nombre: string
    clave: string | null
    creditos: number | null
    descripcion: string | null
    activo: boolean
  }
  isOpen: boolean
  onClose: () => void
}

export default function EditarAsignaturaModal({ asignatura, isOpen, onClose }: EditarAsignaturaModalProps) {
  const [nombre, setNombre] = useState(asignatura.nombre)
  const [clave, setClave] = useState(asignatura.clave || '')
  const [creditos, setCreditos] = useState<number | ''>(asignatura.creditos || '')
  const [descripcion, setDescripcion] = useState(asignatura.descripcion || '')
  const [activo, setActivo] = useState(asignatura.activo)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    setNombre(asignatura.nombre)
    setClave(asignatura.clave || '')
    setCreditos(asignatura.creditos || '')
    setDescripcion(asignatura.descripcion || '')
    setActivo(asignatura.activo)
  }, [asignatura])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: asignaturaError } = await (supabase as any)
        .from('asignatura')
        .update({
          nombre,
          clave: clave || null,
          creditos: creditos || null,
          descripcion: descripcion || null,
          activo,
        })
        .eq('id', asignatura.id)

      if (asignaturaError) {
        setError('Error al actualizar la asignatura: ' + asignaturaError.message)
        setLoading(false)
        return
      }

      toast.success(`Asignatura "${nombre}" actualizada exitosamente`)
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
            <h3 className="font-semibold text-gray-900">Editar Asignatura</h3>
            <p className="text-sm text-gray-500">Actualiza la información de la asignatura</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: Matemáticas I, Español..."
              />
            </div>
          </div>

          {/* Clave y Créditos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clave</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={clave}
                  onChange={(e) => setClave(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                  placeholder="MAT101"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Créditos</label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={creditos}
                  onChange={(e) => setCreditos(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <div className="relative">
              <FileText className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Descripción de la asignatura..."
              />
            </div>
          </div>

          {/* Estado */}
          <div className="bg-gray-50 rounded-lg p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Asignatura activa</span>
            </label>
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

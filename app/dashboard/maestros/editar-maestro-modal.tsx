'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, User, Mail, Phone, BookOpen, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import Portal from '@/components/ui/portal'

interface EditarMaestroModalProps {
  maestro: {
    id: number
    nombre: string
    correo: string | null
    telefono: string | null
    especialidad: string | null
    activo: boolean
  }
  isOpen: boolean
  onClose: () => void
}

export default function EditarMaestroModal({ maestro, isOpen, onClose }: EditarMaestroModalProps) {
  const [nombre, setNombre] = useState(maestro.nombre)
  const [correo, setCorreo] = useState(maestro.correo || '')
  const [telefono, setTelefono] = useState(maestro.telefono || '')
  const [especialidad, setEspecialidad] = useState(maestro.especialidad || '')
  const [activo, setActivo] = useState(maestro.activo)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    setNombre(maestro.nombre)
    setCorreo(maestro.correo || '')
    setTelefono(maestro.telefono || '')
    setEspecialidad(maestro.especialidad || '')
    setActivo(maestro.activo)
  }, [maestro])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: maestroError } = await (supabase as any)
        .from('maestro')
        .update({
          nombre,
          correo: correo || null,
          telefono: telefono || null,
          especialidad: especialidad || null,
          activo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', maestro.id)

      if (maestroError) {
        setError('Error al actualizar el maestro: ' + maestroError.message)
        setLoading(false)
        return
      }

      toast.success(`Maestro "${nombre}" actualizado exitosamente`)
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
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h3 className="font-semibold text-gray-900">Editar Maestro</h3>
            <p className="text-sm text-gray-500">Actualiza la información del maestro</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: Juan Pérez García"
              />
            </div>
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="(000) 000-0000"
              />
            </div>
          </div>

          {/* Especialidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: Matemáticas, Física..."
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
              <span className="text-sm font-medium text-gray-700">Maestro activo</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Los maestros inactivos no podrán acceder al sistema
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2 sticky bottom-0 bg-white">
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
    </Portal>
  )
}

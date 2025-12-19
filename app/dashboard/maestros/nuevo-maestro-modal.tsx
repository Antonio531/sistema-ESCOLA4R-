'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, X, User, Mail, Phone, BookOpen, Lock, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import Portal from '@/components/ui/portal'

export default function NuevoMaestroModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [especialidad, setEspecialidad] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const resetForm = () => {
    setNombre('')
    setCorreo('')
    setTelefono('')
    setEspecialidad('')
    setPassword('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!correo) {
      setError('El correo es requerido para crear la cuenta del maestro')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      // Usar API route para crear usuario sin afectar sesión actual
      const response = await fetch('/api/usuarios/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: correo,
          password,
          nombre,
          rolNombre: 'maestro',
          datosExtra: {
            telefono: telefono || null,
            especialidad: especialidad || null,
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al crear el maestro')
        setLoading(false)
        return
      }

      setIsOpen(false)
      resetForm()
      toast.success(`Maestro "${nombre}" creado exitosamente`)
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
        <UserPlus className="w-5 h-5" />
        Nuevo Maestro
      </button>

      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Nuevo Maestro</h3>
                <p className="text-sm text-gray-500">Registra un nuevo maestro</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    placeholder="Nombre del maestro"
                  />
                </div>
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Mínimo 6 caracteres"
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
                    placeholder="10 dígitos"
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
                    placeholder="Ej: Matemáticas, Español..."
                  />
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
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !nombre || !correo || !password}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Registrar Maestro
              </button>
            </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

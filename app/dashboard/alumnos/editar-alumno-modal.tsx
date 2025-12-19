'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, User, Mail, Phone, MapPin, CreditCard, Calendar, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import Portal from '@/components/ui/portal'

interface EditarAlumnoModalProps {
  alumno: {
    id: number
    nombre: string
    curp: string | null
    fechanacimiento: string | null
    matricula: string | null
    correo: string | null
    telefono: string | null
    direccion: string | null
    activo: boolean
  }
  isOpen: boolean
  onClose: () => void
}

export default function EditarAlumnoModal({ alumno, isOpen, onClose }: EditarAlumnoModalProps) {
  const [nombre, setNombre] = useState(alumno.nombre)
  const [correo, setCorreo] = useState(alumno.correo || '')
  const [matricula, setMatricula] = useState(alumno.matricula || '')
  const [curp, setCurp] = useState(alumno.curp || '')
  const [fechaNacimiento, setFechaNacimiento] = useState(alumno.fechanacimiento || '')
  const [telefono, setTelefono] = useState(alumno.telefono || '')
  const [direccion, setDireccion] = useState(alumno.direccion || '')
  const [activo, setActivo] = useState(alumno.activo)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    setNombre(alumno.nombre)
    setCorreo(alumno.correo || '')
    setMatricula(alumno.matricula || '')
    setCurp(alumno.curp || '')
    setFechaNacimiento(alumno.fechanacimiento || '')
    setTelefono(alumno.telefono || '')
    setDireccion(alumno.direccion || '')
    setActivo(alumno.activo)
  }, [alumno])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: alumnoError } = await (supabase as any)
        .from('alumno')
        .update({
          nombre,
          correo: correo || null,
          matricula: matricula || null,
          curp: curp || null,
          fechanacimiento: fechaNacimiento || null,
          telefono: telefono || null,
          direccion: direccion || null,
          activo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', alumno.id)

      if (alumnoError) {
        setError('Error al actualizar el alumno: ' + alumnoError.message)
        setLoading(false)
        return
      }

      toast.success(`Alumno "${nombre}" actualizado exitosamente`)
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
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h3 className="font-semibold text-gray-900">Editar Alumno</h3>
            <p className="text-sm text-gray-500">Actualiza la información del alumno</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Información personal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ej: María González López"
                />
              </div>
            </div>

            {/* Matrícula */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                  placeholder="Ej: 2024001"
                />
              </div>
            </div>

            {/* CURP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CURP</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={curp}
                  onChange={(e) => setCurp(e.target.value.toUpperCase())}
                  maxLength={18}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                  placeholder="18 caracteres"
                />
              </div>
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Dirección */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  rows={2}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Calle, número, colonia, ciudad..."
                />
              </div>
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
              <span className="text-sm font-medium text-gray-700">Alumno activo</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Los alumnos inactivos no podrán acceder al sistema
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

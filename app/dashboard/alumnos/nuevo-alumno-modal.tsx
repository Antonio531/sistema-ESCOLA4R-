'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserPlus, X, User, Mail, Phone, MapPin, CreditCard, Calendar, Lock, Loader2, GraduationCap } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import Portal from '@/components/ui/portal'

export default function NuevoAlumnoModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [matricula, setMatricula] = useState('')
  const [curp, setCurp] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [grado, setGrado] = useState<number | ''>('')
  const [crearCuenta, setCrearCuenta] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient() // Solo para crear alumnos sin cuenta
  const toast = useToast()

  const resetForm = () => {
    setNombre('')
    setCorreo('')
    setMatricula('')
    setCurp('')
    setFechaNacimiento('')
    setTelefono('')
    setDireccion('')
    setGrado('')
    setCrearCuenta(false)
    setPassword('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Si se quiere crear cuenta, usar API route
      if (crearCuenta && correo && password) {
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres')
          setLoading(false)
          return
        }

        // Usar API route para crear usuario sin afectar sesión actual
        const response = await fetch('/api/usuarios/crear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: correo,
            password,
            nombre,
            rolNombre: 'alumno',
            datosExtra: {
              matricula: matricula || null,
              telefono: telefono || null,
              grado: grado || null,
            }
          })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Error al crear el alumno')
          setLoading(false)
          return
        }

        setIsOpen(false)
        resetForm()
        toast.success(`Alumno "${nombre}" creado exitosamente con cuenta de acceso`)
        router.refresh()
        return
      }

      // Si NO se crea cuenta, crear solo el alumno en la BD
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: alumnoError } = await (supabase as any)
        .from('alumno')
        .insert({
          nombre,
          correo: correo || null,
          matricula: matricula || null,
          curp: curp || null,
          fechanacimiento: fechaNacimiento || null,
          telefono: telefono || null,
          direccion: direccion || null,
          grado: grado || null,
          usuarioid: null,
          activo: true,
        })

      if (alumnoError) {
        setError('Error al crear el alumno: ' + alumnoError.message)
        setLoading(false)
        return
      }

      setIsOpen(false)
      resetForm()
      toast.success(`Alumno "${nombre}" registrado exitosamente`)
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
        Nuevo Alumno
      </button>

      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
              {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Nuevo Alumno</h3>
                <p className="text-sm text-gray-500">Registra un nuevo alumno en el sistema</p>
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
                    placeholder="Nombre del alumno"
                  />
                </div>
              </div>

              {/* Matrícula y CURP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Matrícula"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CURP</label>
                  <input
                    type="text"
                    value={curp}
                    onChange={(e) => setCurp(e.target.value.toUpperCase())}
                    maxLength={18}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                    placeholder="CURP"
                  />
                </div>
              </div>

              {/* Fecha nacimiento y Grado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              </div>

              {/* Correo y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
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
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Dirección del alumno"
                  />
                </div>
              </div>

              {/* Crear cuenta de acceso */}
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={crearCuenta}
                    onChange={(e) => setCrearCuenta(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Crear cuenta de acceso al sistema</span>
                </label>

                {crearCuenta && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3 space-y-3">
                    <p className="text-xs text-gray-600">
                      Se creará una cuenta para que el alumno pueda acceder al sistema.
                    </p>
                    {!correo && (
                      <p className="text-xs text-amber-600">Ingresa un correo electrónico primero.</p>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required={crearCuenta}
                          minLength={6}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                    </div>
                  </div>
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
                disabled={loading || !nombre}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Registrar Alumno
              </button>
            </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { GraduationCap, Mail, Lock, User, Loader2, ShieldCheck } from 'lucide-react'

interface ExistingUser {
  id: string
  email: string
}

export default function SetupForm() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [existingUser, setExistingUser] = useState<ExistingUser | null>(null)
  const [checkingUser, setCheckingUser] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Verificar si hay un usuario en auth sin registro en tabla usuario
  useEffect(() => {
    async function checkExistingUser() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Verificar si tiene registro en tabla usuario
        const { data: usuarioData } = await supabase
          .from('usuario')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (!usuarioData) {
          // Usuario en auth pero sin registro en tabla usuario
          setExistingUser({ id: user.id, email: user.email! })
          setEmail(user.email!)
        }
      }
      setCheckingUser(false)
    }
    checkExistingUser()
  }, [supabase])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones solo si es usuario nuevo
    if (!existingUser) {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden')
        return
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        return
      }
    }

    setLoading(true)

    try {
      let authUserId = existingUser?.id

      // Si no hay usuario existente, crear uno nuevo
      if (!existingUser) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nombre }
          }
        })

        if (authError) {
          if (authError.message.includes('already registered')) {
            setError('Este correo ya está registrado')
          } else {
            setError('Error al crear la cuenta: ' + authError.message)
          }
          setLoading(false)
          return
        }

        if (!authData.user) {
          setError('Error al crear el usuario')
          setLoading(false)
          return
        }

        authUserId = authData.user.id
      }

      // Obtener el ID del rol administrador
      const { data: rolAdmin } = await supabase
        .from('rol')
        .select('id')
        .eq('nombre', 'administrador')
        .single() as { data: { id: number } | null }

      if (!rolAdmin) {
        setError('Error: No se encontró el rol de administrador. Asegúrate de haber ejecutado el SQL.')
        setLoading(false)
        return
      }

      // Crear registro en tabla usuario
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: usuarioError } = await (supabase as any)
        .from('usuario')
        .insert({
          nombre: nombre,
          correo: existingUser?.email || email,
          rolid: rolAdmin.id,
          auth_id: authUserId,
          activo: true,
        })

      if (usuarioError) {
        setError('Error al crear el perfil de usuario: ' + usuarioError.message)
        setLoading(false)
        return
      }

      // Redirigir al dashboard
      router.push('/dashboard')
      router.refresh()

    } catch {
      setError('Ocurrió un error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración Inicial</h1>
          <p className="text-gray-600 mt-2">Crea la cuenta de administrador</p>
        </div>

        {/* Aviso */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Primera configuración</p>
              <p className="text-sm text-amber-700 mt-1">
                {existingUser
                  ? 'Completa tu registro como administrador del sistema.'
                  : 'Esta cuenta será el administrador principal del sistema. Esta página solo aparece una vez.'}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSetup} className="space-y-5">
            {/* Campo de nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Nombre del administrador"
                />
              </div>
            </div>

            {/* Campo de correo - deshabilitado si ya existe usuario */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!!existingUser}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="admin@escuela.com"
                />
              </div>
              {existingUser && (
                <p className="text-xs text-gray-500 mt-1">
                  Ya tienes una cuenta con este correo
                </p>
              )}
            </div>

            {/* Campos de contraseña - solo si es usuario nuevo */}
            {!existingUser && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Repite la contraseña"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  {existingUser ? 'Completando registro...' : 'Creando cuenta...'}
                </>
              ) : (
                existingUser ? 'Completar registro' : 'Crear cuenta de administrador'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Sistema de Gestión Escolar © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

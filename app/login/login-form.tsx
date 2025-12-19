'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, UserPlus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface LoginFormProps {
  showSetupButton: boolean
}

export default function LoginForm({ showSetupButton }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Ocurrió un error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#8B2323]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B2323]/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      </div>

      {/* Card de Login */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4 animate-fade-in-up">
              <Image
                src="/logo-tebaev.png"
                alt="TEBAEV Logo"
                width={180}
                height={80}
                className="h-20 w-auto"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              TELEEDUCA
            </h1>
            <p className="text-gray-500 mt-2 animate-fade-in-up opacity-0" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
              Sistema de Gestión Escolar - TEBAEV
            </p>
          </div>

          {/* Línea decorativa */}
          <div className="flex items-center gap-4 mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-sm text-gray-400">Iniciar sesión</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Campo de correo */}
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#8B2323] transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B2323] focus:border-[#8B2323] transition-all bg-white shadow-sm hover:border-gray-400"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#8B2323] transition-colors" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8B2323] focus:border-[#8B2323] transition-all bg-white shadow-sm hover:border-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-shake">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            {/* Botón de login */}
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-4 text-base font-semibold rounded-xl text-white bg-[#8B2323] hover:bg-[#722020] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B2323] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </div>
          </form>

          {/* Enlace a página principal */}
          <div className="mt-6 text-center animate-fade-in-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-[#8B2323] transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>

          {/* Botón de setup - solo si no hay admin */}
          {showSetupButton && (
            <div className="mt-4 animate-fade-in-up opacity-0" style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>
              <Link
                href="/setup"
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-xl text-[#8B2323] bg-[#8B2323]/10 hover:bg-[#8B2323]/20 border border-[#8B2323]/30 transition-all"
              >
                <UserPlus className="h-4 w-4" />
                Configurar primer administrador
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6 animate-fade-in-up opacity-0" style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}>
          TELEEDUCA © {new Date().getFullYear()}
          <br />
          <span className="text-gray-400">TEBAEV - Telebachillerato de Veracruz</span>
        </p>
      </div>
    </div>
  )
}

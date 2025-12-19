import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  ClipboardList,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  BarChart3
} from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  // Verificar si hay usuarios registrados en el sistema
  const { count: usuariosCount } = await supabase
    .from('usuario')
    .select('id', { count: 'exact', head: true })

  // Si no hay usuarios, redirigir a setup para crear el primer admin
  if (!usuariosCount || usuariosCount === 0) {
    redirect('/setup')
  }

  // Verificar si está logueado
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    redirect('/dashboard')
  }

  // Mostrar landing page para TEBAEV
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-tebaev.png"
                alt="TEBAEV Logo"
                width={60}
                height={60}
                className="object-contain"
              />
              <div className="hidden sm:block">
                <p className="text-lg font-bold text-gray-900">TEBAEV</p>
                <p className="text-xs text-gray-600">Telebachillerato de Veracruz</p>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B2323] text-white font-medium rounded-xl hover:bg-[#6B1A1A] transition-all shadow-lg hover:shadow-xl"
            >
              Iniciar Sesión
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#8B2323]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo grande */}
            <div className="flex justify-center mb-8 animate-fade-in">
              <Image
                src="/logo-tebaev.png"
                alt="TEBAEV Logo"
                width={180}
                height={180}
                className="object-contain"
              />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              TELEEDUCA
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#8B2323] mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Sistema de Gestión Escolar - TEBAEV
            </h2>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Plataforma integral para la administración de alumnos, maestros,
              calificaciones, asistencias y más.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#8B2323] text-white font-semibold rounded-2xl hover:bg-[#6B1A1A] transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Acceder al Sistema
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#caracteristicas"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-[#8B2323] hover:text-[#8B2323] transition-all"
              >
                Conocer más
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <p className="text-3xl font-bold text-[#8B2323]">100%</p>
              <p className="text-gray-600 mt-1">Seguro</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <p className="text-3xl font-bold text-[#8B2323]">24/7</p>
              <p className="text-gray-600 mt-1">Disponible</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <p className="text-3xl font-bold text-[#8B2323]">3</p>
              <p className="text-gray-600 mt-1">Roles de acceso</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <p className="text-3xl font-bold text-[#8B2323]">Fácil</p>
              <p className="text-gray-600 mt-1">De usar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades del Sistema
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas diseñadas para facilitar la gestión académica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-[#8B2323] rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestión de Usuarios</h3>
              <p className="text-gray-600">
                Administra alumnos, maestros y personal administrativo con control de acceso por roles.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-gray-700 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Grupos y Materias</h3>
              <p className="text-gray-600">
                Organiza los grupos escolares y asigna las materias del plan de estudios.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-[#8B2323] rounded-2xl flex items-center justify-center mb-6">
                <FileSpreadsheet className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Calificaciones</h3>
              <p className="text-gray-600">
                Captura y consulta calificaciones por parcial con promedios automáticos.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-gray-700 rounded-2xl flex items-center justify-center mb-6">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Asistencia</h3>
              <p className="text-gray-600">
                Control diario de asistencia con estadísticas y seguimiento por alumno.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-[#8B2323] rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Horarios</h3>
              <p className="text-gray-600">
                Consulta de horarios de clases organizados por día de la semana.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-gray-700 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Reportes</h3>
              <p className="text-gray-600">
                Genera reportes PDF de alumnos, maestros y grupos para impresión.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Acceso por Tipo de Usuario
            </h2>
            <p className="text-xl text-gray-600">
              Cada rol tiene acceso a las funciones que necesita
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Administrador */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-[#8B2323] card-hover">
              <div className="w-16 h-16 bg-[#8B2323] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Administrador</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#8B2323]" />
                  Gestión de usuarios
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#8B2323]" />
                  Control de grupos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#8B2323]" />
                  Asignación de materias
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#8B2323]" />
                  Generación de reportes
                </li>
              </ul>
            </div>

            {/* Maestro */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-300 card-hover">
              <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Maestro</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-700" />
                  Ver sus grupos asignados
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-700" />
                  Capturar calificaciones
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-700" />
                  Pasar lista de asistencia
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-700" />
                  Consultar horarios
                </li>
              </ul>
            </div>

            {/* Alumno */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-300 card-hover">
              <div className="w-16 h-16 bg-gray-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Alumno</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-500" />
                  Ver sus materias
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-500" />
                  Consultar calificaciones
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-500" />
                  Revisar asistencia
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-500" />
                  Ver horario de clases
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#8B2323]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para acceder?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Ingresa con tu cuenta institucional para comenzar.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-[#8B2323] font-semibold rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Iniciar Sesión
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-tebaev.png"
                alt="TEBAEV Logo"
                width={40}
                height={40}
                className="object-contain brightness-0 invert"
              />
              <div>
                <p className="text-white font-semibold">TEBAEV</p>
                <p className="text-gray-400 text-xs">Telebachillerato de Veracruz</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm text-center">
              © {new Date().getFullYear()} TELEEDUCA - TEBAEV
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

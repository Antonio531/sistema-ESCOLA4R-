import { createClient } from '@/lib/supabase/server'
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  ClipboardList,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  Target
} from 'lucide-react'
import Link from 'next/link'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  gradient: string
  delay: number
  trend?: string
  trendUp?: boolean
}

function StatCard({ title, value, icon: Icon, gradient, delay, trend, trendUp }: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 card-hover animate-fade-in-up opacity-0`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Background decoration */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${gradient} opacity-10 blur-2xl`}></div>

      <div className="relative flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-4xl font-bold text-gray-900 counter">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-gray-500'}`}>
              {trendUp && <TrendingUp className="w-3 h-3" />}
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${gradient} shadow-lg`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
    </div>
  )
}

interface QuickActionProps {
  href: string
  icon: React.ElementType
  title: string
  description: string
  delay: number
}

function QuickAction({ href, icon: Icon, title, description, delay }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 card-hover animate-fade-in-up opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#8B2323]/5 to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0 p-3 rounded-xl bg-[#8B2323] shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-[#8B2323] transition-colors">{title}</h3>
          <p className="text-sm text-gray-500 truncate">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#8B2323] group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  )
}

function WelcomeHeader({ userName, role }: { userName: string; role: string }) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const getRoleTitle = () => {
    switch (role) {
      case 'administrador': return 'Panel de Administración'
      case 'maestro': return 'Panel de Maestro'
      default: return 'Mi Panel de Estudiante'
    }
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#8B2323] via-[#6B1A1A] to-[#8B2323] rounded-3xl p-8 mb-8 shadow-xl animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
      <div className="absolute top-1/2 right-1/4 animate-float">
        <Sparkles className="w-8 h-8 text-white/30" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
          <Sparkles className="w-4 h-4" />
          <span>{getRoleTitle()}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {getGreeting()}, <span className="text-gray-200">{userName}</span>
        </h1>
        <p className="text-white/80 max-w-xl">
          {role === 'administrador' && 'Gestiona todos los aspectos del sistema escolar desde aquí.'}
          {role === 'maestro' && 'Administra tus grupos, calificaciones y asistencias.'}
          {role === 'alumno' && 'Revisa tus materias, calificaciones y horarios.'}
        </p>
      </div>
    </div>
  )
}

function ProgressRing({ percentage, label, color }: { percentage: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className={color}
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-out'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-600">{label}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  const { data: usuario } = await supabase
    .from('usuario')
    .select('id, nombre, rol:rol(nombre)')
    .eq('auth_id', session?.user?.id || '')
    .single() as { data: { id: number; nombre: string; rol: { nombre: string } | null } | null }

  const userRole = usuario?.rol?.nombre || 'alumno'
  const userName = usuario?.nombre || 'Usuario'
  const usuarioId = usuario?.id

  // Dashboard para Administrador
  if (userRole === 'administrador') {
    const { data: alumnosData } = await supabase.from('alumno').select('id, activo') as { data: { id: number; activo: boolean }[] | null }
    const { data: maestrosData } = await supabase.from('maestro').select('id, activo') as { data: { id: number; activo: boolean }[] | null }
    const { data: gruposData } = await supabase.from('grupo').select('id') as { data: { id: number }[] | null }
    const { data: asignaturasData } = await supabase.from('asignatura').select('id, activo') as { data: { id: number; activo: boolean }[] | null }
    const { data: periodosData } = await supabase.from('periodo').select('id, activo') as { data: { id: number; activo: boolean }[] | null }

    const alumnosActivos = alumnosData?.filter(a => a.activo).length || 0
    const maestrosActivos = maestrosData?.filter(m => m.activo).length || 0
    const periodoActivo = periodosData?.find(p => p.activo)

    return (
      <div className="space-y-8">
        <WelcomeHeader userName={userName} role={userRole} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Alumnos"
            value={alumnosData?.length || 0}
            icon={GraduationCap}
            gradient="bg-[#8B2323]"
            delay={100}
            trend={`${alumnosActivos} activos`}
            trendUp={true}
          />
          <StatCard
            title="Total Maestros"
            value={maestrosData?.length || 0}
            icon={Users}
            gradient="bg-gray-700"
            delay={200}
            trend={`${maestrosActivos} activos`}
            trendUp={true}
          />
          <StatCard
            title="Grupos Activos"
            value={gruposData?.length || 0}
            icon={BookOpen}
            gradient="bg-[#8B2323]"
            delay={300}
          />
          <StatCard
            title="Asignaturas"
            value={asignaturasData?.length || 0}
            icon={Calendar}
            gradient="bg-gray-700"
            delay={400}
          />
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Acciones Rápidas</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Target className="w-4 h-4" />
              <span>Gestiona tu escuela</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickAction
              href="/dashboard/alumnos"
              icon={GraduationCap}
              title="Gestionar Alumnos"
              description="Agregar, editar y administrar estudiantes"
              delay={600}
            />
            <QuickAction
              href="/dashboard/maestros"
              icon={Users}
              title="Gestionar Maestros"
              description="Administrar el personal docente"
              delay={700}
            />
            <QuickAction
              href="/dashboard/grupos"
              icon={BookOpen}
              title="Gestionar Grupos"
              description="Organizar grupos y asignar materias"
              delay={800}
            />
            <QuickAction
              href="/dashboard/periodos"
              icon={Calendar}
              title="Gestionar Periodos"
              description="Configurar periodos escolares"
              delay={900}
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up opacity-0" style={{ animationDelay: '1000ms', animationFillMode: 'forwards' }}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#8B2323]/10">
                <Award className="w-5 h-5 text-[#8B2323]" />
              </div>
              <h3 className="font-semibold text-gray-900">Periodo Activo</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {periodoActivo ? 'Configurado' : 'Sin periodo activo'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {periodoActivo ? 'El sistema está funcionando correctamente' : 'Configura un periodo para comenzar'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gray-100">
                <TrendingUp className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900">Estado del Sistema</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#8B2323] animate-pulse-soft"></div>
              <p className="text-lg font-semibold text-[#8B2323]">Operativo</p>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Todos los servicios funcionando correctamente
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard para Maestro
  if (userRole === 'maestro') {
    const { data: maestroData } = await supabase
      .from('maestro')
      .select('id')
      .eq('usuarioid', usuarioId || 0)
      .single() as { data: { id: number } | null }

    const maestroId = maestroData?.id
    let gruposCount = 0
    let alumnosCount = 0

    if (maestroId) {
      const { count: grupos } = await supabase
        .from('grupoasignatura')
        .select('id', { count: 'exact', head: true })
        .eq('maestroid', maestroId)

      gruposCount = grupos || 0

      const { data: gruposAsignados } = await supabase
        .from('grupoasignatura')
        .select('grupoid')
        .eq('maestroid', maestroId) as { data: { grupoid: number }[] | null }

      if (gruposAsignados && gruposAsignados.length > 0) {
        const grupoIds = gruposAsignados.map(g => g.grupoid)
        const { count: alumnos } = await supabase
          .from('grupoalumno')
          .select('alumnoid', { count: 'exact', head: true })
          .in('grupoid', grupoIds)
        alumnosCount = alumnos || 0
      }
    }

    return (
      <div className="space-y-8">
        <WelcomeHeader userName={userName} role={userRole} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Mis Grupos"
            value={gruposCount}
            icon={BookOpen}
            gradient="bg-[#8B2323]"
            delay={100}
          />
          <StatCard
            title="Mis Alumnos"
            value={alumnosCount}
            icon={GraduationCap}
            gradient="bg-gray-700"
            delay={200}
          />
          <StatCard
            title="Calificaciones"
            value="Capturar"
            icon={FileSpreadsheet}
            gradient="bg-[#8B2323]"
            delay={300}
          />
          <StatCard
            title="Asistencias"
            value="Registrar"
            icon={ClipboardList}
            gradient="bg-gray-700"
            delay={400}
          />
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickAction
              href="/dashboard/mis-grupos"
              icon={BookOpen}
              title="Ver Mis Grupos"
              description="Consulta los grupos asignados"
              delay={600}
            />
            <QuickAction
              href="/dashboard/calificaciones"
              icon={FileSpreadsheet}
              title="Capturar Calificaciones"
              description="Registra las calificaciones de tus alumnos"
              delay={700}
            />
            <QuickAction
              href="/dashboard/asistencia"
              icon={ClipboardList}
              title="Pasar Asistencia"
              description="Registra la asistencia diaria"
              delay={800}
            />
            <QuickAction
              href="/dashboard/horario"
              icon={Clock}
              title="Ver Horario"
              description="Consulta tu horario de clases"
              delay={900}
            />
          </div>
        </div>
      </div>
    )
  }

  // Dashboard para Alumno
  const { data: alumnoData } = await supabase
    .from('alumno')
    .select('id')
    .eq('usuarioid', usuarioId || 0)
    .single() as { data: { id: number } | null }

  const alumnoId = alumnoData?.id
  let materiasCount = 0
  let promedioGeneral = 0
  let asistenciaPercent = 0

  if (alumnoId) {
    const { data: inscripciones } = await supabase
      .from('grupoalumno')
      .select('grupoid')
      .eq('alumnoid', alumnoId) as { data: { grupoid: number }[] | null }

    if (inscripciones && inscripciones.length > 0) {
      const grupoIds = inscripciones.map(i => i.grupoid)
      const { count: materias } = await supabase
        .from('grupoasignatura')
        .select('id', { count: 'exact', head: true })
        .in('grupoid', grupoIds)
      materiasCount = materias || 0
    }

    // Calcular promedio
    const { data: calificaciones } = await supabase
      .from('calificacion')
      .select('calificacion')
      .eq('alumnoid', alumnoId) as { data: { calificacion: number | null }[] | null }

    if (calificaciones && calificaciones.length > 0) {
      const suma = calificaciones.reduce((acc, c) => acc + (c.calificacion || 0), 0)
      promedioGeneral = suma / calificaciones.length
    }

    // Calcular asistencia
    const { data: asistencias } = await supabase
      .from('asistencia')
      .select('presente')
      .eq('alumnoid', alumnoId) as { data: { presente: boolean }[] | null }

    if (asistencias && asistencias.length > 0) {
      const presentes = asistencias.filter(a => a.presente).length
      asistenciaPercent = Math.round((presentes / asistencias.length) * 100)
    }
  }

  return (
    <div className="space-y-8">
      <WelcomeHeader userName={userName} role={userRole} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Mis Materias"
          value={materiasCount}
          icon={BookOpen}
          gradient="bg-[#8B2323]"
          delay={100}
        />
        <StatCard
          title="Promedio General"
          value={promedioGeneral > 0 ? promedioGeneral.toFixed(1) : '-'}
          icon={TrendingUp}
          gradient="bg-gray-700"
          delay={200}
          trend={promedioGeneral >= 8 ? 'Excelente' : promedioGeneral >= 7 ? 'Bueno' : undefined}
          trendUp={promedioGeneral >= 7}
        />
        <StatCard
          title="Asistencia"
          value={`${asistenciaPercent}%`}
          icon={ClipboardList}
          gradient="bg-[#8B2323]"
          delay={300}
        />
        <StatCard
          title="Clases Hoy"
          value="-"
          icon={Clock}
          gradient="bg-gray-700"
          delay={400}
        />
      </div>

      {/* Progress Section for Student */}
      {promedioGeneral > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-fade-in-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Mi Progreso</h2>
          <div className="flex flex-wrap justify-center gap-12">
            <ProgressRing
              percentage={Math.round(promedioGeneral * 10)}
              label="Promedio"
              color="text-[#8B2323]"
            />
            <ProgressRing
              percentage={asistenciaPercent}
              label="Asistencia"
              color="text-gray-700"
            />
            <ProgressRing
              percentage={Math.round((materiasCount / 8) * 100)}
              label="Materias"
              color="text-[#8B2323]"
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            href="/dashboard/mis-materias"
            icon={BookOpen}
            title="Ver Materias"
            description="Consulta tus materias inscritas"
            delay={700}
          />
          <QuickAction
            href="/dashboard/mis-calificaciones"
            icon={FileSpreadsheet}
            title="Ver Calificaciones"
            description="Revisa tus calificaciones por materia"
            delay={800}
          />
          <QuickAction
            href="/dashboard/mi-asistencia"
            icon={ClipboardList}
            title="Ver Asistencia"
            description="Consulta tu historial de asistencias"
            delay={900}
          />
          <QuickAction
            href="/dashboard/mi-horario"
            icon={Clock}
            title="Ver Horario"
            description="Consulta tu horario semanal"
            delay={1000}
          />
        </div>
      </div>
    </div>
  )
}

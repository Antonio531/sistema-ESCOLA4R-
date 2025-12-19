'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthUser } from '@/lib/auth'
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  Calendar,
  ClipboardList,
  FileSpreadsheet,
  Settings,
  Clock,
  FolderOpen,
} from 'lucide-react'

interface SidebarProps {
  user: AuthUser
}

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  roles: string[]
}

const navigation: NavItem[] = [
  // Todos los roles
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['administrador', 'maestro', 'alumno'] },

  // Solo administrador
  { name: 'Usuarios', href: '/dashboard/usuarios', icon: UserCog, roles: ['administrador'] },
  { name: 'Maestros', href: '/dashboard/maestros', icon: Users, roles: ['administrador'] },
  { name: 'Alumnos', href: '/dashboard/alumnos', icon: Users, roles: ['administrador'] },
  { name: 'Grupos', href: '/dashboard/grupos', icon: FolderOpen, roles: ['administrador'] },
  { name: 'Asignaturas', href: '/dashboard/asignaturas', icon: BookOpen, roles: ['administrador'] },
  { name: 'Periodos', href: '/dashboard/periodos', icon: Calendar, roles: ['administrador'] },

  // Maestros
  { name: 'Mis Grupos', href: '/dashboard/mis-grupos', icon: FolderOpen, roles: ['maestro'] },
  { name: 'Calificaciones', href: '/dashboard/calificaciones', icon: FileSpreadsheet, roles: ['maestro'] },
  { name: 'Asistencia', href: '/dashboard/asistencia', icon: ClipboardList, roles: ['maestro'] },
  { name: 'Horario', href: '/dashboard/horario', icon: Clock, roles: ['maestro'] },

  // Alumnos
  { name: 'Mis Materias', href: '/dashboard/mis-materias', icon: BookOpen, roles: ['alumno'] },
  { name: 'Mis Calificaciones', href: '/dashboard/mis-calificaciones', icon: FileSpreadsheet, roles: ['alumno'] },
  { name: 'Mi Asistencia', href: '/dashboard/mi-asistencia', icon: ClipboardList, roles: ['alumno'] },
  { name: 'Mi Horario', href: '/dashboard/mi-horario', icon: Clock, roles: ['alumno'] },

  // Configuración para todos
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings, roles: ['administrador', 'maestro', 'alumno'] },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.rol)
  )

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#8B2323] px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2">
          <GraduationCap className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">TELEEDUCA</span>
        </div>

        {/* Navegación */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {filteredNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors
                          ${isActive
                            ? 'bg-[#6B1A1A] text-white'
                            : 'text-white/70 hover:text-white hover:bg-[#6B1A1A]'
                          }
                        `}
                      >
                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>

            {/* Info del usuario */}
            <li className="mt-auto">
              <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-medium text-white/70">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6B1A1A]">
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-white">{user.nombre}</p>
                  <p className="truncate text-xs text-white/60 capitalize">{user.rol}</p>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

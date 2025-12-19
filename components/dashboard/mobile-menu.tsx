'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthUser } from '@/lib/auth'
import { X, GraduationCap, LayoutDashboard, Users, UserCog, BookOpen, Calendar, ClipboardList, FileSpreadsheet, Settings, Clock, FolderOpen } from 'lucide-react'

interface MobileMenuProps {
  user: AuthUser
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  roles: string[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['administrador', 'maestro', 'alumno'] },
  { name: 'Usuarios', href: '/dashboard/usuarios', icon: UserCog, roles: ['administrador'] },
  { name: 'Maestros', href: '/dashboard/maestros', icon: Users, roles: ['administrador'] },
  { name: 'Alumnos', href: '/dashboard/alumnos', icon: Users, roles: ['administrador'] },
  { name: 'Grupos', href: '/dashboard/grupos', icon: FolderOpen, roles: ['administrador'] },
  { name: 'Asignaturas', href: '/dashboard/asignaturas', icon: BookOpen, roles: ['administrador'] },
  { name: 'Periodos', href: '/dashboard/periodos', icon: Calendar, roles: ['administrador'] },
  { name: 'Mis Grupos', href: '/dashboard/mis-grupos', icon: FolderOpen, roles: ['maestro'] },
  { name: 'Calificaciones', href: '/dashboard/calificaciones', icon: FileSpreadsheet, roles: ['maestro'] },
  { name: 'Asistencia', href: '/dashboard/asistencia', icon: ClipboardList, roles: ['maestro'] },
  { name: 'Horario', href: '/dashboard/horario', icon: Clock, roles: ['maestro'] },
  { name: 'Mis Materias', href: '/dashboard/mis-materias', icon: BookOpen, roles: ['alumno'] },
  { name: 'Mis Calificaciones', href: '/dashboard/mis-calificaciones', icon: FileSpreadsheet, roles: ['alumno'] },
  { name: 'Mi Asistencia', href: '/dashboard/mi-asistencia', icon: ClipboardList, roles: ['alumno'] },
  { name: 'Mi Horario', href: '/dashboard/mi-horario', icon: Clock, roles: ['alumno'] },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings, roles: ['administrador', 'maestro', 'alumno'] },
]

export function MobileMenu({ user, isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const filteredNavigation = navigation.filter((item) => item.roles.includes(user.rol))

  if (!isOpen) return null

  return (
    <div className="relative z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-900/80 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 flex">
        <div className="relative mr-16 flex w-full max-w-xs flex-1">
          {/* Botón cerrar */}
          <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
            <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Sidebar móvil */}
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
                            onClick={onClose}
                            className={`
                              group flex gap-x-3 rounded-md p-3 text-sm font-medium leading-6 transition-colors
                              ${isActive
                                ? 'bg-[#6B1A1A] text-white'
                                : 'text-white/70 hover:text-white hover:bg-[#6B1A1A]'
                              }
                            `}
                          >
                            <item.icon className="h-6 w-6 shrink-0" />
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6B1A1A] text-white font-bold">
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
      </div>
    </div>
  )
}

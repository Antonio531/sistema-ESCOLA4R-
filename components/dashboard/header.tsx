'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { AuthUser } from '@/lib/auth'
import { Menu, LogOut, User, Bell } from 'lucide-react'
import { MobileMenu } from './mobile-menu'

interface HeaderProps {
  user: AuthUser
}

export function Header({ user }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Cerrar el menú cuando cambia la ruta (al navegar a otra página)
  useEffect(() => {
    setShowMenu(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Menú móvil */}
      <MobileMenu user={user} isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Botón menú móvil */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separador */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Espacio para búsqueda si se necesita */}
        <div className="flex-1" />

        {/* Acciones del header */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notificaciones */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
          >
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separador */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Menú de usuario */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-x-3 text-sm font-medium text-gray-900"
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B2323] text-white">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:block">{user.nombre}</span>
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <>
                {/* Overlay para cerrar al hacer clic fuera */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-[#8B2323] capitalize mt-1">{user.rol}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      router.push('/dashboard/configuracion')
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4" />
                    Mi perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

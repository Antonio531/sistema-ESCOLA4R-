'use client'

import { useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/toast'

interface WelcomeToastProps {
  nombre: string
  rol: string
}

export function WelcomeToast({ nombre, rol }: WelcomeToastProps) {
  const toast = useToast()
  const hasShown = useRef(false)

  useEffect(() => {
    // Solo mostrar una vez por sesión
    const welcomeKey = `welcome_shown_${rol}`
    const alreadyShown = sessionStorage.getItem(welcomeKey)

    if (!alreadyShown && !hasShown.current) {
      hasShown.current = true

      // Pequeño delay para que se vea mejor
      const timer = setTimeout(() => {
        let rolLabel = ''
        switch (rol) {
          case 'administrador':
            rolLabel = 'Administrador'
            break
          case 'maestro':
            rolLabel = 'Maestro'
            break
          case 'alumno':
            rolLabel = 'Estudiante'
            break
          default:
            rolLabel = ''
        }

        toast.success(`Bienvenido ${rolLabel}, ${nombre}`)
        sessionStorage.setItem(welcomeKey, 'true')
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [nombre, rol, toast])

  return null
}

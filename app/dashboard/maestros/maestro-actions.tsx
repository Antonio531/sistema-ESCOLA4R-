'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import EditarMaestroModal from './editar-maestro-modal'
import Portal from '@/components/ui/portal'

interface MaestroActionsProps {
  maestro: {
    id: number
    nombre: string
    correo: string | null
    telefono: string | null
    especialidad: string | null
    activo: boolean
  }
}

export default function MaestroActions({ maestro }: MaestroActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 192, // 192px = w-48
      })
    }
  }, [isOpen])

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar al maestro "${maestro.nombre}"? Esta acción no se puede deshacer.`)) {
      return
    }

    setIsDeleting(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('maestro')
        .delete()
        .eq('id', maestro.id)

      if (error) {
        toast.error('Error al eliminar el maestro: ' + error.message)
        return
      }

      toast.success(`Maestro "${maestro.nombre}" eliminado exitosamente`)
      setIsOpen(false)
      router.refresh()
    } catch {
      toast.error('Ocurrió un error inesperado')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>

        {isOpen && (
          <Portal>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="fixed z-[9999] w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
              style={{ top: menuPosition.top, left: menuPosition.left }}
            >
              <button
                onClick={() => {
                  setIsOpen(false)
                  setIsEditOpen(true)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Eliminar
              </button>
            </div>
          </Portal>
        )}
      </div>

      {isEditOpen && (
        <EditarMaestroModal
          maestro={maestro}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  )
}

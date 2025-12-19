'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import EditarGrupoModal from './editar-grupo-modal'

interface GrupoActionsProps {
  grupo: {
    id: number
    nombre: string
    periodoid: number
    grado: number | null
    turno: string | null
  }
  periodos: Array<{ id: number; nombre: string }>
}

export default function GrupoActions({ grupo, periodos }: GrupoActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar el grupo "${grupo.nombre}"? Esta acción no se puede deshacer.`)) {
      return
    }

    setIsDeleting(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('grupo')
        .delete()
        .eq('id', grupo.id)

      if (error) {
        toast.error('Error al eliminar el grupo: ' + error.message)
        return
      }

      toast.success(`Grupo "${grupo.nombre}" eliminado exitosamente`)
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
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
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
          </>
        )}
      </div>

      {isEditOpen && (
        <EditarGrupoModal
          grupo={grupo}
          periodos={periodos}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  )
}

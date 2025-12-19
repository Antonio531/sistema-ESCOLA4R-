'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserPlus, X, Loader2, Search } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Alumno {
  id: number
  nombre: string
  matricula: string | null
  grado: number | null
}

interface Props {
  grupoId: number
  alumnosDisponibles: Alumno[]
}

export default function AsignarAlumnoModal({ grupoId, alumnosDisponibles }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedAlumnos, setSelectedAlumnos] = useState<number[]>([])
  const [selectedGrado, setSelectedGrado] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  // Obtener grados únicos disponibles
  const gradosDisponibles = [...new Set(alumnosDisponibles.map(a => a.grado).filter(g => g !== null))] as number[]

  const filteredAlumnos = alumnosDisponibles.filter(a => {
    const matchesSearch = a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (a.matricula?.toLowerCase().includes(search.toLowerCase()))
    const matchesGrado = selectedGrado === '' || a.grado === selectedGrado
    return matchesSearch && matchesGrado
  })

  // Seleccionar todos los alumnos del grado filtrado
  const selectAllByGrado = () => {
    const alumnosDelGrado = filteredAlumnos.map(a => a.id)
    setSelectedAlumnos(prev => {
      const newSelection = [...prev]
      alumnosDelGrado.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id)
        }
      })
      return newSelection
    })
  }

  // Deseleccionar todos
  const deselectAll = () => {
    setSelectedAlumnos([])
  }

  const toggleAlumno = (id: number) => {
    setSelectedAlumnos(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleAsignar = async () => {
    if (selectedAlumnos.length === 0) return

    setLoading(true)
    try {
      const inserts = selectedAlumnos.map(alumnoid => ({
        grupoid: grupoId,
        alumnoid,
        activo: true,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('grupoalumno')
        .insert(inserts)

      if (error) {
        console.error('Error al asignar alumnos:', error)
        return
      }

      const count = selectedAlumnos.length
      setIsOpen(false)
      setSelectedAlumnos([])
      toast.success(`${count} alumno${count > 1 ? 's' : ''} asignado${count > 1 ? 's' : ''} al grupo exitosamente`)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        Agregar
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Agregar Alumnos al Grupo</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar alumno..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Filtro por grado */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedGrado}
                  onChange={(e) => setSelectedGrado(e.target.value ? Number(e.target.value) : '')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Todos los grados</option>
                  {gradosDisponibles.sort().map(g => (
                    <option key={g} value={g}>{g}° Grado</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={selectAllByGrado}
                  className="px-3 py-2 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors whitespace-nowrap"
                >
                  Seleccionar todos
                </button>
                {selectedAlumnos.length > 0 && (
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Lista de alumnos */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredAlumnos.length > 0 ? (
                filteredAlumnos.map((alumno) => (
                  <label
                    key={alumno.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAlumnos.includes(alumno.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAlumnos.includes(alumno.id)}
                      onChange={() => toggleAlumno(alumno.id)}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alumno.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {alumno.matricula || 'Sin matrícula'}
                        {alumno.grado && <span className="ml-2">• {alumno.grado}° Grado</span>}
                      </p>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {alumnosDisponibles.length === 0
                    ? 'Todos los alumnos ya están asignados'
                    : 'No se encontraron alumnos'}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {selectedAlumnos.length} seleccionados
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAsignar}
                  disabled={loading || selectedAlumnos.length === 0}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

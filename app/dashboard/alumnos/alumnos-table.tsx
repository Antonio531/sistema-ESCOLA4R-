'use client'

import { useState, useCallback } from 'react'
import { GraduationCap, Mail, Phone } from 'lucide-react'
import { SearchInput } from '@/components/ui/search-input'
import AlumnoActions from './alumno-actions'

interface Alumno {
  id: number
  nombre: string
  matricula: string | null
  correo: string | null
  telefono: string | null
  curp: string | null
  fechanacimiento: string | null
  direccion: string | null
  activo: boolean
  created_at: string
}

interface AlumnosTableProps {
  alumnos: Alumno[]
}

export default function AlumnosTable({ alumnos }: AlumnosTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase())
  }, [])

  const filteredAlumnos = alumnos.filter((alumno) => {
    if (!searchQuery) return true
    return (
      alumno.nombre.toLowerCase().includes(searchQuery) ||
      alumno.matricula?.toLowerCase().includes(searchQuery) ||
      alumno.correo?.toLowerCase().includes(searchQuery)
    )
  })

  return (
    <>
      {/* Barra de búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
        <SearchInput
          placeholder="Buscar alumnos por nombre, matrícula o correo..."
          onSearch={handleSearch}
        />
      </div>

      {/* Tabla de alumnos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Alumno</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Matrícula</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Contacto</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Estado</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAlumnos.length > 0 ? (
                filteredAlumnos.map((alumno) => (
                  <tr
                    key={alumno.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{alumno.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                        {alumno.matricula || 'Sin matrícula'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {alumno.correo && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {alumno.correo}
                          </div>
                        )}
                        {alumno.telefono && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {alumno.telefono}
                          </div>
                        )}
                        {!alumno.correo && !alumno.telefono && (
                          <span className="text-sm text-gray-400">Sin contacto</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        alumno.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {alumno.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <AlumnoActions alumno={alumno} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    {searchQuery ? (
                      <>
                        <p>No se encontraron alumnos</p>
                        <p className="text-sm mt-2">Intenta con otro término de búsqueda</p>
                      </>
                    ) : (
                      <>
                        <p>No hay alumnos registrados</p>
                        <p className="text-sm mt-2">Usa el botón &quot;Nuevo Alumno&quot; para agregar el primero</p>
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con conteo */}
        {filteredAlumnos.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-medium">{filteredAlumnos.length}</span> de <span className="font-medium">{alumnos.length}</span> alumnos
            </p>
          </div>
        )}
      </div>
    </>
  )
}

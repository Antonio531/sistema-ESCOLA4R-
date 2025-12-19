'use client'

import { useState, useCallback } from 'react'
import { Users, Mail, Phone, BookOpen } from 'lucide-react'
import { SearchInput } from '@/components/ui/search-input'
import MaestroActions from './maestro-actions'

interface Maestro {
  id: number
  nombre: string
  correo: string | null
  telefono: string | null
  especialidad: string | null
  activo: boolean
  created_at: string
}

interface MaestrosTableProps {
  maestros: Maestro[]
}

export default function MaestrosTable({ maestros }: MaestrosTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase())
  }, [])

  const filteredMaestros = maestros.filter((maestro) => {
    if (!searchQuery) return true
    return (
      maestro.nombre.toLowerCase().includes(searchQuery) ||
      maestro.especialidad?.toLowerCase().includes(searchQuery) ||
      maestro.correo?.toLowerCase().includes(searchQuery)
    )
  })

  return (
    <>
      {/* Barra de búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
        <SearchInput
          placeholder="Buscar maestros por nombre, especialidad o correo..."
          onSearch={handleSearch}
        />
      </div>

      {/* Tabla de maestros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Maestro</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Especialidad</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Contacto</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Estado</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMaestros.length > 0 ? (
                filteredMaestros.map((maestro) => (
                  <tr
                    key={maestro.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{maestro.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {maestro.especialidad ? (
                        <span className="inline-flex items-center gap-1.5 text-gray-600 bg-indigo-50 px-3 py-1 rounded-full text-sm">
                          <BookOpen className="w-4 h-4 text-indigo-500" />
                          {maestro.especialidad}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Sin especialidad</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {maestro.correo && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {maestro.correo}
                          </div>
                        )}
                        {maestro.telefono && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {maestro.telefono}
                          </div>
                        )}
                        {!maestro.correo && !maestro.telefono && (
                          <span className="text-sm text-gray-400">Sin contacto</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        maestro.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {maestro.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <MaestroActions maestro={maestro} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    {searchQuery ? (
                      <>
                        <p>No se encontraron maestros</p>
                        <p className="text-sm mt-2">Intenta con otro término de búsqueda</p>
                      </>
                    ) : (
                      <>
                        <p>No hay maestros registrados</p>
                        <p className="text-sm mt-2">Usa el botón &quot;Nuevo Maestro&quot; para agregar el primero</p>
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con conteo */}
        {filteredMaestros.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-medium">{filteredMaestros.length}</span> de <span className="font-medium">{maestros.length}</span> maestros
            </p>
          </div>
        )}
      </div>
    </>
  )
}

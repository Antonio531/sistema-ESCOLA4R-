import { createClient } from '@/lib/supabase/server'
import { Search, MoreVertical, Shield, GraduationCap, Users, Info } from 'lucide-react'
import Link from 'next/link'
import NuevoAdminModal from './nuevo-admin-modal'

export default async function UsuariosPage() {
  const supabase = await createClient()

  // Obtener todos los usuarios con sus roles
  const { data: usuarios } = await supabase
    .from('usuario')
    .select(`
      id,
      nombre,
      correo,
      activo,
      created_at,
      rol:rol(id, nombre)
    `)
    .order('created_at', { ascending: false }) as { data: Array<{
      id: number
      nombre: string
      correo: string
      activo: boolean
      created_at: string
      rol: { id: number; nombre: string } | null
    }> | null }

  // Contar por rol
  const admins = usuarios?.filter(u => u.rol?.nombre === 'administrador').length || 0
  const maestros = usuarios?.filter(u => u.rol?.nombre === 'maestro').length || 0
  const alumnos = usuarios?.filter(u => u.rol?.nombre === 'alumno').length || 0

  const getRolIcon = (rolNombre: string) => {
    switch (rolNombre) {
      case 'administrador':
        return <Shield className="w-4 h-4 text-red-500" />
      case 'maestro':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'alumno':
        return <GraduationCap className="w-4 h-4 text-green-500" />
      default:
        return null
    }
  }

  const getRolBadgeColor = (rolNombre: string) => {
    switch (rolNombre) {
      case 'administrador':
        return 'bg-red-100 text-red-800'
      case 'maestro':
        return 'bg-blue-100 text-blue-800'
      case 'alumno':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h1>
          <p className="text-gray-600 mt-1">Vista general de todas las cuentas con acceso</p>
        </div>
        <NuevoAdminModal />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{admins}</p>
            <p className="text-sm text-gray-500">Administradores</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{maestros}</p>
            <p className="text-sm text-gray-500">Maestros</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{alumnos}</p>
            <p className="text-sm text-gray-500">Alumnos</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm">
            Para crear maestros ve a <Link href="/dashboard/maestros/nuevo" className="font-medium underline">Maestros</Link>.
            Para crear alumnos ve a <Link href="/dashboard/alumnos/nuevo" className="font-medium underline">Alumnos</Link>.
            Desde aquí solo puedes crear administradores adicionales.
          </p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Usuario</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Correo</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Rol</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Estado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Fecha</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios && usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {usuario.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{usuario.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{usuario.correo}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRolBadgeColor(usuario.rol?.nombre || '')}`}>
                        {getRolIcon(usuario.rol?.nombre || '')}
                        <span className="capitalize">{usuario.rol?.nombre || 'Sin rol'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        usuario.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(usuario.created_at).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings, User, Mail, Shield, Key } from 'lucide-react'
import ConfiguracionClient from './configuracion-client'

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  // Obtener el usuario
  const { data: usuario } = await supabase
    .from('usuario')
    .select('id, nombre, correo, rolid, rol:rol(nombre)')
    .eq('auth_id', session.user.id)
    .single() as { data: { id: number; nombre: string; correo: string; rolid: number; rol: { nombre: string } } | null }

  if (!usuario) redirect('/login')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">Administra tu cuenta y preferencias</p>
      </div>

      {/* Info de la cuenta */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Información de la cuenta</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Avatar y nombre */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {usuario.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{usuario.nombre}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 capitalize">{usuario.rol.nombre}</span>
              </div>
            </div>
          </div>

          {/* Detalles */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <User className="w-4 h-4" />
                <span className="text-sm">Nombre completo</span>
              </div>
              <p className="font-medium text-gray-900">{usuario.nombre}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Correo electrónico</span>
              </div>
              <p className="font-medium text-gray-900">{usuario.correo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Seguridad</h2>
          </div>
        </div>
        <div className="p-6">
          <ConfiguracionClient />
        </div>
      </div>

      {/* Info adicional según rol */}
      {usuario.rol.nombre === 'administrador' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <Shield className="w-5 h-5" />
            <p className="font-medium">Cuenta de Administrador</p>
          </div>
          <p className="text-amber-700 text-sm mt-1">
            Tienes acceso completo al sistema. Puedes gestionar usuarios, grupos, periodos y todas las configuraciones del sistema.
          </p>
        </div>
      )}

      {usuario.rol.nombre === 'maestro' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Settings className="w-5 h-5" />
            <p className="font-medium">Cuenta de Maestro</p>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Puedes gestionar las calificaciones y asistencia de los grupos y materias que tienes asignados.
          </p>
        </div>
      )}

      {usuario.rol.nombre === 'alumno' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <User className="w-5 h-5" />
            <p className="font-medium">Cuenta de Alumno</p>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Puedes consultar tus calificaciones, asistencia y horario de clases.
          </p>
        </div>
      )}
    </div>
  )
}

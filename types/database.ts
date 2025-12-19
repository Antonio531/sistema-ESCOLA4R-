export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rol: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
      }
      usuario: {
        Row: {
          id: number
          nombre: string
          correo: string
          usuario: string | null
          contrasena: string | null
          rolid: number
          auth_id: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nombre: string
          correo: string
          usuario?: string | null
          contrasena?: string | null
          rolid: number
          auth_id?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          correo?: string
          usuario?: string | null
          contrasena?: string | null
          rolid?: number
          auth_id?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      alumno: {
        Row: {
          id: number
          nombre: string
          curp: string | null
          fechanacimiento: string | null
          matricula: string | null
          correo: string | null
          telefono: string | null
          direccion: string | null
          usuarioid: number | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nombre: string
          curp?: string | null
          fechanacimiento?: string | null
          matricula?: string | null
          correo?: string | null
          telefono?: string | null
          direccion?: string | null
          usuarioid?: number | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          curp?: string | null
          fechanacimiento?: string | null
          matricula?: string | null
          correo?: string | null
          telefono?: string | null
          direccion?: string | null
          usuarioid?: number | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      maestro: {
        Row: {
          id: number
          nombre: string
          correo: string | null
          telefono: string | null
          especialidad: string | null
          usuarioid: number | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nombre: string
          correo?: string | null
          telefono?: string | null
          especialidad?: string | null
          usuarioid?: number | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          correo?: string | null
          telefono?: string | null
          especialidad?: string | null
          usuarioid?: number | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      periodo: {
        Row: {
          id: number
          nombre: string
          fechainicio: string | null
          fechafin: string | null
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: number
          nombre: string
          fechainicio?: string | null
          fechafin?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          fechainicio?: string | null
          fechafin?: string | null
          activo?: boolean
          created_at?: string
        }
      }
      parcial: {
        Row: {
          id: number
          nombre: string
          numero: number
          periodoid: number
          fechainicio: string | null
          fechafin: string | null
          activo: boolean
        }
        Insert: {
          id?: number
          nombre: string
          numero: number
          periodoid: number
          fechainicio?: string | null
          fechafin?: string | null
          activo?: boolean
        }
        Update: {
          id?: number
          nombre?: string
          numero?: number
          periodoid?: number
          fechainicio?: string | null
          fechafin?: string | null
          activo?: boolean
        }
      }
      grupo: {
        Row: {
          id: number
          nombre: string
          periodoid: number
          grado: number | null
          turno: string | null
          created_at: string
        }
        Insert: {
          id?: number
          nombre: string
          periodoid: number
          grado?: number | null
          turno?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          periodoid?: number
          grado?: number | null
          turno?: string | null
          created_at?: string
        }
      }
      asignatura: {
        Row: {
          id: number
          nombre: string
          clave: string | null
          creditos: number | null
          descripcion: string | null
          activo: boolean
        }
        Insert: {
          id?: number
          nombre: string
          clave?: string | null
          creditos?: number | null
          descripcion?: string | null
          activo?: boolean
        }
        Update: {
          id?: number
          nombre?: string
          clave?: string | null
          creditos?: number | null
          descripcion?: string | null
          activo?: boolean
        }
      }
      grupoalumno: {
        Row: {
          id: number
          grupoid: number
          alumnoid: number
          fechainscripcion: string | null
          activo: boolean
        }
        Insert: {
          id?: number
          grupoid: number
          alumnoid: number
          fechainscripcion?: string | null
          activo?: boolean
        }
        Update: {
          id?: number
          grupoid?: number
          alumnoid?: number
          fechainscripcion?: string | null
          activo?: boolean
        }
      }
      grupoasignatura: {
        Row: {
          id: number
          grupoid: number
          asignaturaid: number
          maestroid: number | null
          horario: string | null
          aula: string | null
          activo: boolean
        }
        Insert: {
          id?: number
          grupoid: number
          asignaturaid: number
          maestroid?: number | null
          horario?: string | null
          aula?: string | null
          activo?: boolean
        }
        Update: {
          id?: number
          grupoid?: number
          asignaturaid?: number
          maestroid?: number | null
          horario?: string | null
          aula?: string | null
          activo?: boolean
        }
      }
      calificacion: {
        Row: {
          id: number
          alumnoid: number
          grupoasignaturaid: number
          parcialid: number
          calificacion: number | null
          observaciones: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          alumnoid: number
          grupoasignaturaid: number
          parcialid: number
          calificacion?: number | null
          observaciones?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          alumnoid?: number
          grupoasignaturaid?: number
          parcialid?: number
          calificacion?: number | null
          observaciones?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      asistencia: {
        Row: {
          id: number
          alumnoid: number
          grupoasignaturaid: number
          fecha: string
          presente: boolean
          justificada: boolean
          observaciones: string | null
          created_at: string
        }
        Insert: {
          id?: number
          alumnoid: number
          grupoasignaturaid: number
          fecha?: string
          presente?: boolean
          justificada?: boolean
          observaciones?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          alumnoid?: number
          grupoasignaturaid?: number
          fecha?: string
          presente?: boolean
          justificada?: boolean
          observaciones?: string | null
          created_at?: string
        }
      }
      horario: {
        Row: {
          id: number
          grupoasignaturaid: number
          dia: string
          horainicio: string
          horafin: string
          aula: string | null
        }
        Insert: {
          id?: number
          grupoasignaturaid: number
          dia: string
          horainicio: string
          horafin: string
          aula?: string | null
        }
        Update: {
          id?: number
          grupoasignaturaid?: number
          dia?: string
          horainicio?: string
          horafin?: string
          aula?: string | null
        }
      }
      justificacion: {
        Row: {
          id: number
          asistenciaid: number
          motivo: string
          documento_url: string | null
          aprobada: boolean
          aprobadapor: number | null
          fechaaprobacion: string | null
          created_at: string
        }
        Insert: {
          id?: number
          asistenciaid: number
          motivo: string
          documento_url?: string | null
          aprobada?: boolean
          aprobadapor?: number | null
          fechaaprobacion?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          asistenciaid?: number
          motivo?: string
          documento_url?: string | null
          aprobada?: boolean
          aprobadapor?: number | null
          fechaaprobacion?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_alumno_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_maestro_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      obtener_promedio_alumno_materia: {
        Args: {
          p_alumnoid: number
          p_grupoasignaturaid: number
        }
        Returns: number
      }
      obtener_porcentaje_asistencia: {
        Args: {
          p_alumnoid: number
          p_grupoasignaturaid: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Tipos helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Tipos específicos para uso común
export type Usuario = Tables<'usuario'>
export type Alumno = Tables<'alumno'>
export type Maestro = Tables<'maestro'>
export type Grupo = Tables<'grupo'>
export type Asignatura = Tables<'asignatura'>
export type Calificacion = Tables<'calificacion'>
export type Asistencia = Tables<'asistencia'>
export type Periodo = Tables<'periodo'>
export type Parcial = Tables<'parcial'>
export type Rol = Tables<'rol'>

// Tipos con relaciones
export type UsuarioConRol = Usuario & {
  rol: Rol
}

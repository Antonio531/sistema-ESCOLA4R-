# Sistema Escolar TEBAEV (TELEEDUCA)

## Manual Tecnico

Sistema de gestion escolar desarrollado para el Telebachillerato de Veracruz (TEBAEV). Permite administrar alumnos, maestros, grupos, asignaturas, calificaciones, asistencia y horarios de manera integral.

---

## Tabla de Contenidos

1. [Informacion General](#1-informacion-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Tecnologias Utilizadas](#3-tecnologias-utilizadas)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Base de Datos](#5-base-de-datos)
6. [Sistema de Autenticacion](#6-sistema-de-autenticacion)
7. [Roles y Permisos](#7-roles-y-permisos)
8. [Rutas y Paginas](#8-rutas-y-paginas)
9. [Componentes](#9-componentes)
10. [API y Endpoints](#10-api-y-endpoints)
11. [Instalacion y Configuracion](#11-instalacion-y-configuracion)
12. [Despliegue](#12-despliegue)
13. [Seguridad](#13-seguridad)

---

## 1. Informacion General

### Descripcion
Sistema web completo para la gestion academica de instituciones educativas. Proporciona herramientas para:
- Administracion de usuarios (alumnos, maestros, administradores)
- Gestion de grupos y asignaturas
- Registro de calificaciones por parciales
- Control de asistencia
- Gestion de horarios
- Generacion de reportes

### Requisitos del Sistema
- Node.js 18.x o superior
- npm 9.x o superior
- Cuenta en Supabase (base de datos y autenticacion)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

---

## 2. Arquitectura del Sistema

### Patron de Arquitectura
El sistema utiliza una arquitectura **Server-Side Rendering (SSR)** con hidratacion del cliente, implementada con Next.js App Router.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Paginas   │  │ Componentes │  │  Componentes UI     │  │
│  │   (SSR)     │  │  (Client)   │  │  (Reutilizables)    │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     NEXT.JS APP ROUTER                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Middleware │  │ API Routes  │  │   Server Actions    │  │
│  │  (Auth)     │  │             │  │                     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Auth     │  │  PostgreSQL │  │   Row Level         │  │
│  │             │  │  Database   │  │   Security (RLS)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos
1. El usuario accede a una pagina
2. El middleware valida la sesion
3. El Server Component obtiene datos de Supabase
4. Los datos se pasan a Client Components para interactividad
5. Las acciones del usuario (CRUD) se procesan via API o Server Actions
6. Los cambios se reflejan en la base de datos con RLS aplicado

---

## 3. Tecnologias Utilizadas

### Frontend
| Tecnologia | Version | Descripcion |
|------------|---------|-------------|
| Next.js | ^16.0.10 | Framework React con SSR |
| React | 19.2.1 | Biblioteca de UI |
| TypeScript | ^5 | Tipado estatico |
| Tailwind CSS | ^4 | Framework de estilos |
| Lucide React | ^0.556.0 | Iconos |

### Backend
| Tecnologia | Version | Descripcion |
|------------|---------|-------------|
| Supabase | ^2.87.1 | Backend as a Service |
| PostgreSQL | - | Base de datos (via Supabase) |

### Desarrollo
| Tecnologia | Version | Descripcion |
|------------|---------|-------------|
| ESLint | ^9 | Linter de codigo |
| PostCSS | - | Procesador CSS |

---

## 4. Estructura del Proyecto

```
sistema-escolar/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Layout raiz
│   ├── page.tsx                      # Pagina de inicio (landing)
│   ├── globals.css                   # Estilos globales y animaciones
│   │
│   ├── api/                          # API Routes
│   │   └── usuarios/
│   │       └── crear/
│   │           └── route.ts          # POST: Crear usuarios
│   │
│   ├── login/                        # Autenticacion
│   │   ├── page.tsx                  # Pagina de login (Server)
│   │   └── login-form.tsx            # Formulario (Client)
│   │
│   ├── setup/                        # Configuracion inicial
│   │   ├── page.tsx                  # Pagina setup (Server)
│   │   └── setup-form.tsx            # Formulario (Client)
│   │
│   └── dashboard/                    # Panel principal (protegido)
│       ├── layout.tsx                # Layout del dashboard
│       ├── page.tsx                  # Pagina principal
│       ├── loading.tsx               # Estado de carga
│       │
│       ├── alumnos/                  # Gestion de alumnos
│       │   ├── page.tsx
│       │   ├── alumnos-table.tsx
│       │   ├── alumno-actions.tsx
│       │   ├── nuevo-alumno-modal.tsx
│       │   └── editar-alumno-modal.tsx
│       │
│       ├── maestros/                 # Gestion de maestros
│       │   ├── page.tsx
│       │   ├── maestros-table.tsx
│       │   ├── maestro-actions.tsx
│       │   ├── nuevo-maestro-modal.tsx
│       │   └── editar-maestro-modal.tsx
│       │
│       ├── grupos/                   # Gestion de grupos
│       │   ├── page.tsx
│       │   ├── [id]/                 # Detalle de grupo
│       │   │   └── page.tsx
│       │   └── ...
│       │
│       ├── asignaturas/              # Gestion de asignaturas
│       ├── periodos/                 # Gestion de periodos
│       ├── calificaciones/           # Registro de calificaciones
│       ├── asistencia/               # Control de asistencia
│       ├── horario/                  # Horarios
│       ├── configuracion/            # Configuracion del sistema
│       ├── usuarios/                 # Gestion de usuarios (admin)
│       │
│       ├── mis-grupos/               # Grupos del maestro
│       ├── mis-materias/             # Materias del alumno
│       ├── mis-calificaciones/       # Calificaciones del alumno
│       ├── mi-asistencia/            # Asistencia del alumno
│       └── mi-horario/               # Horario del alumno
│
├── components/                       # Componentes reutilizables
│   ├── dashboard/
│   │   ├── sidebar.tsx               # Menu lateral
│   │   ├── header.tsx                # Encabezado
│   │   ├── mobile-menu.tsx           # Menu movil
│   │   └── welcome-toast.tsx         # Toast de bienvenida
│   │
│   ├── reportes/                     # Generacion de reportes
│   │   ├── generar-reporte-alumnos.tsx
│   │   ├── generar-reporte-maestros.tsx
│   │   ├── generar-reporte-grupos.tsx
│   │   └── boton-reporte.tsx
│   │
│   └── ui/                           # Componentes UI base
│       ├── toast.tsx                 # Sistema de notificaciones
│       ├── search-input.tsx          # Input de busqueda
│       ├── skeleton.tsx              # Esqueleto de carga
│       └── portal.tsx                # Portal para modales
│
├── lib/                              # Utilidades y configuracion
│   ├── auth.ts                       # Helpers de autenticacion
│   └── supabase/
│       ├── client.ts                 # Cliente Supabase (browser)
│       ├── server.ts                 # Cliente Supabase (server)
│       └── middleware.ts             # Middleware de sesion
│
├── types/                            # Tipos TypeScript
│   └── database.ts                   # Tipos de la base de datos
│
├── middleware.ts                     # Middleware de Next.js
├── supabase_completo.sql             # Script SQL de la BD
├── package.json                      # Dependencias
├── tsconfig.json                     # Configuracion TypeScript
├── next.config.ts                    # Configuracion Next.js
└── postcss.config.mjs                # Configuracion PostCSS
```

---

## 5. Base de Datos

### Diagrama Entidad-Relacion

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│     rol     │       │   usuario   │       │   periodo   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ rolid (FK)  │       │ id (PK)     │
│ nombre      │       │ id (PK)     │       │ nombre      │
└─────────────┘       │ nombre      │       │ fechainicio │
                      │ correo      │       │ fechafin    │
                      │ auth_id     │       │ activo      │
                      │ activo      │       └──────┬──────┘
                      └──────┬──────┘              │
                             │                     │
              ┌──────────────┼──────────────┐      │
              ▼              ▼              │      │
       ┌─────────────┐ ┌─────────────┐      │      │
       │   maestro   │ │   alumno    │      │      │
       ├─────────────┤ ├─────────────┤      │      │
       │ id (PK)     │ │ id (PK)     │      │      │
       │ nombre      │ │ nombre      │      │      │
       │ correo      │ │ curp        │      │      │
       │ telefono    │ │ matricula   │      │      │
       │ especialidad│ │ correo      │      │      │
       │ usuarioid   │ │ telefono    │      │      │
       └──────┬──────┘ │ direccion   │      │      │
              │        │ usuarioid   │      │      │
              │        └──────┬──────┘      │      │
              │               │             │      │
              │               │             │      │
              ▼               ▼             │      │
       ┌─────────────────────────────┐      │      │
       │      grupoasignatura        │◄─────┼──────┤
       ├─────────────────────────────┤      │      │
       │ id (PK)                     │      │      │
       │ grupoid (FK)────────────────┼──────┼──────┼───┐
       │ asignaturaid (FK)───────────┼──────┼──┐   │   │
       │ maestroid (FK)              │      │  │   │   │
       │ aula                        │      │  │   │   │
       └──────────┬──────────────────┘      │  │   │   │
                  │                         │  │   │   │
    ┌─────────────┼─────────────┐           │  │   │   │
    │             │             │           │  │   │   │
    ▼             ▼             ▼           │  ▼   │   ▼
┌────────┐  ┌──────────┐  ┌──────────┐      │┌─────┴───┴───┐
│horario │  │califica- │  │asistencia│      ││   grupo     │
├────────┤  │cion      │  ├──────────┤      │├─────────────┤
│id (PK) │  ├──────────┤  │id (PK)   │      ││ id (PK)     │
│grupoas-│  │id (PK)   │  │alumnoid  │      ││ nombre      │
│ignatura│  │alumnoid  │  │grupoas-  │      ││ periodoid   │
│id      │  │grupoas-  │  │ignaturaid│      ││ grado       │
│dia     │  │ignaturaid│  │fecha     │      ││ turno       │
│horaini │  │parcialid │  │presente  │      │└─────────────┘
│horafin │  │califica- │  │justifica-│      │
│aula    │  │cion      │  │da        │      │
└────────┘  │observa-  │  │observa-  │      │
            │ciones    │  │ciones    │      │
            └────┬─────┘  └──────────┘      │
                 │                          │
                 ▼                          │
          ┌─────────────┐                   │
          │   parcial   │◄──────────────────┘
          ├─────────────┤    ┌─────────────┐
          │ id (PK)     │    │ asignatura  │
          │ nombre      │    ├─────────────┤
          │ numero      │    │ id (PK)     │
          │ periodoid   │    │ nombre      │
          │ fechainicio │    │ clave       │
          │ fechafin    │    │ creditos    │
          │ activo      │    │ descripcion │
          └─────────────┘    │ activo      │
                             └─────────────┘

┌─────────────────┐
│  grupoalumno    │ (Tabla de relacion muchos a muchos)
├─────────────────┤
│ id (PK)         │
│ grupoid (FK)────┼──► grupo
│ alumnoid (FK)───┼──► alumno
│ fechainscripcion│
│ activo          │
└─────────────────┘

┌─────────────────┐
│  justificacion  │
├─────────────────┤
│ id (PK)         │
│ asistenciaid────┼──► asistencia
│ motivo          │
│ documento_url   │
│ aprobada        │
│ aprobadapor─────┼──► usuario
│ fechaaprobacion │
└─────────────────┘
```

### Descripcion de Tablas

#### Tabla: `rol`
Define los tipos de usuarios del sistema.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| nombre | VARCHAR(50) | Nombre del rol (administrador, maestro, alumno) |

#### Tabla: `usuario`
Usuarios del sistema vinculados a Supabase Auth.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| nombre | VARCHAR(255) | Nombre completo |
| correo | VARCHAR(255) | Correo electronico (unico) |
| rolid | INTEGER | FK a rol |
| auth_id | UUID | FK a auth.users de Supabase |
| activo | BOOLEAN | Estado del usuario |
| created_at | TIMESTAMPTZ | Fecha de creacion |
| updated_at | TIMESTAMPTZ | Fecha de actualizacion |

#### Tabla: `periodo`
Ciclos escolares.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| nombre | VARCHAR(100) | Nombre del periodo (ej: "2024-2025") |
| fechainicio | DATE | Fecha de inicio |
| fechafin | DATE | Fecha de fin |
| activo | BOOLEAN | Periodo activo |

#### Tabla: `parcial`
Periodos de evaluacion dentro de un ciclo.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| nombre | VARCHAR(50) | Nombre del parcial |
| numero | INTEGER | Numero de parcial (1, 2, 3...) |
| periodoid | INTEGER | FK a periodo |
| fechainicio | DATE | Inicio del parcial |
| fechafin | DATE | Fin del parcial |
| activo | BOOLEAN | Parcial activo |

#### Tabla: `maestro`
Informacion de docentes.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| nombre | VARCHAR(255) | Nombre completo |
| correo | VARCHAR(255) | Correo electronico |
| telefono | VARCHAR(20) | Telefono de contacto |
| especialidad | VARCHAR(100) | Area de especializacion |
| usuarioid | INTEGER | FK a usuario |
| activo | BOOLEAN | Estado del maestro |

#### Tabla: `alumno`
Informacion de estudiantes.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| nombre | VARCHAR(255) | Nombre completo |
| curp | VARCHAR(18) | CURP del alumno |
| fechanacimiento | DATE | Fecha de nacimiento |
| matricula | VARCHAR(50) | Matricula escolar |
| correo | VARCHAR(255) | Correo electronico |
| telefono | VARCHAR(20) | Telefono de contacto |
| direccion | TEXT | Direccion completa |
| usuarioid | INTEGER | FK a usuario |
| activo | BOOLEAN | Estado del alumno |

#### Tabla: `grupo`
Grupos o clases.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| nombre | VARCHAR(50) | Nombre del grupo (ej: "1A") |
| periodoid | INTEGER | FK a periodo |
| grado | INTEGER | Grado escolar (1, 2, 3) |
| turno | VARCHAR(20) | Turno (Matutino/Vespertino) |

#### Tabla: `asignatura`
Materias o cursos.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| nombre | VARCHAR(100) | Nombre de la materia |
| clave | VARCHAR(20) | Clave oficial |
| creditos | INTEGER | Creditos de la materia |
| descripcion | TEXT | Descripcion de la materia |
| activo | BOOLEAN | Estado de la asignatura |

#### Tabla: `grupoalumno`
Relacion muchos a muchos entre grupos y alumnos (inscripciones).
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| grupoid | INTEGER | FK a grupo |
| alumnoid | INTEGER | FK a alumno |
| fechainscripcion | DATE | Fecha de inscripcion |
| activo | BOOLEAN | Inscripcion activa |

#### Tabla: `grupoasignatura`
Materias asignadas a grupos con su maestro.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| grupoid | INTEGER | FK a grupo |
| asignaturaid | INTEGER | FK a asignatura |
| maestroid | INTEGER | FK a maestro |
| aula | VARCHAR(50) | Aula asignada |
| activo | BOOLEAN | Asignacion activa |

#### Tabla: `calificacion`
Calificaciones de alumnos por parcial.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| alumnoid | INTEGER | FK a alumno |
| grupoasignaturaid | INTEGER | FK a grupoasignatura |
| parcialid | INTEGER | FK a parcial |
| calificacion | NUMERIC(5,2) | Calificacion (0-100) |
| observaciones | TEXT | Observaciones adicionales |

#### Tabla: `asistencia`
Registro diario de asistencia.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| alumnoid | INTEGER | FK a alumno |
| grupoasignaturaid | INTEGER | FK a grupoasignatura |
| fecha | DATE | Fecha del registro |
| presente | BOOLEAN | Asistio o no |
| justificada | BOOLEAN | Falta justificada |
| observaciones | TEXT | Observaciones |

#### Tabla: `horario`
Horarios de clases.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| grupoasignaturaid | INTEGER | FK a grupoasignatura |
| dia | VARCHAR(20) | Dia de la semana |
| horainicio | TIME | Hora de inicio |
| horafin | TIME | Hora de fin |
| aula | VARCHAR(50) | Aula |

#### Tabla: `justificacion`
Justificaciones de faltas.
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | SERIAL | Identificador unico |
| asistenciaid | INTEGER | FK a asistencia |
| motivo | TEXT | Motivo de la falta |
| documento_url | TEXT | URL del documento |
| aprobada | BOOLEAN | Justificacion aprobada |
| aprobadapor | INTEGER | FK a usuario que aprobo |
| fechaaprobacion | TIMESTAMPTZ | Fecha de aprobacion |

### Funciones de Base de Datos

```sql
-- Obtener rol del usuario actual
get_user_role() → string

-- Obtener ID del alumno actual
get_current_alumno_id() → number

-- Obtener ID del maestro actual
get_current_maestro_id() → number

-- Calcular promedio de alumno en una materia
obtener_promedio_alumno_materia(p_alumnoid, p_grupoasignaturaid) → number

-- Calcular porcentaje de asistencia
obtener_porcentaje_asistencia(p_alumnoid, p_grupoasignaturaid) → number
```

### Indices de Rendimiento

```sql
CREATE INDEX idx_usuario_auth_id ON usuario(auth_id);
CREATE INDEX idx_usuario_rolid ON usuario(rolid);
CREATE INDEX idx_alumno_usuarioid ON alumno(usuarioid);
CREATE INDEX idx_maestro_usuarioid ON maestro(usuarioid);
CREATE INDEX idx_grupo_periodoid ON grupo(periodoid);
CREATE INDEX idx_grupoalumno_grupoid ON grupoalumno(grupoid);
CREATE INDEX idx_grupoalumno_alumnoid ON grupoalumno(alumnoid);
CREATE INDEX idx_grupoasignatura_grupoid ON grupoasignatura(grupoid);
CREATE INDEX idx_grupoasignatura_maestroid ON grupoasignatura(maestroid);
CREATE INDEX idx_calificacion_alumnoid ON calificacion(alumnoid);
CREATE INDEX idx_asistencia_alumnoid ON asistencia(alumnoid);
CREATE INDEX idx_asistencia_fecha ON asistencia(fecha);
```

---

## 6. Sistema de Autenticacion

### Flujo de Autenticacion

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Usuario    │────►│  Middleware  │────►│   Supabase   │
│   (Browser)  │     │   (Next.js)  │     │    Auth      │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │  1. Accede a ruta  │                    │
       │───────────────────►│                    │
       │                    │  2. Valida sesion  │
       │                    │───────────────────►│
       │                    │◄───────────────────│
       │                    │  3. Sesion valida  │
       │                    │                    │
       │◄───────────────────│                    │
       │  4. Permite acceso │                    │
       │     o redirige     │                    │
```

### Componentes de Autenticacion

#### Middleware (`middleware.ts`)
```typescript
// Valida sesion en cada request
// Redirige usuarios no autenticados a /login
// Redirige usuarios autenticados fuera de /login y /setup
```

#### Cliente Supabase - Servidor (`lib/supabase/server.ts`)
```typescript
// Crea cliente Supabase para Server Components
// Maneja cookies de sesion
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(...)
}
```

#### Cliente Supabase - Browser (`lib/supabase/client.ts`)
```typescript
// Crea cliente Supabase para Client Components
export const createClient = () => {
  return createBrowserClient(...)
}
```

#### Helpers de Auth (`lib/auth.ts`)
```typescript
// Obtener usuario autenticado
export async function getAuthUser()

// Requerir autenticacion
export async function requireAuth()

// Requerir rol especifico
export async function requireRole(allowedRoles: string[])
```

### Manejo de Sesion
- Las sesiones se almacenan en cookies HTTP-only
- Los tokens JWT se renuevan automaticamente
- El middleware valida la sesion en cada peticion

---

## 7. Roles y Permisos

### Definicion de Roles

| ID | Rol | Descripcion |
|----|-----|-------------|
| 1 | administrador | Acceso total al sistema |
| 2 | maestro | Gestion de calificaciones y asistencia |
| 3 | alumno | Consulta de informacion propia |

### Matriz de Permisos

| Funcionalidad | Admin | Maestro | Alumno |
|---------------|:-----:|:-------:|:------:|
| Ver dashboard | Si | Si | Si |
| Gestionar usuarios | Si | No | No |
| Gestionar alumnos | Si | No | No |
| Gestionar maestros | Si | No | No |
| Gestionar grupos | Si | No | No |
| Gestionar asignaturas | Si | No | No |
| Gestionar periodos | Si | No | No |
| Registrar calificaciones | Si | Si* | No |
| Registrar asistencia | Si | Si* | No |
| Ver calificaciones propias | - | - | Si |
| Ver asistencia propia | - | - | Si |
| Ver horario | Si | Si | Si |
| Generar reportes | Si | Si | No |

*Solo para sus grupos asignados

### Politicas RLS (Row Level Security)

```sql
-- Ejemplo: Solo admins pueden gestionar alumnos
CREATE POLICY "Admin puede gestionar alumnos" ON alumno FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuario
    WHERE auth_id = auth.uid()
    AND rolid = (SELECT id FROM rol WHERE nombre = 'administrador')
  )
);

-- Ejemplo: Maestros pueden gestionar calificaciones
CREATE POLICY "Maestros pueden gestionar calificaciones" ON calificacion FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuario u
    WHERE u.auth_id = auth.uid()
    AND u.rolid IN (
      SELECT id FROM rol WHERE nombre IN ('administrador', 'maestro')
    )
  )
);
```

---

## 8. Rutas y Paginas

### Rutas Publicas

| Ruta | Descripcion | Componente |
|------|-------------|------------|
| `/` | Pagina de inicio (landing) | `app/page.tsx` |
| `/login` | Inicio de sesion | `app/login/page.tsx` |
| `/setup` | Configuracion inicial (primer admin) | `app/setup/page.tsx` |

### Rutas Protegidas - Dashboard

| Ruta | Descripcion | Roles |
|------|-------------|-------|
| `/dashboard` | Panel principal | Todos |
| `/dashboard/usuarios` | Gestion de usuarios | Admin |
| `/dashboard/alumnos` | Gestion de alumnos | Admin |
| `/dashboard/maestros` | Gestion de maestros | Admin |
| `/dashboard/grupos` | Gestion de grupos | Admin |
| `/dashboard/grupos/[id]` | Detalle de grupo | Admin |
| `/dashboard/asignaturas` | Gestion de asignaturas | Admin |
| `/dashboard/periodos` | Gestion de periodos | Admin |
| `/dashboard/calificaciones` | Registro de calificaciones | Admin, Maestro |
| `/dashboard/asistencia` | Control de asistencia | Admin, Maestro |
| `/dashboard/horario` | Ver horarios | Todos |
| `/dashboard/configuracion` | Configuracion | Todos |
| `/dashboard/mis-grupos` | Grupos del maestro | Maestro |
| `/dashboard/mis-materias` | Materias del alumno | Alumno |
| `/dashboard/mis-calificaciones` | Calificaciones del alumno | Alumno |
| `/dashboard/mi-asistencia` | Asistencia del alumno | Alumno |
| `/dashboard/mi-horario` | Horario del alumno | Alumno |

### Navegacion por Rol

#### Administrador
```
Dashboard
├── Usuarios
├── Alumnos
├── Maestros
├── Grupos
├── Asignaturas
├── Periodos
├── Calificaciones
├── Asistencia
├── Horario
└── Configuracion
```

#### Maestro
```
Dashboard
├── Mis Grupos
├── Calificaciones
├── Asistencia
├── Horario
└── Configuracion
```

#### Alumno
```
Dashboard
├── Mis Materias
├── Mis Calificaciones
├── Mi Asistencia
├── Mi Horario
└── Configuracion
```

---

## 9. Componentes

### Componentes de Layout

#### Sidebar (`components/dashboard/sidebar.tsx`)
Menu lateral de navegacion con opciones filtradas por rol.

#### Header (`components/dashboard/header.tsx`)
Encabezado con menu de usuario, notificaciones y boton de cierre de sesion.

#### MobileMenu (`components/dashboard/mobile-menu.tsx`)
Menu responsivo para dispositivos moviles.

### Componentes de UI

#### Toast (`components/ui/toast.tsx`)
Sistema de notificaciones con soporte para tipos: success, error, warning, info.

```typescript
// Uso
const { showToast } = useToast()
showToast('Operacion exitosa', 'success')
```

#### Portal (`components/ui/portal.tsx`)
Renderiza componentes fuera del arbol DOM (para modales y dropdowns).

```typescript
// Uso
<Portal>
  <Modal>...</Modal>
</Portal>
```

#### SearchInput (`components/ui/search-input.tsx`)
Input de busqueda con icono y estilos predefinidos.

#### Skeleton (`components/ui/skeleton.tsx`)
Componente de carga animado.

### Componentes de Formularios

#### Modales CRUD
- `nuevo-alumno-modal.tsx` - Crear alumno
- `editar-alumno-modal.tsx` - Editar alumno
- `nuevo-maestro-modal.tsx` - Crear maestro
- `editar-maestro-modal.tsx` - Editar maestro

### Componentes de Reportes

#### GenerarReporteAlumnos
Genera PDF con lista de alumnos.

#### GenerarReporteMaestros
Genera PDF con lista de maestros.

#### GenerarReporteGrupos
Genera PDF con informacion de grupos.

---

## 10. API y Endpoints

### POST `/api/usuarios/crear`
Crea un nuevo usuario en el sistema.

**Request:**
```json
{
  "email": "usuario@correo.com",
  "password": "contrasena123",
  "nombre": "Nombre Completo",
  "rolNombre": "alumno",
  "datosExtra": {
    "curp": "ABCD123456HDFXXX00",
    "matricula": "2024001",
    "telefono": "1234567890"
  }
}
```

**Response (exito):**
```json
{
  "success": true,
  "usuario": {
    "id": 1,
    "auth_id": "uuid-del-usuario"
  }
}
```

**Response (error):**
```json
{
  "error": "Mensaje de error"
}
```

**Flujo interno:**
1. Valida datos de entrada
2. Crea usuario en Supabase Auth
3. Crea registro en tabla `usuario`
4. Si es maestro, crea registro en tabla `maestro`
5. Si es alumno, crea registro en tabla `alumno`
6. En caso de error, hace rollback

---

## 11. Instalacion y Configuracion

### Requisitos Previos
1. Node.js 18.x o superior
2. npm 9.x o superior
3. Cuenta en Supabase

### Paso 1: Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd sistema-escolar
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Configurar Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)

2. Ejecutar el script SQL en el SQL Editor de Supabase:
```sql
-- Copiar contenido de supabase_completo.sql
```

3. Obtener las credenciales del proyecto:
   - Project URL
   - Anon Key
   - Service Role Key

### Paso 4: Configurar Variables de Entorno
Crear archivo `.env.local` en la raiz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### Paso 5: Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

El sistema estara disponible en `http://localhost:3000`

### Paso 6: Configuracion Inicial
1. Acceder a `/setup`
2. Registrar el primer administrador
3. Iniciar sesion con las credenciales creadas

---

## 12. Despliegue

### Despliegue en Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Desplegar

### Despliegue Manual

```bash
# Construir la aplicacion
npm run build

# Iniciar en produccion
npm run start
```

### Variables de Entorno en Produccion

| Variable | Descripcion | Requerida |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Si |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anonima de Supabase | Si |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (admin) | Si |

---

## 13. Seguridad

### Medidas Implementadas

#### Autenticacion
- Autenticacion basada en JWT via Supabase Auth
- Tokens almacenados en cookies HTTP-only
- Renovacion automatica de sesiones

#### Autorizacion
- Row Level Security (RLS) en todas las tablas
- Verificacion de roles en middleware
- Validacion de permisos en cada operacion

#### Proteccion de Datos
- Passwords hasheados con bcrypt (Supabase Auth)
- Comunicacion cifrada (HTTPS)
- Variables de entorno para credenciales

#### Validacion
- Validacion de entrada en formularios
- Sanitizacion de datos antes de insertar
- Restricciones UNIQUE en campos criticos

### Mejores Practicas
1. Nunca exponer `SUPABASE_SERVICE_ROLE_KEY` en el cliente
2. Usar siempre HTTPS en produccion
3. Mantener dependencias actualizadas
4. Revisar logs de Supabase regularmente

---

## Scripts Disponibles

```bash
# Desarrollo
npm run dev      # Inicia servidor de desarrollo

# Produccion
npm run build    # Construye la aplicacion
npm run start    # Inicia servidor de produccion

# Calidad de Codigo
npm run lint     # Ejecuta ESLint
```

---

## Contacto y Soporte

Para reportar errores o solicitar nuevas funcionalidades, crear un issue en el repositorio.

---

**Version:** 0.1.0
**Ultima actualizacion:** Diciembre 2024

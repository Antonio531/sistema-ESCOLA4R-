-- ============================================
-- SCRIPT COMPLETO PARA SISTEMA ESCOLAR
-- Ejecutar en SQL Editor de Supabase
-- ============================================

-- 1. Tabla de roles
CREATE TABLE rol (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Insertar roles base
INSERT INTO rol (nombre) VALUES ('administrador'), ('maestro'), ('alumno');

-- 2. Tabla de usuarios
CREATE TABLE usuario (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  rolid INTEGER NOT NULL REFERENCES rol(id),
  auth_id UUID UNIQUE REFERENCES auth.users(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de periodos
CREATE TABLE periodo (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  fechainicio DATE,
  fechafin DATE,
  activo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de parciales
CREATE TABLE parcial (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  numero INTEGER NOT NULL,
  periodoid INTEGER NOT NULL REFERENCES periodo(id),
  fechainicio DATE,
  fechafin DATE,
  activo BOOLEAN DEFAULT true
);

-- 5. Tabla de maestros
CREATE TABLE maestro (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255),
  telefono VARCHAR(20),
  especialidad VARCHAR(100),
  usuarioid INTEGER REFERENCES usuario(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de alumnos
CREATE TABLE alumno (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  curp VARCHAR(18),
  fechanacimiento DATE,
  matricula VARCHAR(50),
  correo VARCHAR(255),
  telefono VARCHAR(20),
  direccion TEXT,
  usuarioid INTEGER REFERENCES usuario(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de grupos
CREATE TABLE grupo (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  periodoid INTEGER NOT NULL REFERENCES periodo(id),
  grado INTEGER,
  turno VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabla de asignaturas
CREATE TABLE asignatura (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  clave VARCHAR(20),
  creditos INTEGER,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true
);

-- 9. Tabla de grupo-alumno (inscripciones)
CREATE TABLE grupoalumno (
  id SERIAL PRIMARY KEY,
  grupoid INTEGER NOT NULL REFERENCES grupo(id),
  alumnoid INTEGER NOT NULL REFERENCES alumno(id),
  fechainscripcion DATE DEFAULT CURRENT_DATE,
  activo BOOLEAN DEFAULT true,
  UNIQUE(grupoid, alumnoid)
);

-- 10. Tabla de grupo-asignatura (materias por grupo)
CREATE TABLE grupoasignatura (
  id SERIAL PRIMARY KEY,
  grupoid INTEGER NOT NULL REFERENCES grupo(id),
  asignaturaid INTEGER NOT NULL REFERENCES asignatura(id),
  maestroid INTEGER REFERENCES maestro(id),
  aula VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  UNIQUE(grupoid, asignaturaid)
);

-- 11. Tabla de calificaciones
CREATE TABLE calificacion (
  id SERIAL PRIMARY KEY,
  alumnoid INTEGER NOT NULL REFERENCES alumno(id),
  grupoasignaturaid INTEGER NOT NULL REFERENCES grupoasignatura(id),
  parcialid INTEGER NOT NULL REFERENCES parcial(id),
  calificacion NUMERIC(5,2),
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumnoid, grupoasignaturaid, parcialid)
);

-- 12. Tabla de asistencia
CREATE TABLE asistencia (
  id SERIAL PRIMARY KEY,
  alumnoid INTEGER NOT NULL REFERENCES alumno(id),
  grupoasignaturaid INTEGER NOT NULL REFERENCES grupoasignatura(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  presente BOOLEAN DEFAULT true,
  justificada BOOLEAN DEFAULT false,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumnoid, grupoasignaturaid, fecha)
);

-- 13. Tabla de horarios
CREATE TABLE horario (
  id SERIAL PRIMARY KEY,
  grupoasignaturaid INTEGER NOT NULL REFERENCES grupoasignatura(id),
  dia VARCHAR(20) NOT NULL,
  horainicio TIME NOT NULL,
  horafin TIME NOT NULL,
  aula VARCHAR(50)
);

-- 14. Tabla de justificaciones
CREATE TABLE justificacion (
  id SERIAL PRIMARY KEY,
  asistenciaid INTEGER NOT NULL REFERENCES asistencia(id),
  motivo TEXT NOT NULL,
  documento_url TEXT,
  aprobada BOOLEAN DEFAULT false,
  aprobadapor INTEGER REFERENCES usuario(id),
  fechaaprobacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE maestro ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodo ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcial ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupo ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignatura ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupoalumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupoasignatura ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE horario ENABLE ROW LEVEL SECURITY;
ALTER TABLE justificacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE rol ENABLE ROW LEVEL SECURITY;

-- Políticas para rol (todos pueden leer)
CREATE POLICY "Todos pueden ver roles" ON rol FOR SELECT USING (true);

-- Políticas para usuario
CREATE POLICY "Usuarios autenticados pueden ver usuarios" ON usuario
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins pueden insertar usuarios" ON usuario
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuario u
      WHERE u.auth_id = auth.uid()
      AND u.rolid = (SELECT id FROM rol WHERE nombre = 'administrador')
    )
    OR NOT EXISTS (SELECT 1 FROM usuario)
  );

CREATE POLICY "Admins pueden actualizar usuarios" ON usuario
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuario u
      WHERE u.auth_id = auth.uid()
      AND u.rolid = (SELECT id FROM rol WHERE nombre = 'administrador')
    )
  );

-- Políticas para periodo, parcial, grupo, asignatura (lectura para todos, escritura para admin)
CREATE POLICY "Todos pueden ver periodos" ON periodo FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede gestionar periodos" ON periodo FOR ALL USING (
  EXISTS (SELECT 1 FROM usuario WHERE auth_id = auth.uid() AND rolid = (SELECT id FROM rol WHERE nombre = 'administrador'))
);

CREATE POLICY "Todos pueden ver parciales" ON parcial FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede gestionar parciales" ON parcial FOR ALL USING (
  EXISTS (SELECT 1 FROM usuario WHERE auth_id = auth.uid() AND rolid = (SELECT id FROM rol WHERE nombre = 'administrador'))
);

CREATE POLICY "Todos pueden ver grupos" ON grupo FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede gestionar grupos" ON grupo FOR ALL USING (
  EXISTS (SELECT 1 FROM usuario WHERE auth_id = auth.uid() AND rolid = (SELECT id FROM rol WHERE nombre = 'administrador'))
);

CREATE POLICY "Todos pueden ver asignaturas" ON asignatura FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede gestionar asignaturas" ON asignatura FOR ALL USING (
  EXISTS (SELECT 1 FROM usuario WHERE auth_id = auth.uid() AND rolid = (SELECT id FROM rol WHERE nombre = 'administrador'))
);

-- Políticas para alumno y maestro
CREATE POLICY "Usuarios autenticados pueden ver alumnos" ON alumno FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede gestionar alumnos" ON alumno FOR ALL USING (
  EXISTS (SELECT 1 FROM usuario WHERE auth_id = auth.uid() AND rolid = (SELECT id FROM rol WHERE nombre = 'administrador'))
);

CREATE POLICY "Usuarios autenticados pueden ver maestros" ON maestro FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede gestionar maestros" ON maestro FOR ALL USING (
  EXISTS (SELECT 1 FROM usuario WHERE auth_id = auth.uid() AND rolid = (SELECT id FROM rol WHERE nombre = 'administrador'))
);

-- Políticas para grupoalumno y grupoasignatura
CREATE POLICY "Todos pueden ver grupoalumno" ON grupoalumno FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede gestionar grupoalumno" ON grupoalumno FOR ALL USING (
  EXISTS (SELECT 1 FROM usuario WHERE auth_id = auth.uid() AND rolid = (SELECT id FROM rol WHERE nombre = 'administrador'))
);

CREATE POLICY "Todos pueden ver grupoasignatura" ON grupoasignatura FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede gestionar grupoasignatura" ON grupoasignatura FOR ALL USING (
  EXISTS (SELECT 1 FROM usuario WHERE auth_id = auth.uid() AND rolid = (SELECT id FROM rol WHERE nombre = 'administrador'))
);

-- Políticas para calificacion
CREATE POLICY "Ver calificaciones" ON calificacion FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Maestros pueden gestionar calificaciones" ON calificacion FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuario u
    WHERE u.auth_id = auth.uid()
    AND u.rolid IN (
      SELECT id FROM rol WHERE nombre IN ('administrador', 'maestro')
    )
  )
);

-- Políticas para asistencia
CREATE POLICY "Ver asistencia" ON asistencia FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Maestros pueden gestionar asistencia" ON asistencia FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuario u
    WHERE u.auth_id = auth.uid()
    AND u.rolid IN (
      SELECT id FROM rol WHERE nombre IN ('administrador', 'maestro')
    )
  )
);

-- Políticas para horario
CREATE POLICY "Todos pueden ver horarios" ON horario FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede gestionar horarios" ON horario FOR ALL USING (
  EXISTS (SELECT 1 FROM usuario WHERE auth_id = auth.uid() AND rolid = (SELECT id FROM rol WHERE nombre = 'administrador'))
);

-- Políticas para justificacion
CREATE POLICY "Ver justificaciones" ON justificacion FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Gestionar justificaciones" ON justificacion FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuario u
    WHERE u.auth_id = auth.uid()
    AND u.rolid IN (
      SELECT id FROM rol WHERE nombre IN ('administrador', 'maestro')
    )
  )
);

-- ============================================
-- ÍNDICES para mejor rendimiento
-- ============================================
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

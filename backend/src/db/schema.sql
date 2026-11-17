-- =====================================================================
--  SETAR YACUIBA - Geolocalizacion de Medidores
--  Esquema de base de datos para PostgreSQL 18
--
--  Como usar en pgAdmin 4:
--    1. Click derecho en "Databases" -> Create -> Database...
--       Nombre: sistema_medidores   Owner: postgres
--    2. Click derecho en la base "sistema_medidores" -> Query Tool
--    3. Abrir este archivo (schema.sql) y ejecutar (F5)
--    4. Luego ejecutar seed.sql para los datos iniciales
--
--  Dropea y recrea todo el esquema. Ejecuta seed.sql despues de este archivo.
-- =====================================================================

-- (Opcional) Crea la base de datos desde psql / pgAdmin si aun no existe.
-- Nota: en pgAdmin 4 normalmente se crea con la interfaz, no con este script.
-- CREATE DATABASE sistema_medidores ENCODING 'UTF8';

-- Si ejecutas este archivo conectado a la base sistema_medidores:
SET client_encoding = 'UTF8';

-- Borra el esquema publico para dejar la base limpia (remueve este bloque si
-- vas a actualizar una base con datos que quieras conservar).
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- =====================================================================
-- 1. USUARIOS DEL SISTEMA (panel web / administracion)
--    Usado por: authController.login, usuarioService, reporteService
-- =====================================================================
CREATE TABLE usuarios (
  id_usuario      SERIAL PRIMARY KEY,
  nombre          VARCHAR(150) NOT NULL,
  usuario         VARCHAR(80)  NOT NULL UNIQUE,
  password        VARCHAR(255) NOT NULL,
  rol             VARCHAR(30)  NOT NULL DEFAULT 'Usuario',
  estado          BOOLEAN      NOT NULL DEFAULT TRUE,
  fecha_registro  TIMESTAMP    NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE  usuarios IS 'Usuarios del sistema (admin/consulta).';
COMMENT ON COLUMN usuarios.password IS 'Hash bcrypt de la contrasena.';

-- =====================================================================
-- 2. TECNICOS (app movil de campo)
--    Usado por: authController.loginTecnico, tecnicoService, tareaService
-- =====================================================================
CREATE TABLE tecnicos (
  id_tecnico    SERIAL PRIMARY KEY,
  id_usuario    INTEGER      REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  nombre        VARCHAR(150) NOT NULL,
  telefono      VARCHAR(30),
  especialidad  VARCHAR(100),
  estado        BOOLEAN      NOT NULL DEFAULT TRUE,
  usuario       VARCHAR(80)  UNIQUE,
  password_hash VARCHAR(255)
);
COMMENT ON TABLE tecnicos IS 'Tecnicos de campo con acceso desde la app movil.';

CREATE INDEX idx_tecnicos_id_usuario ON tecnicos(id_usuario);

-- =====================================================================
-- 3. CLIENTES (app movil del cliente / portal)
--    Usado por: clienteService, seed
-- =====================================================================
CREATE TABLE clientes (
  id_cliente       SERIAL PRIMARY KEY,
  nombre           VARCHAR(200) NOT NULL,
  ci_nit           VARCHAR(30)  UNIQUE,
  direccion        VARCHAR(255),
  telefono         VARCHAR(30),
  email            VARCHAR(150),
  usuario          VARCHAR(80)  UNIQUE,
  password_hash    VARCHAR(255),
  estado           BOOLEAN      NOT NULL DEFAULT TRUE,
  saldo_pendiente  NUMERIC(12,2) NOT NULL DEFAULT 0,
  fecha_ultimo_pago DATE,
  metodo_pago      VARCHAR(40)
);
COMMENT ON TABLE clientes IS 'Clientes del servicio con acceso a su medidor y pagos.';

-- =====================================================================
-- 4. MEDIDORES
--    Usado por: medidorService, medidorController, clienteService
--    Coordenadas GPS: latitud / longitud (WGS84)
-- =====================================================================
CREATE TABLE medidores (
  id_medidor           SERIAL PRIMARY KEY,
  id_cliente           INTEGER       REFERENCES clientes(id_cliente) ON DELETE SET NULL,
  id_tecnico           INTEGER       REFERENCES tecnicos(id_tecnico) ON DELETE SET NULL,
  id_usuario_registro  INTEGER       REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  codigo_medidor       VARCHAR(60)   NOT NULL UNIQUE,
  marca                VARCHAR(80),
  modelo               VARCHAR(80),
  numero_serie         VARCHAR(80)   UNIQUE,
  direccion            VARCHAR(255),
  latitud              NUMERIC(10,7),
  longitud             NUMERIC(10,7),
  fecha_instalacion    DATE,
  estado               VARCHAR(30)   NOT NULL DEFAULT 'Instalado',
  observaciones        TEXT
);
COMMENT ON TABLE medidores IS 'Medidores geolocalizados instalados.';
COMMENT ON COLUMN medidores.latitud  IS 'Latitud WGS84, ej: -22.0300000';
COMMENT ON COLUMN medidores.longitud IS 'Longitud WGS84, ej: -63.6800000';

CREATE INDEX idx_medidores_cliente ON medidores(id_cliente);
CREATE INDEX idx_medidores_tecnico ON medidores(id_tecnico);
CREATE INDEX idx_medidores_estado  ON medidores(estado);

-- =====================================================================
-- 5. LECTURAS
--    Usado por: lecturaService, clienteService, reporteService
--    consumo se calcula automaticamente (lectura_actual - lectura_anterior)
-- =====================================================================
CREATE TABLE lecturas (
  id_lectura        SERIAL PRIMARY KEY,
  id_medidor        INTEGER       NOT NULL REFERENCES medidores(id_medidor) ON DELETE CASCADE,
  id_tecnico        INTEGER       REFERENCES tecnicos(id_tecnico) ON DELETE SET NULL,
  fecha_lectura     DATE          NOT NULL DEFAULT CURRENT_DATE,
  lectura_anterior  NUMERIC(12,2) NOT NULL DEFAULT 0,
  lectura_actual    NUMERIC(12,2) NOT NULL,
  consumo           NUMERIC(12,2) GENERATED ALWAYS AS (lectura_actual - lectura_anterior) STORED,
  observaciones     TEXT,
  foto_url          VARCHAR(255),
  latitud_lectura   NUMERIC(10,7),
  longitud_lectura  NUMERIC(10,7),
  tipo_trabajo      VARCHAR(30)   NOT NULL DEFAULT 'lectura',
  fecha_registro    TIMESTAMP     NOT NULL DEFAULT NOW()
);
COMMENT ON COLUMN lecturas.tipo_trabajo IS 'lectura, instalacion, reparacion, danado, robo, etc.';
COMMENT ON COLUMN lecturas.consumo      IS 'Columna generada: lectura_actual - lectura_anterior.';

CREATE INDEX idx_lecturas_medidor ON lecturas(id_medidor);
CREATE INDEX idx_lecturas_tecnico ON lecturas(id_tecnico);
CREATE INDEX idx_lecturas_fecha   ON lecturas(fecha_lectura);

-- =====================================================================
-- 6. TAREAS (asignadas a tecnicos)
--    Usado por: tareaService, tareaController
-- =====================================================================
CREATE TABLE tareas (
  id_tarea            SERIAL PRIMARY KEY,
  id_tecnico          INTEGER      REFERENCES tecnicos(id_tecnico) ON DELETE SET NULL,
  id_usuario_creador  INTEGER      REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  id_medidor          INTEGER      REFERENCES medidores(id_medidor) ON DELETE SET NULL,
  titulo              VARCHAR(200) NOT NULL,
  descripcion         TEXT,
  tipo                VARCHAR(60),
  fecha_programada    DATE,
  hora_programada     TIME,
  prioridad           VARCHAR(20)  NOT NULL DEFAULT 'Normal',
  estado              VARCHAR(20)  NOT NULL DEFAULT 'Pendiente',
  fecha_completada    TIMESTAMP,
  notificacion_leida  BOOLEAN      NOT NULL DEFAULT FALSE,
  fecha_creacion      TIMESTAMP    NOT NULL DEFAULT NOW()
);
COMMENT ON COLUMN tareas.estado IS 'Pendiente, En Proceso, Completada, Cancelada.';

CREATE INDEX idx_tareas_tecnico ON tareas(id_tecnico);
CREATE INDEX idx_tareas_estado  ON tareas(estado);
CREATE INDEX idx_tareas_fecha   ON tareas(fecha_programada);

-- =====================================================================
-- 7. TICKETS (reclamos del cliente)
--    Usado por: clienteService.crearTicket / getTickets
-- =====================================================================
CREATE TABLE tickets (
  id_ticket      SERIAL PRIMARY KEY,
  id_cliente     INTEGER      NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  tipo           VARCHAR(60),
  descripcion    TEXT,
  estado         VARCHAR(20)  NOT NULL DEFAULT 'Abierto',
  fecha_creacion TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_cliente ON tickets(id_cliente);

-- =====================================================================
-- 8. PAGOS (pagos y QR)
--    Usado por: clienteService.getSaldo / pagarQR / getPagoDetalle
-- =====================================================================
CREATE TABLE pagos (
  id_pago    SERIAL PRIMARY KEY,
  id_cliente INTEGER       NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  monto      NUMERIC(12,2) NOT NULL,
  metodo     VARCHAR(40)   NOT NULL DEFAULT 'QR',
  estado     VARCHAR(20)   NOT NULL DEFAULT 'completado',
  referencia VARCHAR(60)   UNIQUE,
  fecha_pago TIMESTAMP     NOT NULL DEFAULT NOW(),
  periodo    VARCHAR(20)
);

CREATE INDEX idx_pagos_cliente ON pagos(id_cliente);
CREATE INDEX idx_pagos_fecha   ON pagos(fecha_pago);

-- =====================================================================
-- 9. CONSUMO HORARIO (mediciones por hora para graficos)
--    Usado por: clienteService.getConsumoDiario / getConsumoPorHora
-- =====================================================================
CREATE TABLE consumo_horario (
  id_consumo  SERIAL PRIMARY KEY,
  id_medidor  INTEGER       NOT NULL REFERENCES medidores(id_medidor) ON DELETE CASCADE,
  fecha       DATE          NOT NULL,
  hora        SMALLINT      NOT NULL CHECK (hora BETWEEN 0 AND 23),
  consumo_kwh NUMERIC(12,3) NOT NULL DEFAULT 0,
  CONSTRAINT uq_consumo_horario UNIQUE (id_medidor, fecha, hora)
);

CREATE INDEX idx_consumo_medidor_fecha ON consumo_horario(id_medidor, fecha);

-- =====================================================================
-- OPCIONAL: PostGIS (solo si instalaste la extension PostGIS 3.x)
-- Descomenta este bloque para agregar un indice geoespacial eficiente.
-- =====================================================================
-- CREATE EXTENSION IF NOT EXISTS postgis;
-- ALTER TABLE medidores
--   ADD COLUMN ubicacion GEOGRAPHY(Point, 4326)
--   GENERATED ALWAYS AS (
--     CASE WHEN latitud IS NOT NULL AND longitud IS NOT NULL
--          THEN ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)::geography
--     END
--   ) STORED;
-- CREATE INDEX idx_medidores_ubicacion ON medidores USING GIST (ubicacion);

-- =====================================================================
--  SETAR YACUIBA - Datos iniciales (seed)
--  Ejecutar DESPUES de schema.sql, conectado a la base sistema_medidores.
--  Todos los inserts usan ON CONFLICT DO NOTHING para poder reejecutarse.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Usuarios del sistema
--   admin    / admin123
--   consulta / admin123
-- ---------------------------------------------------------------------
INSERT INTO usuarios (nombre, usuario, password, rol, estado) VALUES
  ('Administrador SETAR', 'admin',
   '$2b$10$11zCJ6PURA6Y2rY5nXP1RedySFgBXgPWEN2C1hooOSTc76HhXfi/O', 'admin',    TRUE),
  ('Usuario Consulta',    'consulta',
   '$2b$10$11zCJ6PURA6Y2rY5nXP1RedySFgBXgPWEN2C1hooOSTc76HhXfi/O', 'consulta', TRUE)
ON CONFLICT (usuario) DO NOTHING;

-- ---------------------------------------------------------------------
-- Tecnicos (app movil)    usuario / contrasena: tecnico1 / setar2026
-- ---------------------------------------------------------------------
INSERT INTO tecnicos (id_usuario, nombre, telefono, especialidad, estado, usuario, password_hash) VALUES
  ((SELECT id_usuario FROM usuarios WHERE usuario = 'admin'),
   'Carlos Mamani', '70011223', 'Electromecanica', TRUE, 'tecnico1',
   '$2b$10$p62F/RyoeYwIhRpDfeJVqefWJDOHCnBY5/o4pSV1VYFq.MWDcWvlu')
ON CONFLICT (usuario) DO NOTHING;

-- ---------------------------------------------------------------------
-- Clientes    usuario / contrasena: juan / cliente1234
-- ---------------------------------------------------------------------
INSERT INTO clientes (nombre, ci_nit, direccion, telefono, email, usuario, password_hash, estado, saldo_pendiente) VALUES
  ('Juan Perez', '1234567', 'Av. San Martin #123, Yacuiba', '70111111',
   'juan@mail.com', 'juan',
   '$2b$10$1Jb8W23FFZiFf5bYv0J4lO.NxgB2XEweSHM5Eum4G9Bk6irNxVlOi', TRUE, 150.00)
ON CONFLICT (usuario) DO NOTHING;

-- ---------------------------------------------------------------------
-- Medidores geolocalizados (Yacuiba, Bolivia ~ -22.03, -63.68)
-- ---------------------------------------------------------------------
INSERT INTO medidores (
  id_cliente, id_tecnico, id_usuario_registro,
  codigo_medidor, marca, modelo, numero_serie,
  direccion, latitud, longitud, fecha_instalacion, estado, observaciones
) VALUES (
  (SELECT id_cliente FROM clientes WHERE usuario = 'juan'),
  (SELECT id_tecnico FROM tecnicos WHERE usuario = 'tecnico1'),
  (SELECT id_usuario FROM usuarios WHERE usuario = 'admin'),
  'MED-0001', 'Itron', 'SL7000', 'SN-ITR-0001',
  'Av. San Martin #123, Yacuiba', -22.0325400, -63.6774200,
  CURRENT_DATE, 'Instalado', 'Medidor de prueba'
)
ON CONFLICT (codigo_medidor) DO NOTHING;

-- ---------------------------------------------------------------------
-- Lecturas (consumo se calcula solo)
-- ---------------------------------------------------------------------
INSERT INTO lecturas (
  id_medidor, id_tecnico, fecha_lectura,
  lectura_anterior, lectura_actual, observaciones,
  latitud_lectura, longitud_lectura, tipo_trabajo
) VALUES (
  (SELECT id_medidor FROM medidores WHERE codigo_medidor = 'MED-0001'),
  (SELECT id_tecnico FROM tecnicos WHERE usuario = 'tecnico1'),
  CURRENT_DATE, 1250.00, 1318.50, 'Lectura normal',
  -22.0325400, -63.6774200, 'lectura'
)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------
-- Consumo horario de ejemplo (ultimas 24 horas)
-- ---------------------------------------------------------------------
INSERT INTO consumo_horario (id_medidor, fecha, hora, consumo_kwh)
SELECT (SELECT id_medidor FROM medidores WHERE codigo_medidor = 'MED-0001'),
       CURRENT_DATE, h, (random() * 0.5)::NUMERIC(12,3)
FROM generate_series(0, 23) AS h
ON CONFLICT (id_medidor, fecha, hora) DO NOTHING;

-- ---------------------------------------------------------------------
-- Tarea asignada al tecnico
-- ---------------------------------------------------------------------
INSERT INTO tareas (
  id_tecnico, id_usuario_creador, id_medidor,
  titulo, descripcion, tipo, fecha_programada, hora_programada, prioridad, estado
) VALUES (
  (SELECT id_tecnico FROM tecnicos WHERE usuario = 'tecnico1'),
  (SELECT id_usuario FROM usuarios WHERE usuario = 'admin'),
  (SELECT id_medidor FROM medidores WHERE codigo_medidor = 'MED-0001'),
  'Lectura mensual MED-0001', 'Tomar lectura del medidor y registrar GPS',
  'lectura', CURRENT_DATE, '09:00', 'Normal', 'Pendiente'
)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------
-- Ticket de ejemplo
-- ---------------------------------------------------------------------
INSERT INTO tickets (id_cliente, tipo, descripcion, estado)
VALUES (
  (SELECT id_cliente FROM clientes WHERE usuario = 'juan'),
  'Reclamo', 'Falta de energia en la zona desde ayer', 'Abierto'
)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------
-- Pago de ejemplo
-- ---------------------------------------------------------------------
INSERT INTO pagos (id_cliente, monto, metodo, estado, referencia, periodo)
VALUES (
  (SELECT id_cliente FROM clientes WHERE usuario = 'juan'),
  120.00, 'QR', 'completado', 'QR-DEMO-0001',
  TO_CHAR(CURRENT_DATE, 'MM-YYYY')
)
ON CONFLICT (referencia) DO NOTHING;

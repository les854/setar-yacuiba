// backend/src/services/clienteService.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'setar_yacuiba_secret_2026';

// ============================================
// LOGIN de cliente
// ============================================
exports.login = async (usuario, password) => {
  console.log(' Login cliente:', usuario);

  const result = await pool.query(`
    SELECT 
      id_cliente, nombre, ci_nit, direccion, telefono, 
      email, usuario, password_hash
    FROM clientes
    WHERE usuario = $1
  `, [usuario.toLowerCase().trim()]);

  console.log(' Filas encontradas:', result.rows.length);

  if (result.rows.length === 0) {
    const err = new Error('Usuario o contraseña incorrectos');
    err.status = 401;
    throw err;
  }

  const row = result.rows[0];

  // Comparar contraseña
  let passwordValida = false;
  if (row.password_hash && (row.password_hash.startsWith('$2b$') || row.password_hash.startsWith('$2a$'))) {
    passwordValida = await bcrypt.compare(password, row.password_hash);
  } else {
    passwordValida = password === row.password_hash;
  }

  console.log(' Password válida:', passwordValida);

  if (!passwordValida) {
    const err = new Error('Usuario o contraseña incorrectos');
    err.status = 401;
    throw err;
  }

  // Generar token
  const token = jwt.sign(
    { id_cliente: row.id_cliente, usuario: row.usuario, rol: 'cliente' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return {
    token,
    cliente: {
      id_cliente: row.id_cliente,
      nombre: row.nombre,
      ci_nit: row.ci_nit,
      direccion: row.direccion,
      telefono: row.telefono,
      email: row.email,
      usuario: row.usuario,
    },
  };
};

// ============================================
// Todas las lecturas
// ============================================
exports.findAll = async () => {
  const result = await pool.query(`
    SELECT 
      c.id_cliente, c.nombre, c.ci_nit, c.direccion, 
      c.telefono, c.email, c.estado, c.usuario
    FROM clientes c
    ORDER BY c.id_cliente
  `);
  return result.rows;
};

// ============================================
// Cliente por ID
// ============================================
exports.findById = async (id) => {
  const result = await pool.query(`
    SELECT 
      id_cliente, nombre, ci_nit, direccion, 
      telefono, email, estado, usuario
    FROM clientes
    WHERE id_cliente = $1
  `, [id]);
  return result.rows[0] || null;
};

// ============================================
// Medidor del cliente
// ============================================
exports.getMedidor = async (idCliente) => {
  const result = await pool.query(`
    SELECT 
      m.id_medidor, m.codigo_medidor, m.marca, m.modelo,
      m.numero_serie, m.direccion, m.latitud, m.longitud,
      m.fecha_instalacion, m.estado,
      (SELECT lectura_actual FROM lecturas 
       WHERE id_medidor = m.id_medidor 
       ORDER BY fecha_lectura DESC LIMIT 1) AS ultima_lectura,
      (SELECT fecha_lectura FROM lecturas 
       WHERE id_medidor = m.id_medidor 
       ORDER BY fecha_lectura DESC LIMIT 1) AS fecha_ultima_lectura
    FROM medidores m
    WHERE m.id_cliente = $1
    LIMIT 1
  `, [idCliente]);
  return result.rows[0] || null;
};

// ============================================
// Consumo diario (últimos 30 días)
// ============================================
exports.getConsumoDiario = async (idMedidor) => {
  const result = await pool.query(`
    SELECT 
      fecha,
      SUM(consumo_kwh) AS consumo_total
    FROM consumo_horario
    WHERE id_medidor = $1
    AND fecha >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY fecha
    ORDER BY fecha DESC
  `, [idMedidor]);
  return result.rows;
};

// ============================================
// Consumo por hora
// ============================================
exports.getConsumoPorHora = async (idMedidor, fecha) => {
  const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

  const result = await pool.query(`
    SELECT 
      gs.hora,
      COALESCE(ch.consumo_kwh, 0) AS consumo_kwh
    FROM generate_series(0, 23) AS gs(hora)
    LEFT JOIN consumo_horario ch 
      ON ch.hora = gs.hora 
      AND ch.id_medidor = $1 
      AND ch.fecha = $2
    ORDER BY gs.hora
  `, [idMedidor, fechaConsulta]);

  return {
    fecha: fechaConsulta,
    horas: result.rows,
  };
};

// ============================================
// Historial de lecturas
// ============================================
exports.getHistorialLecturas = async (idMedidor) => {
  const result = await pool.query(`
    SELECT 
      id_lectura, fecha_lectura, lectura_anterior, lectura_actual,
      consumo, observaciones, tipo_trabajo
    FROM lecturas
    WHERE id_medidor = $1
    ORDER BY fecha_lectura DESC
    LIMIT 20
  `, [idMedidor]);
  return result.rows;
};

// ============================================
// Crear ticket de reclamo
// ============================================
exports.crearTicket = async (data) => {
  const { id_cliente, tipo, descripcion } = data;

  const result = await pool.query(`
    INSERT INTO tickets (id_cliente, tipo, descripcion)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [id_cliente, tipo, descripcion]);

  return result.rows[0];
};

// ============================================
// Tickets del cliente
// ============================================
exports.getTickets = async (idCliente) => {
  const result = await pool.query(`
    SELECT * FROM tickets
    WHERE id_cliente = $1
    ORDER BY fecha_creacion DESC
  `, [idCliente]);
  return result.rows;
};
// ============================================
// Obtener saldo del cliente
// ============================================
exports.getSaldo = async (idCliente) => {
  const result = await pool.query(`
    SELECT 
      id_cliente, nombre, saldo_pendiente, 
      fecha_ultimo_pago, metodo_pago
    FROM clientes
    WHERE id_cliente = $1
  `, [idCliente]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  // Historial de pagos
  const pagosResult = await pool.query(`
    SELECT id_pago, monto, metodo, estado, referencia, fecha_pago
    FROM pagos
    WHERE id_cliente = $1
    ORDER BY fecha_pago DESC
    LIMIT 10
  `, [idCliente]);

  return {
    saldo_pendiente: parseFloat(row.saldo_pendiente || 0),
    fecha_ultimo_pago: row.fecha_ultimo_pago,
    metodo_pago: row.metodo_pago,
    historial_pagos: pagosResult.rows,
  };
};

// ============================================
// Procesar pago con QR
// ============================================
exports.pagarQR = async (idCliente, monto, metodo) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Generar referencia única
    const referencia = 'QR-' + Date.now();

    // Registrar pago
    const pagoResult = await client.query(`
      INSERT INTO pagos (id_cliente, monto, metodo, estado, referencia)
      VALUES ($1, $2, $3, 'completado', $4)
      RETURNING *
    `, [idCliente, monto, metodo || 'QR', referencia]);

    // Actualizar saldo del cliente
    await client.query(`
      UPDATE clientes 
      SET saldo_pendiente = GREATEST(saldo_pendiente - $1, 0),
          fecha_ultimo_pago = CURRENT_DATE,
          metodo_pago = $2
      WHERE id_cliente = $3
    `, [monto, metodo || 'QR', idCliente]);

    await client.query('COMMIT');

    return {
      message: 'Pago registrado correctamente',
      pago: pagoResult.rows[0],
      referencia,
    };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
// ============================================
// Obtener detalles completos de un pago (para PDF)
// ============================================
exports.getPagoDetalle = async (idPago) => {
  const result = await pool.query(`
    SELECT 
      p.id_pago, p.monto, p.metodo, p.estado, p.referencia, 
      p.fecha_pago, p.periodo,
      c.id_cliente, c.nombre, c.ci_nit, c.direccion, c.telefono,
      m.codigo_medidor, m.direccion AS medidor_direccion
    FROM pagos p
    INNER JOIN clientes c ON p.id_cliente = c.id_cliente
    LEFT JOIN medidores m ON m.id_cliente = c.id_cliente
    WHERE p.id_pago = $1
    LIMIT 1
  `, [idPago]);

  return result.rows[0] || null;
};

// ============================================
// Historial completo de pagos
// ============================================
exports.getHistorialPagos = async (idCliente) => {
  const result = await pool.query(`
    SELECT 
      id_pago, monto, metodo, estado, referencia, 
      fecha_pago, periodo
    FROM pagos
    WHERE id_cliente = $1
    ORDER BY fecha_pago DESC
    LIMIT 50
  `, [idCliente]);

  return result.rows;
};
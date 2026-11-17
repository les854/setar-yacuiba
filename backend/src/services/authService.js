// backend/src/services/authService.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'setar_yacuiba_secret_2026';

exports.login = async (usuario, password) => {
  console.log(' Login intento:', usuario);

  // Buscar técnico por usuario
  const result = await pool.query(`
    SELECT 
      id_tecnico, id_usuario, nombre, telefono,
      especialidad, estado, usuario, password_hash
    FROM tecnicos
    WHERE usuario = $1
  `, [usuario.toLowerCase().trim()]);

  console.log(' Filas encontradas:', result.rows.length);

  if (result.rows.length === 0) {
    const err = new Error('Usuario o contraseña incorrectos');
    err.status = 401;
    throw err;
  }

  const row = result.rows[0];

  if (row.estado !== true) {
    const err = new Error('Técnico inactivo');
    err.status = 403;
    throw err;
  }

  // Comparar password
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

  //  GENERAR TOKEN
  const token = jwt.sign(
    {
      id_tecnico: row.id_tecnico,
      usuario: row.usuario,
      nombre: row.nombre,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  console.log(' Token generado para:', row.usuario);
  console.log(' Token (primeros 30):', token.substring(0, 30) + '...');

  return {
    token,   //  EL TOKEN VA AQUÍ
    tecnico: {
      id_tecnico: row.id_tecnico,
      id_usuario: row.id_usuario,
      nombre: row.nombre,
      telefono: row.telefono,
      especialidad: row.especialidad,
      estado: row.estado,
      usuario: row.usuario,
    },
  };
};
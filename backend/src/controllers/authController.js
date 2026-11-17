// backend/src/controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'setar_yacuiba_secret_2026';

// ============================================
// LOGIN GENERAL (usuarios del sistema)
// ============================================
exports.login = async (req, res, next) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }

    const result = await pool.query(`
      SELECT id_usuario, nombre, usuario, password, rol, estado
      FROM usuarios
      WHERE usuario = $1
    `, [usuario.toLowerCase().trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const row = result.rows[0];

    let passwordValida = false;
    if (row.password && (row.password.startsWith('$2b$') || row.password.startsWith('$2a$'))) {
      passwordValida = await bcrypt.compare(password, row.password);
    } else {
      passwordValida = password === row.password;
    }

    if (!passwordValida) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id_usuario: row.id_usuario, usuario: row.usuario, rol: row.rol },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      usuario: {
        id_usuario: row.id_usuario,
        nombre: row.nombre,
        usuario: row.usuario,
        rol: row.rol,
      },
    });
  } catch (err) {
    console.error('Error login:', err);
    next(err);
  }
};

// ============================================
//  LOGIN DE TÉCNICOS (app móvil)
// ============================================
exports.loginTecnico = async (req, res, next) => {
  try {
    const { usuario, password } = req.body;

    console.log(' Login técnico:', usuario);

    if (!usuario || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }

    // Buscar directamente en la tabla tecnicos
    const result = await pool.query(`
      SELECT 
        id_tecnico, id_usuario, nombre, telefono,
        especialidad, estado, usuario, password_hash
      FROM tecnicos
      WHERE usuario = $1
    `, [usuario.toLowerCase().trim()]);

    console.log(' Filas encontradas:', result.rows.length);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const row = result.rows[0];

    if (row.estado !== true) {
      return res.status(403).json({ message: 'Técnico inactivo' });
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
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
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

    res.json({
      token,   //  EL TOKEN
      tecnico: {
        id_tecnico: row.id_tecnico,
        id_usuario: row.id_usuario,
        nombre: row.nombre,
        telefono: row.telefono,
        especialidad: row.especialidad,
        estado: row.estado,
        usuario: row.usuario,
      },
    });
  } catch (err) {
    console.error('Error login técnico:', err);
    next(err);
  }
};

// ============================================
// REGISTER
// ============================================
exports.register = async (req, res, next) => {
  try {
    const { nombre, usuario, password, rol } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO usuarios (nombre, usuario, password, rol, estado)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id_usuario, nombre, usuario, rol
    `, [nombre || usuario, usuario.toLowerCase().trim(), hash, rol || 'Usuario']);

    res.status(201).json({
      message: 'Usuario creado',
      usuario: result.rows[0],
    });
  } catch (err) {
    console.error('Error register:', err);
    next(err);
  }
};

// ============================================
// PROFILE
// ============================================
exports.profile = async (req, res) => {
  res.json({ message: 'Profile endpoint', user: req.user });
};
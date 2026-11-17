// backend/src/services/usuarioService.js
const pool = require('../db');
const bcrypt = require('bcryptjs');

const usuarioService = {
  async findAll() {
    const result = await pool.query(`
      SELECT id_usuario, nombre, usuario, rol, estado, fecha_registro
      FROM usuarios
      ORDER BY id_usuario DESC
    `);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id_usuario, nombre, usuario, rol, estado, fecha_registro
       FROM usuarios WHERE id_usuario = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async create(data) {
    // Verificar que el usuario no exista
    const existe = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE usuario = $1',
      [data.usuario]
    );
    if (existe.rows.length > 0) {
      throw { status: 400, message: 'El usuario ya existe' };
    }

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, usuario, password, rol, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nombre, usuario, rol, estado, fecha_registro`,
      [
        data.nombre,
        data.usuario,
        data.password || 'HASH_DEFAULT',
        data.rol || 'Usuario',
        data.estado ?? true,
      ]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE usuarios SET
        nombre = COALESCE($1, nombre),
        rol = COALESCE($2, rol),
        estado = COALESCE($3, estado)
       WHERE id_usuario = $4
       RETURNING id_usuario, nombre, usuario, rol, estado, fecha_registro`,
      [data.nombre, data.rol, data.estado, id]
    );
    return result.rows[0];
  },

  async remove(id) {
    await pool.query('DELETE FROM usuarios WHERE id_usuario = $1', [id]);
    return true;
  },

  async desactivar(id) {
    const result = await pool.query(
      'UPDATE usuarios SET estado = FALSE WHERE id_usuario = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },

  async reactivar(id) {
    const result = await pool.query(
      'UPDATE usuarios SET estado = TRUE WHERE id_usuario = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },

  async removeDefinitivo(id) {
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = usuarioService;
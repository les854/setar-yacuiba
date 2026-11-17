const pool = require('../db');

const tecnicoService = {
  async findAll() {
    const result = await pool.query(`
      SELECT t.*, u.usuario, u.nombre AS usuario_nombre
      FROM tecnicos t
      LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
      ORDER BY t.id_tecnico DESC
    `);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM tecnicos WHERE id_tecnico = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async create(data) {
    const result = await pool.query(
      `INSERT INTO tecnicos (id_usuario, nombre, telefono, especialidad, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.id_usuario, data.nombre, data.telefono, data.especialidad, data.estado ?? true]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE tecnicos SET
        id_usuario = COALESCE($1, id_usuario),
        nombre = COALESCE($2, nombre),
        telefono = COALESCE($3, telefono),
        especialidad = COALESCE($4, especialidad),
        estado = COALESCE($5, estado)
       WHERE id_tecnico = $6
       RETURNING *`,
      [data.id_usuario, data.nombre, data.telefono, data.especialidad, data.estado, id]
    );
    return result.rows[0];
  },

  async remove(id) {
    await pool.query('DELETE FROM tecnicos WHERE id_tecnico = $1', [id]);
    return true;
  },

  // DESACTIVAR
  async desactivar(id) {
    const result = await pool.query(
      'UPDATE tecnicos SET estado = FALSE WHERE id_tecnico = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },

  // REACTIVAR
  async reactivar(id) {
    const result = await pool.query(
      'UPDATE tecnicos SET estado = TRUE WHERE id_tecnico = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },

  // ELIMINAR DEFINITIVO
  async removeDefinitivo(id) {
    const result = await pool.query(
      'DELETE FROM tecnicos WHERE id_tecnico = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = tecnicoService;
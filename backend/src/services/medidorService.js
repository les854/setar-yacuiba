const pool = require('../db');

const medidorService = {
  async findAll() {
    const result = await pool.query(`
      SELECT m.*, 
             c.nombre AS cliente_nombre, 
             c.ci_nit AS cliente_ci,
             t.nombre AS tecnico_nombre,
             t.especialidad AS tecnico_especialidad
      FROM medidores m
      LEFT JOIN clientes c ON m.id_cliente = c.id_cliente
      LEFT JOIN tecnicos t ON m.id_tecnico = t.id_tecnico
      ORDER BY m.id_medidor DESC
    `);
    return result.rows;
  },

  async findAllGeo() {
    const result = await pool.query(`
      SELECT id_medidor, codigo_medidor, latitud, longitud, estado, direccion
      FROM medidores
      WHERE latitud IS NOT NULL AND longitud IS NOT NULL
    `);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(`
      SELECT m.*, 
             c.nombre AS cliente_nombre,
             t.nombre AS tecnico_nombre
      FROM medidores m
      LEFT JOIN clientes c ON m.id_cliente = c.id_cliente
      LEFT JOIN tecnicos t ON m.id_tecnico = t.id_tecnico
      WHERE m.id_medidor = $1
    `, [id]);
    return result.rows[0] || null;
  },

  async create(data) {
    const result = await pool.query(`
      INSERT INTO medidores (
        id_cliente, id_tecnico, id_usuario_registro,
        codigo_medidor, marca, modelo, numero_serie,
        direccion, latitud, longitud, fecha_instalacion,
        estado, observaciones
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      data.id_cliente, data.id_tecnico, data.id_usuario_registro,
      data.codigo_medidor, data.marca, data.modelo, data.numero_serie,
      data.direccion, data.latitud, data.longitud, data.fecha_instalacion,
      data.estado || 'Instalado', data.observaciones
    ]);
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(`
      UPDATE medidores 
      SET 
        id_cliente = COALESCE($1, id_cliente),
        id_tecnico = COALESCE($2, id_tecnico),
        codigo_medidor = COALESCE($3, codigo_medidor),
        marca = COALESCE($4, marca),
        modelo = COALESCE($5, modelo),
        numero_serie = COALESCE($6, numero_serie),
        direccion = COALESCE($7, direccion),
        latitud = COALESCE($8, latitud),
        longitud = COALESCE($9, longitud),
        fecha_instalacion = COALESCE($10, fecha_instalacion),
        estado = COALESCE($11, estado),
        observaciones = COALESCE($12, observaciones)
      WHERE id_medidor = $13
      RETURNING *
    `, [
      data.id_cliente, data.id_tecnico, data.codigo_medidor, data.marca, data.modelo,
      data.numero_serie, data.direccion, data.latitud, data.longitud,
      data.fecha_instalacion, data.estado, data.observaciones, id
    ]);
    return result.rows[0];
  },

  async remove(id) {
    await pool.query('DELETE FROM medidores WHERE id_medidor = $1', [id]);
    return true;
  },

  async count() {
    const result = await pool.query('SELECT COUNT(*) FROM medidores');
    return parseInt(result.rows[0].count);
  }
};



module.exports = medidorService;
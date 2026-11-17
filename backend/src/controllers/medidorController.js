// backend/src/controllers/medidorController.js
const pool = require('../db');

// ============================================
// GET - Medidores de un técnico CON última lectura
// ============================================
exports.findByTecnico = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id_medidor, m.codigo_medidor, m.marca, m.modelo,
        m.numero_serie, m.direccion, m.latitud, m.longitud,
        m.fecha_instalacion, m.estado,
        c.id_cliente, c.nombre AS cliente_nombre,
        c.ci_nit, c.telefono AS cliente_telefono,
        (SELECT lectura_actual FROM lecturas 
         WHERE id_medidor = m.id_medidor 
         ORDER BY fecha_lectura DESC, fecha_registro DESC LIMIT 1) AS ultima_lectura,
        (SELECT fecha_lectura FROM lecturas 
         WHERE id_medidor = m.id_medidor 
         ORDER BY fecha_lectura DESC, fecha_registro DESC LIMIT 1) AS ultima_lectura_fecha,
        (SELECT tipo_trabajo FROM lecturas 
         WHERE id_medidor = m.id_medidor 
         ORDER BY fecha_lectura DESC, fecha_registro DESC LIMIT 1) AS ultimo_tipo,
        (SELECT COUNT(*) FROM lecturas 
         WHERE id_medidor = m.id_medidor) AS total_lecturas
      FROM medidores m
      INNER JOIN clientes c ON m.id_cliente = c.id_cliente
      WHERE m.id_tecnico = $1
      ORDER BY m.codigo_medidor
    `, [req.params.idTecnico]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error findByTecnico:', error);
    res.status(500).json({ message: 'Error', detalle: error.message });
  }
};

// ============================================
// GET - Todos los medidores
// ============================================
exports.findAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.*,
        c.nombre AS cliente_nombre,
        c.ci_nit, c.telefono AS cliente_telefono
      FROM medidores m
      INNER JOIN clientes c ON m.id_cliente = c.id_cliente
      ORDER BY m.id_medidor
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error findAll:', error);
    res.status(500).json({ message: 'Error', detalle: error.message });
  }
};

// ============================================
// GET - Un medidor por ID
// ============================================
exports.findById = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.*,
        c.nombre AS cliente_nombre,
        c.ci_nit, c.telefono AS cliente_telefono,
        c.email AS cliente_email,
        t.nombre AS tecnico_nombre
      FROM medidores m
      INNER JOIN clientes c ON m.id_cliente = c.id_cliente
      LEFT JOIN tecnicos t ON m.id_tecnico = t.id_tecnico
      WHERE m.id_medidor = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medidor no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error findById:', error);
    res.status(500).json({ message: 'Error', detalle: error.message });
  }
};

// ============================================
// POST - Crear medidor
// ============================================
exports.create = async (req, res) => {
  try {
    const {
      id_cliente, id_tecnico, codigo_medidor, marca, modelo,
      numero_serie, direccion, latitud, longitud, fecha_instalacion, estado,
    } = req.body;

    const result = await pool.query(`
      INSERT INTO medidores (
        id_cliente, id_tecnico, codigo_medidor, marca, modelo,
        numero_serie, direccion, latitud, longitud, fecha_instalacion, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      id_cliente, id_tecnico, codigo_medidor, marca, modelo,
      numero_serie, direccion, latitud, longitud, fecha_instalacion, estado,
    ]);

    res.status(201).json({
      message: 'Medidor creado',
      medidor: result.rows[0],
    });
  } catch (error) {
    console.error('Error create:', error);
    res.status(500).json({ message: 'Error', detalle: error.message });
  }
};

// ============================================
// PUT - Actualizar medidor
// ============================================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      marca, modelo, numero_serie, direccion, latitud, longitud, estado,
    } = req.body;

    const result = await pool.query(`
      UPDATE medidores 
      SET marca = COALESCE($1, marca),
          modelo = COALESCE($2, modelo),
          numero_serie = COALESCE($3, numero_serie),
          direccion = COALESCE($4, direccion),
          latitud = COALESCE($5, latitud),
          longitud = COALESCE($6, longitud),
          estado = COALESCE($7, estado)
      WHERE id_medidor = $8
      RETURNING *
    `, [marca, modelo, numero_serie, direccion, latitud, longitud, estado, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medidor no encontrado' });
    }

    res.json({
      message: 'Medidor actualizado',
      medidor: result.rows[0],
    });
  } catch (error) {
    console.error('Error update:', error);
    res.status(500).json({ message: 'Error', detalle: error.message });
  }
};

// ============================================
// DELETE - Eliminar medidor
// ============================================
exports.delete = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM medidores WHERE id_medidor = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medidor no encontrado' });
    }

    res.json({ message: 'Medidor eliminado' });
  } catch (error) {
    console.error('Error delete:', error);
    res.status(500).json({ message: 'Error', detalle: error.message });
  }
};
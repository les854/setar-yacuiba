// backend/src/controllers/tecnicoController.js
const pool = require('../db');
const bcrypt = require('bcrypt');

// ============================================
// GET - Estadísticas REALES del técnico
// ============================================
exports.getEstadisticas = async (req, res) => {
  const idTecnico = req.params.id;

  try {
    // Total medidores asignados
    const medidoresResult = await pool.query(
      'SELECT COUNT(*) FROM medidores WHERE id_tecnico = $1',
      [idTecnico]
    );

    // Lecturas hoy
    const lecturasHoyResult = await pool.query(`
      SELECT COUNT(*) FROM lecturas 
      WHERE id_tecnico = $1 AND fecha_lectura = CURRENT_DATE
    `, [idTecnico]);

    // Lecturas del mes
    const lecturasMesResult = await pool.query(`
      SELECT COUNT(*) FROM lecturas 
      WHERE id_tecnico = $1 
      AND EXTRACT(MONTH FROM fecha_lectura) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM fecha_lectura) = EXTRACT(YEAR FROM CURRENT_DATE)
    `, [idTecnico]);

    // Tareas pendientes
    const tareasPendientesResult = await pool.query(`
      SELECT COUNT(*) FROM tareas 
      WHERE id_tecnico = $1 AND estado = 'Pendiente'
    `, [idTecnico]);

    // Incidencias (lecturas con tipo dañado/robo)
    const incidenciasResult = await pool.query(`
      SELECT COUNT(*) FROM lecturas 
      WHERE id_tecnico = $1 AND tipo_trabajo IN ('danado', 'robo', 'reparacion')
    `, [idTecnico]);

    res.json({
      total_medidores: parseInt(medidoresResult.rows[0].count),
      lecturas_hoy: parseInt(lecturasHoyResult.rows[0].count),
      lecturas_mes: parseInt(lecturasMesResult.rows[0].count),
      tareas_pendientes: parseInt(tareasPendientesResult.rows[0].count),
      incidencias_reportadas: parseInt(incidenciasResult.rows[0].count),
    });
  } catch (error) {
    console.error('Error estadísticas:', error);
    res.status(500).json({ message: 'Error', detalle: error.message });
  }
};

// ============================================
// GET - Todos los técnicos
// ============================================
exports.findAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id_tecnico, t.id_usuario, t.nombre, t.telefono,
        t.especialidad, t.estado, t.usuario
      FROM tecnicos t
      ORDER BY t.id_tecnico
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error findAll:', error);
    res.status(500).json({ message: 'Error', detalle: error.message });
  }
};

// ============================================
// GET - Un técnico por ID
// ============================================
exports.findById = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id_tecnico, t.id_usuario, t.nombre, t.telefono,
        t.especialidad, t.estado, t.usuario
      FROM tecnicos t
      WHERE t.id_tecnico = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Técnico no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error findById:', error);
    res.status(500).json({ message: 'Error', detalle: error.message });
  }
};

// ============================================
// POST - Crear técnico
// ============================================
exports.create = async (req, res) => {
  try {
    const { nombre, telefono, especialidad, usuario, password } = req.body;

    const hash = await bcrypt.hash(password || 'setar2026', 10);

    const result = await pool.query(`
      INSERT INTO tecnicos (nombre, telefono, especialidad, usuario, password_hash, estado)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id_tecnico, nombre, telefono, especialidad, usuario, estado
    `, [nombre, telefono, especialidad, usuario, hash]);

    res.status(201).json({
      message: 'Técnico creado',
      tecnico: result.rows[0],
    });
  } catch (error) {
    console.error('Error create:', error);
    res.status(500).json({ message: 'Error', detalle: error.message });
  }
};

// ============================================
// PUT - Actualizar técnico
// ============================================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, especialidad, estado } = req.body;

    const result = await pool.query(`
      UPDATE tecnicos 
      SET nombre = COALESCE($1, nombre),
          telefono = COALESCE($2, telefono),
          especialidad = COALESCE($3, especialidad),
          estado = COALESCE($4, estado)
      WHERE id_tecnico = $5
      RETURNING id_tecnico, nombre, telefono, especialidad, estado, usuario
    `, [nombre, telefono, especialidad, estado, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Técnico no encontrado' });
    }

    res.json({
      message: 'Técnico actualizado',
      tecnico: result.rows[0],
    });
  } catch (error) {
    console.error('Error update:', error);
    res.status(500).json({ message: 'Error', detalle: error.message });
  }
};

// ============================================
// DELETE - Eliminar técnico
// ============================================
exports.delete = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tecnicos WHERE id_tecnico = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Técnico no encontrado' });
    }

    res.json({ message: 'Técnico eliminado' });
  } catch (error) {
    console.error('Error delete:', error);
    res.status(500).json({ message: 'Error', detalle: error.message });
  }
};
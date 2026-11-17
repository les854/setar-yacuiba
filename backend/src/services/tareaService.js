// backend/src/services/tareaService.js
const pool = require('../db');

const tareaService = {
  async findAll(filtros = {}) {
    let sql = `
      SELECT 
        t.*,
        tec.nombre AS tecnico_nombre,
        tec.especialidad AS tecnico_especialidad,
        u.nombre AS creador_nombre,
        m.codigo_medidor,
        m.direccion AS medidor_direccion
      FROM tareas t
      LEFT JOIN tecnicos tec ON t.id_tecnico = tec.id_tecnico
      LEFT JOIN usuarios u ON t.id_usuario_creador = u.id_usuario
      LEFT JOIN medidores m ON t.id_medidor = m.id_medidor
      WHERE 1=1
    `;
    const params = [];

    if (filtros.id_tecnico) {
      params.push(filtros.id_tecnico);
      sql += ` AND t.id_tecnico = $${params.length}`;
    }

    if (filtros.estado) {
      params.push(filtros.estado);
      sql += ` AND t.estado = $${params.length}`;
    }

    if (filtros.fecha) {
      params.push(filtros.fecha);
      sql += ` AND t.fecha_programada = $${params.length}`;
    }

    sql += ` ORDER BY t.fecha_programada DESC, t.hora_programada ASC`;

    const result = await pool.query(sql, params);
    return result.rows;
  },

  async findByTecnico(idTecnico) {
    const result = await pool.query(`
      SELECT 
        t.*,
        m.codigo_medidor,
        m.direccion AS medidor_direccion
      FROM tareas t
      LEFT JOIN medidores m ON t.id_medidor = m.id_medidor
      WHERE t.id_tecnico = $1
      ORDER BY t.fecha_programada ASC, t.hora_programada ASC
    `, [idTecnico]);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(`
      SELECT t.*, tec.nombre AS tecnico_nombre
      FROM tareas t
      LEFT JOIN tecnicos tec ON t.id_tecnico = tec.id_tecnico
      WHERE t.id_tarea = $1
    `, [id]);
    return result.rows[0] || null;
  },

  async create(data) {
    const result = await pool.query(`
      INSERT INTO tareas 
        (id_tecnico, id_usuario_creador, id_medidor, titulo, descripcion, 
         tipo, fecha_programada, hora_programada, prioridad)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      data.id_tecnico,
      data.id_usuario_creador,
      data.id_medidor || null,
      data.titulo,
      data.descripcion || null,
      data.tipo,
      data.fecha_programada,
      data.hora_programada,
      data.prioridad || 'Normal',
    ]);
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(`
      UPDATE tareas SET
        titulo = COALESCE($1, titulo),
        descripcion = COALESCE($2, descripcion),
        tipo = COALESCE($3, tipo),
        fecha_programada = COALESCE($4, fecha_programada),
        hora_programada = COALESCE($5, hora_programada),
        estado = COALESCE($6, estado),
        prioridad = COALESCE($7, prioridad)
      WHERE id_tarea = $8
      RETURNING *
    `, [
      data.titulo,
      data.descripcion,
      data.tipo,
      data.fecha_programada,
      data.hora_programada,
      data.estado,
      data.prioridad,
      id,
    ]);
    return result.rows[0];
  },

  async cambiarEstado(id, estado) {
    const fechaCompletada = estado === 'Completada' ? new Date() : null;
    const result = await pool.query(`
      UPDATE tareas 
      SET estado = $1, fecha_completada = $2
      WHERE id_tarea = $3
      RETURNING *
    `, [estado, fechaCompletada, id]);
    return result.rows[0];
  },

  async remove(id) {
    await pool.query('DELETE FROM tareas WHERE id_tarea = $1', [id]);
    return true;
  },

  //  Notificaciones del técnico (tareas no leídas)
  async getNotificaciones(idTecnico) {
    const result = await pool.query(`
      SELECT 
        t.*,
        m.codigo_medidor
      FROM tareas t
      LEFT JOIN medidores m ON t.id_medidor = m.id_medidor
      WHERE t.id_tecnico = $1
        AND t.notificacion_leida = FALSE
        AND t.estado != 'Cancelada'
      ORDER BY t.fecha_programada ASC
      LIMIT 20
    `, [idTecnico]);
    return result.rows;
  },

  async marcarNotificacionLeida(idTarea) {
    const result = await pool.query(
      'UPDATE tareas SET notificacion_leida = TRUE WHERE id_tarea = $1 RETURNING *',
      [idTarea]
    );
    return result.rows[0];
  },
};

module.exports = tareaService;
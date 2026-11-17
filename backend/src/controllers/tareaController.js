// backend/src/controllers/tareaController.js
const tareaService = require('../services/tareaService');
const pool = require('../db');

exports.findAll = async (req, res, next) => {
  try {
    const filtros = {
      id_tecnico: req.query.id_tecnico,
      estado: req.query.estado,
      fecha: req.query.fecha,
    };
    res.json(await tareaService.findAll(filtros));
  } catch (err) {
    next(err);
  }
};

exports.findByTecnico = async (req, res, next) => {
  try {
    res.json(await tareaService.findByTecnico(req.params.idTecnico));
  } catch (err) {
    next(err);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const t = await tareaService.findById(req.params.id);
    t ? res.json(t) : res.status(404).json({ error: 'Tarea no encontrada' });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    res.status(201).json(await tareaService.create(req.body));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    res.json(await tareaService.update(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
};

exports.cambiarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;
    res.json(await tareaService.cambiarEstado(req.params.id, estado));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await tareaService.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// 🎯 Notificaciones del técnico logueado
exports.getMisNotificaciones = async (req, res, next) => {
  try {
    const idUsuario = req.user.id;

    // Buscar el id_tecnico del usuario logueado
    const tecnicoResult = await pool.query(
      'SELECT id_tecnico FROM tecnicos WHERE id_usuario = $1 LIMIT 1',
      [idUsuario]
    );

    if (tecnicoResult.rows.length === 0) {
      return res.json([]);
    }

    const idTecnico = tecnicoResult.rows[0].id_tecnico;
    res.json(await tareaService.getNotificaciones(idTecnico));
  } catch (err) {
    next(err);
  }
};

exports.marcarLeida = async (req, res, next) => {
  try {
    res.json(await tareaService.marcarNotificacionLeida(req.params.id));
  } catch (err) {
    next(err);
  }
};
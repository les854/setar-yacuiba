// backend/src/controllers/usuarioController.js
const usuarioService = require('../services/usuarioService');

exports.findAll = async (req, res, next) => {
  try {
    res.json(await usuarioService.findAll());
  } catch (err) {
    next(err);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const u = await usuarioService.findById(req.params.id);
    u ? res.json(u) : res.status(404).json({ error: 'Usuario no encontrado' });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    res.status(201).json(await usuarioService.create(req.body));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    res.json(await usuarioService.update(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await usuarioService.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.desactivar = async (req, res, next) => {
  try {
    const result = await usuarioService.desactivar(req.params.id);
    if (!result) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario desactivado', usuario: result });
  } catch (err) {
    next(err);
  }
};

exports.reactivar = async (req, res, next) => {
  try {
    const result = await usuarioService.reactivar(req.params.id);
    if (!result) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario reactivado', usuario: result });
  } catch (err) {
    next(err);
  }
};

exports.removeDefinitivo = async (req, res, next) => {
  try {
    const pool = require('../db');
    const { id } = req.params;

    // Verificar si tiene técnicos o medidores asociados
    const tecnicosResult = await pool.query(
      'SELECT COUNT(*) FROM tecnicos WHERE id_usuario = $1',
      [id]
    );
    const totalTecnicos = parseInt(tecnicosResult.rows[0].count);

    if (totalTecnicos > 0) {
      return res.status(400).json({
        error: `No se puede eliminar: el usuario tiene ${totalTecnicos} técnico(s) asociado(s). Desactívalo en su lugar.`,
      });
    }

    const result = await usuarioService.removeDefinitivo(id);
    if (!result) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ mensaje: 'Usuario eliminado definitivamente', usuario: result });
  } catch (err) {
    next(err);
  }
};
// backend/src/controllers/lecturaController.js
const lecturaService = require('../services/lecturaService');

exports.findAll = async (req, res, next) => {
  try {
    res.json(await lecturaService.findAll());
  } catch (err) {
    next(err);
  }
};

exports.findByMedidor = async (req, res, next) => {
  try {
    res.json(await lecturaService.findByMedidor(req.params.idMedidor));
  } catch (err) {
    next(err);
  }
};

exports.getUltimaLectura = async (req, res, next) => {
  try {
    const lectura = await lecturaService.getUltimaLectura(req.params.idMedidor);
    res.json(lectura);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    res.status(201).json(await lecturaService.create(req.body));
  } catch (err) {
    next(err);
  }
};
// backend/src/controllers/reporteController.js
const reporteService = require('../services/reporteService');

exports.getResumen = async (req, res, next) => {
  try {
    res.json(await reporteService.getResumen());
  } catch (err) {
    next(err);
  }
};

exports.getMedidoresPorEstado = async (req, res, next) => {
  try {
    res.json(await reporteService.getMedidoresPorEstado());
  } catch (err) {
    next(err);
  }
};

exports.getMedidoresPorMarca = async (req, res, next) => {
  try {
    res.json(await reporteService.getMedidoresPorMarca());
  } catch (err) {
    next(err);
  }
};

exports.getClientesPorEstado = async (req, res, next) => {
  try {
    res.json(await reporteService.getClientesPorEstado());
  } catch (err) {
    next(err);
  }
};

exports.getLecturasPorMes = async (req, res, next) => {
  try {
    res.json(await reporteService.getLecturasPorMes());
  } catch (err) {
    next(err);
  }
};

exports.getTopMedidores = async (req, res, next) => {
  try {
    res.json(await reporteService.getTopMedidores());
  } catch (err) {
    next(err);
  }
};

exports.getTodo = async (req, res, next) => {
  try {
    const [
      resumen,
      medidoresPorEstado,
      medidoresPorMarca,
      clientesPorEstado,
      lecturasPorMes,
      topMedidores,
    ] = await Promise.all([
      reporteService.getResumen(),
      reporteService.getMedidoresPorEstado(),
      reporteService.getMedidoresPorMarca(),
      reporteService.getClientesPorEstado(),
      reporteService.getLecturasPorMes(),
      reporteService.getTopMedidores(),
    ]);

    res.json({
      resumen,
      medidoresPorEstado,
      medidoresPorMarca,
      clientesPorEstado,
      lecturasPorMes,
      topMedidores,
    });
  } catch (err) {
    next(err);
  }
};
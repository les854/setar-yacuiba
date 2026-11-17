// backend/src/routes/reporteRoutes.js
const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const authMiddleware = require('../middleware/auth');

//  Todos los datos de una vez
router.get('/todo', authMiddleware, reporteController.getTodo);

// Endpoints individuales
router.get('/resumen', reporteController.getResumen);
router.get('/medidores-por-estado', reporteController.getMedidoresPorEstado);
router.get('/medidores-por-marca', reporteController.getMedidoresPorMarca);
router.get('/clientes-por-estado', reporteController.getClientesPorEstado);
router.get('/lecturas-por-mes', reporteController.getLecturasPorMes);
router.get('/top-medidores', reporteController.getTopMedidores);

module.exports = router;
// backend/src/routes/tecnicoRoutes.js
const express = require('express');
const router = express.Router();
const tecnicoController = require('../controllers/tecnicoController');
const authMiddleware = require('../middleware/auth');

// Estadísticas del técnico
router.get('/:id/estadisticas', tecnicoController.getEstadisticas);

// Rutas generales
router.get('/', tecnicoController.findAll);
router.get('/:id', tecnicoController.findById);

// Rutas protegidas
router.post('/', authMiddleware, tecnicoController.create);
router.put('/:id', authMiddleware, tecnicoController.update);
router.delete('/:id', authMiddleware, tecnicoController.delete);

module.exports = router;
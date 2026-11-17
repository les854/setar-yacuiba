// backend/src/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.get('/', usuarioController.findAll);
router.get('/:id', usuarioController.findById);

// Rutas protegidas
router.post('/', authMiddleware, usuarioController.create);
router.put('/:id', authMiddleware, usuarioController.update);

// RUTAS NUEVAS (antes de /:id)
router.patch('/:id/desactivar', authMiddleware, usuarioController.desactivar);
router.patch('/:id/reactivar', authMiddleware, usuarioController.reactivar);
router.delete('/:id/definitivo', authMiddleware, usuarioController.removeDefinitivo);

// Ruta antigua
router.delete('/:id', authMiddleware, usuarioController.remove);

module.exports = router;
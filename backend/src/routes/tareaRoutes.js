// backend/src/routes/tareaRoutes.js
const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tareaController');
const authMiddleware = require('../middleware/auth');

//  RUTAS ESPECÍFICAS PRIMERO (antes de /:id)
router.get('/mis-notificaciones', authMiddleware, tareaController.getMisNotificaciones);
router.get('/tecnico/:idTecnico', tareaController.findByTecnico);

//  Rutas genéricas
router.get('/', tareaController.findAll);
router.get('/:id', tareaController.findById);

// Rutas protegidas
router.post('/', authMiddleware, tareaController.create);
router.put('/:id', authMiddleware, tareaController.update);
router.patch('/:id/estado', authMiddleware, tareaController.cambiarEstado);
router.patch('/:id/leer', authMiddleware, tareaController.marcarLeida);
router.delete('/:id', authMiddleware, tareaController.remove);

module.exports = router;
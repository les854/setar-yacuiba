// backend/src/routes/medidorRoutes.js
const express = require('express');
const router = express.Router();
const medidorController = require('../controllers/medidorController');
const authMiddleware = require('../middleware/auth');


router.get('/tecnico/:idTecnico', medidorController.findByTecnico);

// Rutas generales
router.get('/', medidorController.findAll);
router.get('/:id', medidorController.findById);

// Rutas protegidas
router.post('/', authMiddleware, medidorController.create);
router.put('/:id', authMiddleware, medidorController.update);
router.delete('/:id', authMiddleware, medidorController.delete);

module.exports = router;
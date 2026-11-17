// backend/src/routes/lecturaRoutes.js
const express = require('express');
const router = express.Router();
const lecturaController = require('../controllers/lecturaController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.get('/', lecturaController.findAll);
router.get('/medidor/:idMedidor', lecturaController.findByMedidor);
router.get('/medidor/:idMedidor/ultima', lecturaController.getUltimaLectura);

// Ruta protegida
router.post('/', authMiddleware, lecturaController.create);

module.exports = router;
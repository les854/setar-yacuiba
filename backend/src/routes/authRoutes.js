// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login general (usuarios del sistema)
router.post('/login', authController.login);

//  Login específico de TÉCNICOS (para la app móvil)
router.post('/tecnico/login', authController.loginTecnico);

router.post('/register', authController.register);
router.get('/profile', authController.profile);

module.exports = router;
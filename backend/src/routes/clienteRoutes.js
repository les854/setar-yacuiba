// backend/src/routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

//  LOGIN (PRIMERO, antes de /:id)
router.post('/login', clienteController.login);

// Rutas específicas del cliente (ANTES de /:id)
router.get('/:idCliente/medidor', clienteController.getMedidor);
router.get('/:idCliente/tickets', clienteController.getTickets);
router.post('/:idCliente/tickets', clienteController.crearTicket);

// Consumo (por idMedidor)
router.get('/medidor/:idMedidor/consumo-diario', clienteController.getConsumoDiario);
router.get('/medidor/:idMedidor/consumo-hora', clienteController.getConsumoPorHora);
router.get('/medidor/:idMedidor/lecturas', clienteController.getHistorialLecturas);

// Generales (SIEMPRE al final)
router.get('/', clienteController.findAll);
router.get('/:id', clienteController.findById);
// Pagos
router.get('/:idCliente/saldo', clienteController.getSaldo);
router.get('/:idCliente/historial-pagos', clienteController.getHistorialPagos);
router.post('/:idCliente/pagar-qr', clienteController.pagarQR);
router.post('/', clienteController.create);
router.put('/:id', clienteController.update);
router.delete('/:id', clienteController.delete);

// Recibo PDF
router.get('/pago/:idPago/detalle', clienteController.getPagoDetalle);
router.get('/pago/:idPago/recibo', clienteController.generarPDFRecibo);

module.exports = router;
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');

router.get('/resumen', ctrl.resumenGeneral);
router.get('/restaurantes-mejor-calificados', ctrl.restaurantesMejorCalificados);
router.get('/platillos-mas-vendidos', ctrl.platillosMasVendidos);
router.get('/ventas-por-restaurante', ctrl.ventasPorRestaurante);
router.get('/ventas-por-periodo', ctrl.ventasPorPeriodo);
router.get('/ordenes-por-estado', ctrl.ordenesPorEstado);
router.get('/distribucion-calificaciones/:restauranteId', ctrl.distribucionCalificaciones);

module.exports = router;

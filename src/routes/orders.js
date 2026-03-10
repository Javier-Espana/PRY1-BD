const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');

router.post('/', ctrl.crearOrden);
router.get('/', ctrl.listarOrdenes);
router.get('/usuario/:usuarioId', ctrl.listarOrdenesPorUsuario);
router.get('/restaurante/:restauranteId', ctrl.listarOrdenesPorRestaurante);
router.get('/:id', ctrl.obtenerOrden);
router.patch('/:id/estado', ctrl.actualizarEstadoOrden);
router.post('/:id/items', ctrl.agregarItemAOrden);
router.delete('/:id/items/:menuItemId', ctrl.eliminarItemDeOrden);
router.delete('/:id', ctrl.eliminarOrden);

module.exports = router;

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/menuItemController');

router.post('/', ctrl.crearArticulo);
router.post('/varios', ctrl.crearVariosArticulos);
router.get('/restaurante/:restauranteId', ctrl.listarMenuRestaurante);
router.get('/buscar', ctrl.buscarArticulos);
router.get('/:id', ctrl.obtenerArticulo);
router.put('/:id', ctrl.actualizarArticulo);
router.delete('/:id', ctrl.eliminarArticulo);

module.exports = router;

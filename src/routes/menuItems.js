const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/menuItemController');

router.post('/', ctrl.crearArticulo);
router.post('/varios', ctrl.crearVariosArticulos);
router.patch('/varios', ctrl.actualizarVariosArticulos);
router.delete('/varios', ctrl.eliminarVariosArticulos);
router.get('/restaurante/:restauranteId', ctrl.listarMenuRestaurante);
router.get('/buscar', ctrl.buscarArticulos);
router.get('/:id', ctrl.obtenerArticulo);
router.put('/:id', ctrl.actualizarArticulo);
router.delete('/:id', ctrl.eliminarArticulo);

module.exports = router;

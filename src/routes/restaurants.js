const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/restaurantController');

router.post('/', ctrl.crearRestaurante);
router.get('/', ctrl.listarRestaurantes);
router.get('/cercanos', ctrl.buscarCercanos);
router.get('/buscar', ctrl.buscarPorTexto);
router.get('/categorias', ctrl.obtenerCategorias);
router.get('/:id', ctrl.obtenerRestaurante);
router.put('/:id', ctrl.actualizarRestaurante);
router.delete('/:id', ctrl.eliminarRestaurante);

module.exports = router;

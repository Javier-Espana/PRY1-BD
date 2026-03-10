const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');

router.post('/', ctrl.crearUsuario);
router.get('/', ctrl.listarUsuarios);
router.get('/:id', ctrl.obtenerUsuario);
router.put('/:id', ctrl.actualizarUsuario);
router.delete('/:id', ctrl.eliminarUsuario);

module.exports = router;

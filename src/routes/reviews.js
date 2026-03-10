const express = require('express');
const router = express.Router();
const multer = require('multer');
const ctrl = require('../controllers/reviewController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', ctrl.crearResena);
router.get('/', ctrl.listarResenas);
router.get('/restaurante/:restauranteId', ctrl.listarResenasPorRestaurante);
router.get('/usuario/:usuarioId', ctrl.listarResenasPorUsuario);
router.get('/archivos', ctrl.listarArchivos);
router.get('/archivos/:fileId', ctrl.descargarArchivo);
router.get('/:id', ctrl.obtenerResena);
router.post('/:id/imagenes', upload.single('imagen'), ctrl.agregarImagen);
router.delete('/:id/imagenes/:fileId', ctrl.eliminarImagen);
router.put('/:id', ctrl.actualizarResena);
router.delete('/:id', ctrl.eliminarResena);

module.exports = router;

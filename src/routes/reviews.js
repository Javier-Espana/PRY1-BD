/**
 * Rutas de Reseñas + GridFS.
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const ctrl = require('../controllers/reviewController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', async (req, res) => {
  try {
    const result = await ctrl.crearResena(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { skip, limit } = req.query;
    const result = await ctrl.listarResenas({
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/restaurante/:restauranteId', async (req, res) => {
  try {
    const { skip, limit } = req.query;
    const result = await ctrl.listarResenasPorRestaurante(req.params.restauranteId, {
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const { skip, limit } = req.query;
    const result = await ctrl.listarResenasPorUsuario(req.params.usuarioId, {
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await ctrl.obtenerResena(req.params.id);
    if (!result) return res.status(404).json({ error: 'No encontrada' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subir imagen a reseña (GridFS)
router.post('/:id/imagenes', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
    const result = await ctrl.agregarImagenDesdeBuffer(
      req.params.id,
      req.file.buffer,
      req.file.originalname,
      req.body.descripcion || ''
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Descargar imagen de GridFS
router.get('/archivos/:fileId', async (req, res) => {
  try {
    const stream = ctrl.descargarArchivo(req.params.fileId);
    stream.on('error', () => res.status(404).json({ error: 'Archivo no encontrado' }));
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar imagen de reseña
router.delete('/:id/imagenes/:fileId', async (req, res) => {
  try {
    const result = await ctrl.eliminarImagenDeResena(req.params.id, req.params.fileId);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar archivos en GridFS
router.get('/archivos', async (req, res) => {
  try {
    const result = await ctrl.listarArchivosGridFS();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const result = await ctrl.actualizarResena(req.params.id, req.body);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await ctrl.eliminarResena(req.params.id);
    res.json({ eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

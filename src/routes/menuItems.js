/**
 * Rutas de Artículos del Menú.
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/menuItemController');

router.post('/', async (req, res) => {
  try {
    const result = await ctrl.crearArticulo(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/varios', async (req, res) => {
  try {
    const result = await ctrl.crearVariosArticulos(req.body.articulos);
    res.status(201).json({ insertados: result.insertedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/restaurante/:restauranteId', async (req, res) => {
  try {
    const { skip, limit, solo_disponibles } = req.query;
    const result = await ctrl.listarMenuRestaurante(req.params.restauranteId, {
      soloDisponibles: solo_disponibles !== 'false',
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 50
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/buscar', async (req, res) => {
  try {
    const { texto, limit } = req.query;
    const result = await ctrl.buscarArticulos(texto, parseInt(limit) || 10);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await ctrl.obtenerArticulo(req.params.id);
    if (!result) return res.status(404).json({ error: 'No encontrado' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const result = await ctrl.actualizarArticulo(req.params.id, req.body);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await ctrl.eliminarArticulo(req.params.id);
    res.json({ eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

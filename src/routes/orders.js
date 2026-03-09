/**
 * Rutas de Órdenes.
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');

router.post('/', async (req, res) => {
  try {
    const result = await ctrl.crearOrden(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { skip, limit, estado } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    const result = await ctrl.listarOrdenes({
      filtro,
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
    const result = await ctrl.listarOrdenesPorUsuario(req.params.usuarioId, {
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
    const { skip, limit, estado } = req.query;
    const result = await ctrl.listarOrdenesPorRestaurante(req.params.restauranteId, {
      estado,
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
    const result = await ctrl.obtenerOrden(req.params.id);
    if (!result) return res.status(404).json({ error: 'No encontrada' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado
router.patch('/:id/estado', async (req, res) => {
  try {
    const result = await ctrl.actualizarEstadoOrden(req.params.id, req.body.estado);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Agregar item ($push)
router.post('/:id/items', async (req, res) => {
  try {
    const result = await ctrl.agregarItemAOrden(req.params.id, req.body);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar item ($pull)
router.delete('/:id/items/:menuItemId', async (req, res) => {
  try {
    const result = await ctrl.eliminarItemDeOrden(req.params.id, req.params.menuItemId);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await ctrl.eliminarOrden(req.params.id);
    res.json({ eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

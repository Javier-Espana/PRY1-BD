/**
 * Rutas de Analíticas.
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');

router.get('/resumen', async (req, res) => {
  try {
    const result = await ctrl.resumenGeneral();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/restaurantes-mejor-calificados', async (req, res) => {
  try {
    const { limit } = req.query;
    const result = await ctrl.restaurantesMejorCalificados(parseInt(limit) || 10);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/platillos-mas-vendidos', async (req, res) => {
  try {
    const { limit } = req.query;
    const result = await ctrl.platillosMasVendidos(parseInt(limit) || 10);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ventas-por-restaurante', async (req, res) => {
  try {
    const { limit } = req.query;
    const result = await ctrl.ventasPorRestaurante(parseInt(limit) || 10);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ventas-por-periodo', async (req, res) => {
  try {
    const { periodo, fecha_inicio, fecha_fin } = req.query;
    const result = await ctrl.ventasPorPeriodo(periodo || 'dia', fecha_inicio, fecha_fin);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ordenes-por-estado', async (req, res) => {
  try {
    const result = await ctrl.ordenesPorEstado();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/distribucion-calificaciones/:restauranteId', async (req, res) => {
  try {
    const result = await ctrl.distribucionCalificaciones(req.params.restauranteId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

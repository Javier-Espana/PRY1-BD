/**
 * Rutas de Restaurantes.
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/restaurantController');

// Crear restaurante
router.post('/', async (req, res) => {
  try {
    const result = await ctrl.crearRestaurante(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar restaurantes
router.get('/', async (req, res) => {
  try {
    const { skip, limit, categoria, sort_field, sort_order } = req.query;
    const options = {
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    };
    if (categoria) options.filtro = { categoria };
    if (sort_field) options.sort = { [sort_field]: parseInt(sort_order) || -1 };
    const result = await ctrl.listarRestaurantes(options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar cercanos
router.get('/cercanos', async (req, res) => {
  try {
    const { longitud, latitud, distancia } = req.query;
    const result = await ctrl.buscarCercanos(
      parseFloat(longitud), parseFloat(latitud), parseInt(distancia) || 5000
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Búsqueda por texto
router.get('/buscar', async (req, res) => {
  try {
    const { texto, limit } = req.query;
    const result = await ctrl.buscarPorTexto(texto, parseInt(limit) || 10);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categorías distintas
router.get('/categorias', async (req, res) => {
  try {
    const result = await ctrl.obtenerCategorias();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await ctrl.obtenerRestaurante(req.params.id);
    if (!result) return res.status(404).json({ error: 'No encontrado' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar
router.put('/:id', async (req, res) => {
  try {
    const result = await ctrl.actualizarRestaurante(req.params.id, req.body);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar
router.delete('/:id', async (req, res) => {
  try {
    const result = await ctrl.eliminarRestaurante(req.params.id);
    res.json({ eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

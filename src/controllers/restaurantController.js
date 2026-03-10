const service = require('../services/restaurantService');

async function crearRestaurante(req, res) {
  try {
    const result = await service.crearRestaurante(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarRestaurantes(req, res) {
  try {
    const { skip, limit, categoria, sort_field, sort_order } = req.query;
    const options = {
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    };
    if (categoria) options.filtro = { categoria };
    if (sort_field) options.sort = { [sort_field]: parseInt(sort_order) || -1 };
    const result = await service.listarRestaurantes(options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function buscarCercanos(req, res) {
  try {
    const { longitud, latitud, distancia } = req.query;
    const result = await service.buscarCercanos(
      parseFloat(longitud), parseFloat(latitud), parseInt(distancia) || 5000
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function buscarPorTexto(req, res) {
  try {
    const { texto, limit } = req.query;
    const result = await service.buscarPorTexto(texto, parseInt(limit) || 10);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerCategorias(req, res) {
  try {
    const result = await service.obtenerCategorias();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerRestaurante(req, res) {
  try {
    const result = await service.obtenerRestaurante(req.params.id);
    if (!result) return res.status(404).json({ error: 'No encontrado' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function actualizarRestaurante(req, res) {
  try {
    const result = await service.actualizarRestaurante(req.params.id, req.body);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminarRestaurante(req, res) {
  try {
    const result = await service.eliminarRestaurante(req.params.id);
    res.json({ eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  crearRestaurante,
  listarRestaurantes,
  buscarCercanos,
  buscarPorTexto,
  obtenerCategorias,
  obtenerRestaurante,
  actualizarRestaurante,
  eliminarRestaurante
};

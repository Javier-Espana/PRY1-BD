const service = require('../services/menuItemService');

async function crearArticulo(req, res) {
  try {
    const result = await service.crearArticulo(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function crearVariosArticulos(req, res) {
  try {
    const result = await service.crearVariosArticulos(req.body.articulos);
    res.status(201).json({ insertados: result.insertedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarMenuRestaurante(req, res) {
  try {
    const { skip, limit, solo_disponibles, categoria } = req.query;
    const options = {
      soloDisponibles: solo_disponibles !== 'false',
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 50
    };
    if (categoria) options.categoria = categoria;
    const result = await service.listarMenuRestaurante(req.params.restauranteId, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function buscarArticulos(req, res) {
  try {
    const { texto, limit } = req.query;
    const result = await service.buscarArticulos(texto, parseInt(limit) || 10);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerArticulo(req, res) {
  try {
    const result = await service.obtenerArticulo(req.params.id);
    if (!result) return res.status(404).json({ error: 'No encontrado' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function actualizarArticulo(req, res) {
  try {
    const result = await service.actualizarArticulo(req.params.id, req.body);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminarArticulo(req, res) {
  try {
    const result = await service.eliminarArticulo(req.params.id);
    res.json({ eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function actualizarVariosArticulos(req, res) {
  try {
    const { filtro, datos } = req.body;
    if (!filtro || Object.keys(filtro).length === 0) {
      return res.status(400).json({ error: 'Se requiere un filtro no vacío' });
    }
    const result = await service.actualizarVariosArticulos(filtro, datos || {});
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminarVariosArticulos(req, res) {
  try {
    const { filtro } = req.body;
    if (!filtro || Object.keys(filtro).length === 0) {
      return res.status(400).json({ error: 'Se requiere un filtro no vacío' });
    }
    const result = await service.eliminarVariosArticulos(filtro);
    res.json({ eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  crearArticulo,
  crearVariosArticulos,
  listarMenuRestaurante,
  buscarArticulos,
  obtenerArticulo,
  actualizarArticulo,
  actualizarVariosArticulos,
  eliminarArticulo,
  eliminarVariosArticulos
};

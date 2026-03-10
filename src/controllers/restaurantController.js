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

async function eliminarVariosRestaurantes(req, res) {
  try {
    const { filtro } = req.body;
    if (!filtro || Object.keys(filtro).length === 0) {
      return res.status(400).json({ error: 'Se requiere un filtro no vacío' });
    }
    const result = await service.eliminarVariosRestaurantes(filtro);
    res.json({ eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function actualizarVariosRestaurantes(req, res) {
  try {
    const { filtro, datos } = req.body;
    if (!filtro || Object.keys(filtro).length === 0) {
      return res.status(400).json({ error: 'Se requiere un filtro no vacío' });
    }
    const result = await service.actualizarVariosRestaurantes(filtro, datos);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function agregarEtiqueta(req, res) {
  try {
    const { etiqueta } = req.body;
    if (!etiqueta) return res.status(400).json({ error: 'Se requiere etiqueta' });
    const result = await service.agregarEtiqueta(req.params.id, etiqueta);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminarEtiqueta(req, res) {
  try {
    const result = await service.eliminarEtiqueta(req.params.id, req.params.etiqueta);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
  actualizarVariosRestaurantes,
  eliminarRestaurante,
  eliminarVariosRestaurantes,
  agregarEtiqueta,
  eliminarEtiqueta
};

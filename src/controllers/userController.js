const service = require('../services/userService');

async function crearUsuario(req, res) {
  try {
    const result = await service.crearUsuario(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarUsuarios(req, res) {
  try {
    const { skip, limit } = req.query;
    const result = await service.listarUsuarios({
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerUsuario(req, res) {
  try {
    const result = await service.obtenerUsuario(req.params.id);
    if (!result) return res.status(404).json({ error: 'No encontrado' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function actualizarUsuario(req, res) {
  try {
    const result = await service.actualizarUsuario(req.params.id, req.body);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminarUsuario(req, res) {
  try {
    const result = await service.eliminarUsuario(req.params.id);
    res.json({ eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario
};

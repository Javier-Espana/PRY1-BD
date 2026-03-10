const service = require('../services/bulkService');

async function bulkWriteArticulos(req, res) {
  try {
    const result = await service.bulkWriteArticulos(req.body.operaciones);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function bulkWriteOrdenes(req, res) {
  try {
    const result = await service.bulkWriteOrdenes(req.body.operaciones);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function bulkInsertRestaurantes(req, res) {
  try {
    const result = await service.bulkInsertRestaurantes(req.body.restaurantes);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  bulkWriteArticulos,
  bulkWriteOrdenes,
  bulkInsertRestaurantes
};

const service = require('../services/analyticsService');

async function resumenGeneral(req, res) {
  try {
    const result = await service.resumenGeneral();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function restaurantesMejorCalificados(req, res) {
  try {
    const { limit } = req.query;
    const result = await service.restaurantesMejorCalificados(parseInt(limit) || 10);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function platillosMasVendidos(req, res) {
  try {
    const { limit } = req.query;
    const result = await service.platillosMasVendidos(parseInt(limit) || 10);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function ventasPorRestaurante(req, res) {
  try {
    const { limit } = req.query;
    const result = await service.ventasPorRestaurante(parseInt(limit) || 10);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function ventasPorPeriodo(req, res) {
  try {
    const { periodo, fecha_inicio, fecha_fin } = req.query;
    const result = await service.ventasPorPeriodo(periodo || 'dia', fecha_inicio, fecha_fin);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function ordenesPorEstado(req, res) {
  try {
    const result = await service.ordenesPorEstado();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function distribucionCalificaciones(req, res) {
  try {
    const result = await service.distribucionCalificaciones(req.params.restauranteId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  resumenGeneral,
  restaurantesMejorCalificados,
  platillosMasVendidos,
  ventasPorRestaurante,
  ventasPorPeriodo,
  ordenesPorEstado,
  distribucionCalificaciones
};

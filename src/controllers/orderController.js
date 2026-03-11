const service = require('../services/orderService');

async function crearOrden(req, res) {
  try {
    const result = await service.crearOrden(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarOrdenes(req, res) {
  try {
    const {
      skip,
      limit,
      estado,
      metodo_pago,
      min_total,
      max_total,
      sort_field,
      sort_order,
      campos
    } = req.query;

    const filtro = {};
    if (estado) filtro.estado = estado;
    if (metodo_pago) filtro.metodo_pago = metodo_pago;
    if (min_total || max_total) {
      filtro.total = {};
      if (min_total) filtro.total.$gte = parseFloat(min_total);
      if (max_total) filtro.total.$lte = parseFloat(max_total);
    }

    const sort = sort_field
      ? { [sort_field]: parseInt(sort_order, 10) === 1 ? 1 : -1 }
      : { fecha_creacion: -1 };

    const proyeccion = {};
    if (campos) {
      String(campos)
        .split(',')
        .map(campo => campo.trim())
        .filter(Boolean)
        .forEach(campo => {
          proyeccion[campo] = 1;
        });
    }

    const result = await service.listarOrdenes({
      filtro,
      sort,
      proyeccion,
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function listarOrdenesPorUsuario(req, res) {
  try {
    const { skip, limit } = req.query;
    const result = await service.listarOrdenesPorUsuario(req.params.usuarioId, {
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function listarOrdenesPorRestaurante(req, res) {
  try {
    const { skip, limit, estado } = req.query;
    const result = await service.listarOrdenesPorRestaurante(req.params.restauranteId, {
      estado,
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerOrden(req, res) {
  try {
    const result = await service.obtenerOrden(req.params.id);
    if (!result) return res.status(404).json({ error: 'No encontrada' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function actualizarEstadoOrden(req, res) {
  try {
    const result = await service.actualizarEstadoOrden(req.params.id, req.body.estado);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function agregarItemAOrden(req, res) {
  try {
    const result = await service.agregarItemAOrden(req.params.id, req.body);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminarItemDeOrden(req, res) {
  try {
    const result = await service.eliminarItemDeOrden(req.params.id, req.params.menuItemId);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminarOrden(req, res) {
  try {
    const result = await service.eliminarOrden(req.params.id);
    res.json({ eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function eliminarVariasOrdenes(req, res) {
  try {
    const { filtro } = req.body;
    if (!filtro || Object.keys(filtro).length === 0) {
      return res.status(400).json({ error: 'Se requiere un filtro no vacío' });
    }
    const result = await service.eliminarVariasOrdenes(filtro);
    res.json({ eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function actualizarVariasOrdenes(req, res) {
  try {
    const { filtro, datos } = req.body;
    if (!filtro || Object.keys(filtro).length === 0) {
      return res.status(400).json({ error: 'Se requiere un filtro no vacío' });
    }
    const result = await service.actualizarVariasOrdenes(filtro, datos);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  crearOrden,
  listarOrdenes,
  listarOrdenesPorUsuario,
  listarOrdenesPorRestaurante,
  obtenerOrden,
  actualizarEstadoOrden,
  actualizarVariasOrdenes,
  agregarItemAOrden,
  eliminarItemDeOrden,
  eliminarOrden,
  eliminarVariasOrdenes
};

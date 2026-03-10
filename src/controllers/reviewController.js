const service = require('../services/reviewService');

async function crearResena(req, res) {
  try {
    const result = await service.crearResena(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarResenas(req, res) {
  try {
    const { skip, limit } = req.query;
    const result = await service.listarResenas({
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function listarResenasPorRestaurante(req, res) {
  try {
    const { skip, limit } = req.query;
    const result = await service.listarResenasPorRestaurante(req.params.restauranteId, {
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function listarResenasPorUsuario(req, res) {
  try {
    const { skip, limit } = req.query;
    const result = await service.listarResenasPorUsuario(req.params.usuarioId, {
      skip: parseInt(skip) || 0,
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerResena(req, res) {
  try {
    const result = await service.obtenerResena(req.params.id);
    if (!result) return res.status(404).json({ error: 'No encontrada' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function agregarImagen(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envio imagen' });
    const result = await service.agregarImagenDesdeBuffer(
      req.params.id,
      req.file.buffer,
      req.file.originalname,
      req.body.descripcion || ''
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function descargarArchivo(req, res) {
  try {
    const stream = service.descargarArchivo(req.params.fileId);
    stream.on('error', () => res.status(404).json({ error: 'Archivo no encontrado' }));
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function eliminarImagen(req, res) {
  try {
    const result = await service.eliminarImagenDeResena(req.params.id, req.params.fileId);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarArchivos(req, res) {
  try {
    const archivos = await service.listarArchivosGridFS();
    res.json(archivos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function actualizarResena(req, res) {
  try {
    const result = await service.actualizarResena(req.params.id, req.body);
    res.json({ modificados: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminarResena(req, res) {
  try {
    const result = await service.eliminarResena(req.params.id);
    res.json({ eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  crearResena,
  listarResenas,
  listarResenasPorRestaurante,
  listarResenasPorUsuario,
  obtenerResena,
  agregarImagen,
  descargarArchivo,
  eliminarImagen,
  listarArchivos,
  actualizarResena,
  eliminarResena
};

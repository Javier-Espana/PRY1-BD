/**
 * Controlador de Reseñas.
 * CRUD completo + GridFS para imágenes + manejo de arrays.
 */
const { ObjectId } = require('mongodb');
const { getDB, getGridFSBucket } = require('../config/database');
const fs = require('fs');
const path = require('path');

const COLLECTION = 'Resenas';

/**
 * Crear una reseña (solo si la orden existe y está entregada).
 * Actualiza rating_promedio y total_resenas del restaurante.
 */
async function crearResena(datos) {
  const db = getDB();

  // Validar que la orden exista y esté entregada
  const orden = await db.collection('Ordenes').findOne({ _id: new ObjectId(datos.orden_id) });
  if (!orden) throw new Error('Orden no encontrada.');
  if (orden.estado !== 'entregado') throw new Error('Solo se pueden reseñar órdenes entregadas.');
  if (orden.usuario_id.toString() !== datos.usuario_id) {
    throw new Error('La orden no pertenece a este usuario.');
  }

  // Verificar que no exista ya una reseña para esta orden
  const existente = await db.collection(COLLECTION).findOne({ orden_id: new ObjectId(datos.orden_id) });
  if (existente) throw new Error('Ya existe una reseña para esta orden.');

  const doc = {
    usuario_id: new ObjectId(datos.usuario_id),
    restaurante_id: new ObjectId(datos.restaurante_id || orden.restaurante_id),
    orden_id: new ObjectId(datos.orden_id),
    calificacion: parseInt(datos.calificacion),
    comentario: datos.comentario || '',
    imagenes: [],
    fecha_creacion: new Date()
  };

  const result = await db.collection(COLLECTION).insertOne(doc);

  // Actualizar rating_promedio y total_resenas del restaurante
  await actualizarRatingRestaurante(doc.restaurante_id);

  return { id: result.insertedId, ...doc };
}

/**
 * Recalcular y actualizar el rating promedio de un restaurante.
 */
async function actualizarRatingRestaurante(restauranteId) {
  const db = getDB();
  const pipeline = [
    { $match: { restaurante_id: new ObjectId(restauranteId) } },
    {
      $group: {
        _id: null,
        promedio: { $avg: '$calificacion' },
        total: { $sum: 1 }
      }
    }
  ];

  const resultado = await db.collection(COLLECTION).aggregate(pipeline).toArray();

  if (resultado.length > 0) {
    await db.collection('Restaurantes').updateOne(
      { _id: new ObjectId(restauranteId) },
      {
        $set: {
          rating_promedio: Math.round(resultado[0].promedio * 100) / 100,
          total_resenas: resultado[0].total
        }
      }
    );
  }
}

/**
 * Obtener reseña por ID.
 */
async function obtenerResena(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

/**
 * Listar reseñas con lookups multi-colección.
 */
async function listarResenas({ filtro = {}, sort = { fecha_creacion: -1 }, skip = 0, limit = 10 } = {}) {
  const db = getDB();
  return await db.collection(COLLECTION).aggregate([
    { $match: filtro },
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'Usuarios',
        localField: 'usuario_id',
        foreignField: '_id',
        as: 'usuario'
      }
    },
    { $unwind: { path: '$usuario', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'Restaurantes',
        localField: 'restaurante_id',
        foreignField: '_id',
        as: 'restaurante'
      }
    },
    { $unwind: { path: '$restaurante', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        'usuario.password_hash': 0
      }
    }
  ]).toArray();
}

/**
 * Listar reseñas de un restaurante.
 */
async function listarResenasPorRestaurante(restauranteId, options = {}) {
  return await listarResenas({
    filtro: { restaurante_id: new ObjectId(restauranteId) },
    ...options
  });
}

/**
 * Listar reseñas de un usuario.
 */
async function listarResenasPorUsuario(usuarioId, options = {}) {
  return await listarResenas({
    filtro: { usuario_id: new ObjectId(usuarioId) },
    ...options
  });
}

/**
 * Subir imagen a GridFS y agregarla a una reseña ($push - manejo de arrays).
 */
async function agregarImagenAResena(resenaId, filePath, descripcion = '') {
  const db = getDB();
  const bucket = getGridFSBucket();

  const filename = path.basename(filePath);
  const uploadStream = bucket.openUploadStream(filename, {
    metadata: {
      resena_id: new ObjectId(resenaId),
      descripcion: descripcion,
      fecha_subida: new Date()
    }
  });

  const fileStream = fs.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    fileStream.pipe(uploadStream)
      .on('error', reject)
      .on('finish', async () => {
        // Agregar referencia a la imagen en la reseña ($push)
        await db.collection(COLLECTION).updateOne(
          { _id: new ObjectId(resenaId) },
          {
            $push: {
              imagenes: {
                file_id: uploadStream.id,
                descripcion: descripcion
              }
            }
          }
        );
        resolve({ file_id: uploadStream.id, filename });
      });
  });
}

/**
 * Subir imagen desde buffer a GridFS (para uso desde API).
 */
async function agregarImagenDesdeBuffer(resenaId, buffer, filename, descripcion = '') {
  const db = getDB();
  const bucket = getGridFSBucket();

  const uploadStream = bucket.openUploadStream(filename, {
    metadata: {
      resena_id: new ObjectId(resenaId),
      descripcion: descripcion,
      fecha_subida: new Date()
    }
  });

  return new Promise((resolve, reject) => {
    uploadStream.on('error', reject);
    uploadStream.on('finish', async () => {
      await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(resenaId) },
        {
          $push: {
            imagenes: {
              file_id: uploadStream.id,
              descripcion: descripcion
            }
          }
        }
      );
      resolve({ file_id: uploadStream.id, filename });
    });
    uploadStream.end(buffer);
  });
}

/**
 * Eliminar una imagen de una reseña ($pull - manejo de arrays) y de GridFS.
 */
async function eliminarImagenDeResena(resenaId, fileId) {
  const db = getDB();
  const bucket = getGridFSBucket();

  // Eliminar de GridFS
  await bucket.delete(new ObjectId(fileId));

  // Eliminar referencia de la reseña ($pull)
  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(resenaId) },
    {
      $pull: { imagenes: { file_id: new ObjectId(fileId) } }
    }
  );
  return result;
}

/**
 * Descargar archivo de GridFS.
 */
function descargarArchivo(fileId) {
  const bucket = getGridFSBucket();
  return bucket.openDownloadStream(new ObjectId(fileId));
}

/**
 * Listar archivos en GridFS.
 */
async function listarArchivosGridFS() {
  const bucket = getGridFSBucket();
  return await bucket.find().toArray();
}

/**
 * Actualizar una reseña.
 */
async function actualizarResena(id, datos) {
  const db = getDB();
  const updateFields = {};
  if (datos.calificacion) updateFields.calificacion = parseInt(datos.calificacion);
  if (datos.comentario !== undefined) updateFields.comentario = datos.comentario;

  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );

  // Recalcular rating del restaurante
  if (datos.calificacion) {
    const resena = await obtenerResena(id);
    if (resena) await actualizarRatingRestaurante(resena.restaurante_id);
  }

  return result;
}

/**
 * Eliminar una reseña.
 */
async function eliminarResena(id) {
  const db = getDB();
  const bucket = getGridFSBucket();

  const resena = await obtenerResena(id);
  if (!resena) throw new Error('Reseña no encontrada');

  // Eliminar todas las imágenes de GridFS
  for (const img of resena.imagenes || []) {
    try {
      await bucket.delete(img.file_id);
    } catch (e) { /* Ignorar si ya no existe */ }
  }

  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });

  // Recalcular rating
  await actualizarRatingRestaurante(resena.restaurante_id);

  return result;
}

/**
 * Eliminar varias reseñas.
 */
async function eliminarVariasResenas(filtro) {
  const db = getDB();
  const result = await db.collection(COLLECTION).deleteMany(filtro);
  return result;
}

/**
 * Contar reseñas.
 */
async function contarResenas(filtro = {}) {
  const db = getDB();
  return await db.collection(COLLECTION).countDocuments(filtro);
}

module.exports = {
  crearResena,
  obtenerResena,
  listarResenas,
  listarResenasPorRestaurante,
  listarResenasPorUsuario,
  agregarImagenAResena,
  agregarImagenDesdeBuffer,
  eliminarImagenDeResena,
  descargarArchivo,
  listarArchivosGridFS,
  actualizarResena,
  eliminarResena,
  eliminarVariasResenas,
  contarResenas,
  actualizarRatingRestaurante
};

const { ObjectId } = require('mongodb');
const { getDB, getGridFSBucket } = require('../config/database');
const fs = require('fs');
const path = require('path');

const COLLECTION = 'Resenas';

async function crearResena(datos) {
  const db = getDB();

  const orden = await db.collection('Ordenes').findOne({ _id: new ObjectId(datos.orden_id) });
  if (!orden) throw new Error('Orden no encontrada.');
  if (orden.estado !== 'entregado') throw new Error('Solo se pueden resenar ordenes entregadas.');
  if (orden.usuario_id.toString() !== datos.usuario_id) {
    throw new Error('La orden no pertenece a este usuario.');
  }

  const existente = await db.collection(COLLECTION).findOne({ orden_id: new ObjectId(datos.orden_id) });
  if (existente) throw new Error('Ya existe una resena para esta orden.');

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
  await actualizarRatingRestaurante(doc.restaurante_id);
  return { id: result.insertedId, ...doc };
}

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

async function obtenerResena(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

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
    { $project: { 'usuario.password_hash': 0 } }
  ]).toArray();
}

async function listarResenasPorRestaurante(restauranteId, options = {}) {
  return await listarResenas({
    filtro: { restaurante_id: new ObjectId(restauranteId) },
    ...options
  });
}

async function listarResenasPorUsuario(usuarioId, options = {}) {
  return await listarResenas({
    filtro: { usuario_id: new ObjectId(usuarioId) },
    ...options
  });
}

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

async function eliminarImagenDeResena(resenaId, fileId) {
  const db = getDB();
  const bucket = getGridFSBucket();
  await bucket.delete(new ObjectId(fileId));

  return await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(resenaId) },
    { $pull: { imagenes: { file_id: new ObjectId(fileId) } } }
  );
}

function descargarArchivo(fileId) {
  const bucket = getGridFSBucket();
  return bucket.openDownloadStream(new ObjectId(fileId));
}

async function listarArchivosGridFS() {
  const bucket = getGridFSBucket();
  return await bucket.find().toArray();
}

async function actualizarResena(id, datos) {
  const db = getDB();
  const updateFields = {};
  if (datos.calificacion) updateFields.calificacion = parseInt(datos.calificacion);
  if (datos.comentario !== undefined) updateFields.comentario = datos.comentario;

  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );

  if (datos.calificacion) {
    const resena = await obtenerResena(id);
    if (resena) await actualizarRatingRestaurante(resena.restaurante_id);
  }

  return result;
}

async function eliminarResena(id) {
  const db = getDB();
  const bucket = getGridFSBucket();
  const resena = await obtenerResena(id);
  if (!resena) throw new Error('Resena no encontrada');

  for (const img of resena.imagenes || []) {
    try { await bucket.delete(img.file_id); } catch (e) { /* file already removed */ }
  }

  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  await actualizarRatingRestaurante(resena.restaurante_id);
  return result;
}

async function eliminarVariasResenas(filtro) {
  const db = getDB();
  return await db.collection(COLLECTION).deleteMany(filtro);
}

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

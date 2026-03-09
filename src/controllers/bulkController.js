/**
 * Controlador de operaciones Bulk.
 * Operaciones bulkWrite para inserción/actualización masiva.
 */
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

/**
 * BulkWrite en la colección ArticulosMenu.
 * Permite insertar, actualizar y eliminar artículos masivamente.
 */
async function bulkWriteArticulos(operaciones) {
  const db = getDB();

  const bulkOps = operaciones.map(op => {
    switch (op.tipo) {
      case 'insertar':
        return {
          insertOne: {
            document: {
              restaurante_id: new ObjectId(op.datos.restaurante_id),
              nombre: op.datos.nombre,
              descripcion: op.datos.descripcion || '',
              precio: parseFloat(op.datos.precio),
              categoria: op.datos.categoria || 'Otro',
              disponible: op.datos.disponible !== false,
              stock: parseInt(op.datos.stock) || 100,
              fecha_creacion: new Date()
            }
          }
        };
      case 'actualizar':
        return {
          updateOne: {
            filter: { _id: new ObjectId(op.id) },
            update: { $set: op.datos }
          }
        };
      case 'eliminar':
        return {
          deleteOne: {
            filter: { _id: new ObjectId(op.id) }
          }
        };
      default:
        throw new Error(`Tipo de operación desconocido: ${op.tipo}`);
    }
  });

  const result = await db.collection('ArticulosMenu').bulkWrite(bulkOps, { ordered: false });
  return {
    insertados: result.insertedCount,
    actualizados: result.modifiedCount,
    eliminados: result.deletedCount
  };
}

/**
 * BulkWrite en la colección Ordenes.
 * Útil para actualizar estados masivamente.
 */
async function bulkWriteOrdenes(operaciones) {
  const db = getDB();

  const bulkOps = operaciones.map(op => {
    switch (op.tipo) {
      case 'actualizarEstado':
        return {
          updateOne: {
            filter: { _id: new ObjectId(op.id) },
            update: {
              $set: {
                estado: op.estado,
                fecha_actualizacion: new Date()
              }
            }
          }
        };
      case 'eliminar':
        return {
          deleteOne: {
            filter: { _id: new ObjectId(op.id) }
          }
        };
      default:
        throw new Error(`Tipo de operación desconocido: ${op.tipo}`);
    }
  });

  const result = await db.collection('Ordenes').bulkWrite(bulkOps, { ordered: false });
  return {
    actualizados: result.modifiedCount,
    eliminados: result.deletedCount
  };
}

/**
 * Inserción masiva de restaurantes con bulkWrite.
 */
async function bulkInsertRestaurantes(restaurantes) {
  const db = getDB();

  const bulkOps = restaurantes.map(r => ({
    insertOne: {
      document: {
        nombre: r.nombre,
        descripcion: r.descripcion || '',
        categoria: r.categoria,
        direccion: {
          type: 'Point',
          coordinates: [parseFloat(r.longitud), parseFloat(r.latitud)]
        },
        telefono: r.telefono || '',
        email_contacto: r.email_contacto || '',
        rating_promedio: 0.0,
        total_resenas: 0,
        activo: true,
        fecha_registro: new Date()
      }
    }
  }));

  const result = await db.collection('Restaurantes').bulkWrite(bulkOps, { ordered: false });
  return { insertados: result.insertedCount };
}

module.exports = {
  bulkWriteArticulos,
  bulkWriteOrdenes,
  bulkInsertRestaurantes
};

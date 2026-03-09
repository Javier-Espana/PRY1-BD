/**
 * Controlador de Órdenes.
 * CRUD completo + transacción multi-documento + manejo de arrays embebidos.
 * 
 * NOTA: El shard key es order_id (_id), no restaurant_id.
 */
const { ObjectId } = require('mongodb');
const { getDB, getClient } = require('../config/database');

const COLLECTION = 'Ordenes';

/**
 * Crear una orden con transacción multi-documento.
 * - Inserta la orden en Ordenes.
 * - Descuenta el stock de cada artículo en ArticulosMenu.
 * - Si algún artículo no tiene stock, aborta la transacción.
 */
async function crearOrden(datos) {
  const client = getClient();
  const session = client.startSession();

  try {
    let ordenCreada;

    await session.withTransaction(async () => {
      const db = getDB();

      // Validar stock y construir items embebidos
      const itemsEmbedded = [];
      for (const item of datos.items) {
        const articulo = await db.collection('ArticulosMenu').findOne(
          { _id: new ObjectId(item.menu_item_id) },
          { session }
        );

        if (!articulo) {
          throw new Error(`Artículo ${item.menu_item_id} no encontrado.`);
        }
        if (articulo.stock < parseInt(item.cantidad)) {
          throw new Error(`Stock insuficiente para "${articulo.nombre}". Disponible: ${articulo.stock}, solicitado: ${item.cantidad}`);
        }

        const cantidad = parseInt(item.cantidad);
        const precioUnitario = articulo.precio;
        const subtotal = cantidad * precioUnitario;

        itemsEmbedded.push({
          menu_item_id: new ObjectId(item.menu_item_id),
          nombre: articulo.nombre,
          cantidad: cantidad,
          precio_unitario: precioUnitario,
          subtotal: subtotal
        });

        // Descontar stock
        await db.collection('ArticulosMenu').updateOne(
          { _id: new ObjectId(item.menu_item_id) },
          { $inc: { stock: -cantidad } },
          { session }
        );
      }

      const total = itemsEmbedded.reduce((sum, i) => sum + i.subtotal, 0);

      const ordenDoc = {
        usuario_id: new ObjectId(datos.usuario_id),
        restaurante_id: new ObjectId(datos.restaurante_id),
        items: itemsEmbedded,
        estado: 'pendiente',
        total: total,
        metodo_pago: datos.metodo_pago || 'efectivo',
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date()
      };

      const result = await db.collection(COLLECTION).insertOne(ordenDoc, { session });
      ordenCreada = { id: result.insertedId, ...ordenDoc };
    });

    return ordenCreada;
  } finally {
    await session.endSession();
  }
}

/**
 * Obtener orden por ID con lookup a usuario y restaurante.
 */
async function obtenerOrden(id) {
  const db = getDB();
  const result = await db.collection(COLLECTION).aggregate([
    { $match: { _id: new ObjectId(id) } },
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

  return result[0] || null;
}

/**
 * Listar órdenes con filtros, proyección, sort, skip, limit.
 * Incluye lookups multi-colección.
 */
async function listarOrdenes({ filtro = {}, sort = { fecha_creacion: -1 }, skip = 0, limit = 10 } = {}) {
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
 * Listar órdenes de un usuario (historial).
 */
async function listarOrdenesPorUsuario(usuarioId, { sort = { fecha_creacion: -1 }, skip = 0, limit = 10 } = {}) {
  return await listarOrdenes({
    filtro: { usuario_id: new ObjectId(usuarioId) },
    sort, skip, limit
  });
}

/**
 * Listar órdenes de un restaurante.
 */
async function listarOrdenesPorRestaurante(restauranteId, { estado, sort = { fecha_creacion: -1 }, skip = 0, limit = 10 } = {}) {
  const filtro = { restaurante_id: new ObjectId(restauranteId) };
  if (estado) filtro.estado = estado;
  return await listarOrdenes({ filtro, sort, skip, limit });
}

/**
 * Actualizar estado de una orden.
 */
async function actualizarEstadoOrden(id, nuevoEstado) {
  const db = getDB();
  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        estado: nuevoEstado,
        fecha_actualizacion: new Date()
      }
    }
  );
  return result;
}

/**
 * Actualizar varias órdenes (ej: cancelar todas las pendientes de un restaurante).
 */
async function actualizarVariasOrdenes(filtro, datos) {
  const db = getDB();
  datos.fecha_actualizacion = new Date();
  const result = await db.collection(COLLECTION).updateMany(filtro, { $set: datos });
  return result;
}

/**
 * Agregar un item a una orden existente ($push - manejo de arrays).
 */
async function agregarItemAOrden(ordenId, nuevoItem) {
  const db = getDB();
  const articulo = await db.collection('ArticulosMenu').findOne({ _id: new ObjectId(nuevoItem.menu_item_id) });
  if (!articulo) throw new Error('Artículo no encontrado');

  const cantidad = parseInt(nuevoItem.cantidad);
  const subtotal = cantidad * articulo.precio;

  const itemEmbedded = {
    menu_item_id: new ObjectId(nuevoItem.menu_item_id),
    nombre: articulo.nombre,
    cantidad: cantidad,
    precio_unitario: articulo.precio,
    subtotal: subtotal
  };

  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(ordenId) },
    {
      $push: { items: itemEmbedded },
      $inc: { total: subtotal },
      $set: { fecha_actualizacion: new Date() }
    }
  );
  return result;
}

/**
 * Eliminar un item de una orden ($pull - manejo de arrays).
 */
async function eliminarItemDeOrden(ordenId, menuItemId) {
  const db = getDB();

  // Obtener el subtotal del item a eliminar
  const orden = await db.collection(COLLECTION).findOne({ _id: new ObjectId(ordenId) });
  if (!orden) throw new Error('Orden no encontrada');

  const item = orden.items.find(i => i.menu_item_id.toString() === menuItemId);
  if (!item) throw new Error('Item no encontrado en la orden');

  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(ordenId) },
    {
      $pull: { items: { menu_item_id: new ObjectId(menuItemId) } },
      $inc: { total: -item.subtotal },
      $set: { fecha_actualizacion: new Date() }
    }
  );
  return result;
}

/**
 * Eliminar una orden.
 */
async function eliminarOrden(id) {
  const db = getDB();
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result;
}

/**
 * Eliminar varias órdenes (por filtro).
 */
async function eliminarVariasOrdenes(filtro) {
  const db = getDB();
  const result = await db.collection(COLLECTION).deleteMany(filtro);
  return result;
}

/**
 * Contar órdenes.
 */
async function contarOrdenes(filtro = {}) {
  const db = getDB();
  return await db.collection(COLLECTION).countDocuments(filtro);
}

/**
 * Estados distintos de órdenes.
 */
async function obtenerEstados() {
  const db = getDB();
  return await db.collection(COLLECTION).distinct('estado');
}

module.exports = {
  crearOrden,
  obtenerOrden,
  listarOrdenes,
  listarOrdenesPorUsuario,
  listarOrdenesPorRestaurante,
  actualizarEstadoOrden,
  actualizarVariasOrdenes,
  agregarItemAOrden,
  eliminarItemDeOrden,
  eliminarOrden,
  eliminarVariasOrdenes,
  contarOrdenes,
  obtenerEstados
};

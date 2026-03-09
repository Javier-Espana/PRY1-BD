/**
 * Controlador de Analíticas.
 * Aggregation pipelines complejas y consultas analíticas.
 */
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

/**
 * [PIPELINE COMPLEJA] Restaurantes mejor calificados.
 * Calcula promedio de calificaciones y cuenta reseñas desde la colección Resenas.
 */
async function restaurantesMejorCalificados(limit = 10) {
  const db = getDB();
  return await db.collection('Resenas').aggregate([
    {
      $group: {
        _id: '$restaurante_id',
        promedio_calificacion: { $avg: '$calificacion' },
        total_resenas: { $sum: 1 }
      }
    },
    { $sort: { promedio_calificacion: -1, total_resenas: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'Restaurantes',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurante'
      }
    },
    { $unwind: '$restaurante' },
    {
      $project: {
        _id: 0,
        restaurante_id: '$_id',
        nombre: '$restaurante.nombre',
        categoria: '$restaurante.categoria',
        promedio_calificacion: { $round: ['$promedio_calificacion', 2] },
        total_resenas: 1
      }
    }
  ]).toArray();
}

/**
 * [PIPELINE COMPLEJA] Platillos más vendidos.
 * Desenvuelve items embebidos de Ordenes y agrupa por nombre.
 */
async function platillosMasVendidos(limit = 10) {
  const db = getDB();
  return await db.collection('Ordenes').aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.menu_item_id',
        nombre: { $first: '$items.nombre' },
        total_vendido: { $sum: '$items.cantidad' },
        monto_total: { $sum: '$items.subtotal' },
        veces_ordenado: { $sum: 1 }
      }
    },
    { $sort: { total_vendido: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        menu_item_id: '$_id',
        nombre: 1,
        total_vendido: 1,
        monto_total: { $round: ['$monto_total', 2] },
        veces_ordenado: 1
      }
    }
  ]).toArray();
}

/**
 * [PIPELINE COMPLEJA] Ventas por restaurante.
 * Monto total y número de órdenes agrupados por restaurante.
 */
async function ventasPorRestaurante(limit = 10) {
  const db = getDB();
  return await db.collection('Ordenes').aggregate([
    {
      $group: {
        _id: '$restaurante_id',
        monto_total: { $sum: '$total' },
        total_ordenes: { $sum: 1 },
        promedio_orden: { $avg: '$total' }
      }
    },
    { $sort: { monto_total: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'Restaurantes',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurante'
      }
    },
    { $unwind: '$restaurante' },
    {
      $project: {
        _id: 0,
        restaurante_id: '$_id',
        nombre: '$restaurante.nombre',
        monto_total: { $round: ['$monto_total', 2] },
        total_ordenes: 1,
        promedio_orden: { $round: ['$promedio_orden', 2] }
      }
    }
  ]).toArray();
}

/**
 * [PIPELINE COMPLEJA] Ventas por período de tiempo.
 * Agrupa órdenes por día/semana/mes.
 */
async function ventasPorPeriodo(periodo = 'dia', fechaInicio = null, fechaFin = null) {
  const db = getDB();

  const matchStage = {};
  if (fechaInicio || fechaFin) {
    matchStage.fecha_creacion = {};
    if (fechaInicio) matchStage.fecha_creacion.$gte = new Date(fechaInicio);
    if (fechaFin) matchStage.fecha_creacion.$lte = new Date(fechaFin);
  }

  let dateGrouping;
  switch (periodo) {
    case 'mes':
      dateGrouping = { $dateToString: { format: '%Y-%m', date: '$fecha_creacion' } };
      break;
    case 'semana':
      dateGrouping = { $dateToString: { format: '%Y-W%V', date: '$fecha_creacion' } };
      break;
    case 'dia':
    default:
      dateGrouping = { $dateToString: { format: '%Y-%m-%d', date: '$fecha_creacion' } };
  }

  const pipeline = [];
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  pipeline.push(
    {
      $group: {
        _id: dateGrouping,
        monto_total: { $sum: '$total' },
        total_ordenes: { $sum: 1 },
        promedio_orden: { $avg: '$total' }
      }
    },
    { $sort: { _id: -1 } },
    {
      $project: {
        _id: 0,
        periodo: '$_id',
        monto_total: { $round: ['$monto_total', 2] },
        total_ordenes: 1,
        promedio_orden: { $round: ['$promedio_orden', 2] }
      }
    }
  );

  return await db.collection('Ordenes').aggregate(pipeline).toArray();
}

/**
 * Órdenes por estado (conteo por estado).
 */
async function ordenesPorEstado() {
  const db = getDB();
  return await db.collection('Ordenes').aggregate([
    {
      $group: {
        _id: '$estado',
        total: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        estado: '$_id',
        total: 1
      }
    }
  ]).toArray();
}

/**
 * Distribución de calificaciones de un restaurante.
 */
async function distribucionCalificaciones(restauranteId) {
  const db = getDB();
  return await db.collection('Resenas').aggregate([
    { $match: { restaurante_id: new ObjectId(restauranteId) } },
    {
      $group: {
        _id: '$calificacion',
        total: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        calificacion: '$_id',
        total: 1
      }
    }
  ]).toArray();
}

/**
 * Resumen general del sistema (dashboard).
 */
async function resumenGeneral() {
  const db = getDB();

  const [restaurantes, usuarios, ordenes, resenas, articulos] = await Promise.all([
    db.collection('Restaurantes').countDocuments(),
    db.collection('Usuarios').countDocuments(),
    db.collection('Ordenes').countDocuments(),
    db.collection('Resenas').countDocuments(),
    db.collection('ArticulosMenu').countDocuments()
  ]);

  return {
    total_restaurantes: restaurantes,
    total_usuarios: usuarios,
    total_ordenes: ordenes,
    total_resenas: resenas,
    total_articulos_menu: articulos
  };
}

module.exports = {
  restaurantesMejorCalificados,
  platillosMasVendidos,
  ventasPorRestaurante,
  ventasPorPeriodo,
  ordenesPorEstado,
  distribucionCalificaciones,
  resumenGeneral
};

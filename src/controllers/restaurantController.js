/**
 * Controlador de Restaurantes.
 * CRUD completo + consultas geoespaciales + búsqueda por texto.
 */
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

const COLLECTION = 'Restaurantes';

/**
 * Crear un restaurante.
 */
async function crearRestaurante(datos) {
  const db = getDB();
  const doc = {
    nombre: datos.nombre,
    descripcion: datos.descripcion || '',
    categoria: datos.categoria,
    direccion: {
      type: 'Point',
      coordinates: [parseFloat(datos.longitud), parseFloat(datos.latitud)]
    },
    telefono: datos.telefono || '',
    email_contacto: datos.email_contacto || '',
    rating_promedio: 0.0,
    total_resenas: 0,
    activo: true,
    fecha_registro: new Date()
  };

  const result = await db.collection(COLLECTION).insertOne(doc);
  return { id: result.insertedId, ...doc };
}

/**
 * Obtener restaurante por ID.
 */
async function obtenerRestaurante(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

/**
 * Listar restaurantes con filtros, proyección, sort, skip, limit.
 */
async function listarRestaurantes({ filtro = {}, proyeccion = {}, sort = { rating_promedio: -1 }, skip = 0, limit = 10 } = {}) {
  const db = getDB();
  return await db.collection(COLLECTION)
    .find(filtro, { projection: proyeccion })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();
}

/**
 * Buscar restaurantes cercanos a una ubicación (geoespacial).
 */
async function buscarCercanos(longitud, latitud, maxDistanciaMetros = 5000) {
  const db = getDB();
  return await db.collection(COLLECTION).find({
    direccion: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitud, latitud] },
        $maxDistance: maxDistanciaMetros
      }
    }
  }).toArray();
}

/**
 * Búsqueda por texto en nombre y descripción.
 */
async function buscarPorTexto(texto, limit = 10) {
  const db = getDB();
  return await db.collection(COLLECTION)
    .find(
      { $text: { $search: texto } },
      { projection: { score: { $meta: 'textScore' } } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .toArray();
}

/**
 * Actualizar un restaurante.
 */
async function actualizarRestaurante(id, datos) {
  const db = getDB();
  const updateFields = {};
  if (datos.nombre) updateFields.nombre = datos.nombre;
  if (datos.descripcion) updateFields.descripcion = datos.descripcion;
  if (datos.categoria) updateFields.categoria = datos.categoria;
  if (datos.telefono) updateFields.telefono = datos.telefono;
  if (datos.email_contacto) updateFields.email_contacto = datos.email_contacto;
  if (datos.activo !== undefined) updateFields.activo = datos.activo;
  if (datos.longitud && datos.latitud) {
    updateFields.direccion = {
      type: 'Point',
      coordinates: [parseFloat(datos.longitud), parseFloat(datos.latitud)]
    };
  }

  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );
  return result;
}

/**
 * Actualizar varios restaurantes (por ej., desactivar por categoría).
 */
async function actualizarVariosRestaurantes(filtro, datos) {
  const db = getDB();
  const result = await db.collection(COLLECTION).updateMany(filtro, { $set: datos });
  return result;
}

/**
 * Eliminar un restaurante.
 */
async function eliminarRestaurante(id) {
  const db = getDB();
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result;
}

/**
 * Eliminar varios restaurantes (por filtro).
 */
async function eliminarVariosRestaurantes(filtro) {
  const db = getDB();
  const result = await db.collection(COLLECTION).deleteMany(filtro);
  return result;
}

/**
 * Listar restaurantes por categoría.
 */
async function listarPorCategoria(categoria, skip = 0, limit = 10) {
  const db = getDB();
  return await db.collection(COLLECTION)
    .find({ categoria, activo: true })
    .sort({ rating_promedio: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
}

/**
 * Contar restaurantes (agregación simple).
 */
async function contarRestaurantes(filtro = {}) {
  const db = getDB();
  return await db.collection(COLLECTION).countDocuments(filtro);
}

/**
 * Obtener categorías distintas (agregación simple).
 */
async function obtenerCategorias() {
  const db = getDB();
  return await db.collection(COLLECTION).distinct('categoria');
}

module.exports = {
  crearRestaurante,
  obtenerRestaurante,
  listarRestaurantes,
  buscarCercanos,
  buscarPorTexto,
  actualizarRestaurante,
  actualizarVariosRestaurantes,
  eliminarRestaurante,
  eliminarVariosRestaurantes,
  listarPorCategoria,
  contarRestaurantes,
  obtenerCategorias
};

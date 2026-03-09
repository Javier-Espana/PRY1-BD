/**
 * Controlador de Artículos del Menú.
 * CRUD completo con referencias a Restaurante.
 */
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

const COLLECTION = 'ArticulosMenu';

/**
 * Crear un artículo del menú (documento referenciado a restaurante).
 */
async function crearArticulo(datos) {
  const db = getDB();
  const doc = {
    restaurante_id: new ObjectId(datos.restaurante_id),
    nombre: datos.nombre,
    descripcion: datos.descripcion || '',
    precio: parseFloat(datos.precio),
    categoria: datos.categoria || 'Otro',
    disponible: datos.disponible !== false,
    stock: parseInt(datos.stock) || 100,
    fecha_creacion: new Date()
  };

  const result = await db.collection(COLLECTION).insertOne(doc);
  return { id: result.insertedId, ...doc };
}

/**
 * Crear varios artículos a la vez (insertMany).
 */
async function crearVariosArticulos(articulos) {
  const db = getDB();
  const docs = articulos.map(a => ({
    restaurante_id: new ObjectId(a.restaurante_id),
    nombre: a.nombre,
    descripcion: a.descripcion || '',
    precio: parseFloat(a.precio),
    categoria: a.categoria || 'Otro',
    disponible: a.disponible !== false,
    stock: parseInt(a.stock) || 100,
    fecha_creacion: new Date()
  }));

  const result = await db.collection(COLLECTION).insertMany(docs);
  return result;
}

/**
 * Obtener artículo por ID.
 */
async function obtenerArticulo(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

/**
 * Listar artículos del menú de un restaurante con filtros.
 */
async function listarMenuRestaurante(restauranteId, { soloDisponibles = true, sort = { precio: 1 }, skip = 0, limit = 50 } = {}) {
  const db = getDB();
  const filtro = { restaurante_id: new ObjectId(restauranteId) };
  if (soloDisponibles) filtro.disponible = true;

  return await db.collection(COLLECTION)
    .find(filtro)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();
}

/**
 * Buscar artículos por texto.
 */
async function buscarArticulos(texto, limit = 10) {
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
 * Actualizar un artículo.
 */
async function actualizarArticulo(id, datos) {
  const db = getDB();
  const updateFields = {};
  if (datos.nombre) updateFields.nombre = datos.nombre;
  if (datos.descripcion) updateFields.descripcion = datos.descripcion;
  if (datos.precio !== undefined) updateFields.precio = parseFloat(datos.precio);
  if (datos.categoria) updateFields.categoria = datos.categoria;
  if (datos.disponible !== undefined) updateFields.disponible = datos.disponible;
  if (datos.stock !== undefined) updateFields.stock = parseInt(datos.stock);

  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );
  return result;
}

/**
 * Actualizar varios artículos (ej: desactivar todo el menú de un restaurante).
 */
async function actualizarVariosArticulos(filtro, datos) {
  const db = getDB();
  const result = await db.collection(COLLECTION).updateMany(filtro, { $set: datos });
  return result;
}

/**
 * Eliminar un artículo.
 */
async function eliminarArticulo(id) {
  const db = getDB();
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result;
}

/**
 * Eliminar varios artículos (ej: todos los de un restaurante eliminado).
 */
async function eliminarArticulosDeRestaurante(restauranteId) {
  const db = getDB();
  const result = await db.collection(COLLECTION).deleteMany({ restaurante_id: new ObjectId(restauranteId) });
  return result;
}

/**
 * Contar artículos de un restaurante.
 */
async function contarArticulos(restauranteId) {
  const db = getDB();
  return await db.collection(COLLECTION).countDocuments({ restaurante_id: new ObjectId(restauranteId) });
}

/**
 * Categorías distintas de artículos.
 */
async function obtenerCategoriasArticulos() {
  const db = getDB();
  return await db.collection(COLLECTION).distinct('categoria');
}

module.exports = {
  crearArticulo,
  crearVariosArticulos,
  obtenerArticulo,
  listarMenuRestaurante,
  buscarArticulos,
  actualizarArticulo,
  actualizarVariosArticulos,
  eliminarArticulo,
  eliminarArticulosDeRestaurante,
  contarArticulos,
  obtenerCategoriasArticulos
};

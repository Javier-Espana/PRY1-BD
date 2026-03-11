const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

const COLLECTION = 'ArticulosMenu';

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

  return await db.collection(COLLECTION).insertMany(docs);
}

async function obtenerArticulo(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function listarMenuRestaurante(restauranteId, { soloDisponibles = true, categoria, sort = { precio: 1 }, skip = 0, limit = 50 } = {}) {
  const db = getDB();
  const filtro = { restaurante_id: new ObjectId(restauranteId) };
  if (soloDisponibles) filtro.disponible = true;
  if (categoria) filtro.categoria = categoria;

  return await db.collection(COLLECTION)
    .find(filtro)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();
}

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

async function actualizarArticulo(id, datos) {
  const db = getDB();
  const updateFields = {};
  if (datos.nombre) updateFields.nombre = datos.nombre;
  if (datos.descripcion) updateFields.descripcion = datos.descripcion;
  if (datos.precio !== undefined) updateFields.precio = parseFloat(datos.precio);
  if (datos.categoria) updateFields.categoria = datos.categoria;
  if (datos.disponible !== undefined) updateFields.disponible = datos.disponible;
  if (datos.stock !== undefined) updateFields.stock = parseInt(datos.stock);

  return await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );
}

function normalizarFiltroBulk(filtro = {}) {
  const normalized = { ...filtro };
  if (normalized.restaurante_id) {
    normalized.restaurante_id = new ObjectId(normalized.restaurante_id);
  }
  if (normalized._id) {
    normalized._id = new ObjectId(normalized._id);
  }
  return normalized;
}

async function actualizarVariosArticulos(filtro, datos) {
  const db = getDB();
  const safeFiltro = normalizarFiltroBulk(filtro);
  return await db.collection(COLLECTION).updateMany(safeFiltro, { $set: datos });
}

async function eliminarArticulo(id) {
  const db = getDB();
  return await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
}

async function eliminarVariosArticulos(filtro) {
  const db = getDB();
  const safeFiltro = normalizarFiltroBulk(filtro);
  return await db.collection(COLLECTION).deleteMany(safeFiltro);
}

async function eliminarArticulosDeRestaurante(restauranteId) {
  const db = getDB();
  return await db.collection(COLLECTION).deleteMany({ restaurante_id: new ObjectId(restauranteId) });
}

async function contarArticulos(restauranteId) {
  const db = getDB();
  return await db.collection(COLLECTION).countDocuments({ restaurante_id: new ObjectId(restauranteId) });
}

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
  eliminarVariosArticulos,
  eliminarArticulosDeRestaurante,
  contarArticulos,
  obtenerCategoriasArticulos
};

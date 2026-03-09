/**
 * Controlador de Usuarios.
 * CRUD completo.
 */
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

const COLLECTION = 'Usuarios';

/**
 * Crear un usuario.
 */
async function crearUsuario(datos) {
  const db = getDB();
  const doc = {
    nombre: datos.nombre,
    email: datos.email,
    password_hash: datos.password_hash,
    direccion_principal: datos.direccion_principal || '',
    telefono: datos.telefono || '',
    rol: datos.rol || 'cliente',
    fecha_registro: new Date(),
    activo: true
  };

  const result = await db.collection(COLLECTION).insertOne(doc);
  return { id: result.insertedId, ...doc };
}

/**
 * Obtener usuario por ID.
 */
async function obtenerUsuario(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

/**
 * Obtener usuario por email (para login).
 */
async function obtenerPorEmail(email) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ email });
}

/**
 * Listar usuarios con filtros, proyección, sort, skip, limit.
 */
async function listarUsuarios({ filtro = {}, proyeccion = {}, sort = { fecha_registro: -1 }, skip = 0, limit = 10 } = {}) {
  const db = getDB();
  return await db.collection(COLLECTION)
    .find(filtro, { projection: proyeccion })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();
}

/**
 * Actualizar un usuario.
 */
async function actualizarUsuario(id, datos) {
  const db = getDB();
  const updateFields = {};
  if (datos.nombre) updateFields.nombre = datos.nombre;
  if (datos.email) updateFields.email = datos.email;
  if (datos.direccion_principal) updateFields.direccion_principal = datos.direccion_principal;
  if (datos.telefono) updateFields.telefono = datos.telefono;
  if (datos.rol) updateFields.rol = datos.rol;
  if (datos.activo !== undefined) updateFields.activo = datos.activo;

  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );
  return result;
}

/**
 * Eliminar un usuario.
 */
async function eliminarUsuario(id) {
  const db = getDB();
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result;
}

/**
 * Contar usuarios.
 */
async function contarUsuarios(filtro = {}) {
  const db = getDB();
  return await db.collection(COLLECTION).countDocuments(filtro);
}

module.exports = {
  crearUsuario,
  obtenerUsuario,
  obtenerPorEmail,
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  contarUsuarios
};

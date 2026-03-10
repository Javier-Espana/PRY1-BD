const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'delivery_db';

let client = null;
let db = null;
let gridFSBucket = null;

async function connectDB() {
  if (db) return db;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    gridFSBucket = new GridFSBucket(db, { bucketName: 'imagenes' });

    console.log(`Conectado a MongoDB: ${DB_NAME}`);
    return db;
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
}

function getDB() {
  if (!db) throw new Error('Base de datos no conectada. Llama a connectDB() primero.');
  return db;
}

function getClient() {
  if (!client) throw new Error('Cliente no conectado. Llama a connectDB() primero.');
  return client;
}

function getGridFSBucket() {
  if (!gridFSBucket) throw new Error('GridFS no inicializado. Llama a connectDB() primero.');
  return gridFSBucket;
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    gridFSBucket = null;
    console.log('Conexión a MongoDB cerrada.');
  }
}

module.exports = { connectDB, getDB, getClient, getGridFSBucket, closeDB };

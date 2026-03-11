const { connectDB, closeDB } = require('./src/config/database');
const { ObjectId } = require('mongodb');

async function testBulkUpdate() {
  const db = await connectDB();
  const ordenes = db.collection('Ordenes');

  // Toma las primeras 5 órdenes con estado "preparando"
  const ordenesAProcesar = await ordenes
    .find({ estado: 'preparando' })
    .limit(5)
    .toArray();

  if (ordenesAProcesar.length === 0) {
    console.log('No hay órdenes en estado "preparando"');
    await closeDB();
    return;
  }

  const ids = ordenesAProcesar.map(o => o._id);
  console.log(`Actualizando ${ids.length} órdenes de "preparando" a "enviado"`);

  const operaciones = ids.map(id => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { estado: 'enviado' } }
    }
  }));

  const result = await ordenes.bulkWrite(operaciones);
  console.log(`✓ Actualizadas ${result.modifiedCount} órdenes`);
  
  await closeDB();
}

testBulkUpdate().catch(console.error);
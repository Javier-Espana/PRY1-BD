const { connectDB, closeDB } = require('./src/config/database');

async function testBulk() {
  const db = await connectDB();
  const restaurantes = db.collection('Restaurantes');

  const operaciones = [
    {
      insertOne: {
        document: { 
          nombre: 'Pizzería Extra 1', 
          categoria: 'Italiana', 
          direccion: { type: 'Point', coordinates: [-99.1234, 19.4567] },
          activo: true
        }
      }
    },
    {
      insertOne: {
        document: { 
          nombre: 'Pizzería Extra 2', 
          categoria: 'Italiana', 
          direccion: { type: 'Point', coordinates: [-99.1235, 19.4568] },
          activo: true
        }
      }
    },
    {
      insertOne: {
        document: { 
          nombre: 'Pizzería Extra 3', 
          categoria: 'Italiana', 
          direccion: { type: 'Point', coordinates: [-99.1236, 19.4569] },
          activo: true
        }
      }
    }
  ];

  const result = await restaurantes.bulkWrite(operaciones);
  console.log(`✓ Insertadas ${result.insertedCount} restaurantes`);
  
  await closeDB();
}

testBulk().catch(console.error);
const { connectDB, closeDB, getDB } = require('../config/database');

async function configureNotableScan() {
  const db = await connectDB();

  console.log('\nConfigurando notablescan para rechazar queries sin indice...\n');

  try {
    const adminDb = db.admin();
    await adminDb.command({ setParameter: 1, notablescan: true });
    console.log('  [OK] notablescan activado globalmente');
    console.log('       Las consultas que requieran COLLSCAN seran rechazadas.\n');
  } catch (err) {
    if (err.codeName === 'Unauthorized' || err.code === 13) {
      console.log('  [WARN] No se puede configurar notablescan a nivel de servidor (requiere acceso admin)');
      console.log('         En Atlas, usa el profiler del cluster o configura desde la UI.\n');
    } else {
      console.log(`  [ERROR] ${err.message}\n`);
    }
  }
}

async function disableNotableScan() {
  const db = await connectDB();

  console.log('\nDesactivando notablescan...\n');

  try {
    const adminDb = db.admin();
    await adminDb.command({ setParameter: 1, notablescan: false });
    console.log('  [OK] notablescan desactivado. Las consultas COLLSCAN son permitidas de nuevo.\n');
  } catch (err) {
    console.log(`  [ERROR] ${err.message}\n`);
  }
}

async function testNotableScan() {
  const db = await connectDB();

  console.log('\nProbando que notablescan rechaza queries sin indice...\n');

  try {
    await db.collection('Restaurantes').find({ nombre: /test/i }).toArray();
    console.log('  [WARN] La consulta sin indice NO fue rechazada (notablescan puede no estar activo)');
  } catch (err) {
    if (err.message.includes('No query solutions') || err.codeName === 'NoQueryExecutionPlans') {
      console.log('  [OK] Query sin indice fue rechazada correctamente');
      console.log(`       Error: ${err.message}`);
    } else {
      console.log(`  [ERROR] ${err.message}`);
    }
  }

  try {
    await db.collection('Restaurantes').find({ categoria: 'Italiana' }).toArray();
    console.log('  [OK] Query CON indice (categoria) ejecutada sin problemas');
  } catch (err) {
    console.log(`  [ERROR] Query con indice fallo: ${err.message}`);
  }

  console.log('');
}

const action = process.argv[2] || 'enable';

(async () => {
  try {
    switch (action) {
      case 'enable':
        await configureNotableScan();
        await testNotableScan();
        break;
      case 'disable':
        await disableNotableScan();
        break;
      case 'test':
        await testNotableScan();
        break;
      default:
        console.log('Uso: node configureDB.js [enable|disable|test]');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await closeDB();
  }
})();

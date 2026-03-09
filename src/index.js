/**
 * Punto de entrada principal del sistema.
 * 
 * Modo API:     node src/index.js api
 * Modo Consola: node src/index.js (o npm start)
 */

require('dotenv').config();
const { connectDB, closeDB } = require('./config/database');
const { initCollections } = require('./models');

const MODE = process.argv[2] || 'console';

async function startAPI() {
  const express = require('express');
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Rutas
  app.use('/api/restaurantes', require('./routes/restaurants'));
  app.use('/api/usuarios', require('./routes/users'));
  app.use('/api/menu', require('./routes/menuItems'));
  app.use('/api/ordenes', require('./routes/orders'));
  app.use('/api/resenas', require('./routes/reviews'));
  app.use('/api/analiticas', require('./routes/analytics'));

  // Ruta raíz
  app.get('/', (req, res) => {
    res.json({
      nombre: 'Sistema de Gestión de Pedidos y Reseñas',
      version: '1.0.0',
      rutas: {
        restaurantes: '/api/restaurantes',
        usuarios: '/api/usuarios',
        menu: '/api/menu',
        ordenes: '/api/ordenes',
        resenas: '/api/resenas',
        analiticas: '/api/analiticas'
      }
    });
  });

  app.listen(PORT, () => {
    console.log(`\n🚀 API corriendo en http://localhost:${PORT}`);
    console.log('📝 Endpoints disponibles:');
    console.log(`   GET  http://localhost:${PORT}/`);
    console.log(`   GET  http://localhost:${PORT}/api/restaurantes`);
    console.log(`   GET  http://localhost:${PORT}/api/usuarios`);
    console.log(`   GET  http://localhost:${PORT}/api/menu`);
    console.log(`   GET  http://localhost:${PORT}/api/ordenes`);
    console.log(`   GET  http://localhost:${PORT}/api/resenas`);
    console.log(`   GET  http://localhost:${PORT}/api/analiticas/resumen`);
  });
}

async function startConsole() {
  const { menuPrincipal } = require('./utils/consoleMenu');
  await menuPrincipal();
}

async function main() {
  try {
    const db = await connectDB();
    await initCollections(db);

    if (MODE === 'api') {
      await startAPI();
    } else {
      await startConsole();
      await closeDB();
    }
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    await closeDB();
    process.exit(1);
  }
}

// Manejo de cierre limpio
process.on('SIGINT', async () => {
  console.log('\n👋 Cerrando...');
  await closeDB();
  process.exit(0);
});

main();

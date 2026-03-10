require('dotenv').config();
const { connectDB, closeDB } = require('./config/database');
const { initCollections } = require('./models');

const MODE = process.argv[2] || 'console';

async function startAPI() {
  const express = require('express');
  const path = require('path');
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use('/api/restaurantes', require('./routes/restaurants'));
  app.use('/api/usuarios', require('./routes/users'));
  app.use('/api/menu', require('./routes/menuItems'));
  app.use('/api/ordenes', require('./routes/orders'));
  app.use('/api/resenas', require('./routes/reviews'));
  app.use('/api/analiticas', require('./routes/analytics'));
  app.use('/api/bulk', require('./routes/bulk'));

  app.get('/api', (req, res) => {
    res.json({
      nombre: 'Sistema de Gestion de Pedidos y Resenas',
      version: '1.0.0',
      rutas: {
        restaurantes: '/api/restaurantes',
        usuarios: '/api/usuarios',
        menu: '/api/menu',
        ordenes: '/api/ordenes',
        resenas: '/api/resenas',
        analiticas: '/api/analiticas',
        bulk: '/api/bulk'
      }
    });
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
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
    console.error('Error fatal:', error.message);
    await closeDB();
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\nCerrando...');
  await closeDB();
  process.exit(0);
});

main();

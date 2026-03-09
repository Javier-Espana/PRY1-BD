/**
 * Script de seed: genera datos de prueba para todas las colecciones.
 * Crea al menos 50,000 documentos en Ordenes (requisito del proyecto).
 * 
 * Uso: npm run seed
 */

const { connectDB, closeDB } = require('../config/database');
const { initCollections } = require('../models');
const { createIndexes } = require('./createIndexes');

// ============================================================
// Datos de prueba
// ============================================================

const CATEGORIAS_RESTAURANTE = [
  'Comida Rápida', 'Italiana', 'Asiática', 'Mexicana',
  'Americana', 'Mediterránea', 'Francesa', 'Japonesa',
  'China', 'Peruana', 'Guatemalteca', 'Postres', 'Café'
];

const NOMBRES_RESTAURANTES = [
  'El Buen Sabor', 'La Cocina de Mamá', 'Rincón Gourmet', 'Sabores del Mundo',
  'Pizza Express', 'Taco Loco', 'Sushi Zen', 'Burger Palace', 'Café Central',
  'Pollo Rico', 'La Parrilla', 'Pasta Fresca', 'El Mesón', 'Dim Sum House',
  'Thai Garden', 'Le Petit Bistro', 'Cevichería del Mar', 'Antojitos GT',
  'Dulce Tentación', 'Wok & Roll', 'Steak House Elite', 'Taquería El Paso',
  'Pizzería Napoli', 'Restaurant Chen', 'Mariscos La Costa'
];

const CATEGORIAS_ARTICULO = [
  'Entrada', 'Plato Fuerte', 'Postre', 'Bebida',
  'Acompañamiento', 'Ensalada', 'Sopa', 'Snack'
];

const NOMBRES_ARTICULOS = [
  'Hamburguesa Clásica', 'Pizza Margherita', 'Tacos al Pastor', 'Sushi Roll',
  'Ensalada César', 'Pollo a la Plancha', 'Pasta Alfredo', 'Ceviche Mixto',
  'Sopa de Tortilla', 'Nachos con Guacamole', 'Arroz Frito', 'Pad Thai',
  'Churrasco', 'Filete de Pescado', 'Enchiladas Verdes', 'Ramen Tonkotsu',
  'Flan de Caramelo', 'Brownie con Helado', 'Limonada Natural', 'Café Espresso',
  'Jugo de Naranja', 'Quesadilla de Queso', 'Alitas BBQ', 'Empanadas',
  'Tiramisú', 'Cheesecake', 'Smoothie de Frutas', 'Agua de Jamaica',
  'Burrito Supreme', 'Gyozas', 'Spring Rolls', 'Tempura de Camarón'
];

const ESTADOS_ORDEN = ['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'];
const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia'];

const NOMBRES_USUARIOS = [
  'Ana', 'Carlos', 'María', 'Pedro', 'Lucía', 'Roberto', 'Diana', 'Fernando',
  'Sofía', 'Miguel', 'Valentina', 'Andrés', 'Camila', 'David', 'Isabella',
  'Jorge', 'Gabriela', 'Luis', 'Daniela', 'Alejandro'
];

const APELLIDOS = [
  'García', 'Rodríguez', 'Martínez', 'López', 'Hernández', 'González',
  'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera',
  'Cruz', 'Morales', 'Ortiz', 'Castillo'
];

const COMENTARIOS_RESENAS = [
  'Excelente comida, muy recomendado!',
  'El servicio fue muy rápido.',
  'Buena relación calidad-precio.',
  'La comida llegó fría, no tan buena experiencia.',
  'Me encantó, definitivamente vuelvo.',
  'Regular, esperaba un poco más.',
  'Los platillos son deliciosos y abundantes.',
  'No estuvo mal, pero hay mejores opciones.',
  'Increíble sabor, chef excepcional.',
  'Muy bueno! La presentación perfecta.',
  'Comida casera de primer nivel.',
  'El mejor restaurante de la zona sin duda.',
  'Tuve que esperar mucho pero la comida compensó.',
  'Porciones pequeñas para el precio.',
  'Sabores auténticos, vale cada centavo.'
];

// Utilidades
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDouble(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(daysBack = 365) {
  const now = Date.now();
  const past = now - daysBack * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

// Coordenadas de Guatemala City aproximadas
function randomCoords() {
  const latBase = 14.6;
  const lonBase = -90.5;
  return [
    lonBase + (Math.random() - 0.5) * 0.2,
    latBase + (Math.random() - 0.5) * 0.2
  ];
}

// ============================================================
// Seed principal
// ============================================================

async function seedData() {
  const db = await connectDB();

  console.log('\n🌱 Iniciando seed de datos...\n');

  // Inicializar colecciones con validación
  console.log('📋 Inicializando colecciones con validación JSON Schema...');
  await initCollections(db);

  // Crear índices
  console.log('\n📋 Creando índices...');
  await createIndexes();

  // Limpiar datos existentes
  console.log('\n🗑️  Limpiando datos existentes...');
  await db.collection('Restaurantes').deleteMany({});
  await db.collection('Usuarios').deleteMany({});
  await db.collection('ArticulosMenu').deleteMany({});
  await db.collection('Ordenes').deleteMany({});
  await db.collection('Resenas').deleteMany({});
  console.log('  ✅ Colecciones limpiadas');

  // ============================================================
  // 1. Restaurantes (25)
  // ============================================================
  console.log('\n🍽️  Creando restaurantes...');
  const restauranteDocs = NOMBRES_RESTAURANTES.map((nombre, i) => {
    const coords = randomCoords();
    return {
      nombre,
      descripcion: `Restaurante ${nombre} - especialidad en ${CATEGORIAS_RESTAURANTE[i % CATEGORIAS_RESTAURANTE.length]}`,
      categoria: CATEGORIAS_RESTAURANTE[i % CATEGORIAS_RESTAURANTE.length],
      direccion: { type: 'Point', coordinates: coords },
      telefono: `+502 ${randomBetween(3000, 9999)}-${randomBetween(1000, 9999)}`,
      email_contacto: `contacto@${nombre.toLowerCase().replace(/\s+/g, '')}.com`,
      rating_promedio: 0.0,
      total_resenas: 0,
      activo: true,
      fecha_registro: randomDate(180)
    };
  });

  const restaurantesResult = await db.collection('Restaurantes').insertMany(restauranteDocs);
  const restauranteIds = Object.values(restaurantesResult.insertedIds);
  console.log(`  ✅ ${restauranteIds.length} restaurantes creados`);

  // ============================================================
  // 2. Usuarios (200)
  // ============================================================
  console.log('\n👤 Creando usuarios...');
  const usuarioDocs = [];
  const usedEmails = new Set();

  for (let i = 0; i < 200; i++) {
    const nombre = randomElement(NOMBRES_USUARIOS);
    const apellido = randomElement(APELLIDOS);
    let email;
    do {
      email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${randomBetween(1, 9999)}@email.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    usuarioDocs.push({
      nombre: `${nombre} ${apellido}`,
      email,
      password_hash: `hash_${randomBetween(100000, 999999)}`,
      direccion_principal: `Zona ${randomBetween(1, 21)}, Ciudad de Guatemala`,
      telefono: `+502 ${randomBetween(3000, 9999)}-${randomBetween(1000, 9999)}`,
      rol: i < 5 ? 'admin' : 'cliente',
      fecha_registro: randomDate(365),
      activo: true
    });
  }

  const usuariosResult = await db.collection('Usuarios').insertMany(usuarioDocs);
  const usuarioIds = Object.values(usuariosResult.insertedIds);
  console.log(`  ✅ ${usuarioIds.length} usuarios creados`);

  // ============================================================
  // 3. Artículos del Menú (~250, ~10 por restaurante)
  // ============================================================
  console.log('\n📝 Creando artículos del menú...');
  const articuloDocs = [];

  for (const restId of restauranteIds) {
    const numArticulos = randomBetween(8, 15);
    const usedNames = new Set();

    for (let j = 0; j < numArticulos; j++) {
      let nombre;
      do {
        nombre = randomElement(NOMBRES_ARTICULOS);
      } while (usedNames.has(nombre));
      usedNames.add(nombre);

      articuloDocs.push({
        restaurante_id: restId,
        nombre,
        descripcion: `Delicioso ${nombre} preparado con ingredientes frescos`,
        precio: randomDouble(25, 150),
        categoria: randomElement(CATEGORIAS_ARTICULO),
        disponible: Math.random() > 0.1,
        stock: randomBetween(10, 500),
        fecha_creacion: randomDate(180)
      });
    }
  }

  const articulosResult = await db.collection('ArticulosMenu').insertMany(articuloDocs);
  const articuloIds = Object.values(articulosResult.insertedIds);
  console.log(`  ✅ ${articuloIds.length} artículos del menú creados`);

  // Mapear artículos por restaurante
  const articulosPorRestaurante = {};
  for (const art of articuloDocs) {
    const rId = art.restaurante_id.toString();
    if (!articulosPorRestaurante[rId]) articulosPorRestaurante[rId] = [];
    articulosPorRestaurante[rId].push(art);
  }

  // Obtener los artículos con sus IDs insertados
  const articulosConId = await db.collection('ArticulosMenu').find({}).toArray();
  const articulosPorRestauranteConId = {};
  for (const art of articulosConId) {
    const rId = art.restaurante_id.toString();
    if (!articulosPorRestauranteConId[rId]) articulosPorRestauranteConId[rId] = [];
    articulosPorRestauranteConId[rId].push(art);
  }

  // ============================================================
  // 4. Órdenes (50,000+ documentos - REQUERIMIENTO)
  // ============================================================
  console.log('\n📦 Creando 55,000 órdenes (esto toma unos segundos)...');
  const TOTAL_ORDENES = 55000;
  const BATCH_SIZE = 5000;

  let ordenesInsertadas = 0;
  const ordenIdsList = [];

  for (let batch = 0; batch < Math.ceil(TOTAL_ORDENES / BATCH_SIZE); batch++) {
    const ordenDocs = [];
    const batchCount = Math.min(BATCH_SIZE, TOTAL_ORDENES - ordenesInsertadas);

    for (let i = 0; i < batchCount; i++) {
      const restId = randomElement(restauranteIds);
      const articulosDelRest = articulosPorRestauranteConId[restId.toString()] || [];
      if (articulosDelRest.length === 0) continue;

      const numItems = randomBetween(1, 4);
      const items = [];
      const usedItems = new Set();

      for (let j = 0; j < numItems && j < articulosDelRest.length; j++) {
        let art;
        do {
          art = randomElement(articulosDelRest);
        } while (usedItems.has(art._id.toString()) && usedItems.size < articulosDelRest.length);

        if (usedItems.has(art._id.toString())) continue;
        usedItems.add(art._id.toString());

        const cantidad = randomBetween(1, 3);
        items.push({
          menu_item_id: art._id,
          nombre: art.nombre,
          cantidad,
          precio_unitario: art.precio,
          subtotal: Math.round(cantidad * art.precio * 100) / 100
        });
      }

      if (items.length === 0) continue;

      const total = items.reduce((sum, i) => sum + i.subtotal, 0);
      const fechaCreacion = randomDate(180);

      ordenDocs.push({
        usuario_id: randomElement(usuarioIds),
        restaurante_id: restId,
        items,
        estado: randomElement(ESTADOS_ORDEN),
        total: Math.round(total * 100) / 100,
        metodo_pago: randomElement(METODOS_PAGO),
        fecha_creacion: fechaCreacion,
        fecha_actualizacion: fechaCreacion
      });
    }

    if (ordenDocs.length > 0) {
      const result = await db.collection('Ordenes').insertMany(ordenDocs);
      const ids = Object.values(result.insertedIds);
      ordenIdsList.push(...ids);
      ordenesInsertadas += ordenDocs.length;
      console.log(`  📦 Batch ${batch + 1}: ${ordenDocs.length} órdenes (total: ${ordenesInsertadas})`);
    }
  }
  console.log(`  ✅ ${ordenesInsertadas} órdenes creadas`);

  // ============================================================
  // 5. Reseñas (~5,000 para órdenes entregadas)
  // ============================================================
  console.log('\n⭐ Creando reseñas...');

  // Obtener órdenes entregadas
  const ordenesEntregadas = await db.collection('Ordenes')
    .find({ estado: 'entregado' })
    .limit(6000)
    .toArray();

  const resenaDocs = [];
  const ordenesResenadasSet = new Set();

  for (const orden of ordenesEntregadas) {
    if (resenaDocs.length >= 5000) break;
    // 70% probabilidad de tener reseña
    if (Math.random() > 0.7) continue;

    const ordenIdStr = orden._id.toString();
    if (ordenesResenadasSet.has(ordenIdStr)) continue;
    ordenesResenadasSet.add(ordenIdStr);

    resenaDocs.push({
      usuario_id: orden.usuario_id,
      restaurante_id: orden.restaurante_id,
      orden_id: orden._id,
      calificacion: randomBetween(1, 5),
      comentario: randomElement(COMENTARIOS_RESENAS),
      imagenes: [],
      fecha_creacion: new Date(orden.fecha_creacion.getTime() + randomBetween(1, 72) * 3600000)
    });
  }

  if (resenaDocs.length > 0) {
    await db.collection('Resenas').insertMany(resenaDocs);
  }
  console.log(`  ✅ ${resenaDocs.length} reseñas creadas`);

  // ============================================================
  // 6. Actualizar ratings de restaurantes
  // ============================================================
  console.log('\n📊 Actualizando ratings de restaurantes...');

  for (const restId of restauranteIds) {
    const pipeline = [
      { $match: { restaurante_id: restId } },
      {
        $group: {
          _id: null,
          promedio: { $avg: '$calificacion' },
          total: { $sum: 1 }
        }
      }
    ];

    const resultado = await db.collection('Resenas').aggregate(pipeline).toArray();
    if (resultado.length > 0) {
      await db.collection('Restaurantes').updateOne(
        { _id: restId },
        {
          $set: {
            rating_promedio: Math.round(resultado[0].promedio * 100) / 100,
            total_resenas: resultado[0].total
          }
        }
      );
    }
  }
  console.log('  ✅ Ratings actualizados');

  // ============================================================
  // Resumen
  // ============================================================
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE SEED');
  console.log('='.repeat(50));
  console.log(`  🍽️  Restaurantes:     ${restauranteIds.length}`);
  console.log(`  👤 Usuarios:          ${usuarioIds.length}`);
  console.log(`  📝 Artículos menú:    ${articuloIds.length}`);
  console.log(`  📦 Órdenes:           ${ordenesInsertadas}`);
  console.log(`  ⭐ Reseñas:           ${resenaDocs.length}`);
  console.log('='.repeat(50));
  console.log('✅ Seed completado exitosamente!\n');
}

// Ejecutar
if (require.main === module) {
  seedData()
    .catch(err => console.error('❌ Error en seed:', err))
    .finally(() => closeDB());
}

module.exports = { seedData };

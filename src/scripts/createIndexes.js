const { connectDB, closeDB, getDB } = require('../config/database');

async function createIndexes() {
  const db = await connectDB();
  console.log('\nCreando índices...\n');

  // ============================================================
  // RESTAURANTES
  // ============================================================

  // Índice geoespacial 2dsphere para consultas por proximidad
  await db.collection('Restaurantes').createIndex(
    { direccion: '2dsphere' },
    { name: 'idx_restaurantes_geo' }
  );
  console.log('  Restaurantes: idx_restaurantes_geo (2dsphere)');

  // Índice compuesto para ranking por rating
  await db.collection('Restaurantes').createIndex(
    { rating_promedio: -1, total_resenas: -1 },
    { name: 'idx_restaurantes_rating' }
  );
  console.log('  Restaurantes: idx_restaurantes_rating (compuesto)');

  // Índice de texto para búsqueda por nombre y descripción
  await db.collection('Restaurantes').createIndex(
    { nombre: 'text', descripcion: 'text' },
    { name: 'idx_restaurantes_text', default_language: 'spanish' }
  );
  console.log('  Restaurantes: idx_restaurantes_text (texto)');

  // Índice simple por categoría
  await db.collection('Restaurantes').createIndex(
    { categoria: 1 },
    { name: 'idx_restaurantes_categoria' }
  );
  console.log('  Restaurantes: idx_restaurantes_categoria (simple)');

  // ============================================================
  // USUARIOS
  // ============================================================

  // Índice único en email
  await db.collection('Usuarios').createIndex(
    { email: 1 },
    { unique: true, name: 'idx_usuarios_email_unique' }
  );
  console.log('  Usuarios: idx_usuarios_email_unique (único)');

  // ============================================================
  // ARTÍCULOS DEL MENÚ
  // ============================================================

  // Índice compuesto para menú por restaurante + stock
  await db.collection('ArticulosMenu').createIndex(
    { restaurante_id: 1, stock: -1 },
    { name: 'idx_menu_restaurante_stock' }
  );
  console.log('  ArticulosMenu: idx_menu_restaurante_stock (compuesto)');

  // Índice compuesto para menú por restaurante + disponible
  await db.collection('ArticulosMenu').createIndex(
    { restaurante_id: 1, disponible: 1 },
    { name: 'idx_menu_restaurante_disponible' }
  );
  console.log('  ArticulosMenu: idx_menu_restaurante_disponible (compuesto)');

  // Índice de texto para búsqueda en artículos
  await db.collection('ArticulosMenu').createIndex(
    { nombre: 'text', descripcion: 'text' },
    { name: 'idx_menu_text', default_language: 'spanish' }
  );
  console.log('  ArticulosMenu: idx_menu_text (texto)');

  // ============================================================
  // ÓRDENES
  // ============================================================

  // Índice compuesto: historial de órdenes por usuario con fecha
  await db.collection('Ordenes').createIndex(
    { usuario_id: 1, fecha_creacion: -1 },
    { name: 'idx_ordenes_usuario_fecha' }
  );
  console.log('  Ordenes: idx_ordenes_usuario_fecha (compuesto)');

  // Índice compuesto: órdenes por restaurante con fecha
  await db.collection('Ordenes').createIndex(
    { restaurante_id: 1, fecha_creacion: -1 },
    { name: 'idx_ordenes_restaurante_fecha' }
  );
  console.log('  Ordenes: idx_ordenes_restaurante_fecha (compuesto)');

  // Índice compuesto: filtrar por estado dentro de restaurante
  await db.collection('Ordenes').createIndex(
    { restaurante_id: 1, estado: 1, fecha_creacion: -1 },
    { name: 'idx_ordenes_restaurante_estado' }
  );
  console.log('  Ordenes: idx_ordenes_restaurante_estado (compuesto)');

  // Índice simple por estado (para consultas generales)
  await db.collection('Ordenes').createIndex(
    { estado: 1 },
    { name: 'idx_ordenes_estado' }
  );
  console.log('  Ordenes: idx_ordenes_estado (simple)');

  // Índice multikey en items.menu_item_id (para aggregation de platillos más vendidos)
  await db.collection('Ordenes').createIndex(
    { 'items.menu_item_id': 1 },
    { name: 'idx_ordenes_items_menu_item' }
  );
  console.log('  Ordenes: idx_ordenes_items_menu_item (multikey)');

  // ============================================================
  // RESEÑAS
  // ============================================================

  // Índice compuesto: reseñas por restaurante con fecha
  await db.collection('Resenas').createIndex(
    { restaurante_id: 1, fecha_creacion: -1 },
    { name: 'idx_resenas_restaurante_fecha' }
  );
  console.log('  Resenas: idx_resenas_restaurante_fecha (compuesto)');

  // Índice único: una reseña por orden
  await db.collection('Resenas').createIndex(
    { orden_id: 1 },
    { unique: true, name: 'idx_resenas_orden_unique' }
  );
  console.log('  Resenas: idx_resenas_orden_unique (único)');

  // Índice multikey en imagenes.file_id
  await db.collection('Resenas').createIndex(
    { 'imagenes.file_id': 1 },
    { name: 'idx_resenas_imagenes_file' }
  );
  console.log('  Resenas: idx_resenas_imagenes_file (multikey)');

  // Índice por usuario (para ver reseñas propias)
  await db.collection('Resenas').createIndex(
    { usuario_id: 1, fecha_creacion: -1 },
    { name: 'idx_resenas_usuario_fecha' }
  );
  console.log('  Resenas: idx_resenas_usuario_fecha (compuesto)');

  console.log('\nTodos los índices creados exitosamente.\n');
}

async function validateIndexes() {
  const db = getDB();
  console.log('\nValidando indices con explain()...\n');

  function extractStats(explain) {
    const plan = explain.queryPlanner?.winningPlan || {};
    const stats = explain.executionStats || {};

    function findStage(node) {
      if (!node) return 'UNKNOWN';
      if (node.stage === 'IXSCAN' || node.stage === 'COLLSCAN' || node.stage === 'GEO_NEAR_2DSPHERE') return node.stage;
      if (node.inputStage) return findStage(node.inputStage);
      if (node.inputStages) {
        for (const s of node.inputStages) {
          const r = findStage(s);
          if (r !== 'UNKNOWN') return r;
        }
      }
      return node.stage || 'UNKNOWN';
    }

    function findIndexName(node) {
      if (!node) return '-';
      if (node.indexName) return node.indexName;
      if (node.inputStage) return findIndexName(node.inputStage);
      if (node.inputStages) {
        for (const s of node.inputStages) {
          const r = findIndexName(s);
          if (r !== '-') return r;
        }
      }
      return '-';
    }

    return {
      scan: findStage(plan),
      index: findIndexName(plan),
      nReturned: stats.nReturned ?? 0,
      totalKeysExamined: stats.totalKeysExamined ?? 0,
      totalDocsExamined: stats.totalDocsExamined ?? 0,
      executionTimeMs: stats.executionTimeMillis ?? 0
    };
  }

  function logResult(label, s) {
    const ok = s.scan !== 'COLLSCAN';
    const mark = ok ? '[OK]' : '[WARN]';
    console.log(`  ${mark} ${label}`);
    console.log(`       Scan: ${s.scan} | Index: ${s.index}`);
    console.log(`       nReturned: ${s.nReturned} | keysExamined: ${s.totalKeysExamined} | docsExamined: ${s.totalDocsExamined} | time: ${s.executionTimeMs}ms`);
  }

  const { ObjectId } = require('mongodb');

  // 1. Restaurantes cercanos (2dsphere)
  const geoExplain = await db.collection('Restaurantes')
    .find({
      direccion: {
        $near: {
          $geometry: { type: 'Point', coordinates: [-90.5069, 14.6349] },
          $maxDistance: 5000
        }
      }
    })
    .explain('executionStats');
  logResult('Restaurantes cercanos (2dsphere)', extractStats(geoExplain));

  // 2. Restaurantes por categoria
  const catExplain = await db.collection('Restaurantes')
    .find({ categoria: 'Italiana' })
    .explain('executionStats');
  logResult('Restaurantes por categoria', extractStats(catExplain));

  // 3. Menu por restaurante + disponible
  const menuExplain = await db.collection('ArticulosMenu')
    .find({ restaurante_id: new ObjectId(), disponible: true })
    .explain('executionStats');
  logResult('Menu por restaurante + disponible', extractStats(menuExplain));

  // 4. Ordenes por usuario + fecha
  const ordenesExplain = await db.collection('Ordenes')
    .find({ usuario_id: new ObjectId() })
    .sort({ fecha_creacion: -1 })
    .explain('executionStats');
  logResult('Ordenes por usuario + fecha', extractStats(ordenesExplain));

  // 5. Ordenes por estado
  const estadoExplain = await db.collection('Ordenes')
    .find({ estado: 'pendiente' })
    .explain('executionStats');
  logResult('Ordenes por estado', extractStats(estadoExplain));

  // 6. Ordenes por restaurante + estado
  const restEstadoExplain = await db.collection('Ordenes')
    .find({ restaurante_id: new ObjectId(), estado: 'pendiente' })
    .sort({ fecha_creacion: -1 })
    .explain('executionStats');
  logResult('Ordenes por restaurante + estado', extractStats(restEstadoExplain));

  // 7. Resenas por restaurante + fecha
  const resenasExplain = await db.collection('Resenas')
    .find({ restaurante_id: new ObjectId() })
    .sort({ fecha_creacion: -1 })
    .explain('executionStats');
  logResult('Resenas por restaurante + fecha', extractStats(resenasExplain));

  // 8. Resenas por usuario
  const resenasUserExplain = await db.collection('Resenas')
    .find({ usuario_id: new ObjectId() })
    .sort({ fecha_creacion: -1 })
    .explain('executionStats');
  logResult('Resenas por usuario + fecha', extractStats(resenasUserExplain));

  console.log('\nValidacion de indices completada.\n');
}

// Ejecutar si se corre directamente
if (require.main === module) {
  (async () => {
    try {
      await createIndexes();
      await validateIndexes();
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      await closeDB();
    }
  })();
}

module.exports = { createIndexes, validateIndexes };

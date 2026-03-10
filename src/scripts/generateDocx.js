/**
 * Genera el Documento de Diseño en formato Word (.docx)
 * con screenshots embebidos.
 *
 * Uso: node src/scripts/generateDocx.js
 * Salida: docs/DOCUMENTO_DISENO.docx
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  ImageRun, AlignmentType, PageBreak, ShadingType
} = require('docx');

const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');
const OUTPUT_PATH = path.join(__dirname, '..', '..', 'docs', 'DOCUMENTO_DISENO.docx');

// ─── helpers ───────────────────────────────────────────────────
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { before: 300, after: 150 } });
}

function para(text, opts = {}) {
  const runs = [];
  if (typeof text === 'string') {
    runs.push(new TextRun({ text, size: 22, ...opts }));
  } else {
    runs.push(...text);
  }
  return new Paragraph({ children: runs, spacing: { after: 120 } });
}

function bold(text) {
  return new TextRun({ text, bold: true, size: 22 });
}

function normal(text) {
  return new TextRun({ text, size: 22 });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    bullet: { level: 0 },
    spacing: { after: 60 }
  });
}

function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Consolas', size: 18 })],
    spacing: { after: 60 },
    indent: { left: 360 }
  });
}

function codeBlock(lines) {
  return lines.map(l => code(l));
}

function emptyLine() {
  return new Paragraph({ text: '', spacing: { after: 60 } });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function tableCell(text, opts = {}) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, bold: opts.bold || false })],
      alignment: AlignmentType.LEFT
    })],
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shading ? { type: ShadingType.CLEAR, fill: opts.shading } : undefined
  });
}

function headerCell(text, width) {
  return tableCell(text, { bold: true, shading: '2B2D42', width });
}

function simpleTable(headers, rows, widths) {
  const hRow = new TableRow({
    children: headers.map((h, i) => headerCell(h, widths ? widths[i] : undefined))
  });
  const dataRows = rows.map(row =>
    new TableRow({
      children: row.map((cell, i) => tableCell(cell, { width: widths ? widths[i] : undefined }))
    })
  );
  return new Table({
    rows: [hRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE }
  });
}

function insertImage(filename, widthPx = 600, heightPx = 340) {
  const imgPath = path.join(SCREENSHOTS_DIR, filename);
  if (!fs.existsSync(imgPath)) {
    console.warn(`  [WARN] Screenshot no encontrado: ${filename}`);
    return para(`[Imagen no encontrada: ${filename}]`);
  }
  const data = fs.readFileSync(imgPath);
  return new Paragraph({
    children: [
      new ImageRun({ data, transformation: { width: widthPx, height: heightPx }, type: 'png' })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 200 }
  });
}

// ─── Secciones del documento ──────────────────────────────────

function titlePage() {
  return [
    emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      children: [new TextRun({ text: 'Documento de Diseño', bold: true, size: 52, color: '2B2D42' })],
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Sistema de Gestión de Pedidos y Reseñas de Restaurantes', size: 28, italics: true })],
      alignment: AlignmentType.CENTER, spacing: { after: 200 }
    }),
    emptyLine(),
    new Paragraph({
      children: [new TextRun({ text: 'Proyecto 1 — CC3089 Base de Datos 2, Sección 20', size: 24 })],
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Universidad del Valle de Guatemala', size: 24 })],
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Catedrática: Daniela Mesalles', size: 24 })],
      alignment: AlignmentType.CENTER, spacing: { after: 400 }
    }),
    simpleTable(
      ['Nombre', 'Carné'],
      [['Roberto Barreda', '23354'], ['Javier España', '23361'], ['Diego López', '23747']]
    ),
    emptyLine(), emptyLine(),
    new Paragraph({
      children: [new TextRun({ text: 'Fecha de entrega: 10 de marzo de 2026', size: 24 })],
      alignment: AlignmentType.CENTER
    }),
    pageBreak()
  ];
}

function seccionCasoUso() {
  return [
    heading('1. Descripción del caso de uso'),
    para('El sistema modela una plataforma de delivery de comida similar a Uber Eats o PedidosYa, donde:'),
    bullet('Restaurantes publican su menú de artículos.'),
    bullet('Usuarios (clientes) realizan pedidos seleccionando artículos del menú.'),
    bullet('Cada Orden contiene uno o más artículos embebidos con cantidad, precio unitario y subtotal.'),
    bullet('Al entregar una orden, el usuario puede dejar una Reseña con calificación (1-5), comentario e imágenes almacenadas en GridFS.'),
    emptyLine(),
    para('El sistema demuestra las capacidades de MongoDB: documentos embebidos vs referenciados, transacciones, índices avanzados, GridFS, aggregation pipelines y operaciones bulk.'),
  ];
}

function seccionArquitectura() {
  return [
    heading('2. Arquitectura del sistema'),
    para([
      bold('Backend: '), normal('Node.js + Express, driver nativo de MongoDB v6.13')
    ]),
    para([
      bold('Base de datos: '), normal('MongoDB Atlas (replica set de 3 nodos)')
    ]),
    para([
      bold('Frontend: '), normal('Vanilla JS SPA con dark theme, sin frameworks')
    ]),
    para([
      bold('Consola: '), normal('Menú interactivo con readline-sync')
    ]),
    emptyLine(),
    para('El sistema ofrece dos modos de interacción: una API REST con 56 endpoints consumida por el frontend SPA, y un menú de consola interactivo para operaciones directas.'),
  ];
}

function seccionModeloDatos() {
  return [
    heading('3. Modelo de datos'),
    heading('3.1 Colecciones', HeadingLevel.HEADING_2),
    simpleTable(
      ['Colección', 'Documentos', 'Tipo', 'Validación'],
      [
        ['Restaurantes', '25', 'Independiente con GeoJSON', 'JSON Schema (moderate)'],
        ['Usuarios', '200', 'Independiente', 'JSON Schema (moderate)'],
        ['ArticulosMenu', '~298', 'Referenciado (restaurante_id)', 'JSON Schema (moderate)'],
        ['Ordenes', '55,000', 'Embebido (items[]) + referenciado', 'JSON Schema (moderate)'],
        ['Reseñas', '~4,230', 'Referenciado + GridFS refs', 'JSON Schema (moderate)']
      ]
    ),
    para('Adicionalmente, GridFS crea automáticamente imagenes.files e imagenes.chunks.'),
    emptyLine(),
    insertImage('Collections.png', 580, 320),
    insertImage('Counting.png', 580, 320),

    heading('3.2 Relaciones', HeadingLevel.HEADING_2),
    para([bold('Documentos embebidos: '), normal('Los items dentro de cada Orden son documentos embebidos. Cada item contiene un snapshot del nombre y precio del artículo al momento de la compra.')]),
    para([bold('Documentos referenciados: '), normal('Las relaciones entre colecciones usan ObjectId como referencia (usuario_id, restaurante_id, menu_item_id, orden_id).')]),
    emptyLine(),
    insertImage('DocumentoExample.png', 580, 400),

    heading('3.3 Esquema: Restaurantes', HeadingLevel.HEADING_2),
    ...codeBlock([
      '{',
      '  "_id": "ObjectId",',
      '  "nombre": "string (requerido)",',
      '  "descripcion": "string",',
      '  "categoria": "enum [14 categorías]",',
      '  "direccion": { "type": "Point", "coordinates": [lng, lat] },',
      '  "telefono": "string",',
      '  "rating_promedio": "double (0-5)",',
      '  "total_resenas": "int (>= 0)",',
      '  "activo": "bool (requerido)",',
      '  "etiquetas": ["string"],',
      '  "fecha_registro": "date"',
      '}'
    ]),

    heading('3.4 Esquema: Usuarios', HeadingLevel.HEADING_2),
    ...codeBlock([
      '{',
      '  "_id": "ObjectId",',
      '  "nombre": "string (requerido)",',
      '  "email": "string (requerido, único)",',
      '  "password_hash": "string (requerido)",',
      '  "rol": "enum [cliente, admin]",',
      '  "fecha_registro": "date",',
      '  "activo": "bool"',
      '}'
    ]),

    heading('3.5 Esquema: ArticulosMenu', HeadingLevel.HEADING_2),
    ...codeBlock([
      '{',
      '  "_id": "ObjectId",',
      '  "restaurante_id": "ObjectId (ref → Restaurantes)",',
      '  "nombre": "string (requerido)",',
      '  "precio": "double (>= 0)",',
      '  "categoria": "enum [8 categorías]",',
      '  "disponible": "bool (requerido)",',
      '  "stock": "int (>= 0)",',
      '  "fecha_creacion": "date"',
      '}'
    ]),

    heading('3.6 Esquema: Ordenes (shard key: _id)', HeadingLevel.HEADING_2),
    ...codeBlock([
      '{',
      '  "_id": "ObjectId  ← SHARD KEY",',
      '  "usuario_id": "ObjectId (ref → Usuarios)",',
      '  "restaurante_id": "ObjectId (ref → Restaurantes)",',
      '  "items": [{',
      '    "menu_item_id": "ObjectId (ref → ArticulosMenu)",',
      '    "nombre": "string (snapshot)",',
      '    "cantidad": "int (>= 1)",',
      '    "precio_unitario": "double",',
      '    "subtotal": "double"',
      '  }],',
      '  "estado": "enum [pendiente, preparando, enviado, entregado, cancelado]",',
      '  "total": "double",',
      '  "metodo_pago": "enum [efectivo, tarjeta, transferencia]",',
      '  "fecha_creacion": "date"',
      '}'
    ]),

    heading('3.7 Esquema: Reseñas', HeadingLevel.HEADING_2),
    ...codeBlock([
      '{',
      '  "_id": "ObjectId",',
      '  "usuario_id": "ObjectId (ref → Usuarios)",',
      '  "restaurante_id": "ObjectId (ref → Restaurantes)",',
      '  "orden_id": "ObjectId (ref → Ordenes, único)",',
      '  "calificacion": "int (1-5)",',
      '  "comentario": "string (max 1000)",',
      '  "imagenes": [{ "file_id": "ObjectId (GridFS)", "descripcion": "string" }],',
      '  "fecha_creacion": "date"',
      '}'
    ]),
    pageBreak()
  ];
}

function seccionIndices() {
  return [
    heading('4. Estrategia de índices'),
    para('Se crearon 17 índices para optimizar todas las consultas. Todas usan IXSCAN (verificado con explain()).'),
    emptyLine(),
    simpleTable(
      ['#', 'Nombre', 'Colección', 'Tipo', 'Justificación'],
      [
        ['1', 'idx_restaurantes_geo', 'Restaurantes', '2dsphere', 'Búsqueda geoespacial'],
        ['2', 'idx_restaurantes_rating', 'Restaurantes', 'Compuesto', 'Ranking por calificación'],
        ['3', 'idx_restaurantes_text', 'Restaurantes', 'Text', 'Búsqueda full-text'],
        ['4', 'idx_restaurantes_categoria', 'Restaurantes', 'Simple', 'Filtro por categoría'],
        ['5', 'idx_usuarios_email_unique', 'Usuarios', 'Unique', 'Unicidad de email'],
        ['6', 'idx_menu_restaurante_stock', 'ArticulosMenu', 'Compuesto', 'Menú por restaurante + stock'],
        ['7', 'idx_menu_restaurante_disponible', 'ArticulosMenu', 'Compuesto', 'Artículos disponibles'],
        ['8', 'idx_menu_text', 'ArticulosMenu', 'Text', 'Búsqueda de artículos'],
        ['9', 'idx_ordenes_usuario_fecha', 'Ordenes', 'Compuesto', 'Historial de usuario'],
        ['10', 'idx_ordenes_restaurante_fecha', 'Ordenes', 'Compuesto', 'Órdenes por restaurante'],
        ['11', 'idx_ordenes_restaurante_estado', 'Ordenes', 'Compuesto', 'Filtro estado + restaurante'],
        ['12', 'idx_ordenes_estado', 'Ordenes', 'Simple', 'Consultas por estado'],
        ['13', 'idx_ordenes_items_menu_item', 'Ordenes', 'Multikey', 'Platillos más vendidos'],
        ['14', 'idx_resenas_restaurante_fecha', 'Reseñas', 'Compuesto', 'Reseñas por restaurante'],
        ['15', 'idx_resenas_orden_unique', 'Reseñas', 'Unique', '1 reseña por orden'],
        ['16', 'idx_resenas_usuario_fecha', 'Reseñas', 'Compuesto', 'Reseñas por usuario'],
        ['17', 'idx_resenas_imagenes_file', 'Reseñas', 'Multikey', 'Búsqueda por archivo GridFS']
      ]
    ),
    emptyLine(),
    heading('4.1 Validación con explain()', HeadingLevel.HEADING_2),
    para('Todas las consultas fueron validadas con explain("executionStats") confirmando uso de IXSCAN:'),
    insertImage('RunIndexesExplain.png', 580, 360),
    insertImage('RunIndeexes.png', 580, 280),
    insertImage('GetIndexes.png', 580, 480),
    heading('4.2 notablescan', HeadingLevel.HEADING_2),
    para('El sistema soporta activar notablescan para rechazar consultas que requieran COLLSCAN:'),
    insertImage('notablescan.png', 580, 300),
    pageBreak()
  ];
}

function seccionShardKey() {
  return [
    heading('5. Estrategia de Shard Key'),
    heading('5.1 Shard key seleccionada', HeadingLevel.HEADING_2),
    para([bold('Campo: '), normal('_id de la colección Ordenes (order_id)')]),
    para('Definido según indicaciones de la catedrática Daniela Mesalles.'),
    emptyLine(),
    heading('5.2 Justificación', HeadingLevel.HEADING_2),
    simpleTable(
      ['Criterio', 'Evaluación'],
      [
        ['Cardinalidad', 'Muy alta — cada orden tiene un ObjectId único, distribución granular entre shards'],
        ['Frecuencia de escritura', 'ObjectId monotónicamente creciente; con hashed sharding se mitigan hot spots'],
        ['Patrón de consulta', 'Consultas a órdenes individuales por _id son targeted queries directas'],
        ['Distribución', 'Con hashed sharding sobre _id, distribución uniforme'],
        ['Escalabilidad', 'Ordenes es la colección más grande (55,000+) y crece continuamente']
      ]
    ),
    emptyLine(),
    heading('5.3 Comando de sharding', HeadingLevel.HEADING_2),
    ...codeBlock([
      'sh.enableSharding("delivery_db")',
      'sh.shardCollection("delivery_db.Ordenes", { _id: "hashed" })'
    ]),
    emptyLine(),
    heading('5.4 Alternativa descartada', HeadingLevel.HEADING_2),
    para('Se consideró restaurant_id pero se descartó por:'),
    bullet('Baja cardinalidad (solo 25 restaurantes) causa distribución desigual'),
    bullet('Restaurantes populares concentrarían demasiadas órdenes en un solo shard'),
    bullet('Consultas por _id individual serían scatter-gather en lugar de targeted'),
  ];
}

function seccionValidation() {
  return [
    heading('6. JSON Schema Validation'),
    para('Todas las colecciones usan validación JSON Schema con nivel moderate y acción error:'),
    bullet('Los documentos existentes no se revalidan al modificar el esquema'),
    bullet('Los INSERT y UPDATE de documentos nuevos SÍ son validados'),
    bullet('Un documento que no cumpla el esquema causa un error de validación'),
    para('Los tipos numéricos aceptan [double, int, long, decimal] para compatibilidad con la serialización del driver.'),
    insertImage('TotalesNumericos.png', 580, 400),
  ];
}

function seccionTransacciones() {
  return [
    heading('7. Transacciones multi-documento'),
    para('La creación de órdenes usa una transacción multi-documento para garantizar atomicidad:'),
    bullet('1. Iniciar sesión con client.startSession()'),
    bullet('2. Iniciar transacción con session.startTransaction()'),
    bullet('3. Verificar stock de cada artículo en ArticulosMenu'),
    bullet('4. Decrementar stock con updateOne({ $inc: { stock: -cantidad } })'),
    bullet('5. Insertar la orden en la colección Ordenes'),
    bullet('6. Commit si todo exitoso, abort si stock insuficiente'),
    insertImage('StockExiste.png', 580, 300),
    insertImage('OrderStatus.png', 580, 300),
  ];
}

function seccionGridFS() {
  return [
    heading('8. GridFS'),
    para([bold('Bucket: '), normal('imagenes (colecciones: imagenes.files, imagenes.chunks)')]),
    emptyLine(),
    para('Operaciones implementadas:'),
    bullet('Subir: POST /api/resenas/:id/imagenes (multipart/form-data)'),
    bullet('Descargar: GET /api/resenas/archivos/:fileId'),
    bullet('Listar: GET /api/resenas/archivos'),
    bullet('Eliminar: DELETE /api/resenas/:id/imagenes/:fileId'),
    emptyLine(),
    insertImage('TestGridFS.png', 580, 360),
    insertImage('TestGridFS2.png', 580, 360),
  ];
}

function seccionAggregation() {
  return [
    heading('9. Aggregation Pipelines'),
    para('Se implementaron 6 pipelines analíticas accesibles vía API y consola:'),
    emptyLine(),
    heading('9.1 Restaurantes mejor calificados', HeadingLevel.HEADING_2),
    ...codeBlock([
      '[ { $sort: { rating_promedio: -1, total_resenas: -1 } },',
      '  { $limit: N },',
      '  { $project: { nombre, categoria, rating_promedio, total_resenas } } ]'
    ]),
    insertImage('Analisis1.png', 580, 340),

    heading('9.2 Platillos más vendidos', HeadingLevel.HEADING_2),
    ...codeBlock([
      '[ { $unwind: "$items" },',
      '  { $group: { _id: "$items.menu_item_id", total: { $sum: "$items.cantidad" } } },',
      '  { $sort: { total: -1 } }, { $limit: N } ]'
    ]),
    insertImage('Analisis2.png', 580, 340),

    heading('9.3 Ventas por restaurante', HeadingLevel.HEADING_2),
    ...codeBlock([
      '[ { $group: { _id: "$restaurante_id", total_ventas: { $sum: "$total" } } },',
      '  { $lookup: { from: "Restaurantes" } },',
      '  { $sort: { total_ventas: -1 } } ]'
    ]),
    insertImage('Analisis3.png', 580, 340),

    heading('9.4 Ventas por período', HeadingLevel.HEADING_2),
    para('Agrupa órdenes por día, semana o mes usando $dateToString:'),
    insertImage('Analisis4.png', 580, 340),

    heading('9.5 Órdenes por estado', HeadingLevel.HEADING_2),
    ...codeBlock([
      '[ { $group: { _id: "$estado", count: { $sum: 1 } } },',
      '  { $sort: { count: -1 } } ]'
    ]),
    insertImage('Analisis5.png', 580, 340),

    heading('9.6 Distribución de calificaciones', HeadingLevel.HEADING_2),
    ...codeBlock([
      '[ { $match: { restaurante_id: ObjectId } },',
      '  { $group: { _id: "$calificacion", count: { $sum: 1 } } },',
      '  { $sort: { _id: 1 } } ]'
    ]),
    insertImage('Analisis6.png', 580, 340),
    pageBreak()
  ];
}

function seccionBulk() {
  return [
    heading('10. Operaciones Bulk'),
    para('Se implementó bulkWrite para ArticulosMenu, Ordenes y Restaurantes:'),
    bullet('Bulk insert restaurantes: Inserta múltiples restaurantes en una sola operación'),
    bullet('Bulk update órdenes: Actualiza estados de múltiples órdenes simultáneamente'),
    bullet('Bulk write artículos: Combinación de insert/update/delete en una llamada'),
    emptyLine(),
    insertImage('Bulk1.png', 580, 340),
    insertImage('Bulk2.png', 580, 340),
  ];
}

function seccionCRUD() {
  return [
    heading('11. Operaciones CRUD y de arrays'),
    heading('11.1 Operaciones básicas', HeadingLevel.HEADING_2),
    bullet('insert: insertOne, insertMany'),
    bullet('find: find, findOne con filtros, proyecciones, sort, skip, limit'),
    bullet('update: updateOne, updateMany'),
    bullet('delete: deleteOne, deleteMany'),
    bullet('count: countDocuments'),
    bullet('distinct: distinct'),
    heading('11.2 Operaciones de arrays', HeadingLevel.HEADING_2),
    bullet('$push: Agregar item a una orden'),
    bullet('$pull: Eliminar item de una orden, eliminar imagen de reseña'),
    bullet('$addToSet: Agregar etiqueta única a un restaurante'),
    heading('11.3 Lookups', HeadingLevel.HEADING_2),
    bullet('$lookup para enriquecer órdenes con datos de usuario y restaurante'),
    bullet('$lookup para reseñas con datos de usuario'),
    emptyLine(),
    insertImage('OrderFindID1.png', 580, 400),
    insertImage('OrderFindID2.png', 580, 400),
  ];
}

function seccionAPI() {
  return [
    heading('12. API REST (56 endpoints)'),
    para('Base URL: http://localhost:3000/api'),
    emptyLine(),

    heading('Restaurantes (12 endpoints)', HeadingLevel.HEADING_2),
    simpleTable(['Método', 'Endpoint', 'Descripción'], [
      ['GET', '/restaurantes', 'Listar (paginado)'],
      ['POST', '/restaurantes', 'Crear restaurante'],
      ['GET', '/restaurantes/cercanos', 'Búsqueda geoespacial'],
      ['GET', '/restaurantes/buscar', 'Búsqueda full-text'],
      ['GET', '/restaurantes/categorias', 'Categorías distintas'],
      ['PATCH', '/restaurantes/varios', 'updateMany'],
      ['DELETE', '/restaurantes/varios', 'deleteMany'],
      ['GET', '/restaurantes/:id', 'Obtener por ID'],
      ['PUT', '/restaurantes/:id', 'Actualizar'],
      ['DELETE', '/restaurantes/:id', 'Eliminar'],
      ['POST', '/restaurantes/:id/etiquetas', 'Agregar etiqueta ($addToSet)'],
      ['DELETE', '/restaurantes/:id/etiquetas/:etiqueta', 'Eliminar etiqueta']
    ]),
    emptyLine(),

    heading('Usuarios (5 endpoints)', HeadingLevel.HEADING_2),
    simpleTable(['Método', 'Endpoint', 'Descripción'], [
      ['GET', '/usuarios', 'Listar'],
      ['POST', '/usuarios', 'Crear'],
      ['GET', '/usuarios/:id', 'Obtener'],
      ['PUT', '/usuarios/:id', 'Actualizar'],
      ['DELETE', '/usuarios/:id', 'Eliminar']
    ]),
    emptyLine(),

    heading('Artículos Menú (7 endpoints)', HeadingLevel.HEADING_2),
    simpleTable(['Método', 'Endpoint', 'Descripción'], [
      ['GET', '/menu/restaurante/:id', 'Menú por restaurante'],
      ['POST', '/menu', 'Crear artículo'],
      ['POST', '/menu/varios', 'insertMany'],
      ['GET', '/menu/buscar', 'Búsqueda full-text'],
      ['GET', '/menu/:id', 'Obtener'],
      ['PUT', '/menu/:id', 'Actualizar'],
      ['DELETE', '/menu/:id', 'Eliminar']
    ]),
    emptyLine(),

    heading('Órdenes (11 endpoints)', HeadingLevel.HEADING_2),
    simpleTable(['Método', 'Endpoint', 'Descripción'], [
      ['GET', '/ordenes', 'Listar'],
      ['POST', '/ordenes', 'Crear con transacción'],
      ['GET', '/ordenes/usuario/:id', 'Por usuario'],
      ['GET', '/ordenes/restaurante/:id', 'Por restaurante'],
      ['PATCH', '/ordenes/varios', 'updateMany'],
      ['DELETE', '/ordenes/varios', 'deleteMany'],
      ['GET', '/ordenes/:id', 'Obtener con $lookup'],
      ['PATCH', '/ordenes/:id/estado', 'Actualizar estado'],
      ['POST', '/ordenes/:id/items', 'Agregar item ($push)'],
      ['DELETE', '/ordenes/:id/items/:itemId', 'Eliminar item ($pull)'],
      ['DELETE', '/ordenes/:id', 'Eliminar']
    ]),
    emptyLine(),

    heading('Reseñas (11 endpoints)', HeadingLevel.HEADING_2),
    simpleTable(['Método', 'Endpoint', 'Descripción'], [
      ['GET', '/reseñas', 'Listar'],
      ['POST', '/reseñas', 'Crear'],
      ['GET', '/reseñas/restaurante/:id', 'Por restaurante'],
      ['GET', '/reseñas/usuario/:id', 'Por usuario'],
      ['GET', '/reseñas/archivos', 'Listar archivos GridFS'],
      ['GET', '/reseñas/archivos/:fileId', 'Descargar archivo'],
      ['GET', '/reseñas/:id', 'Obtener'],
      ['POST', '/reseñas/:id/imagenes', 'Subir imagen (GridFS)'],
      ['DELETE', '/reseñas/:id/imagenes/:fileId', 'Eliminar imagen'],
      ['PUT', '/reseñas/:id', 'Actualizar'],
      ['DELETE', '/reseñas/:id', 'Eliminar']
    ]),
    emptyLine(),

    heading('Analíticas (7 endpoints)', HeadingLevel.HEADING_2),
    simpleTable(['Método', 'Endpoint', 'Descripción'], [
      ['GET', '/analiticas/resumen', 'Conteos generales'],
      ['GET', '/analiticas/restaurantes-mejor-calificados', 'Top calificación'],
      ['GET', '/analiticas/platillos-mas-vendidos', 'Más vendidos'],
      ['GET', '/analiticas/ventas-por-restaurante', 'Ventas agrupadas'],
      ['GET', '/analiticas/ventas-por-periodo', 'Ventas por período'],
      ['GET', '/analiticas/ordenes-por-estado', 'Conteo por estado'],
      ['GET', '/analiticas/distribucion-calificaciones/:id', 'Distribución']
    ]),
    emptyLine(),

    heading('Bulk (3 endpoints)', HeadingLevel.HEADING_2),
    simpleTable(['Método', 'Endpoint', 'Descripción'], [
      ['POST', '/bulk/articulos', 'bulkWrite ArticulosMenu'],
      ['POST', '/bulk/ordenes', 'bulkWrite Ordenes'],
      ['POST', '/bulk/restaurantes', 'Bulk insert restaurantes']
    ]),
    pageBreak()
  ];
}

function seccionFrontend() {
  return [
    heading('13. Frontend SPA'),
    para('Single Page Application con dark theme accesible en http://localhost:3000.'),
    emptyLine(),
    para('Características técnicas:'),
    bullet('Vanilla JS (sin frameworks)'),
    bullet('CSS custom properties para dark theme'),
    bullet('Navegación hash-based sin recarga de página'),
    bullet('Sistema de modales para CRUD'),
    bullet('Notificaciones toast'),
    bullet('Paginación en listas'),
    bullet('Gráficos de barras CSS para analíticas'),
    emptyLine(),
    insertImage('Interfaz.png', 580, 360),
  ];
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  console.log('Generando documento de diseño (.docx)...\n');

  const children = [
    ...titlePage(),
    ...seccionCasoUso(),
    ...seccionArquitectura(),
    pageBreak(),
    ...seccionModeloDatos(),
    ...seccionIndices(),
    ...seccionShardKey(),
    pageBreak(),
    ...seccionValidation(),
    ...seccionTransacciones(),
    pageBreak(),
    ...seccionGridFS(),
    ...seccionAggregation(),
    ...seccionBulk(),
    pageBreak(),
    ...seccionCRUD(),
    pageBreak(),
    ...seccionAPI(),
    ...seccionFrontend()
  ];

  const doc = new Document({
    creator: 'Roberto Barreda, Javier España, Diego López',
    title: 'Documento de Diseño - Sistema de Pedidos y Reseñas',
    description: 'Proyecto 1 CC3089 BD2 UVG',
    sections: [{
      properties: {},
      children
    }]
  });

  const buffer = await Packer.toBuffer(doc);

  // Ensure docs/ directory exists
  const docsDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log(`\n[OK] Documento generado: ${OUTPUT_PATH}`);
  console.log(`     Tamaño: ${(buffer.length / 1024).toFixed(0)} KB`);
}

main().catch(err => {
  console.error('Error generando documento:', err);
  process.exit(1);
});

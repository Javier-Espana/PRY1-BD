/**
 * Script para insertar datos de demostración completos:
 * - Artículos del menú para cada restaurante
 * - Órdenes con items
 * - Reseñas con calificaciones
 */
require('dotenv').config();
const { connectDB, closeDB, getClient } = require('../config/database');
const { ObjectId } = require('mongodb');

// Menús temáticos por categoría de restaurante
const MENUS = {
  'Mexicana': [
    { nombre: 'Tacos al Pastor', categoria: 'Plato Fuerte', precio: 45, stock: 200 },
    { nombre: 'Enchiladas Verdes', categoria: 'Plato Fuerte', precio: 55, stock: 150 },
    { nombre: 'Guacamole con Totopos', categoria: 'Entrada', precio: 35, stock: 180 },
    { nombre: 'Quesadillas de Queso', categoria: 'Entrada', precio: 30, stock: 200 },
    { nombre: 'Churros con Chocolate', categoria: 'Postre', precio: 25, stock: 120 },
    { nombre: 'Agua de Jamaica', categoria: 'Bebida', precio: 15, stock: 300 },
    { nombre: 'Burrito Supreme', categoria: 'Plato Fuerte', precio: 60, stock: 100 },
    { nombre: 'Sopa de Tortilla', categoria: 'Sopa', precio: 40, stock: 80 },
  ],
  'Italiana': [
    { nombre: 'Pizza Margherita', categoria: 'Plato Fuerte', precio: 85, stock: 100 },
    { nombre: 'Pasta Alfredo', categoria: 'Plato Fuerte', precio: 75, stock: 120 },
    { nombre: 'Lasagna Bolognese', categoria: 'Plato Fuerte', precio: 90, stock: 80 },
    { nombre: 'Bruschetta', categoria: 'Entrada', precio: 40, stock: 150 },
    { nombre: 'Tiramisú', categoria: 'Postre', precio: 50, stock: 90 },
    { nombre: 'Limonada Italiana', categoria: 'Bebida', precio: 20, stock: 200 },
    { nombre: 'Risotto de Hongos', categoria: 'Plato Fuerte', precio: 80, stock: 70 },
    { nombre: 'Ensalada Caprese', categoria: 'Ensalada', precio: 45, stock: 100 },
  ],
  'Japonesa': [
    { nombre: 'Sushi Roll California', categoria: 'Plato Fuerte', precio: 70, stock: 100 },
    { nombre: 'Ramen Tonkotsu', categoria: 'Sopa', precio: 85, stock: 80 },
    { nombre: 'Tempura de Camarón', categoria: 'Entrada', precio: 65, stock: 90 },
    { nombre: 'Gyozas', categoria: 'Entrada', precio: 45, stock: 150 },
    { nombre: 'Mochi de Matcha', categoria: 'Postre', precio: 35, stock: 100 },
    { nombre: 'Té Verde', categoria: 'Bebida', precio: 18, stock: 250 },
    { nombre: 'Sashimi Mixto', categoria: 'Plato Fuerte', precio: 120, stock: 50 },
    { nombre: 'Edamame', categoria: 'Snack', precio: 25, stock: 200 },
  ],
  'Comida Rápida': [
    { nombre: 'Hamburguesa Clásica', categoria: 'Plato Fuerte', precio: 55, stock: 200 },
    { nombre: 'Papas Fritas XL', categoria: 'Acompañamiento', precio: 25, stock: 300 },
    { nombre: 'Hot Dog Premium', categoria: 'Plato Fuerte', precio: 40, stock: 150 },
    { nombre: 'Alitas BBQ (12 pzs)', categoria: 'Plato Fuerte', precio: 75, stock: 120 },
    { nombre: 'Nuggets de Pollo', categoria: 'Snack', precio: 45, stock: 180 },
    { nombre: 'Milkshake de Oreo', categoria: 'Bebida', precio: 35, stock: 100 },
    { nombre: 'Nachos con Queso', categoria: 'Entrada', precio: 40, stock: 150 },
    { nombre: 'Onion Rings', categoria: 'Acompañamiento', precio: 30, stock: 200 },
  ],
  'Francesa': [
    { nombre: 'Crêpe de Nutella', categoria: 'Postre', precio: 45, stock: 100 },
    { nombre: 'Croissant de Jamón', categoria: 'Entrada', precio: 35, stock: 120 },
    { nombre: 'Coq au Vin', categoria: 'Plato Fuerte', precio: 110, stock: 60 },
    { nombre: 'Ratatouille', categoria: 'Plato Fuerte', precio: 85, stock: 70 },
    { nombre: 'Crème Brûlée', categoria: 'Postre', precio: 50, stock: 90 },
    { nombre: 'Café au Lait', categoria: 'Bebida', precio: 25, stock: 200 },
    { nombre: 'Sopa de Cebolla', categoria: 'Sopa', precio: 55, stock: 80 },
    { nombre: 'Quiche Lorraine', categoria: 'Plato Fuerte', precio: 65, stock: 90 },
  ],
  'China': [
    { nombre: 'Arroz Frito Especial', categoria: 'Plato Fuerte', precio: 55, stock: 180 },
    { nombre: 'Chow Mein', categoria: 'Plato Fuerte', precio: 50, stock: 150 },
    { nombre: 'Pollo Kung Pao', categoria: 'Plato Fuerte', precio: 65, stock: 100 },
    { nombre: 'Spring Rolls', categoria: 'Entrada', precio: 30, stock: 200 },
    { nombre: 'Dim Sum Mixto', categoria: 'Entrada', precio: 55, stock: 80 },
    { nombre: 'Té Jazmín', categoria: 'Bebida', precio: 15, stock: 300 },
    { nombre: 'Wonton Soup', categoria: 'Sopa', precio: 40, stock: 120 },
    { nombre: 'Galletas de la Fortuna', categoria: 'Postre', precio: 10, stock: 500 },
  ],
  'Peruana': [
    { nombre: 'Ceviche Clásico', categoria: 'Plato Fuerte', precio: 80, stock: 90 },
    { nombre: 'Lomo Saltado', categoria: 'Plato Fuerte', precio: 95, stock: 70 },
    { nombre: 'Ají de Gallina', categoria: 'Plato Fuerte', precio: 75, stock: 80 },
    { nombre: 'Causa Limeña', categoria: 'Entrada', precio: 45, stock: 100 },
    { nombre: 'Suspiro Limeño', categoria: 'Postre', precio: 40, stock: 60 },
    { nombre: 'Chicha Morada', categoria: 'Bebida', precio: 20, stock: 200 },
    { nombre: 'Papa a la Huancaína', categoria: 'Entrada', precio: 35, stock: 120 },
    { nombre: 'Anticuchos', categoria: 'Entrada', precio: 50, stock: 100 },
  ],
  'Café': [
    { nombre: 'Espresso Doble', categoria: 'Bebida', precio: 20, stock: 500 },
    { nombre: 'Cappuccino', categoria: 'Bebida', precio: 28, stock: 300 },
    { nombre: 'Latte de Vainilla', categoria: 'Bebida', precio: 32, stock: 200 },
    { nombre: 'Cheesecake NY', categoria: 'Postre', precio: 45, stock: 80 },
    { nombre: 'Brownie con Helado', categoria: 'Postre', precio: 40, stock: 100 },
    { nombre: 'Panini de Pollo', categoria: 'Plato Fuerte', precio: 50, stock: 120 },
    { nombre: 'Smoothie de Frutas', categoria: 'Bebida', precio: 30, stock: 150 },
    { nombre: 'Croissant de Almendras', categoria: 'Snack', precio: 25, stock: 100 },
  ],
  'Asiática': [
    { nombre: 'Pad Thai', categoria: 'Plato Fuerte', precio: 65, stock: 120 },
    { nombre: 'Curry Verde con Arroz', categoria: 'Plato Fuerte', precio: 70, stock: 100 },
    { nombre: 'Tom Yum', categoria: 'Sopa', precio: 50, stock: 80 },
    { nombre: 'Satay de Pollo', categoria: 'Entrada', precio: 45, stock: 150 },
    { nombre: 'Mango Sticky Rice', categoria: 'Postre', precio: 35, stock: 90 },
    { nombre: 'Thai Iced Tea', categoria: 'Bebida', precio: 22, stock: 200 },
    { nombre: 'Green Papaya Salad', categoria: 'Ensalada', precio: 40, stock: 100 },
    { nombre: 'Banh Mi', categoria: 'Plato Fuerte', precio: 55, stock: 80 },
  ],
  'Americana': [
    { nombre: 'Ribeye Steak 300g', categoria: 'Plato Fuerte', precio: 150, stock: 60 },
    { nombre: 'Baby Back Ribs', categoria: 'Plato Fuerte', precio: 130, stock: 50 },
    { nombre: 'Ensalada Caesar', categoria: 'Ensalada', precio: 55, stock: 100 },
    { nombre: 'Baked Potato', categoria: 'Acompañamiento', precio: 35, stock: 150 },
    { nombre: 'Apple Pie', categoria: 'Postre', precio: 40, stock: 80 },
    { nombre: 'Limonada de Menta', categoria: 'Bebida', precio: 25, stock: 200 },
    { nombre: 'Pulled Pork Sandwich', categoria: 'Plato Fuerte', precio: 75, stock: 90 },
    { nombre: 'Coleslaw', categoria: 'Acompañamiento', precio: 20, stock: 200 },
  ],
  'Postres': [
    { nombre: 'Tres Leches', categoria: 'Postre', precio: 40, stock: 100 },
    { nombre: 'Flan Napolitano', categoria: 'Postre', precio: 35, stock: 120 },
    { nombre: 'Pastel de Chocolate', categoria: 'Postre', precio: 50, stock: 80 },
    { nombre: 'Helado Artesanal (3 bolas)', categoria: 'Postre', precio: 30, stock: 200 },
    { nombre: 'Macarons (6 pzs)', categoria: 'Postre', precio: 55, stock: 90 },
    { nombre: 'Café Americano', categoria: 'Bebida', precio: 18, stock: 300 },
    { nombre: 'Churros con Cajeta', categoria: 'Postre', precio: 28, stock: 150 },
    { nombre: 'Waffles con Fruta', categoria: 'Postre', precio: 45, stock: 100 },
  ],
  'Guatemalteca': [
    { nombre: 'Pepián de Pollo', categoria: 'Plato Fuerte', precio: 65, stock: 100 },
    { nombre: 'Kak\'ik', categoria: 'Sopa', precio: 70, stock: 80 },
    { nombre: 'Chuchitos', categoria: 'Plato Fuerte', precio: 35, stock: 150 },
    { nombre: 'Tamales Colorados', categoria: 'Plato Fuerte', precio: 25, stock: 200 },
    { nombre: 'Rellenitos de Plátano', categoria: 'Postre', precio: 20, stock: 180 },
    { nombre: 'Atol de Elote', categoria: 'Bebida', precio: 15, stock: 250 },
    { nombre: 'Hilachas', categoria: 'Plato Fuerte', precio: 55, stock: 90 },
    { nombre: 'Tostadas Guatemaltecas', categoria: 'Entrada', precio: 30, stock: 120 },
  ],
  'Mediterránea': [
    { nombre: 'Hummus con Pita', categoria: 'Entrada', precio: 40, stock: 150 },
    { nombre: 'Falafel Plate', categoria: 'Plato Fuerte', precio: 60, stock: 100 },
    { nombre: 'Shawarma de Pollo', categoria: 'Plato Fuerte', precio: 70, stock: 90 },
    { nombre: 'Ensalada Griega', categoria: 'Ensalada', precio: 50, stock: 120 },
    { nombre: 'Baklava', categoria: 'Postre', precio: 30, stock: 100 },
    { nombre: 'Agua de Flor de Azahar', categoria: 'Bebida', precio: 20, stock: 200 },
    { nombre: 'Moussaka', categoria: 'Plato Fuerte', precio: 80, stock: 70 },
    { nombre: 'Taboulé', categoria: 'Ensalada', precio: 35, stock: 130 },
  ],
  'Otro': [
    { nombre: 'Açaí Bowl', categoria: 'Plato Fuerte', precio: 55, stock: 100 },
    { nombre: 'Smoothie Verde Detox', categoria: 'Bebida', precio: 35, stock: 150 },
    { nombre: 'Poke Bowl de Salmón', categoria: 'Plato Fuerte', precio: 80, stock: 70 },
    { nombre: 'Wrap de Pollo', categoria: 'Plato Fuerte', precio: 50, stock: 120 },
    { nombre: 'Ensalada Quinoa', categoria: 'Ensalada', precio: 55, stock: 100 },
    { nombre: 'Jugo de Naranja Natural', categoria: 'Bebida', precio: 20, stock: 200 },
    { nombre: 'Energy Bowl', categoria: 'Plato Fuerte', precio: 60, stock: 80 },
    { nombre: 'Avocado Toast', categoria: 'Snack', precio: 40, stock: 90 },
  ],
};

const COMENTARIOS_POSITIVOS = [
  'Excelente comida, muy recomendado!',
  'El mejor restaurante de la zona, volveré pronto.',
  'Comida deliciosa y servicio rápido.',
  'Muy buena calidad y precio justo.',
  'Increíble sabor, todo fresco y bien preparado.',
  'Superó mis expectativas, 100% recomendado.',
  'Atención excepcional y platos espectaculares.',
  'La mejor experiencia culinaria que he tenido.',
  'Comida casera con un toque gourmet, me encantó.',
  'Pedido llegó rápido y todo en perfecto estado.',
];

const COMENTARIOS_REGULARES = [
  'Estuvo bien, nada extraordinario pero cumple.',
  'La comida estaba buena pero tardó un poco.',
  'Porción pequeña para el precio, pero buen sabor.',
  'Regular, he probado mejores opciones.',
  'El sabor está bien pero la presentación podría mejorar.',
];

async function main() {
  const db = await connectDB();
  console.log('\n========================================');
  console.log('  INSERTANDO DATOS DE DEMOSTRACIÓN');
  console.log('========================================\n');

  // 1. Obtener restaurantes existentes
  const restaurantes = await db.collection('Restaurantes').find().toArray();
  console.log(`Restaurantes encontrados: ${restaurantes.length}`);

  // 2. Obtener usuarios existentes
  const usuarios = await db.collection('Usuarios').find().toArray();
  console.log(`Usuarios encontrados: ${usuarios.length}`);

  if (restaurantes.length === 0 || usuarios.length === 0) {
    console.error('No hay restaurantes o usuarios. Ejecuta primero el seed básico.');
    await closeDB();
    return;
  }

  // 3. Insertar artículos del menú para cada restaurante
  console.log('\n--- Insertando artículos del menú ---');
  const menuItemsByRest = {};

  for (const rest of restaurantes) {
    const menuTemplate = MENUS[rest.categoria] || MENUS['Otro'];
    const docs = menuTemplate.map(item => ({
      restaurante_id: rest._id,
      nombre: item.nombre,
      descripcion: `${item.nombre} de ${rest.nombre}`,
      precio: item.precio + Math.round(Math.random() * 10 - 5),
      categoria: item.categoria,
      disponible: true,
      stock: item.stock,
      fecha_creacion: new Date()
    }));

    const result = await db.collection('ArticulosMenu').insertMany(docs);
    menuItemsByRest[rest._id.toString()] = Object.values(result.insertedIds);
    console.log(`  ${rest.nombre}: ${docs.length} artículos`);
  }

  // 4. Agregar etiquetas a restaurantes (para demostrar $addToSet)
  console.log('\n--- Agregando etiquetas a restaurantes ---');
  const etiquetas = ['wifi-gratis', 'estacionamiento', 'terraza', 'pet-friendly', 'delivery', 'para-llevar', 'reservaciones', 'aire-acondicionado', 'musica-en-vivo', 'happy-hour'];
  for (const rest of restaurantes) {
    const numEtiquetas = 2 + Math.floor(Math.random() * 4);
    const tags = [];
    for (let i = 0; i < numEtiquetas; i++) {
      const tag = etiquetas[Math.floor(Math.random() * etiquetas.length)];
      if (!tags.includes(tag)) tags.push(tag);
    }
    await db.collection('Restaurantes').updateOne(
      { _id: rest._id },
      { $addToSet: { etiquetas: { $each: tags } } }
    );
  }
  console.log(`  Etiquetas agregadas a ${restaurantes.length} restaurantes`);

  // 5. Crear órdenes
  console.log('\n--- Creando órdenes ---');
  const ordenes = [];
  const estados = ['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'];
  const metodosPago = ['efectivo', 'tarjeta', 'transferencia'];

  for (let i = 0; i < 60; i++) {
    const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
    const rest = restaurantes[Math.floor(Math.random() * restaurantes.length)];
    const menuItems = menuItemsByRest[rest._id.toString()];
    if (!menuItems || menuItems.length === 0) continue;

    // Seleccionar 1-4 items aleatorios
    const numItems = 1 + Math.floor(Math.random() * 3);
    const selectedItems = [];
    const usedIndexes = new Set();
    for (let j = 0; j < numItems && j < menuItems.length; j++) {
      let idx;
      do { idx = Math.floor(Math.random() * menuItems.length); } while (usedIndexes.has(idx));
      usedIndexes.add(idx);

      const articulo = await db.collection('ArticulosMenu').findOne({ _id: menuItems[idx] });
      if (!articulo) continue;
      const cantidad = 1 + Math.floor(Math.random() * 3);
      selectedItems.push({
        menu_item_id: articulo._id,
        nombre: articulo.nombre,
        cantidad,
        precio_unitario: articulo.precio,
        subtotal: cantidad * articulo.precio
      });
    }

    if (selectedItems.length === 0) continue;

    const total = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    // Distribute states: many delivered for reviews
    const estado = i < 30 ? 'entregado' : estados[Math.floor(Math.random() * estados.length)];
    const fechaBase = new Date();
    fechaBase.setDate(fechaBase.getDate() - Math.floor(Math.random() * 60));

    const orden = {
      usuario_id: usuario._id,
      restaurante_id: rest._id,
      items: selectedItems,
      estado,
      total,
      metodo_pago: metodosPago[Math.floor(Math.random() * metodosPago.length)],
      fecha_creacion: fechaBase,
      fecha_actualizacion: fechaBase
    };

    const result = await db.collection('Ordenes').insertOne(orden);
    ordenes.push({ ...orden, _id: result.insertedId });
  }
  console.log(`  ${ordenes.length} órdenes creadas`);

  // 6. Crear reseñas para órdenes entregadas
  console.log('\n--- Creando reseñas ---');
  const ordenesEntregadas = ordenes.filter(o => o.estado === 'entregado');
  let resenasCreadas = 0;

  for (const orden of ordenesEntregadas) {
    // Verificar que no exista una reseña duplicada para esta orden
    const existente = await db.collection('Resenas').findOne({ orden_id: orden._id });
    if (existente) continue;

    const calificacion = Math.random() > 0.3
      ? (3 + Math.floor(Math.random() * 3))  // 3-5 (70%)
      : (1 + Math.floor(Math.random() * 3)); // 1-3 (30%)

    const comentarios = calificacion >= 4 ? COMENTARIOS_POSITIVOS : COMENTARIOS_REGULARES;
    const comentario = comentarios[Math.floor(Math.random() * comentarios.length)];

    try {
      await db.collection('Resenas').insertOne({
        usuario_id: orden.usuario_id,
        restaurante_id: orden.restaurante_id,
        orden_id: orden._id,
        calificacion,
        comentario,
        imagenes: [],
        fecha_creacion: new Date(orden.fecha_creacion.getTime() + 86400000) // 1 día después
      });
      resenasCreadas++;

      // Actualizar rating del restaurante
      const pipeline = [
        { $match: { restaurante_id: orden.restaurante_id } },
        { $group: { _id: null, promedio: { $avg: '$calificacion' }, total: { $sum: 1 } } }
      ];
      const resultado = await db.collection('Resenas').aggregate(pipeline).toArray();
      if (resultado.length > 0) {
        await db.collection('Restaurantes').updateOne(
          { _id: orden.restaurante_id },
          { $set: { rating_promedio: Math.round(resultado[0].promedio * 100) / 100, total_resenas: resultado[0].total } }
        );
      }
    } catch (e) {
      // Ignoring duplicate review errors
    }
  }
  console.log(`  ${resenasCreadas} reseñas creadas`);

  // 7. Resumen final
  console.log('\n========================================');
  console.log('  RESUMEN DE DATOS INSERTADOS');
  console.log('========================================');
  const counts = {
    restaurantes: await db.collection('Restaurantes').countDocuments(),
    usuarios: await db.collection('Usuarios').countDocuments(),
    articulos: await db.collection('ArticulosMenu').countDocuments(),
    ordenes: await db.collection('Ordenes').countDocuments(),
    resenas: await db.collection('Resenas').countDocuments()
  };
  console.log(`  Restaurantes:    ${counts.restaurantes}`);
  console.log(`  Usuarios:        ${counts.usuarios}`);
  console.log(`  Artículos Menú:  ${counts.articulos}`);
  console.log(`  Órdenes:         ${counts.ordenes}`);
  console.log(`  Reseñas:         ${counts.resenas}`);
  console.log('========================================\n');

  await closeDB();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

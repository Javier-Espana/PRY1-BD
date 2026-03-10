const readlineSync = require('readline-sync');
const { ObjectId } = require('mongodb');

const restaurantCtrl = require('../services/restaurantService');
const userCtrl = require('../services/userService');
const menuItemCtrl = require('../services/menuItemService');
const orderCtrl = require('../services/orderService');
const reviewCtrl = require('../services/reviewService');
const analyticsCtrl = require('../services/analyticsService');
const bulkCtrl = require('../services/bulkService');

// ============================================================
// Utilidades de presentación
// ============================================================

function clearScreen() {
  console.clear();
}

function printHeader(titulo) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${titulo}`);
  console.log('═'.repeat(60));
}

function printSubHeader(titulo) {
  console.log(`\n  ── ${titulo} ──`);
}

function printDoc(doc, indent = 2) {
  const spaces = ' '.repeat(indent);
  console.log(`${spaces}${JSON.stringify(doc, null, 2).split('\n').join('\n' + spaces)}`);
}

function printTable(docs, campos) {
  if (!docs || docs.length === 0) {
    console.log('  (sin resultados)');
    return;
  }
  docs.forEach((doc, i) => {
    const values = campos.map(c => {
      const val = c.split('.').reduce((o, k) => (o ? o[k] : ''), doc);
      return val !== undefined ? val : '';
    });
    console.log(`  ${i + 1}. ${values.join(' | ')}`);
  });
}

function pausar() {
  readlineSync.question('\n  Presiona ENTER para continuar...');
}

function leerTexto(prompt, obligatorio = false) {
  let val;
  do {
    val = readlineSync.question(`  ${prompt}: `);
    if (obligatorio && !val) console.log('  Este campo es obligatorio.');
  } while (obligatorio && !val);
  return val;
}

function leerNumero(prompt, defaultVal = 0) {
  const val = readlineSync.question(`  ${prompt} [${defaultVal}]: `);
  return val ? parseFloat(val) : defaultVal;
}

function leerEntero(prompt, defaultVal = 0) {
  const val = readlineSync.question(`  ${prompt} [${defaultVal}]: `);
  return val ? parseInt(val) : defaultVal;
}

// ============================================================
// Menú principal
// ============================================================

async function menuPrincipal() {
  let salir = false;

  while (!salir) {
    clearScreen();
    printHeader('SISTEMA DE GESTION DE PEDIDOS Y RESENAS');
    console.log('');
    console.log('  1. Restaurantes');
    console.log('  2. Usuarios');
    console.log('  3. Artículos del Menú');
    console.log('  4. Órdenes');
    console.log('  5. Resenas');
    console.log('  6. Analíticas y Reportes');
    console.log('  7. Operaciones Bulk');
    console.log('  8. Resumen del Sistema');
    console.log('  0. Salir');
    console.log('');

    const opcion = readlineSync.question('  Selecciona una opción: ');

    try {
      switch (opcion) {
        case '1': await menuRestaurantes(); break;
        case '2': await menuUsuarios(); break;
        case '3': await menuArticulos(); break;
        case '4': await menuOrdenes(); break;
        case '5': await menuResenas(); break;
        case '6': await menuAnaliticas(); break;
        case '7': await menuBulk(); break;
        case '8': await mostrarResumen(); break;
        case '0': salir = true; break;
        default: console.log('  Opción no válida.');
      }
    } catch (error) {
      console.log(`\n  Error: ${error.message}`);
      pausar();
    }
  }
}

// ============================================================
// 1. Restaurantes
// ============================================================

async function menuRestaurantes() {
  let volver = false;
  while (!volver) {
    clearScreen();
    printHeader('RESTAURANTES');
    console.log('');
    console.log('  1. Crear restaurante');
    console.log('  2. Listar restaurantes');
    console.log('  3. Buscar por ID');
    console.log('  4. Buscar cercanos (geoespacial)');
    console.log('  5. Buscar por texto');
    console.log('  6. Listar por categoría');
    console.log('  7. Actualizar restaurante');
    console.log('  8. Eliminar restaurante');
    console.log('  9. Contar restaurantes');
    console.log('  10. Ver categorías');
    console.log('  11. Agregar etiqueta ($addToSet)');
    console.log('  12. Eliminar etiqueta');
    console.log('  13. Eliminar varios restaurantes (deleteMany)');
    console.log('  14. Actualizar varios restaurantes (updateMany)');
    console.log('  0. Volver');
    console.log('');

    const opcion = readlineSync.question('  Selecciona: ');
    try {
      switch (opcion) {
        case '1': {
          printSubHeader('Crear Restaurante');
          const nombre = leerTexto('Nombre', true);
          const descripcion = leerTexto('Descripción');
          const categorias = await restaurantCtrl.obtenerCategorias();
          console.log(`  Categorías: ${['Comida Rápida', 'Italiana', 'Asiática', 'Mexicana', 'Americana', 'Mediterránea', 'Francesa', 'Japonesa', 'China', 'Peruana', 'Guatemalteca', 'Postres', 'Café', 'Otro'].join(', ')}`);
          const categoria = leerTexto('Categoría', true);
          const latitud = leerNumero('Latitud', 14.6349);
          const longitud = leerNumero('Longitud', -90.5069);
          const telefono = leerTexto('Teléfono');
          const email_contacto = leerTexto('Email contacto');
          const result = await restaurantCtrl.crearRestaurante({ nombre, descripcion, categoria, latitud, longitud, telefono, email_contacto });
          console.log('\n  Restaurante creado:');
          printDoc(result);
          pausar();
          break;
        }
        case '2': {
          printSubHeader('Listar Restaurantes');
          const skip = leerEntero('Skip', 0);
          const limit = leerEntero('Limit', 10);
          const result = await restaurantCtrl.listarRestaurantes({ skip, limit });
          result.forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.nombre} | ${r.categoria} | ${r.rating_promedio} | ${r.total_resenas} reseñas`);
          });
          pausar();
          break;
        }
        case '3': {
          const id = leerTexto('ID del restaurante', true);
          const result = await restaurantCtrl.obtenerRestaurante(id);
          if (result) printDoc(result);
          else console.log('  No encontrado.');
          pausar();
          break;
        }
        case '4': {
          printSubHeader('Buscar Cercanos (Geoespacial 2dsphere)');
          const lat = leerNumero('Latitud', 14.6349);
          const lon = leerNumero('Longitud', -90.5069);
          const dist = leerEntero('Distancia máxima (metros)', 5000);
          const result = await restaurantCtrl.buscarCercanos(lon, lat, dist);
          result.forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.nombre} | ${r.categoria}`);
          });
          console.log(`\n  Total: ${result.length} restaurantes encontrados`);
          pausar();
          break;
        }
        case '5': {
          printSubHeader('Buscar por Texto (índice text)');
          const texto = leerTexto('Texto a buscar', true);
          const result = await restaurantCtrl.buscarPorTexto(texto);
          result.forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.nombre} | Score: ${r.score?.toFixed(2)}`);
          });
          pausar();
          break;
        }
        case '6': {
          const cat = leerTexto('Categoría', true);
          const result = await restaurantCtrl.listarPorCategoria(cat);
          result.forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.nombre} | ${r.rating_promedio}`);
          });
          pausar();
          break;
        }
        case '7': {
          const id = leerTexto('ID del restaurante', true);
          console.log('  (Dejar vacío para no cambiar)');
          const nombre = leerTexto('Nuevo nombre');
          const descripcion = leerTexto('Nueva descripción');
          const telefono = leerTexto('Nuevo teléfono');
          const result = await restaurantCtrl.actualizarRestaurante(id, { nombre, descripcion, telefono });
          console.log(`  Modificados: ${result.modifiedCount}`);
          pausar();
          break;
        }
        case '8': {
          const id = leerTexto('ID del restaurante', true);
          const result = await restaurantCtrl.eliminarRestaurante(id);
          console.log(`  Eliminados: ${result.deletedCount}`);
          pausar();
          break;
        }
        case '9': {
          const total = await restaurantCtrl.contarRestaurantes();
          console.log(`\n  Total restaurantes: ${total}`);
          pausar();
          break;
        }
        case '10': {
          const cats = await restaurantCtrl.obtenerCategorias();
          console.log('\n  Categorías:', cats.join(', '));
          pausar();
          break;
        }
        case '11': {
          printSubHeader('Agregar Etiqueta ($addToSet)');
          const id = leerTexto('ID del restaurante', true);
          const etiqueta = leerTexto('Etiqueta a agregar', true);
          const result = await restaurantCtrl.agregarEtiqueta(id, etiqueta);
          console.log(`  Modificados: ${result.modifiedCount}`);
          const rest = await restaurantCtrl.obtenerRestaurante(id);
          if (rest) console.log(`  Etiquetas actuales: ${(rest.etiquetas || []).join(', ')}`);
          pausar();
          break;
        }
        case '12': {
          printSubHeader('Eliminar Etiqueta ($pull de etiquetas)');
          const id = leerTexto('ID del restaurante', true);
          const rest = await restaurantCtrl.obtenerRestaurante(id);
          if (rest) console.log(`  Etiquetas actuales: ${(rest.etiquetas || []).join(', ')}`);
          const etiqueta = leerTexto('Etiqueta a eliminar', true);
          const result = await restaurantCtrl.eliminarEtiqueta(id, etiqueta);
          console.log(`  Modificados: ${result.modifiedCount}`);
          pausar();
          break;
        }
        case '13': {
          printSubHeader('Eliminar Varios Restaurantes (deleteMany)');
          const campo = leerTexto('Campo para filtrar (ej: categoria, activo)', true);
          const valor = leerTexto('Valor del campo', true);
          let filtro = {};
          if (valor === 'true') filtro[campo] = true;
          else if (valor === 'false') filtro[campo] = false;
          else filtro[campo] = valor;
          const count = await restaurantCtrl.contarRestaurantes(filtro);
          console.log(`  Se encontraron ${count} restaurantes con ese filtro.`);
          if (count > 0 && readlineSync.keyInYN('  ¿Proceder con la eliminación?')) {
            const result = await restaurantCtrl.eliminarVariosRestaurantes(filtro);
            console.log(`  Eliminados: ${result.deletedCount}`);
          }
          pausar();
          break;
        }
        case '14': {
          printSubHeader('Actualizar Varios Restaurantes (updateMany)');
          const campo = leerTexto('Campo para filtrar (ej: categoria)', true);
          const valor = leerTexto('Valor del filtro', true);
          let filtro = {};
          if (valor === 'true') filtro[campo] = true;
          else if (valor === 'false') filtro[campo] = false;
          else filtro[campo] = valor;
          const campoUpd = leerTexto('Campo a actualizar', true);
          const valorUpd = leerTexto('Nuevo valor', true);
          let datos = {};
          if (valorUpd === 'true') datos[campoUpd] = true;
          else if (valorUpd === 'false') datos[campoUpd] = false;
          else datos[campoUpd] = valorUpd;
          const result = await restaurantCtrl.actualizarVariosRestaurantes(filtro, datos);
          console.log(`  Modificados: ${result.modifiedCount}`);
          pausar();
          break;
        }
        case '0': volver = true; break;
        default: console.log('  Opción no válida.'); pausar();
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      pausar();
    }
  }
}

// ============================================================
// 2. Usuarios
// ============================================================

async function menuUsuarios() {
  let volver = false;
  while (!volver) {
    clearScreen();
    printHeader('USUARIOS');
    console.log('');
    console.log('  1. Crear usuario');
    console.log('  2. Listar usuarios');
    console.log('  3. Buscar por ID');
    console.log('  4. Buscar por email');
    console.log('  5. Actualizar usuario');
    console.log('  6. Eliminar usuario');
    console.log('  7. Contar usuarios');
    console.log('  0. Volver');
    console.log('');

    const opcion = readlineSync.question('  Selecciona: ');
    try {
      switch (opcion) {
        case '1': {
          printSubHeader('Crear Usuario');
          const nombre = leerTexto('Nombre completo', true);
          const email = leerTexto('Email', true);
          const password_hash = `hash_${Date.now()}`;
          const direccion_principal = leerTexto('Dirección');
          const telefono = leerTexto('Teléfono');
          const rol = leerTexto('Rol (cliente/admin)') || 'cliente';
          const result = await userCtrl.crearUsuario({ nombre, email, password_hash, direccion_principal, telefono, rol });
          console.log('\n  Usuario creado:');
          printDoc(result);
          pausar();
          break;
        }
        case '2': {
          const skip = leerEntero('Skip', 0);
          const limit = leerEntero('Limit', 10);
          const result = await userCtrl.listarUsuarios({ skip, limit, proyeccion: { password_hash: 0 } });
          result.forEach((u, i) => {
            console.log(`  ${i + 1}. ${u.nombre} | ${u.email} | ${u.rol}`);
          });
          pausar();
          break;
        }
        case '3': {
          const id = leerTexto('ID del usuario', true);
          const result = await userCtrl.obtenerUsuario(id);
          if (result) { delete result.password_hash; printDoc(result); }
          else console.log('  No encontrado.');
          pausar();
          break;
        }
        case '4': {
          const email = leerTexto('Email', true);
          const result = await userCtrl.obtenerPorEmail(email);
          if (result) { delete result.password_hash; printDoc(result); }
          else console.log('  No encontrado.');
          pausar();
          break;
        }
        case '5': {
          const id = leerTexto('ID del usuario', true);
          const nombre = leerTexto('Nuevo nombre');
          const telefono = leerTexto('Nuevo teléfono');
          const result = await userCtrl.actualizarUsuario(id, { nombre, telefono });
          console.log(`  Modificados: ${result.modifiedCount}`);
          pausar();
          break;
        }
        case '6': {
          const id = leerTexto('ID del usuario', true);
          const result = await userCtrl.eliminarUsuario(id);
          console.log(`  Eliminados: ${result.deletedCount}`);
          pausar();
          break;
        }
        case '7': {
          const total = await userCtrl.contarUsuarios();
          console.log(`\n  Total usuarios: ${total}`);
          pausar();
          break;
        }
        case '0': volver = true; break;
        default: console.log('  Opción no válida.'); pausar();
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      pausar();
    }
  }
}

// ============================================================
// 3. Artículos del Menú
// ============================================================

async function menuArticulos() {
  let volver = false;
  while (!volver) {
    clearScreen();
    printHeader('ARTÍCULOS DEL MENÚ');
    console.log('');
    console.log('  1. Crear artículo');
    console.log('  2. Ver menú de un restaurante');
    console.log('  3. Buscar artículos por texto');
    console.log('  4. Buscar por ID');
    console.log('  5. Actualizar artículo');
    console.log('  6. Eliminar artículo');
    console.log('  7. Ver categorías');
    console.log('  0. Volver');
    console.log('');

    const opcion = readlineSync.question('  Selecciona: ');
    try {
      switch (opcion) {
        case '1': {
          printSubHeader('Crear Artículo');
          const restaurante_id = leerTexto('ID del restaurante', true);
          const nombre = leerTexto('Nombre', true);
          const descripcion = leerTexto('Descripción');
          const precio = leerNumero('Precio', 50);
          const categoria = leerTexto('Categoría (Entrada/Plato Fuerte/Postre/Bebida/Otro)') || 'Otro';
          const stock = leerEntero('Stock', 100);
          const result = await menuItemCtrl.crearArticulo({ restaurante_id, nombre, descripcion, precio, categoria, stock });
          console.log('\n  Artículo creado:');
          printDoc(result);
          pausar();
          break;
        }
        case '2': {
          const id = leerTexto('ID del restaurante', true);
          const result = await menuItemCtrl.listarMenuRestaurante(id);
          result.forEach((a, i) => {
            console.log(`  ${i + 1}. ${a.nombre} | Q${a.precio} | Stock: ${a.stock} | ${a.disponible ? '' : ''}`);
          });
          console.log(`\n  Total artículos: ${result.length}`);
          pausar();
          break;
        }
        case '3': {
          const texto = leerTexto('Texto a buscar', true);
          const result = await menuItemCtrl.buscarArticulos(texto);
          result.forEach((a, i) => {
            console.log(`  ${i + 1}. ${a.nombre} | Q${a.precio} | Score: ${a.score?.toFixed(2)}`);
          });
          pausar();
          break;
        }
        case '4': {
          const id = leerTexto('ID del artículo', true);
          const result = await menuItemCtrl.obtenerArticulo(id);
          if (result) printDoc(result);
          else console.log('  No encontrado.');
          pausar();
          break;
        }
        case '5': {
          const id = leerTexto('ID del artículo', true);
          const precio = leerTexto('Nuevo precio');
          const stock = leerTexto('Nuevo stock');
          const datos = {};
          if (precio) datos.precio = parseFloat(precio);
          if (stock) datos.stock = parseInt(stock);
          const result = await menuItemCtrl.actualizarArticulo(id, datos);
          console.log(`  Modificados: ${result.modifiedCount}`);
          pausar();
          break;
        }
        case '6': {
          const id = leerTexto('ID del artículo', true);
          const result = await menuItemCtrl.eliminarArticulo(id);
          console.log(`  Eliminados: ${result.deletedCount}`);
          pausar();
          break;
        }
        case '7': {
          const cats = await menuItemCtrl.obtenerCategoriasArticulos();
          console.log('\n  Categorías:', cats.join(', '));
          pausar();
          break;
        }
        case '0': volver = true; break;
        default: console.log('  Opción no válida.'); pausar();
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      pausar();
    }
  }
}

// ============================================================
// 4. Órdenes
// ============================================================

async function menuOrdenes() {
  let volver = false;
  while (!volver) {
    clearScreen();
    printHeader('ÓRDENES');
    console.log('');
    console.log('  1. Crear orden (con transacción)');
    console.log('  2. Listar órdenes');
    console.log('  3. Buscar orden por ID (con lookups)');
    console.log('  4. Órdenes de un usuario');
    console.log('  5. Órdenes de un restaurante');
    console.log('  6. Actualizar estado');
    console.log('  7. Agregar item a orden ($push)');
    console.log('  8. Eliminar item de orden ($pull)');
    console.log('  9. Eliminar orden');
    console.log('  10. Contar órdenes por estado');
    console.log('  11. Eliminar varias órdenes (deleteMany)');
    console.log('  12. Actualizar varias órdenes (updateMany)');
    console.log('  0. Volver');
    console.log('');

    const opcion = readlineSync.question('  Selecciona: ');
    try {
      switch (opcion) {
        case '1': {
          printSubHeader('Crear Orden (Transacción Multi-Documento)');
          const usuario_id = leerTexto('ID del usuario', true);
          const restaurante_id = leerTexto('ID del restaurante', true);
          const metodo_pago = leerTexto('Método de pago (efectivo/tarjeta/transferencia)') || 'efectivo';

          const items = [];
          let agregar = true;
          while (agregar) {
            const menu_item_id = leerTexto('ID del artículo del menú', true);
            const cantidad = leerEntero('Cantidad', 1);
            items.push({ menu_item_id, cantidad });
            agregar = readlineSync.keyInYN('  ¿Agregar otro artículo?');
          }

          console.log('\n  Procesando transacción...');
          const result = await orderCtrl.crearOrden({ usuario_id, restaurante_id, metodo_pago, items });
          console.log('\n  Orden creada exitosamente:');
          console.log(`  ID: ${result.id}`);
          console.log(`  Total: Q${result.total}`);
          console.log(`  Items: ${result.items.length}`);
          console.log(`  Estado: ${result.estado}`);
          pausar();
          break;
        }
        case '2': {
          const skip = leerEntero('Skip', 0);
          const limit = leerEntero('Limit', 10);
          const estado = leerTexto('Filtrar por estado (dejar vacío para todos)');
          const filtro = {};
          if (estado) filtro.estado = estado;
          const result = await orderCtrl.listarOrdenes({ filtro, skip, limit });
          result.forEach((o, i) => {
            console.log(`  ${i + 1}. ${o._id} | Q${o.total?.toFixed(2)} | ${o.estado} | ${o.usuario?.nombre || 'N/A'} | ${o.restaurante?.nombre || 'N/A'}`);
          });
          pausar();
          break;
        }
        case '3': {
          const id = leerTexto('ID de la orden', true);
          const result = await orderCtrl.obtenerOrden(id);
          if (result) {
            console.log(`\n  Orden: ${result._id}`);
            console.log(`  Usuario: ${result.usuario?.nombre || 'N/A'}`);
            console.log(`  Restaurante: ${result.restaurante?.nombre || 'N/A'}`);
            console.log(`  Estado: ${result.estado}`);
            console.log(`  Total: Q${result.total}`);
            console.log(`  Items:`);
            result.items.forEach((item, i) => {
              console.log(`    ${i + 1}. ${item.nombre} x${item.cantidad} = Q${item.subtotal}`);
            });
          } else {
            console.log('  No encontrada.');
          }
          pausar();
          break;
        }
        case '4': {
          const id = leerTexto('ID del usuario', true);
          const result = await orderCtrl.listarOrdenesPorUsuario(id);
          result.forEach((o, i) => {
            console.log(`  ${i + 1}. ${o._id} | Q${o.total?.toFixed(2)} | ${o.estado}`);
          });
          pausar();
          break;
        }
        case '5': {
          const id = leerTexto('ID del restaurante', true);
          const estado = leerTexto('Estado (dejar vacío para todos)');
          const result = await orderCtrl.listarOrdenesPorRestaurante(id, { estado: estado || undefined });
          result.forEach((o, i) => {
            console.log(`  ${i + 1}. ${o._id} | Q${o.total?.toFixed(2)} | ${o.estado}`);
          });
          pausar();
          break;
        }
        case '6': {
          const id = leerTexto('ID de la orden', true);
          console.log('  Estados: pendiente, preparando, enviado, entregado, cancelado');
          const estado = leerTexto('Nuevo estado', true);
          const result = await orderCtrl.actualizarEstadoOrden(id, estado);
          console.log(`  Modificados: ${result.modifiedCount}`);
          pausar();
          break;
        }
        case '7': {
          printSubHeader('Agregar Item ($push)');
          const ordenId = leerTexto('ID de la orden', true);
          const menu_item_id = leerTexto('ID del artículo', true);
          const cantidad = leerEntero('Cantidad', 1);
          const result = await orderCtrl.agregarItemAOrden(ordenId, { menu_item_id, cantidad });
          console.log(`  Item agregado. Modificados: ${result.modifiedCount}`);
          pausar();
          break;
        }
        case '8': {
          printSubHeader('Eliminar Item ($pull)');
          const ordenId = leerTexto('ID de la orden', true);
          const menuItemId = leerTexto('ID del artículo a eliminar', true);
          const result = await orderCtrl.eliminarItemDeOrden(ordenId, menuItemId);
          console.log(`  Item eliminado. Modificados: ${result.modifiedCount}`);
          pausar();
          break;
        }
        case '9': {
          const id = leerTexto('ID de la orden', true);
          const result = await orderCtrl.eliminarOrden(id);
          console.log(`  Eliminados: ${result.deletedCount}`);
          pausar();
          break;
        }
        case '10': {
          const total = await orderCtrl.contarOrdenes();
          const estados = await orderCtrl.obtenerEstados();
          console.log(`\n  Total órdenes: ${total}`);
          console.log(`  Estados: ${estados.join(', ')}`);
          pausar();
          break;
        }
        case '11': {
          printSubHeader('Eliminar Varias Órdenes (deleteMany)');
          console.log('  Estados: pendiente, preparando, enviado, entregado, cancelado');
          const estado = leerTexto('Estado de las órdenes a eliminar', true);
          const count = await orderCtrl.contarOrdenes({ estado });
          console.log(`  Se encontraron ${count} órdenes con estado "${estado}".`);
          if (count > 0 && readlineSync.keyInYN('  ¿Proceder con la eliminación?')) {
            const result = await orderCtrl.eliminarVariasOrdenes({ estado });
            console.log(`  Eliminados: ${result.deletedCount}`);
          }
          pausar();
          break;
        }
        case '12': {
          printSubHeader('Actualizar Varias Órdenes (updateMany)');
          console.log('  Estados: pendiente, preparando, enviado, entregado, cancelado');
          const estadoActual = leerTexto('Estado actual (filtro)', true);
          const nuevoEstado = leerTexto('Nuevo estado', true);
          const count = await orderCtrl.contarOrdenes({ estado: estadoActual });
          console.log(`  Se encontraron ${count} órdenes con estado "${estadoActual}".`);
          if (count > 0 && readlineSync.keyInYN('  ¿Proceder con la actualización?')) {
            const result = await orderCtrl.actualizarVariasOrdenes({ estado: estadoActual }, { estado: nuevoEstado });
            console.log(`  Modificados: ${result.modifiedCount}`);
          }
          pausar();
          break;
        }
        case '0': volver = true; break;
        default: console.log('  Opción no válida.'); pausar();
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      pausar();
    }
  }
}

// ============================================================
// 5. Reseñas
// ============================================================

async function menuResenas() {
  let volver = false;
  while (!volver) {
    clearScreen();
    printHeader('RESENAS');
    console.log('');
    console.log('  1. Crear reseña');
    console.log('  2. Listar reseñas');
    console.log('  3. Reseñas de un restaurante');
    console.log('  4. Reseñas de un usuario');
    console.log('  5. Buscar por ID');
    console.log('  6. Subir imagen a reseña (GridFS)');
    console.log('  7. Listar archivos GridFS');
    console.log('  8. Eliminar imagen de reseña');
    console.log('  9. Actualizar reseña');
    console.log('  10. Eliminar reseña');
    console.log('  0. Volver');
    console.log('');

    const opcion = readlineSync.question('  Selecciona: ');
    try {
      switch (opcion) {
        case '1': {
          printSubHeader('Crear Reseña');
          const usuario_id = leerTexto('ID del usuario', true);
          const orden_id = leerTexto('ID de la orden (debe estar entregada)', true);
          const calificacion = leerEntero('Calificación (1-5)', 5);
          const comentario = leerTexto('Comentario');
          const result = await reviewCtrl.crearResena({ usuario_id, orden_id, calificacion, comentario });
          console.log('\n  Reseña creada:');
          printDoc(result);
          pausar();
          break;
        }
        case '2': {
          const skip = leerEntero('Skip', 0);
          const limit = leerEntero('Limit', 10);
          const result = await reviewCtrl.listarResenas({ skip, limit });
          result.forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.calificacion} | ${r.usuario?.nombre || 'N/A'} → ${r.restaurante?.nombre || 'N/A'} | "${(r.comentario || '').substring(0, 40)}..."`);
          });
          pausar();
          break;
        }
        case '3': {
          const id = leerTexto('ID del restaurante', true);
          const result = await reviewCtrl.listarResenasPorRestaurante(id);
          result.forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.calificacion} | ${r.usuario?.nombre || 'N/A'} | "${(r.comentario || '').substring(0, 40)}..."`);
          });
          pausar();
          break;
        }
        case '4': {
          const id = leerTexto('ID del usuario', true);
          const result = await reviewCtrl.listarResenasPorUsuario(id);
          result.forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.calificacion} | ${r.restaurante?.nombre || 'N/A'} | "${(r.comentario || '').substring(0, 40)}..."`);
          });
          pausar();
          break;
        }
        case '5': {
          const id = leerTexto('ID de la reseña', true);
          const result = await reviewCtrl.obtenerResena(id);
          if (result) printDoc(result);
          else console.log('  No encontrada.');
          pausar();
          break;
        }
        case '6': {
          printSubHeader('Subir Imagen a Reseña (GridFS)');
          const resenaId = leerTexto('ID de la reseña', true);
          const filePath = leerTexto('Ruta del archivo de imagen', true);
          const descripcion = leerTexto('Descripción de la imagen');
          const result = await reviewCtrl.agregarImagenAResena(resenaId, filePath, descripcion);
          console.log(`\n  Imagen subida: ${result.filename} (ID: ${result.file_id})`);
          pausar();
          break;
        }
        case '7': {
          printSubHeader('Archivos en GridFS');
          const archivos = await reviewCtrl.listarArchivosGridFS();
          archivos.forEach((a, i) => {
            console.log(`  ${i + 1}. ${a.filename} | ${a.length} bytes | ${a.uploadDate}`);
          });
          console.log(`\n  Total archivos: ${archivos.length}`);
          pausar();
          break;
        }
        case '8': {
          const resenaId = leerTexto('ID de la reseña', true);
          const fileId = leerTexto('ID del archivo a eliminar', true);
          const result = await reviewCtrl.eliminarImagenDeResena(resenaId, fileId);
          console.log(`  Imagen eliminada. Modificados: ${result.modifiedCount}`);
          pausar();
          break;
        }
        case '9': {
          const id = leerTexto('ID de la reseña', true);
          const calificacion = leerTexto('Nueva calificación (1-5)');
          const comentario = leerTexto('Nuevo comentario');
          const datos = {};
          if (calificacion) datos.calificacion = parseInt(calificacion);
          if (comentario) datos.comentario = comentario;
          const result = await reviewCtrl.actualizarResena(id, datos);
          console.log(`  Modificados: ${result.modifiedCount}`);
          pausar();
          break;
        }
        case '10': {
          const id = leerTexto('ID de la reseña', true);
          const result = await reviewCtrl.eliminarResena(id);
          console.log(`  Eliminados: ${result.deletedCount}`);
          pausar();
          break;
        }
        case '0': volver = true; break;
        default: console.log('  Opción no válida.'); pausar();
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      pausar();
    }
  }
}

// ============================================================
// 6. Analíticas
// ============================================================

async function menuAnaliticas() {
  let volver = false;
  while (!volver) {
    clearScreen();
    printHeader('ANALÍTICAS Y REPORTES');
    console.log('');
    console.log('  1. Restaurantes mejor calificados');
    console.log('  2. Platillos más vendidos');
    console.log('  3. Ventas por restaurante');
    console.log('  4. Ventas por período');
    console.log('  5. Órdenes por estado');
    console.log('  6. Distribución de calificaciones');
    console.log('  0. Volver');
    console.log('');

    const opcion = readlineSync.question('  Selecciona: ');
    try {
      switch (opcion) {
        case '1': {
          printSubHeader('Restaurantes Mejor Calificados (Aggregation Pipeline)');
          const limit = leerEntero('Top N', 10);
          const result = await analyticsCtrl.restaurantesMejorCalificados(limit);
          result.forEach((r, i) => {
            console.log(`  ${i + 1}. ${r.nombre} | ${r.promedio_calificacion} | ${r.total_resenas} reseñas | ${r.categoria}`);
          });
          pausar();
          break;
        }
        case '2': {
          printSubHeader('Platillos Más Vendidos (Aggregation Pipeline con $unwind)');
          const limit = leerEntero('Top N', 10);
          const result = await analyticsCtrl.platillosMasVendidos(limit);
          result.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.nombre} | Vendidos: ${p.total_vendido} | Monto: Q${p.monto_total} | Órdenes: ${p.veces_ordenado}`);
          });
          pausar();
          break;
        }
        case '3': {
          printSubHeader('Ventas por Restaurante (Aggregation Pipeline)');
          const limit = leerEntero('Top N', 10);
          const result = await analyticsCtrl.ventasPorRestaurante(limit);
          result.forEach((v, i) => {
            console.log(`  ${i + 1}. ${v.nombre} | Total: Q${v.monto_total} | Órdenes: ${v.total_ordenes} | Prom: Q${v.promedio_orden}`);
          });
          pausar();
          break;
        }
        case '4': {
          printSubHeader('Ventas por Período');
          console.log('  Periodos: dia, semana, mes');
          const periodo = leerTexto('Período') || 'dia';
          const fechaInicio = leerTexto('Fecha inicio (YYYY-MM-DD, vacío = todas)');
          const fechaFin = leerTexto('Fecha fin (YYYY-MM-DD, vacío = todas)');
          const result = await analyticsCtrl.ventasPorPeriodo(periodo, fechaInicio || null, fechaFin || null);
          result.slice(0, 20).forEach((v, i) => {
            console.log(`  ${i + 1}. ${v.periodo} | Total: Q${v.monto_total} | Órdenes: ${v.total_ordenes}`);
          });
          pausar();
          break;
        }
        case '5': {
          printSubHeader('Órdenes por Estado');
          const result = await analyticsCtrl.ordenesPorEstado();
          result.forEach((e) => {
            console.log(`  ${e.estado}: ${e.total}`);
          });
          pausar();
          break;
        }
        case '6': {
          const id = leerTexto('ID del restaurante', true);
          const result = await analyticsCtrl.distribucionCalificaciones(id);
          result.forEach((d) => {
            const bar = '█'.repeat(Math.min(d.total, 50));
            console.log(`  ${d.calificacion}: ${bar} (${d.total})`);
          });
          pausar();
          break;
        }
        case '0': volver = true; break;
        default: console.log('  Opción no válida.'); pausar();
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      pausar();
    }
  }
}

// ============================================================
// 7. Operaciones Bulk
// ============================================================

async function menuBulk() {
  let volver = false;
  while (!volver) {
    clearScreen();
    printHeader('OPERACIONES BULK');
    console.log('');
    console.log('  1. Bulk insert restaurantes');
    console.log('  2. Bulk update estados de órdenes');
    console.log('  0. Volver');
    console.log('');

    const opcion = readlineSync.question('  Selecciona: ');
    try {
      switch (opcion) {
        case '1': {
          printSubHeader('Bulk Insert Restaurantes');
          const cantidad = leerEntero('Cantidad de restaurantes a crear', 5);
          const restaurantes = [];
          for (let i = 0; i < cantidad; i++) {
            restaurantes.push({
              nombre: `Rest Bulk ${Date.now()}_${i}`,
              descripcion: 'Creado por operación bulk',
              categoria: 'Otro',
              longitud: -90.5 + Math.random() * 0.1,
              latitud: 14.6 + Math.random() * 0.1,
              telefono: '+502 0000-0000'
            });
          }
          const result = await bulkCtrl.bulkInsertRestaurantes(restaurantes);
          console.log(`  Insertados: ${result.insertados}`);
          pausar();
          break;
        }
        case '2': {
          printSubHeader('Bulk Update Estados');
          console.log('  Esto actualizará las primeras N órdenes pendientes a preparando.');
          const limit = leerEntero('Cantidad', 10);
          const db = require('../config/database').getDB();
          const ordenes = await db.collection('Ordenes')
            .find({ estado: 'pendiente' })
            .limit(limit)
            .toArray();

          if (ordenes.length === 0) {
            console.log('  No hay órdenes pendientes.');
          } else {
            const ops = ordenes.map(o => ({
              tipo: 'actualizarEstado',
              id: o._id.toString(),
              estado: 'preparando'
            }));
            const result = await bulkCtrl.bulkWriteOrdenes(ops);
            console.log(`  Actualizados: ${result.actualizados}`);
          }
          pausar();
          break;
        }
        case '0': volver = true; break;
        default: console.log('  Opción no válida.'); pausar();
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      pausar();
    }
  }
}

// ============================================================
// 8. Resumen
// ============================================================

async function mostrarResumen() {
  clearScreen();
  printHeader('RESUMEN DEL SISTEMA');
  const resumen = await analyticsCtrl.resumenGeneral();
  console.log('');
  console.log(`  Restaurantes:     ${resumen.total_restaurantes}`);
  console.log(`  Usuarios:          ${resumen.total_usuarios}`);
  console.log(`  Articulos menu:    ${resumen.total_articulos_menu}`);
  console.log(`  Ordenes:           ${resumen.total_ordenes}`);
  console.log(`  Resenas:           ${resumen.total_resenas}`);
  pausar();
}

module.exports = { menuPrincipal };

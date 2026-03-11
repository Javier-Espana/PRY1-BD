# Guion del Video - Proyecto 1 MongoDB
**Duracion maxima: 10 minutos**

Participantes:
- **Roberto** (R) — Roberto Barreda, 23354
- **Javier** (J) — Javier Espana, 23361
- **Diego** (D) — Diego Lopez, 23747

---

## INTRO (0:00 - 0:40) — Roberto

**R:** "Hola, somos del equipo conformado por Roberto Barreda, Javier España y Diego López, de la sección 20 de Base de Datos 2. Nuestro proyecto es un sistema de gestión de pedidos y reseñas de restaurantes, tipo Uber Eats, desarrollado en Node.js con MongoDB."

**R:** "El sistema tiene 5 colecciones: Restaurantes, Usuarios, Artículos del Menú, Órdenes y Reseñas, con más de 55,000 documentos. Usamos documentos embebidos en los ítems de cada orden, y documentos referenciados entre las demás colecciones."

*[Mostrar: Dashboard del frontend con los conteos]*

---

## CRUD Y CONSULTAS (0:40 - 2:30) — Javier

**J:** "Voy a mostrar las operaciones CRUD. Empecemos creando un restaurante."

*[Mostrar: Crear restaurante desde frontend o consola]*

**J:** "Ahora listamos los restaurantes con paginación. También podemos filtrar por categoría, buscar por texto y ver restaurantes cercanos con consultas geoespaciales."

*[Mostrar: Listar, filtrar por categoría, búsqueda de texto, restaurantes cercanos]*

**J:** "Actualizamos el restaurante que acabamos de crear y después lo eliminamos."

*[Mostrar: Editar restaurante → Eliminar restaurante]*

**J:** "También tenemos insertMany para artículos del menú, updateMany y deleteMany para órdenes y restaurantes, expuestos vía API."

*[Mostrar en consola o frontend: updateMany/deleteMany]*

**J:** "Y para arrays, usamos $addToSet para agregar etiquetas a restaurantes, $push y $pull para manejar ítems en órdenes."

*[Mostrar: Agregar etiqueta a restaurante]*

---

## TRANSACCIONES E INDICES (2:30 - 4:30) — Diego

**D:** "Ahora les muestro la transacción multi-documento. Cuando creamos una orden, el sistema verifica stock, lo decrementa y crea la orden en una sola transacción. Si no hay stock, se hace abort."

*[Mostrar en consola: Crear orden exitosa → mostrar stock decrementado]*

**D:** "Si intentamos crear una orden con stock insuficiente, la transacción se aborta automáticamente."

*[Mostrar: Intento con stock insuficiente → error/abort]*

**D:** "Pasemos a los índices. Creamos 17 índices de distintos tipos: simple, compuesto, multikey, 2dsphere, text y unique."

*[Mostrar salida de npm run indexes]*

**D:** "Validamos con explain que todas las consultas usan IXSCAN. Aquí ven un ejemplo con el índice idx_ordenes_estado."

*[Mostrar: explain() con IXSCAN]*

**D:** "También configuramos notablescan para rechazar queries sin índice."

*[Mostrar: npm run notablescan → npm run notablescan:test]*

---

## GRIDFS (4:30 - 5:30) — Roberto

**R:** "Implementamos GridFS para almacenar imágenes en reseñas. Usamos un bucket llamado 'imagenes'."

*[Mostrar: Subir imagen a una reseña desde frontend o API]*

**R:** "Podemos listar los archivos almacenados y descargarlos."

*[Mostrar: GET /api/resenas/archivos → Descargar archivo]*

**R:** "Y eliminar un archivo cuando ya no se necesita."

*[Mostrar: Eliminar imagen de reseña]*

---

## AGGREGATION PIPELINES (5:30 - 7:30) — Javier

**J:** "Implementamos 6 aggregation pipelines accesibles desde el menú de analíticas."

**J:** "La primera muestra los restaurantes mejor calificados usando $sort y $limit."

*[Mostrar: Opción 1 de analíticas en consola]*

**J:** "La de platillos más vendidos usa $unwind para descomponer los ítems de cada orden, luego $group para agrupar por artículo."

*[Mostrar: Opción 2]*

**J:** "Ventas por restaurante combina $group con $lookup para traer el nombre del restaurante."

*[Mostrar: Opción 3]*

**J:** "Ventas por período permite agrupar por día, semana o mes usando $dateToString."

*[Mostrar: Opción 4]*

**J:** "Órdenes por estado y distribución de calificaciones completan las analíticas."

*[Mostrar: Opciones 5 y 6]*

---

## OPERACIONES BULK Y SHARD KEY (7:30 - 9:00) — Diego

**D:** "Para operaciones bulk usamos bulkWrite. Aquí hago un bulk insert de restaurantes."

*[Mostrar: Desde consola o API, bulk insert]*

**D:** "Y un bulk update para cambiar estados de órdenes masivamente."

*[Mostrar: Bulk update de órdenes]*

**D:** "Respecto a la shard key, usamos el _id de la colección Órdenes, siguiendo indicación de la catedrática. La justificación es que Ordenes es nuestra colección más grande, el _id tiene alta cardinalidad, y con hashed sharding la distribución es uniforme entre shards."

*[Mostrar: Documento de diseño, sección de shard key]*

---

## FRONTEND Y CIERRE (9:00 - 10:00) — Roberto

**R:** "Como extra, implementamos un frontend SPA completo con dark theme. Desde aquí se pueden hacer todas las operaciones: CRUD, transacciones, GridFS, analíticas y operaciones bulk."

*[Mostrar: Navegación rápida por las vistas del frontend: Dashboard → Restaurantes → Órdenes → Analíticas]*

**R:** "El sistema tiene 56 endpoints REST, 5 colecciones con validación JSON Schema, 17 índices y más de 55,000 documentos de prueba."

**R:** "Eso es todo, gracias."

---

## Tips para la grabacion

1. **Preparar todo antes de grabar**: Tener la consola abierta, el API corriendo, y el frontend cargado.
2. **Tener datos de ejemplo listos**: IDs de restaurantes/usuarios para no buscarlos en vivo.
3. **Practicar una vez** el flujo completo antes de grabar.
4. **Si algo falla**, no parar — explicar qué pasó y continuar.
5. **Hablar claro y pausado**, no correr.
6. **Compartir pantalla** mostrando la terminal o el navegador según corresponda.

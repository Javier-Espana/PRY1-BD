# 📋 TAREAS PENDIENTES - Proyecto 1 MongoDB

Este documento lista las tareas que faltan por completar para que cada miembro del equipo contribuya con commits propios.

---

## ⚠️ IMPORTANTE: Cambio de Shard Key

Según indicaciones de la catedrática, se cambió la **shard key** de `restaurant_id` a **`order_id`** (el `_id` de la colección Órdenes). Esto ya está reflejado en el código y en los comentarios del modelo `Order.js`.

---

## 🔧 Tareas por completar

### 1. Configurar `.env` con credenciales de MongoDB Atlas (Roberto)
- [ ] Crear el archivo `.env` basándose en `.env.example`
- [ ] Configurar la URI de conexión con el cluster de Atlas del equipo
- [ ] Verificar que la conexión funciana ejecutando `npm start`

### 2. Ejecutar y validar el seed de datos (Roberto)
- [ ] Ejecutar `npm run seed` para poblar la base de datos
- [ ] Verificar que se crearon 55,000+ documentos en Órdenes
- [ ] Verificar que los índices están creados correctamente
- [ ] Tomar screenshots de Atlas mostrando las colecciones y sus documentos

### 3. Validar índices con `explain()` (Diego)
- [ ] Ejecutar el script `npm run indexes` y documentar la salida
- [ ] Verificar que todas las consultas usan `IXSCAN` (no `COLLSCAN`)
- [ ] Tomar screenshots de al menos 4 `explain()` diferentes mostrando uso de índices
- [ ] Documentar el impacto de cada índice (nReturned vs totalDocsExamined)
- [ ] Agregar los screenshots al documento de diseño o a una carpeta `docs/`

### 4. Configurar la base de datos para rechazar queries sin índice (Diego)
- [ ] Ejecutar en MongoDB Shell o Atlas:
  ```js
  db.adminCommand({ setParameter: 1, notablescan: 1 })
  ```
- [ ] Verificar que consultas sin índice son rechazadas
- [ ] Documentar con screenshot

### 5. Probar transacción multi-documento (Roberto)
- [ ] Desde el menú de consola, crear una orden (opción 4 → 1)
- [ ] Verificar que se descuenta el stock en ArticulosMenu
- [ ] Probar con stock insuficiente y verificar que la transacción se aborta
- [ ] Documentar el flujo completo con screenshots

### 6. Probar operaciones GridFS (Diego)
- [ ] Preparar 2-3 imágenes de prueba (jpg/png)
- [ ] Desde el menú de consola, subir imágenes a una reseña (opción 5 → 6)
- [ ] Verificar que los archivos aparecen en la colección `imagenes.files` y `imagenes.chunks`
- [ ] Probar desde la API: `POST /api/resenas/:id/imagenes` con multipart form
- [ ] Documentar con screenshots

### 7. Probar y documentar Aggregation Pipelines (Roberto)
- [ ] Desde el menú de consola (opción 6), ejecutar:
  - [ ] Restaurantes mejor calificados
  - [ ] Platillos más vendidos
  - [ ] Ventas por restaurante
  - [ ] Ventas por período (día, semana, mes)
  - [ ] Órdenes por estado
- [ ] Tomar screenshots de cada resultado
- [ ] Documentar las pipelines usadas y sus resultados

### 8. Probar operaciones Bulk (Diego)
- [ ] Desde el menú de consola (opción 7), ejecutar:
  - [ ] Bulk insert de restaurantes
  - [ ] Bulk update de estados de órdenes
- [ ] Documentar con screenshots

### 9. Video de demostración (todos)
- [ ] Grabar video de máximo 10 minutos mostrando:
  - [ ] Descripción del caso de uso y modelo de datos
  - [ ] CRUD completo (crear, leer, actualizar, eliminar)
  - [ ] Consultas con filtros, proyecciones, ordenamiento, skip, limit
  - [ ] Consulta geoespacial (restaurantes cercanos)
  - [ ] Búsqueda por texto
  - [ ] Transacción multi-documento
  - [ ] Operaciones de arrays ($push, $pull)
  - [ ] GridFS (subir/descargar archivos)
  - [ ] Aggregation pipelines
  - [ ] Operaciones bulk
  - [ ] Validación de índices con explain()

### 10. Frontend (EXTRA - hasta 10 pts) (a decidir)
- [ ] Si se decide hacer frontend, implementar interfaz web
- [ ] Opciones: React, Vue, o cualquier framework
- [ ] Conectar con la API Express existente
- [ ] **NOTA**: Si se hace frontend, la evaluación se basa en esa interfaz

### 11. Mongo Charts (EXTRA - hasta 5 pts) (a decidir)
- [ ] Configurar Mongo Charts en Atlas
- [ ] Crear dashboards con sentido de negocio:
  - [ ] Top restaurantes por calificación
  - [ ] Distribución de pedidos por estado
  - [ ] Ventas por período
  - [ ] Platillos más vendidos
- [ ] Embeber gráficas (2 pts por gráfica embebida)
- [ ] **NOTA**: No se puede hacer si se elige BI Connectors

### 12. Shard Key - Documentación (Diego)
- [ ] Documentar la estrategia de shard key usando `order_id`
- [ ] Justificar por qué se usa `order_id` en lugar de `restaurant_id`
- [ ] Incluir análisis de escalabilidad en el documento de diseño

---

## 📂 Estructura del proyecto

```
PRY1-BD/
├── .env.example          # Template de variables de entorno
├── .gitignore            # Ignora node_modules, .env y docs de referencia
├── package.json          # Dependencias y scripts
├── src/
│   ├── index.js          # Punto de entrada (modo API o consola)
│   ├── config/
│   │   └── database.js   # Conexión a MongoDB + GridFS
│   ├── models/
│   │   ├── index.js      # Inicializador de colecciones
│   │   ├── Restaurant.js # Schema Restaurantes
│   │   ├── User.js       # Schema Usuarios
│   │   ├── MenuItem.js   # Schema ArticulosMenu
│   │   ├── Order.js      # Schema Ordenes (shard key: order_id)
│   │   └── Review.js     # Schema Resenas
│   ├── controllers/
│   │   ├── restaurantController.js  # CRUD + geo + texto
│   │   ├── userController.js        # CRUD
│   │   ├── menuItemController.js    # CRUD + insertMany
│   │   ├── orderController.js       # CRUD + transacción + arrays
│   │   ├── reviewController.js      # CRUD + GridFS + arrays
│   │   ├── analyticsController.js   # Aggregation pipelines
│   │   └── bulkController.js        # Operaciones bulkWrite
│   ├── routes/
│   │   ├── restaurants.js
│   │   ├── users.js
│   │   ├── menuItems.js
│   │   ├── orders.js
│   │   ├── reviews.js
│   │   └── analytics.js
│   ├── scripts/
│   │   ├── createIndexes.js  # Creación y validación de índices
│   │   └── seedData.js       # Seed de 55,000+ documentos
│   └── utils/
│       └── consoleMenu.js    # Menú interactivo de consola
```

---

## 🚀 Cómo empezar

```bash
# 1. Instalar dependencias (ya instaladas)
npm install

# 2. Configurar .env (copiar de .env.example y agregar credenciales)
cp .env.example .env

# 3. Ejecutar seed (crea colecciones, índices y datos de prueba)
npm run seed

# 4. Iniciar la aplicación
npm start          # Modo consola (menú interactivo)
npm start api      # Modo API (Express en puerto 3000)
```

---

## ✅ Lo que ya está implementado

| Aspecto | Estado | Ubicación |
|---------|--------|-----------|
| Modelos con validación JSON Schema | ✅ | `src/models/` |
| CRUD completo (todas las colecciones) | ✅ | `src/controllers/` |
| Documentos embebidos (items en Ordenes) | ✅ | `orderController.js` |
| Documentos referenciados (todas las relaciones) | ✅ | Todos los controllers |
| Índices (simple, compuesto, multikey, geo, texto) | ✅ | `createIndexes.js` |
| Transacción multi-documento | ✅ | `orderController.crearOrden()` |
| Aggregation pipelines complejas | ✅ | `analyticsController.js` |
| GridFS para archivos | ✅ | `reviewController.js` |
| Manejo de arrays ($push, $pull, $addToSet) | ✅ | `orderController.js`, `reviewController.js` |
| Operaciones Bulk (bulkWrite) | ✅ | `bulkController.js` |
| Seed 55,000+ documentos | ✅ | `seedData.js` |
| Filtros, proyecciones, sort, skip, limit | ✅ | Todos los controllers |
| Lookups multi-colección | ✅ | `orderController.js`, `reviewController.js` |
| count, distinct | ✅ | Todos los controllers |
| Menú de consola interactivo | ✅ | `consoleMenu.js` |
| API REST Express | ✅ | `src/routes/` |
| Shard key: order_id (cambio solicitado) | ✅ | `Order.js` |

---

## 📝 Notas importantes

1. **Shard Key**: Se usa `order_id` (el `_id` de Ordenes) como shard key en lugar de `restaurant_id`, según indicación de la catedrática.

2. **notablescan**: Recuerden configurar la base de datos para rechazar queries sin índice antes de la presentación.

3. **GridFS bucket**: Se llama `imagenes` (colecciones: `imagenes.files` e `imagenes.chunks`).

4. **Validación de schema**: Está configurada como `moderate` para permitir documentos legacy.

5. **Commits**: Cada miembro debe tener commits propios documentando su trabajo.

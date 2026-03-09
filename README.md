# 🍕 Sistema de Gestión de Pedidos y Reseñas de Restaurantes

Proyecto 1 — CC3089 Base de Datos 2, Sección 20  
Universidad del Valle de Guatemala  
Catedrática: Daniela Mesalles

## 👥 Equipo

| Nombre | Carné |
|--------|-------|
| Roberto Barreda | 23354 |
| Javier España | 23 |
| Diego López | 23747 |

---

## 📖 Descripción

Sistema backend para gestionar pedidos y reseñas de restaurantes usando **MongoDB**. Incluye:

- **5 colecciones** con validación JSON Schema
- CRUD completo para todas las entidades
- Documentos embebidos y referenciados
- Transacciones multi-documento
- Consultas geoespaciales y búsqueda de texto
- GridFS para almacenamiento de imágenes
- Aggregation pipelines complejas
- Operaciones bulk (bulkWrite)
- Más de 55,000 documentos de prueba
- Interfaz de consola interactiva + API REST

---

## 🛠 Tecnologías

- **Node.js** + **Express**
- **MongoDB** (driver nativo)
- **GridFS** para archivos
- **MongoDB Atlas** (recomendado)

---

## 🚀 Instalación y uso

### Requisitos previos

- Node.js v18+
- MongoDB Atlas (o instancia local de MongoDB)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd PRY1-BD

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URI de MongoDB Atlas
```

### Variables de entorno (.env)

```env
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=delivery_db
PORT=3000
```

### Ejecutar

```bash
# Modo consola (menú interactivo - recomendado para demo)
npm start

# Modo API REST (Express en puerto 3000)
npm start api

# Solo seed de datos (crea colecciones + índices + datos de prueba)
npm run seed

# Solo crear índices
npm run indexes

# Setup completo (colecciones + índices)
npm run setup
```

---

## 📂 Estructura del proyecto

```
PRY1-BD/
├── package.json
├── .env.example
├── .gitignore
├── PENDIENTES.md          # Tareas pendientes por miembro
├── README.md              # Este archivo
├── src/
│   ├── index.js           # Punto de entrada
│   ├── config/
│   │   └── database.js    # Conexión MongoDB + GridFS
│   ├── models/
│   │   ├── index.js       # Inicializador de colecciones con validación
│   │   ├── Restaurant.js  # Schema: Restaurantes
│   │   ├── User.js        # Schema: Usuarios
│   │   ├── MenuItem.js    # Schema: ArticulosMenu
│   │   ├── Order.js       # Schema: Ordenes
│   │   └── Review.js      # Schema: Resenas
│   ├── controllers/
│   │   ├── restaurantController.js   # CRUD + geoespacial + texto
│   │   ├── userController.js         # CRUD usuarios
│   │   ├── menuItemController.js     # CRUD + insertMany
│   │   ├── orderController.js        # CRUD + transacción + arrays
│   │   ├── reviewController.js       # CRUD + GridFS + arrays
│   │   ├── analyticsController.js    # Aggregation pipelines
│   │   └── bulkController.js         # Operaciones bulkWrite
│   ├── routes/
│   │   ├── restaurants.js
│   │   ├── users.js
│   │   ├── menuItems.js
│   │   ├── orders.js
│   │   ├── reviews.js
│   │   └── analytics.js
│   ├── scripts/
│   │   ├── createIndexes.js   # Índices + validación con explain()
│   │   └── seedData.js        # Generador de 55,000+ documentos
│   └── utils/
│       └── consoleMenu.js     # Menú interactivo de consola
```

---

## 🗄 Modelo de datos

### Colecciones

| Colección | Descripción | Documentos seed |
|-----------|-------------|-----------------|
| **Restaurantes** | Datos del restaurante, ubicación GeoJSON | 25 |
| **Usuarios** | Clientes y administradores | 200 |
| **ArticulosMenu** | Platillos de cada restaurante | ~250 |
| **Ordenes** | Pedidos con ítems embebidos | 55,000+ |
| **Resenas** | Calificaciones y comentarios | ~5,000 |

### Shard Key

Se utiliza **`order_id`** (el `_id` de la colección Ordenes) como shard key, según indicación de la catedrática.

### Índices implementados

| Tipo | Colección | Campo(s) |
|------|-----------|----------|
| 2dsphere | Restaurantes | `direccion.coordenadas` |
| Text | Restaurantes | `nombre`, `descripcion` |
| Compound | Restaurantes | `categoria`, `rating_promedio` |
| Unique | Usuarios | `email` |
| Compound | ArticulosMenu | `restaurante_id`, `stock` |
| Text | ArticulosMenu | `nombre`, `descripcion` |
| Compound | Ordenes | `usuario_id`, `fecha_creacion` |
| Compound | Ordenes | `restaurante_id`, `estado`, `fecha_creacion` |
| Multikey | Ordenes | `items.menu_item_id` |
| Compound | Resenas | `restaurante_id`, `fecha` |
| Unique | Resenas | `orden_id` |
| Multikey | Resenas | `imagenes.file_id` |

---

## 📡 API REST

Base URL: `http://localhost:3000/api`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/restaurantes` | Listar restaurantes |
| POST | `/restaurantes` | Crear restaurante |
| GET | `/restaurantes/:id` | Obtener restaurante |
| PUT | `/restaurantes/:id` | Actualizar restaurante |
| DELETE | `/restaurantes/:id` | Eliminar restaurante |
| GET | `/restaurantes/cercanos` | Búsqueda geoespacial |
| GET | `/restaurantes/buscar` | Búsqueda por texto |
| GET | `/usuarios` | Listar usuarios |
| POST | `/usuarios` | Crear usuario |
| GET | `/ordenes` | Listar órdenes |
| POST | `/ordenes` | Crear orden (con transacción) |
| PUT | `/ordenes/:id/items` | Agregar ítem ($push) |
| DELETE | `/ordenes/:id/items/:itemId` | Eliminar ítem ($pull) |
| GET | `/resenas` | Listar reseñas |
| POST | `/resenas` | Crear reseña |
| POST | `/resenas/:id/imagenes` | Subir imagen (GridFS) |
| GET | `/analytics/top-restaurantes` | Mejores restaurantes |
| GET | `/analytics/platillos-vendidos` | Platillos más vendidos |
| GET | `/analytics/ventas-restaurante` | Ventas por restaurante |
| GET | `/analytics/ventas-periodo` | Ventas por período |

---

## 🎯 Funcionalidades implementadas

- [x] Mínimo 5 colecciones con JSON Schema validation
- [x] CRUD completo (insert, find, update, delete)
- [x] Documentos embebidos (items en Ordenes)
- [x] Documentos referenciados (todas las relaciones)
- [x] insertMany / updateMany / deleteMany
- [x] Filtros, proyecciones, ordenamiento, skip, limit
- [x] count, distinct
- [x] $lookup (joins multi-colección)
- [x] Manejo de arrays ($push, $pull, $addToSet)
- [x] Índices: simple, compuesto, multikey, 2dsphere, text, unique
- [x] Validación de índices con explain()
- [x] Transacción multi-documento
- [x] GridFS (subir, descargar, eliminar archivos)
- [x] Aggregation pipelines ($group, $match, $sort, $lookup, $unwind, $project)
- [x] Operaciones Bulk (bulkWrite)
- [x] Seed con 55,000+ documentos
- [x] Menú interactivo de consola
- [x] API REST con Express

---

## 📅 Fecha de entrega

**Martes 10 de marzo de 2026, 18:59 hrs**

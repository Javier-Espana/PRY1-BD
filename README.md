# Sistema de Gestion de Pedidos y Resenas de Restaurantes

Proyecto 1 — CC3089 Base de Datos 2, Sección 20  
Universidad del Valle de Guatemala  
Catedrática: Daniela Mesalles

## Equipo

| Nombre | Carné |
|--------|-------|
| Roberto Barreda | 23354 |
| Javier España | 23361 |
| Diego López | 23747 |

---

## Descripcion

Sistema completo para gestionar pedidos y resenas de restaurantes usando **MongoDB**. Incluye:

- **5 colecciones** con validacion JSON Schema
- CRUD completo para todas las entidades
- Documentos embebidos y referenciados
- Transacciones multi-documento
- Consultas geoespaciales y busqueda de texto
- GridFS para almacenamiento de imagenes
- Aggregation pipelines complejas
- Operaciones bulk (bulkWrite)
- Mas de 55,000 documentos de prueba
- Interfaz de consola interactiva + API REST
- **Frontend SPA** (Single Page Application) con dark theme

---

## Tecnologias

- **Node.js** + **Express**
- **MongoDB** (driver nativo v6.13)
- **GridFS** para archivos
- **MongoDB Atlas** (recomendado)
- **Frontend**: Vanilla JS SPA (sin frameworks), CSS custom properties, dark theme

---

## Instalacion y uso

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
# Modo consola (menu interactivo - recomendado para demo)
npm start

# Modo API REST + Frontend (Express en puerto 3000)
npm run api

# Solo seed de datos (crea colecciones + indices + datos de prueba)
npm run seed

# Solo crear indices
npm run indexes

# Setup completo (colecciones + indices)
npm run setup

# Configurar notablescan (rechazar queries sin indice)
npm run notablescan

# Desactivar notablescan
npm run notablescan:off

# Probar que notablescan funciona
npm run notablescan:test
```

---

## Modelo de datos

### Colecciones

| Coleccion | Descripcion | Documentos seed |
|-----------|-------------|-----------------|
| **Restaurantes** | Datos del restaurante, ubicación GeoJSON | 25 |
| **Usuarios** | Clientes y administradores | 200 |
| **ArticulosMenu** | Platillos de cada restaurante | ~250 |
| **Ordenes** | Pedidos con ítems embebidos | 55,000+ |
| **Resenas** | Calificaciones y comentarios | ~5,000 |

### Shard Key

Se utiliza **`order_id`** (el `_id` de la colección Ordenes) como shard key, según indicación de la catedrática.

### Indices implementados

| Tipo | Coleccion | Campo(s) |
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

## API REST

Base URL: `http://localhost:3000/api`

### Restaurantes (12 endpoints)
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/restaurantes` | Listar (paginado) |
| POST | `/restaurantes` | Crear restaurante |
| GET | `/restaurantes/cercanos` | Busqueda geoespacial (2dsphere) |
| GET | `/restaurantes/buscar` | Busqueda full-text |
| GET | `/restaurantes/categorias` | Categorias distintas |
| PATCH | `/restaurantes/varios` | updateMany con filtro |
| DELETE | `/restaurantes/varios` | deleteMany con filtro |
| GET | `/restaurantes/:id` | Obtener por ID |
| PUT | `/restaurantes/:id` | Actualizar |
| DELETE | `/restaurantes/:id` | Eliminar |
| POST | `/restaurantes/:id/etiquetas` | Agregar etiqueta ($addToSet) |
| DELETE | `/restaurantes/:id/etiquetas/:etiqueta` | Eliminar etiqueta |

### Usuarios (5 endpoints)
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/usuarios` | Listar |
| POST | `/usuarios` | Crear |
| GET | `/usuarios/:id` | Obtener |
| PUT | `/usuarios/:id` | Actualizar |
| DELETE | `/usuarios/:id` | Eliminar |

### Articulos Menu (7 endpoints)
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/menu/restaurante/:id` | Menu por restaurante |
| POST | `/menu` | Crear articulo |
| POST | `/menu/varios` | insertMany |
| GET | `/menu/buscar` | Busqueda full-text |
| GET | `/menu/:id` | Obtener |
| PUT | `/menu/:id` | Actualizar |
| DELETE | `/menu/:id` | Eliminar |

### Ordenes (11 endpoints)
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/ordenes` | Listar (filtro por estado) |
| POST | `/ordenes` | Crear con transaccion multi-documento |
| GET | `/ordenes/usuario/:id` | Por usuario |
| GET | `/ordenes/restaurante/:id` | Por restaurante |
| PATCH | `/ordenes/varios` | updateMany con filtro |
| DELETE | `/ordenes/varios` | deleteMany con filtro |
| GET | `/ordenes/:id` | Obtener con $lookup |
| PATCH | `/ordenes/:id/estado` | Actualizar estado |
| POST | `/ordenes/:id/items` | Agregar item ($push) |
| DELETE | `/ordenes/:id/items/:itemId` | Eliminar item ($pull) |
| DELETE | `/ordenes/:id` | Eliminar |

### Resenas (11 endpoints)
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/resenas` | Listar |
| POST | `/resenas` | Crear |
| GET | `/resenas/restaurante/:id` | Por restaurante |
| GET | `/resenas/usuario/:id` | Por usuario |
| GET | `/resenas/archivos` | Listar archivos GridFS |
| GET | `/resenas/archivos/:fileId` | Descargar archivo |
| GET | `/resenas/:id` | Obtener |
| POST | `/resenas/:id/imagenes` | Subir imagen (GridFS) |
| DELETE | `/resenas/:id/imagenes/:fileId` | Eliminar imagen |
| PUT | `/resenas/:id` | Actualizar |
| DELETE | `/resenas/:id` | Eliminar |

### Analiticas (7 endpoints)
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/analiticas/resumen` | Conteos generales |
| GET | `/analiticas/restaurantes-mejor-calificados` | Top por calificacion |
| GET | `/analiticas/platillos-mas-vendidos` | Mas vendidos ($unwind + $group) |
| GET | `/analiticas/ventas-por-restaurante` | Ventas agrupadas |
| GET | `/analiticas/ventas-por-periodo` | Ventas por dia/semana/mes |
| GET | `/analiticas/ordenes-por-estado` | Conteo por estado |
| GET | `/analiticas/distribucion-calificaciones/:id` | Distribucion por restaurante |

### Bulk (3 endpoints)
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/bulk/articulos` | bulkWrite ArticulosMenu |
| POST | `/bulk/ordenes` | bulkWrite Ordenes |
| POST | `/bulk/restaurantes` | Bulk insert restaurantes |

---

## Frontend SPA

Al ejecutar `npm run api`, el frontend esta disponible en `http://localhost:3000`.

**Caracteristicas:**
- Dark theme con CSS custom properties
- Navegacion hash-based (sin recarga de pagina)
- Sidebar responsiva con menu toggle para movil
- Sistema de modales para crear/editar/detallar recursos
- Notificaciones toast
- Paginacion en todas las listas
- Graficos de barras CSS para analytics

**Vistas:**
| Vista | Funcionalidad |
|-------|---------------|
| Dashboard | Stats generales + top restaurantes + top platillos + ordenes por estado |
| Restaurantes | CRUD + busqueda texto + busqueda geoespacial (cercanos) |
| Usuarios | CRUD completo |
| Articulos Menu | CRUD por restaurante + busqueda texto |
| Ordenes | CRUD + transaccion multi-documento + filtro estado + items dinamicos |
| Resenas | CRUD + subida imagenes GridFS + listado archivos |
| Analiticas | 6 tabs con aggregation pipelines y graficos |
| Bulk | Bulk insert restaurantes + bulk update ordenes |

---

## Funcionalidades implementadas

- [x] Minimo 5 colecciones con JSON Schema validation
- [x] CRUD completo (insert, find, update, delete)
- [x] Documentos embebidos (items en Ordenes)
- [x] Documentos referenciados (todas las relaciones)
- [x] insertMany / updateMany / deleteMany
- [x] Filtros, proyecciones, ordenamiento, skip, limit
- [x] count, distinct
- [x] $lookup (joins multi-coleccion)
- [x] Manejo de arrays ($push, $pull, $addToSet)
- [x] Indices: simple, compuesto, multikey, 2dsphere, text, unique
- [x] Validacion de indices con explain()
- [x] Transaccion multi-documento
- [x] GridFS (subir, descargar, eliminar archivos)
- [x] Aggregation pipelines ($group, $match, $sort, $lookup, $unwind, $project)
- [x] Operaciones Bulk (bulkWrite)
- [x] Seed con 55,000+ documentos
- [x] Menu interactivo de consola
- [x] API REST con Express (56 endpoints)
- [x] Frontend SPA con dark theme
- [x] Configuracion notablescan

---

## Fecha de entrega

**Martes 10 de marzo de 2026, 18:59 hrs**

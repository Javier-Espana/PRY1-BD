# Sistema de Gestion de Pedidos y Resenas de Restaurantes

Proyecto 1 — CC3089 Base de Datos 2, Seccion 20  
Universidad del Valle de Guatemala  
Catedratica: Daniela Mesalles

## Equipo

| Nombre | Carne |
|--------|-------|
| Roberto Barreda | 23354 |
| Javier Espana | 23361 |
| Diego Lopez | 23747 |

---

## Descripcion

Sistema para gestionar pedidos y resenas de restaurantes usando **MongoDB**. Cuenta con 5 colecciones validadas con JSON Schema, mas de 55,000 documentos de prueba, API REST (56 endpoints), frontend SPA con dark theme y menu de consola interactivo.

Para detalles de arquitectura, modelo de datos, estrategia de indices, shard key y evidencias, consultar el **Documento de Diseno** (`docs/DOCUMENTO_DISENO.md`).

---

## Tecnologias

- **Node.js** v18+ / **Express** v4
- **MongoDB** driver nativo v6.13 / **MongoDB Atlas**
- **GridFS** (bucket `imagenes`)
- **Frontend**: Vanilla JS SPA, CSS custom properties, dark theme

---

## Instalacion rapida

```bash
# 1. Clonar e instalar
git clone <url-del-repo>
cd PRY1-BD
npm install

# 2. Configurar variables de entorno
cp .env.example .env   # editar con URI de Atlas

# 3. Poblar base de datos (colecciones + indices + datos)
npm run seed

# 4. Ejecutar
npm start              # Modo consola (menu interactivo)
npm run api            # Modo API + Frontend (http://localhost:3000)
```

### Scripts disponibles

| Script | Descripcion |
|--------|-------------|
| `npm start` | Menu interactivo de consola |
| `npm run api` | API REST + Frontend SPA |
| `npm run seed` | Seed de colecciones, indices y datos |
| `npm run indexes` | Crear y validar indices |
| `npm run notablescan` | Activar notablescan |
| `npm run notablescan:off` | Desactivar notablescan |
| `npm run notablescan:test` | Probar notablescan |

## Funcionalidades clave

- 5 colecciones con JSON Schema validation
- CRUD completo + insertMany / updateMany / deleteMany
- Documentos embebidos (items en Ordenes) y referenciados
- $lookup, $push, $pull, $addToSet
- Indices: simple, compuesto, multikey, 2dsphere, text, unique
- Transaccion multi-documento
- GridFS para imagenes
- Aggregation pipelines ($group, $match, $sort, $unwind, $project)
- Operaciones Bulk (bulkWrite)
- notablescan (rechazar queries sin indice)
- Frontend SPA + Menu consola interactivo
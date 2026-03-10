/**
 * Validación JSON Schema para la colección ArticulosMenu.
 */
const menuItemSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['restaurante_id', 'nombre', 'precio', 'disponible'],
    properties: {
      restaurante_id: {
        bsonType: 'objectId',
        description: 'Referencia al restaurante - requerido'
      },
      nombre: {
        bsonType: 'string',
        description: 'Nombre del artículo - requerido'
      },
      descripcion: {
        bsonType: 'string'
      },
      precio: {
        bsonType: ['double', 'int', 'long', 'decimal'],
        minimum: 0,
        description: 'Precio > 0'
      },
      categoria: {
        bsonType: 'string',
        enum: [
          'Entrada', 'Plato Fuerte', 'Postre', 'Bebida',
          'Acompañamiento', 'Ensalada', 'Sopa', 'Snack', 'Otro'
        ],
        description: 'Categoría del artículo'
      },
      disponible: {
        bsonType: 'bool',
        description: 'Si está disponible'
      },
      stock: {
        bsonType: 'int',
        minimum: 0,
        description: 'Stock >= 0'
      },
      fecha_creacion: {
        bsonType: 'date'
      }
    }
  }
};

module.exports = { menuItemSchema };

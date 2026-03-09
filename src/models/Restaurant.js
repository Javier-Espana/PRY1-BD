/**
 * Validación JSON Schema para la colección Restaurantes.
 * Aplica las reglas definidas en el diseño del proyecto.
 */
const restaurantSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['nombre', 'direccion', 'categoria', 'activo'],
    properties: {
      nombre: {
        bsonType: 'string',
        description: 'Nombre del restaurante - requerido'
      },
      descripcion: {
        bsonType: 'string',
        description: 'Descripción del restaurante'
      },
      categoria: {
        bsonType: 'string',
        enum: [
          'Comida Rápida', 'Italiana', 'Asiática', 'Mexicana',
          'Americana', 'Mediterránea', 'Francesa', 'Japonesa',
          'China', 'Peruana', 'Guatemalteca', 'Postres', 'Café', 'Otro'
        ],
        description: 'Categoría del restaurante - enum requerido'
      },
      direccion: {
        bsonType: 'object',
        required: ['type', 'coordinates'],
        properties: {
          type: {
            bsonType: 'string',
            enum: ['Point'],
            description: 'Tipo GeoJSON - debe ser Point'
          },
          coordinates: {
            bsonType: 'array',
            minItems: 2,
            maxItems: 2,
            items: { bsonType: 'double' },
            description: '[longitud, latitud]'
          }
        },
        description: 'Ubicación GeoJSON del restaurante - requerido'
      },
      telefono: {
        bsonType: 'string'
      },
      email_contacto: {
        bsonType: 'string'
      },
      rating_promedio: {
        bsonType: 'double',
        minimum: 0,
        maximum: 5,
        description: 'Rating promedio entre 0 y 5'
      },
      total_resenas: {
        bsonType: 'int',
        minimum: 0,
        description: 'Total de reseñas >= 0'
      },
      activo: {
        bsonType: 'bool',
        description: 'Si el restaurante está activo'
      },
      fecha_registro: {
        bsonType: 'date'
      }
    }
  }
};

module.exports = { restaurantSchema };

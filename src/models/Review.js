/**
 * Validación JSON Schema para la colección Reseñas.
 * Las imágenes se almacenan en GridFS y se referencian por file_id.
 */
const reviewSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['usuario_id', 'restaurante_id', 'orden_id', 'calificacion'],
    properties: {
      usuario_id: {
        bsonType: 'objectId',
        description: 'Referencia al usuario - requerido'
      },
      restaurante_id: {
        bsonType: 'objectId',
        description: 'Referencia al restaurante - requerido'
      },
      orden_id: {
        bsonType: 'objectId',
        description: 'Referencia a la orden entregada - requerido'
      },
      calificacion: {
        bsonType: 'int',
        minimum: 1,
        maximum: 5,
        description: 'Calificación de 1 a 5'
      },
      comentario: {
        bsonType: 'string',
        maxLength: 1000,
        description: 'Comentario de máximo 1000 caracteres'
      },
      imagenes: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['file_id'],
          properties: {
            file_id: {
              bsonType: 'objectId',
              description: 'Referencia al archivo en GridFS'
            },
            descripcion: {
              bsonType: 'string',
              description: 'Descripción de la imagen'
            }
          }
        },
        description: 'Imágenes almacenadas en GridFS (multikey)'
      },
      fecha_creacion: {
        bsonType: 'date'
      }
    }
  }
};

module.exports = { reviewSchema };

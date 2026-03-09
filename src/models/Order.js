/**
 * Validación JSON Schema para la colección Ordenes.
 * 
 * NOTA IMPORTANTE: Se usa order_id (el _id de la orden) como shard key
 * en lugar de restaurant_id, según indicaciones de la catedrática.
 * Esto permite mejor distribución de escrituras y consultas más
 * eficientes basadas en la orden.
 * 
 * items es un arreglo embebido: cada item pertenece exclusivamente a la orden.
 */
const orderSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['usuario_id', 'restaurante_id', 'items', 'estado', 'total'],
    properties: {
      usuario_id: {
        bsonType: 'objectId',
        description: 'Referencia al usuario que hizo el pedido - requerido'
      },
      restaurante_id: {
        bsonType: 'objectId',
        description: 'Referencia al restaurante - requerido'
      },
      items: {
        bsonType: 'array',
        minItems: 1,
        items: {
          bsonType: 'object',
          required: ['menu_item_id', 'nombre', 'cantidad', 'precio_unitario', 'subtotal'],
          properties: {
            menu_item_id: {
              bsonType: 'objectId',
              description: 'Referencia al artículo del menú'
            },
            nombre: {
              bsonType: 'string',
              description: 'Nombre del artículo (snapshot histórico)'
            },
            cantidad: {
              bsonType: 'int',
              minimum: 1,
              description: 'Cantidad >= 1'
            },
            precio_unitario: {
              bsonType: 'double',
              minimum: 0,
              description: 'Precio unitario al momento de la orden'
            },
            subtotal: {
              bsonType: 'double',
              minimum: 0,
              description: 'cantidad * precio_unitario'
            }
          }
        },
        description: 'Artículos del pedido (embebidos) - mínimo 1'
      },
      estado: {
        bsonType: 'string',
        enum: ['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'],
        description: 'Estado del pedido'
      },
      total: {
        bsonType: 'double',
        minimum: 0,
        description: 'Total del pedido > 0'
      },
      metodo_pago: {
        bsonType: 'string',
        enum: ['efectivo', 'tarjeta', 'transferencia'],
        description: 'Método de pago'
      },
      fecha_creacion: {
        bsonType: 'date'
      },
      fecha_actualizacion: {
        bsonType: 'date'
      }
    }
  }
};

module.exports = { orderSchema };

/**
 * Validación JSON Schema para la colección Usuarios.
 */
const userSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['nombre', 'email', 'password_hash', 'rol'],
    properties: {
      nombre: {
        bsonType: 'string',
        description: 'Nombre del usuario - requerido'
      },
      email: {
        bsonType: 'string',
        description: 'Email único del usuario - requerido'
      },
      password_hash: {
        bsonType: 'string',
        description: 'Hash de la contraseña - requerido'
      },
      direccion_principal: {
        bsonType: 'string'
      },
      telefono: {
        bsonType: 'string'
      },
      rol: {
        bsonType: 'string',
        enum: ['cliente', 'admin'],
        description: 'Rol del usuario: cliente o admin'
      },
      fecha_registro: {
        bsonType: 'date'
      },
      activo: {
        bsonType: 'bool'
      }
    }
  }
};

module.exports = { userSchema };

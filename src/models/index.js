const { restaurantSchema } = require('./Restaurant');
const { userSchema } = require('./User');
const { menuItemSchema } = require('./MenuItem');
const { orderSchema } = require('./Order');
const { reviewSchema } = require('./Review');

const collections = [
  { name: 'Restaurantes', validator: restaurantSchema },
  { name: 'Usuarios', validator: userSchema },
  { name: 'ArticulosMenu', validator: menuItemSchema },
  { name: 'Ordenes', validator: orderSchema },
  { name: 'Resenas', validator: reviewSchema }
];

async function initCollections(db) {
  const existingCollections = await db.listCollections().toArray();
  const existingNames = existingCollections.map(c => c.name);

  for (const col of collections) {
    if (existingNames.includes(col.name)) {
      // Actualizar validación si la colección ya existe
      await db.command({
        collMod: col.name,
        validator: col.validator,
        validationLevel: 'moderate',
        validationAction: 'error'
      });
      console.log(`  Validación actualizada: ${col.name}`);
    } else {
      await db.createCollection(col.name, {
        validator: col.validator,
        validationLevel: 'moderate',
        validationAction: 'error'
      });
      console.log(`  Colección creada: ${col.name}`);
    }
  }
}

module.exports = { initCollections, collections };

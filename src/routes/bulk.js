const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bulkController');

router.post('/articulos', ctrl.bulkWriteArticulos);
router.post('/ordenes', ctrl.bulkWriteOrdenes);
router.post('/restaurantes', ctrl.bulkInsertRestaurantes);

module.exports = router;

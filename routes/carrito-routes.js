const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito-Controller');

// Ruta POST /carrito para agregar productos al carrito
router.post('/', carritoController.addProductoToCarrito);

module.exports = router;

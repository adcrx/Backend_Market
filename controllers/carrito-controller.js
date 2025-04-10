const carritoModel = require('../models/carrito-model');
const usuarioModel = require('../models/usuario-model');
const pool = require('../config/db-config');
const sanitizarCarritoItem = require('../utils/sanitizar-carrito');

const addProductoToCarrito = async (req, res) => {
  try {
    const { usuario_id, producto_id, cantidad } = req.body;

    if (!usuario_id || !producto_id || !cantidad) {
      return res.status(400).json({ error: 'Los campos usuario_id, producto_id y cantidad son requeridos' });
    }

    const usuario = await usuarioModel.getUsuarioById(usuario_id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const producto = await pool.query('SELECT * FROM productos WHERE id = $1', [producto_id]);
    if (producto.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    let carrito = await carritoModel.getCarritoByUsuarioId(usuario_id);
    if (!carrito) {
      carrito = await carritoModel.createCarrito(usuario_id);
    }

    const carritoItem = await carritoModel.addItemToCarrito(carrito.id, producto_id, cantidad);

    res.status(201).json(sanitizarCarritoItem(carritoItem));
  } catch (error) {
    console.error('Error agregando producto al carrito:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = {
  addProductoToCarrito
};

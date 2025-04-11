const pool = require('../config/db-config');
const pedidoModel = require('../models/pedido-model');

const createPedido = async (req, res) => {
  try {
    const { usuario_id, carrito } = req.body;
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const vendedor_id = carrito[0].vendedor_id;

    const nuevoPedido = await pedidoModel.createPedido(usuario_id, total, vendedor_id);

    for (const item of carrito) {
      await pedidoModel.createPedidoItem(nuevoPedido.id, item.producto_id, item.cantidad, item.precio);
    }

    res.status(201).json({ message: 'Pedido creado exitosamente', pedido: nuevoPedido });
  } catch (error) {
    console.error('Error creando el pedido:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const getPedidos = async (req, res) => {
  try {
    const { usuario_id, vendedor_id } = req.query;

    let query = '';
    let queryParams = [];

    if (usuario_id && vendedor_id) {
      query = `
        SELECT pedidos.*, usuarios.nombre AS usuario_nombre, productos.titulo, productos.imagen, pedido_items.cantidad, pedido_items.precio_unitario
        FROM pedidos
        JOIN pedido_items ON pedidos.id = pedido_items.pedido_id
        JOIN productos ON pedido_items.producto_id = productos.id
        JOIN usuarios ON pedidos.usuario_id = usuarios.id
        WHERE pedidos.usuario_id = $1 AND pedidos.vendedor_id = $2
        ORDER BY pedidos.created_at DESC
      `;
      queryParams = [usuario_id, vendedor_id];
    } else if (vendedor_id) {
      query = `
        SELECT pedidos.*, usuarios.nombre AS usuario_nombre, productos.titulo, productos.imagen, pedido_items.cantidad, pedido_items.precio_unitario
        FROM pedidos
        JOIN pedido_items ON pedidos.id = pedido_items.pedido_id
        JOIN productos ON pedido_items.producto_id = productos.id
        JOIN usuarios ON pedidos.usuario_id = usuarios.id
        WHERE pedidos.vendedor_id = $1
        ORDER BY pedidos.created_at DESC
      `;
      queryParams = [vendedor_id];
    } else if (usuario_id) {
      query = `
        SELECT pedidos.*, usuarios.nombre AS usuario_nombre, productos.titulo, productos.imagen, pedido_items.cantidad, pedido_items.precio_unitario
        FROM pedidos
        JOIN pedido_items ON pedidos.id = pedido_items.pedido_id
        JOIN productos ON pedido_items.producto_id = productos.id
        JOIN usuarios ON pedidos.usuario_id = usuarios.id
        WHERE pedidos.usuario_id = $1
        ORDER BY pedidos.created_at DESC
      `;
      queryParams = [usuario_id];
    } else {
      return res.json([]);
    }

    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error obteniendo los pedidos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};



const updateEstadoPedido = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const result = await pool.query(
      'UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const actualizarEstadoPedido = async (req, res) => {
  const { pedido_id, nuevo_estado } = req.body;

  try {
    const result = await pool.query(
      'UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *',
      [nuevo_estado, pedido_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ message: 'Estado actualizado correctamente', pedido: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const getPedidosPorUsuario = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener pedidos del usuario:", err);
    res.status(500).json({ error: 'Error al obtener pedidos del usuario' });
  }
};

module.exports = {
  createPedido,
  getPedidos,
  actualizarEstadoPedido,
  updateEstadoPedido,
  getPedidosPorUsuario
};

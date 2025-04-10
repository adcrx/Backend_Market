const pool = require('../config/db-config');
const pedidoModel = require('../models/pedido-model');
const sanitizarPedido = require('../utils/sanitizar-pedido');

// Crear un nuevo pedido
const createPedido = async (req, res) => {
  try {
    const { usuario_id, carrito } = req.body;
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const vendedor_id = carrito[0].vendedor_id;

    console.log('vendedor_id:', vendedor_id);

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

// Obtener pedidos según usuario_id y/o vendedor_id
const getPedidos = async (req, res) => {
  try {
    const { usuario_id, vendedor_id } = req.query;

    let query;
    let queryParams = [];

    if (usuario_id && vendedor_id) {
      query = `
        SELECT 
          p.id, p.total, p.status, p.created_at, 
          p.vendedor_id, pi.producto_id, pi.cantidad, pi.precio_unitario, 
          pr.titulo, pr.imagen, u.nombre AS usuario_nombre
        FROM pedidos p
        JOIN pedido_items pi ON p.id = pi.pedido_id
        JOIN productos pr ON pi.producto_id = pr.id
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.usuario_id = $1 AND p.vendedor_id = $2
      `;
      queryParams = [usuario_id, vendedor_id];
    } else if (vendedor_id) {
      query = `
        SELECT 
          p.id, p.total, p.status, p.created_at, 
          p.vendedor_id, pi.producto_id, pi.cantidad, pi.precio_unitario, 
          pr.titulo, pr.imagen, u.nombre AS usuario_nombre
        FROM pedidos p
        JOIN pedido_items pi ON p.id = pi.pedido_id
        JOIN productos pr ON pi.producto_id = pr.id
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.vendedor_id = $1
      `;
      queryParams = [vendedor_id];
    } else if (usuario_id) {
      query = `
        SELECT 
          p.id, p.total, p.status, p.created_at, 
          p.vendedor_id, pi.producto_id, pi.cantidad, pi.precio_unitario, 
          pr.titulo, pr.imagen, u.nombre AS usuario_nombre
        FROM pedidos p
        JOIN pedido_items pi ON p.id = pi.pedido_id
        JOIN productos pr ON pi.producto_id = pr.id
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.usuario_id = $1
      `;
      queryParams = [usuario_id];
    }

    const result = await pool.query(query, queryParams);
    const pedidosSanitizados = result.rows.map(sanitizarPedido);

    res.status(200).json(pedidosSanitizados);
  } catch (error) {
    console.error('Error obteniendo los pedidos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Cambiar estado de un pedido
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

    res.json({ status: result.rows[0].status });
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Alternativa para actualizar el estado
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

// Obtener todos los pedidos de un usuario (sin sanitizar porque ya es privado)
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
  getPedidosPorUsuario,
};

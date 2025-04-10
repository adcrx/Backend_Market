function sanitizarPedido(pedido) {
    return {
      id: pedido.id,
      total: pedido.total,
      status: pedido.status,
      created_at: pedido.created_at,
      producto_id: pedido.producto_id,
      cantidad: pedido.cantidad,
      precio_unitario: pedido.precio_unitario,
      titulo: pedido.titulo,
      imagen: pedido.imagen,
      usuario_nombre: pedido.usuario_nombre
    };
  }
  
  module.exports = sanitizarPedido;
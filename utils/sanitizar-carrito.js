function sanitizarCarritoItem(item) {
    return {
      producto_id: item.producto_id,
      cantidad: item.cantidad
    };
  }
  
  module.exports = sanitizarCarritoItem;
  
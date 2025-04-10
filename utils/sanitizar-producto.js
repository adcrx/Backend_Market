function sanitizarProducto(producto) {
    return {
      id: producto.id,
      titulo: producto.titulo,
      descripcion: producto.descripcion,
      precio: producto.precio,
      imagen: producto.imagen,
      rating: producto.rating,
      stock: producto.stock
    };
  }
  
  module.exports = sanitizarProducto;
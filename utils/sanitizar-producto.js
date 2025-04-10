function sanitizarProducto(producto) {
    return {
      id: producto.id,
      titulo: producto.titulo,
      descripcion: producto.descripcion,
      precio: producto.precio,
      imagen: producto.imagen,
      rating: producto.rating,
    };
  }
  
  module.exports = sanitizarProducto;
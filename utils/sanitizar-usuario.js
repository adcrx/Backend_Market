function sanitizarUsuario(usuario) {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      avatar: usuario.avatar
    };
  }
  
  module.exports = sanitizarUsuario;
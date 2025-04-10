function sanitizarUsuario(usuario) {
    return {
      id: usuario.id,
    };
  }
  
  module.exports = sanitizarUsuario;
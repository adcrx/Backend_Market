const usuarioModel = require('../models/usuario-model');
const sanitizarUsuario = require('../utils/sanitizar-usuario');

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioModel.getUsuarios();
    const usuariosSanitizados = usuarios.map(sanitizarUsuario);
    res.json(usuariosSanitizados);
  } catch (error) {
    console.error('Error obteniendo los usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const registerUsuario = async (req, res) => {
  try {
    const { nombre, email, password, direccion, avatar } = req.body;

    if (!nombre || !email || !password || !avatar) {
      return res.status(400).json({
        error: 'Los campos nombre, email, password y avatar son requeridos'
      });
    }

    if (password.length < 3) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 3 caracteres'
      });
    }

    const nuevoUsuario = await usuarioModel.registerUsuario({ nombre, email, password, direccion, avatar });
    res.status(201).json(sanitizarUsuario(nuevoUsuario));
  } catch (error) {
    console.error('Error registrando el usuario:', error);

    if (error.message === 'El correo electrónico ya está registrado') {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Los campos email y password son requeridos'
      });
    }

    const usuario = await usuarioModel.loginUsuario(email, password);

    if (!usuario || !usuario.token || !usuario.user) {
      return res.status(500).json({ error: 'Error al generar el token o los datos del usuario' });
    }

    return res.json({
      token: usuario.token,
      usuario: usuario.user // Se mantiene como está para que el frontend siga funcionando
    });
  } catch (error) {
    console.error('Error en el login:', error);
    if (error.message === 'Usuario no encontrado' || error.message === 'Contraseña incorrecta') {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioModel.getUsuarioById(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(sanitizarUsuario(usuario));
  } catch (error) {
    console.error('Error obteniendo el usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = {
  getUsuarios,
  registerUsuario,
  loginUsuario,
  getUsuarioById
};

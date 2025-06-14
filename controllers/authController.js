const UserModel = require("../models/userModel")

class AuthController {
  // Mostrar página de registro
  static showRegister(req, res) {
    res.sendFile("register.html", { root: "./views" })
  }

  // Mostrar página de login
  static showLogin(req, res) {
    res.sendFile("login.html", { root: "./views" })
  }

  // Procesar registro
  static async register(req, res) {
    try {
      const { cedula, nombre_nino, edad, password, confirm_password } = req.body

      // Validaciones
      if (!cedula || !nombre_nino || !edad || !password || !confirm_password) {
        return res.status(400).json({
          success: false,
          message: "Todos los campos son obligatorios",
        })
      }

      if (password !== confirm_password) {
        return res.status(400).json({
          success: false,
          message: "Las contraseñas no coinciden",
        })
      }

      if (edad < 2 || edad > 4) {
        return res.status(400).json({
          success: false,
          message: "La edad debe estar entre 2 y 4 años",
        })
      }

      // Verificar si el usuario ya existe
      const existingUser = await UserModel.findByCedula(cedula)
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un usuario con esta cédula",
        })
      }

      // Crear usuario
      await UserModel.create({ cedula, nombre_nino, edad, password })

      res.json({
        success: true,
        message: "Usuario registrado exitosamente",
      })
    } catch (error) {
      console.error("Error en registro:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }

  // Procesar login
  static async login(req, res) {
    try {
      const { cedula, password } = req.body

      // Validaciones
      if (!cedula || !password) {
        return res.status(400).json({
          success: false,
          message: "Cédula y contraseña son obligatorios",
        })
      }

      // Buscar usuario
      const user = await UserModel.findByCedula(cedula)
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Cédula o contraseña incorrectos",
        })
      }

      // Verificar contraseña
      const isValidPassword = await UserModel.verifyPassword(password, user.password)
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: "Cédula o contraseña incorrectos",
        })
      }

      // Crear sesión
      req.session.userId = user.id
      req.session.userCedula = user.cedula
      req.session.nombreNino = user.nombre_nino
      req.session.edad = user.edad

      res.json({
        success: true,
        message: "Inicio de sesión exitoso",
      })
    } catch (error) {
      console.error("Error en login:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }

  // Cerrar sesión
  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al cerrar sesión",
        })
      }
      res.json({
        success: true,
        message: "Sesión cerrada exitosamente",
      })
    })
  }

  // Obtener datos del usuario actual
  static getCurrentUser(req, res) {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "No hay sesión activa",
      })
    }

    res.json({
      success: true,
      user: {
        id: req.session.userId,
        cedula: req.session.userCedula,
        nombre_nino: req.session.nombreNino,
        edad: req.session.edad,
      },
    })
  }
}

module.exports = AuthController

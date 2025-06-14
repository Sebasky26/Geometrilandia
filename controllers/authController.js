const UserModel = require("../models/userModel")

class AuthController {
  // Mostrar página de login
  static showLogin(req, res) {
    res.sendFile("login.html", { root: "./views" })
  }

  // Mostrar página de registro
  static showRegister(req, res) {
    res.sendFile("register.html", { root: "./views" })
  }

  // Procesar login
  static async login(req, res) {
    try {
      const { correo, password } = req.body

      // Validaciones básicas
      if (!correo || !password) {
        return res.status(400).json({
          success: false,
          message: "Correo y contraseña son requeridos",
        })
      }

      // Buscar usuario
      const user = await UserModel.findByEmail(correo)
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas",
        })
      }

      // Verificar contraseña
      const isValidPassword = await UserModel.verifyPassword(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas",
        })
      }

      // Crear sesión
      req.session.userId = user.id
      req.session.userName = user.nombre
      req.session.userEmail = user.correo

      res.json({
        success: true,
        message: "Login exitoso",
        user: {
          id: user.id,
          nombre: user.nombre,
          correo: user.correo,
        },
      })
    } catch (error) {
      console.error("Error en login:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }

  // Procesar registro
  static async register(req, res) {
    try {
      const { nombre, correo, password, confirmPassword } = req.body

      // Validaciones
      if (!nombre || !correo || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Todos los campos son requeridos",
        })
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Las contraseñas no coinciden",
        })
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres",
        })
      }

      // Verificar si el correo ya existe
      const existingUser = await UserModel.findByEmail(correo)
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "El correo ya está registrado",
        })
      }

      // Crear usuario
      const newUser = await UserModel.create({ nombre, correo, password })

      // Crear sesión automáticamente
      req.session.userId = newUser.id
      req.session.userName = newUser.nombre
      req.session.userEmail = newUser.correo

      res.json({
        success: true,
        message: "Usuario registrado exitosamente",
        user: newUser,
      })
    } catch (error) {
      console.error("Error en registro:", error)
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
        console.error("Error cerrando sesión:", err)
        return res.status(500).json({
          success: false,
          message: "Error cerrando sesión",
        })
      }

      res.json({
        success: true,
        message: "Sesión cerrada exitosamente",
      })
    })
  }

  // Verificar autenticación
  static checkAuth(req, res) {
    if (req.session.userId) {
      res.json({
        success: true,
        authenticated: true,
        user: {
          id: req.session.userId,
          nombre: req.session.userName,
          correo: req.session.userEmail,
        },
      })
    } else {
      res.json({
        success: true,
        authenticated: false,
      })
    }
  }
}

module.exports = AuthController

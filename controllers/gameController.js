const FiguraModel = require("../models/figuraModel")
const UserModel = require("../models/ninoModel")

class GameController {
  // Mostrar dashboard
  static showDashboard(req, res) {
    res.sendFile("dashboard.html", { root: "./views" })
  }

  // Mostrar modo libre
  static showModoLibre(req, res) {
    res.sendFile("modoLibre.html", { root: "./views" })
  }

  // Mostrar modo guiado
  static showModoGuiado(req, res) {
    res.sendFile("modoGuiado.html", { root: "./views" })
  }

  // Mostrar modo desafío
  static showModoDesafio(req, res) {
    res.sendFile("modoDesafio.html", { root: "./views" })
  }

  // Obtener todas las figuras
  static async getFiguras(req, res) {
    try {
      const figuras = await FiguraModel.getAll()
      res.json({
        success: true,
        figuras: figuras,
      })
    } catch (error) {
      console.error("Error obteniendo figuras:", error)
      res.status(500).json({
        success: false,
        message: "Error obteniendo figuras",
      })
    }
  }

  // Procesar lectura RFID
  static async processRFID(req, res) {
    try {
      const { codigo_rfid, modo, figura_esperada } = req.body
      const userId = req.session.ninoId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "No hay sesión activa",
        })
      }

      // Buscar figura por código RFID
      const figura = await FiguraModel.findByRFID(codigo_rfid)
      if (!figura) {
        return res.status(404).json({
          success: false,
          message: "Figura no encontrada",
        })
      }

      let resultado = "correcto"
      let mensaje = `¡Es un ${figura.nombre}!`

      // En modo guiado y desafío, verificar si es la figura correcta
      if ((modo === "guiado" || modo === "desafio") && figura_esperada) {
        if (figura.nombre !== figura_esperada) {
          resultado = "incorrecto"
          mensaje = `No es correcto. Es un ${figura.nombre}`
        }
      }

      // Registrar interacción
      await FiguraModel.registrarInteraccion(userId, figura.id, modo, resultado)

      res.json({
        success: true,
        figura: figura,
        resultado: resultado,
        mensaje: mensaje,
      })
    } catch (error) {
      console.error("Error procesando RFID:", error)
      res.status(500).json({
        success: false,
        message: "Error procesando lectura RFID",
      })
    }
  }

  // Obtener figura aleatoria para modo guiado
  static async getFiguraAleatoria(req, res) {
    try {
      const figura = await FiguraModel.getRandomFigura()
      res.json({
        success: true,
        figura: figura,
      })
    } catch (error) {
      console.error("Error obteniendo figura aleatoria:", error)
      res.status(500).json({
        success: false,
        message: "Error obteniendo figura",
      })
    }
  }

  // Obtener estadísticas del usuario
  static async getStats(req, res) {
    try {
      const userId = req.session.ninoId
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "No hay sesión activa",
        })
      }

      const stats = await UserModel.getStats(userId)
      res.json({
        success: true,
        stats: stats,
      })
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error)
      res.status(500).json({
        success: false,
        message: "Error obteniendo estadísticas",
      })
    }
  }
}

module.exports = GameController

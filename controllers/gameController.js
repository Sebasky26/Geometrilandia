const FiguraModel = require("../models/figuraModel")
const UserModel = require("../models/userModel")

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
        figuras,
      })
    } catch (error) {
      console.error("Error obteniendo figuras:", error)
      res.status(500).json({
        success: false,
        message: "Error obteniendo figuras",
      })
    }
  }

  // Procesar lectura RFID en modo libre
  static async procesarModoLibre(req, res) {
    try {
      const { codigoRfid } = req.body
      const userId = req.session.userId

      if (!codigoRfid) {
        return res.status(400).json({
          success: false,
          message: "Código RFID requerido",
        })
      }

      const figura = await FiguraModel.findByRFID(codigoRfid)
      if (!figura) {
        return res.status(404).json({
          success: false,
          message: "Figura no encontrada",
        })
      }

      // Registrar interacción como acierto (modo libre siempre es positivo)
      await FiguraModel.registrarInteraccion(userId, figura.id, "libre", "acierto")

      res.json({
        success: true,
        figura: {
          nombre: figura.nombre,
          descripcion: figura.descripcion,
          color: figura.color,
        },
        mensaje: `¡Excelente! Es un ${figura.nombre}. ${figura.descripcion}`,
      })
    } catch (error) {
      console.error("Error en modo libre:", error)
      res.status(500).json({
        success: false,
        message: "Error procesando modo libre",
      })
    }
  }

  // Obtener figura objetivo para modo guiado
  static async getFiguraObjetivo(req, res) {
    try {
      const figura = await FiguraModel.getRandom()

      // Guardar en sesión para verificar después
      req.session.figuraObjetivo = figura

      res.json({
        success: true,
        figura: {
          nombre: figura.nombre,
          descripcion: figura.descripcion,
          color: figura.color,
        },
        instruccion: `Encuentra y coloca el ${figura.nombre}`,
      })
    } catch (error) {
      console.error("Error obteniendo figura objetivo:", error)
      res.status(500).json({
        success: false,
        message: "Error obteniendo figura objetivo",
      })
    }
  }

  // Procesar respuesta en modo guiado
  static async procesarModoGuiado(req, res) {
    try {
      const { codigoRfid } = req.body
      const userId = req.session.userId
      const figuraObjetivo = req.session.figuraObjetivo

      if (!figuraObjetivo) {
        return res.status(400).json({
          success: false,
          message: "No hay figura objetivo activa",
        })
      }

      const figuraLeida = await FiguraModel.findByRFID(codigoRfid)
      if (!figuraLeida) {
        return res.status(404).json({
          success: false,
          message: "Figura no encontrada",
        })
      }

      const esCorrecta = figuraLeida.id === figuraObjetivo.id
      const resultado = esCorrecta ? "acierto" : "error"

      // Registrar interacción
      await FiguraModel.registrarInteraccion(userId, figuraLeida.id, "guiado", resultado)

      let mensaje
      if (esCorrecta) {
        mensaje = `¡Perfecto! Encontraste el ${figuraObjetivo.nombre}. ¡Muy bien hecho!`
        // Limpiar figura objetivo de la sesión
        req.session.figuraObjetivo = null
      } else {
        mensaje = `Esa es un ${figuraLeida.nombre}. Intenta encontrar el ${figuraObjetivo.nombre}.`
      }

      res.json({
        success: true,
        correcto: esCorrecta,
        figuraLeida: figuraLeida.nombre,
        figuraObjetivo: figuraObjetivo.nombre,
        mensaje,
        completado: esCorrecta,
      })
    } catch (error) {
      console.error("Error en modo guiado:", error)
      res.status(500).json({
        success: false,
        message: "Error procesando modo guiado",
      })
    }
  }

  // Iniciar desafío (secuencia de figuras)
  static async iniciarDesafio(req, res) {
    try {
      const figuras = await FiguraModel.getAll()

      // Crear secuencia aleatoria de 3 figuras
      const secuencia = []
      for (let i = 0; i < 3; i++) {
        const figuraAleatoria = figuras[Math.floor(Math.random() * figuras.length)]
        secuencia.push(figuraAleatoria)
      }

      // Guardar en sesión
      req.session.desafioSecuencia = secuencia
      req.session.desafioIndice = 0

      res.json({
        success: true,
        secuencia: secuencia.map((f) => ({
          nombre: f.nombre,
          color: f.color,
        })),
        figuraActual: {
          nombre: secuencia[0].nombre,
          color: secuencia[0].color,
        },
        instruccion: `Desafío iniciado. Encuentra el ${secuencia[0].nombre}`,
        progreso: {
          actual: 1,
          total: 3,
        },
      })
    } catch (error) {
      console.error("Error iniciando desafío:", error)
      res.status(500).json({
        success: false,
        message: "Error iniciando desafío",
      })
    }
  }

  // Procesar respuesta en modo desafío
  static async procesarModoDesafio(req, res) {
    try {
      const { codigoRfid } = req.body
      const userId = req.session.userId
      const secuencia = req.session.desafioSecuencia
      const indiceActual = req.session.desafioIndice || 0

      if (!secuencia || indiceActual >= secuencia.length) {
        return res.status(400).json({
          success: false,
          message: "No hay desafío activo",
        })
      }

      const figuraEsperada = secuencia[indiceActual]
      const figuraLeida = await FiguraModel.findByRFID(codigoRfid)

      if (!figuraLeida) {
        return res.status(404).json({
          success: false,
          message: "Figura no encontrada",
        })
      }

      const esCorrecta = figuraLeida.id === figuraEsperada.id
      const resultado = esCorrecta ? "acierto" : "error"

      // Registrar interacción
      await FiguraModel.registrarInteraccion(userId, figuraLeida.id, "desafio", resultado)

      const respuesta = {
        success: true,
        correcto: esCorrecta,
        figuraLeida: figuraLeida.nombre,
        figuraEsperada: figuraEsperada.nombre,
      }

      if (esCorrecta) {
        const nuevoIndice = indiceActual + 1
        req.session.desafioIndice = nuevoIndice

        if (nuevoIndice >= secuencia.length) {
          // Desafío completado
          respuesta.completado = true
          respuesta.mensaje = "¡Felicitaciones! Completaste todo el desafío correctamente."

          // Limpiar sesión
          req.session.desafioSecuencia = null
          req.session.desafioIndice = null
        } else {
          // Continuar con siguiente figura
          const siguienteFigura = secuencia[nuevoIndice]
          respuesta.completado = false
          respuesta.mensaje = `¡Correcto! Ahora encuentra el ${siguienteFigura.nombre}`
          respuesta.siguienteFigura = {
            nombre: siguienteFigura.nombre,
            color: siguienteFigura.color,
          }
          respuesta.progreso = {
            actual: nuevoIndice + 1,
            total: secuencia.length,
          }
        }
      } else {
        respuesta.mensaje = `Esa es un ${figuraLeida.nombre}. Busca el ${figuraEsperada.nombre}`
        respuesta.progreso = {
          actual: indiceActual + 1,
          total: secuencia.length,
        }
      }

      res.json(respuesta)
    } catch (error) {
      console.error("Error en modo desafío:", error)
      res.status(500).json({
        success: false,
        message: "Error procesando modo desafío",
      })
    }
  }

  // Obtener estadísticas del usuario
  static async getEstadisticas(req, res) {
    try {
      const userId = req.session.userId
      const stats = await UserModel.getUserStats(userId)

      // Procesar estadísticas
      const estadisticas = {
        resumen: {
          totalInteracciones: 0,
          totalAciertos: 0,
          totalErrores: 0,
          porcentajeAcierto: 0,
        },
        porModo: {},
        porFigura: {},
      }

      stats.forEach((stat) => {
        // Resumen general
        estadisticas.resumen.totalInteracciones += stat.total_interacciones
        estadisticas.resumen.totalAciertos += stat.aciertos
        estadisticas.resumen.totalErrores += stat.errores

        // Por modo
        if (!estadisticas.porModo[stat.modo]) {
          estadisticas.porModo[stat.modo] = {
            interacciones: 0,
            aciertos: 0,
            errores: 0,
          }
        }
        estadisticas.porModo[stat.modo].interacciones += stat.total_interacciones
        estadisticas.porModo[stat.modo].aciertos += stat.aciertos
        estadisticas.porModo[stat.modo].errores += stat.errores

        // Por figura
        if (!estadisticas.porFigura[stat.figura_nombre]) {
          estadisticas.porFigura[stat.figura_nombre] = {
            interacciones: 0,
            aciertos: 0,
            errores: 0,
          }
        }
        estadisticas.porFigura[stat.figura_nombre].interacciones += stat.total_interacciones
        estadisticas.porFigura[stat.figura_nombre].aciertos += stat.aciertos
        estadisticas.porFigura[stat.figura_nombre].errores += stat.errores
      })

      // Calcular porcentaje de acierto general
      if (estadisticas.resumen.totalInteracciones > 0) {
        estadisticas.resumen.porcentajeAcierto = Math.round(
          (estadisticas.resumen.totalAciertos / estadisticas.resumen.totalInteracciones) * 100,
        )
      }

      res.json({
        success: true,
        estadisticas,
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

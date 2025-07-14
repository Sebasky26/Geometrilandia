const FiguraModel = require("../models/figuraModel");
const UserModel = require("../models/ninoModel");
const InteraccionModel = require("../models/interaccionModel");


class GameController {
  // Mostrar dashboard
  static showDashboard(req, res) {
    res.sendFile("dashboard.html", { root: "./views" });
  }

  // Mostrar modo libre
  static showModoLibre(req, res) {
    res.sendFile("modoLibre.html", { root: "./views" });
  }

  // Mostrar modo guiado
  static showModoGuiado(req, res) {
    res.sendFile("modoGuiado.html", { root: "./views" });
  }

  // Mostrar modo desafío
  static showModoDesafio(req, res) {
    res.sendFile("modoDesafio.html", { root: "./views" });
  }

  // Obtener todas las figuras
  static async getFiguras(req, res) {
    try {
      const figuras = await FiguraModel.getAll();
      res.json({
        success: true,
        figuras: figuras,
      });
    } catch (error) {
      console.error("Error obteniendo figuras:", error);
      res.status(500).json({
        success: false,
        message: "Error obteniendo figuras",
      });
    }
  }

  // Procesar lectura RFID
  static async processRFID(req, res) {
    try {
      const { codigo_rfid, modo, figura_esperada } = req.body;
      const userId = req.session.ninoId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "No hay sesión activa",
        });
      }

      // Buscar figura por código RFID
      const figura = await FiguraModel.findByRFID(codigo_rfid);
      if (!figura) {
        return res.status(404).json({
          success: false,
          message: "Figura no encontrada",
        });
      }

      let resultado = "correcto";
      let mensaje = `¡Es un ${figura.nombre}!`;
      let gameStatus = "continuar";

      // En modo guiado y desafío, verificar si es la figura correcta
      if ((modo === "guiado" || modo === "desafio") && figura_esperada) {
        if (figura.nombre !== figura_esperada) {
          resultado = "incorrecto";
          mensaje = `No es correcto. Es un ${figura.nombre}`;

          // En modo desafío, manejar vidas
          if (modo === "desafio") {
            const nuevasVidas = vidas_restantes - 1;
            if (nuevasVidas <= 0) {
              gameStatus = "game_over";
              mensaje = `Juego terminado. Era un ${figura.nombre}`;
            }
          }
        } else {
          // Respuesta correcta en modo desafío
          if (modo === "desafio") {
            const nuevosAciertos = aciertos_actuales + 1;
            if (nuevosAciertos >= 5) {
              gameStatus = "victoria";
              mensaje = `¡Felicidades! Has completado el desafío!`;
            }
          }
        }
      }

      // Registrar interacción
      await InteraccionModel.insertarInteraccion({
        nino_id: userId,
        figura_id: figura.id,
        modo_id: getModoId(modo),  // Función para convertir string a ID
        resultado: resultado,
        aciertos_total: await UserModel.getAciertosTotales(userId),
        errores_total: await UserModel.getErroresTotales(userId),
        tiempo_promedio_por_figura: await UserModel.getTiempoPromedio(userId),
        sesiones_totales: await UserModel.getSesionesTotales(userId),
        rendimiento_ultima_sesion: await UserModel.getRendimientoUltimaSesion(userId),
        progreso_general: await UserModel.getProgresoGeneral(userId)
      });


      // Respuesta completa para el modo desafío
      const response = {
        success: true,
        figura: figura,
        resultado: resultado,
        mensaje: mensaje,
        gameStatus: gameStatus,
      };

      // Agregar datos específicos del modo desafío
      if (modo === "desafio") {
        response.desafioData = {
          vidas_restantes:
            resultado === "incorrecto"
              ? Math.max(0, vidas_restantes - 1)
              : vidas_restantes,
          aciertos_actuales:
            resultado === "correcto"
              ? aciertos_actuales + 1
              : aciertos_actuales,
          juego_terminado: gameStatus !== "continuar",
        };
      }

      res.json(response);
    } catch (error) {
      console.error("Error procesando RFID:", error);
      res.status(500).json({
        success: false,
        message: "Error procesando lectura RFID",
      });
    }
  }

  // Obtener figura aleatoria para modo guiado y desafío
  static async getFiguraAleatoria(req, res) {
    try {
      const figura = await FiguraModel.getRandomFigura();
      res.json({
        success: true,
        figura: figura,
      });
    } catch (error) {
      console.error("Error obteniendo figura aleatoria:", error);
      res.status(500).json({
        success: false,
        message: "Error obteniendo figura",
      });
    }
  }

  // Iniciar sesión de desafío
  static async iniciarDesafio(req, res) {
    try {
      const userId = req.session.ninoId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "No hay sesión activa",
        });
      }

      // Obtener primera figura aleatoria
      const figura = await FiguraModel.getRandomFigura();

      res.json({
        success: true,
        figura: figura,
        vidas: 3,
        aciertos: 0,
        mensaje: "Desafío iniciado. ¡Encuentra las figuras!",
      });
    } catch (error) {
      console.error("Error iniciando desafío:", error);
      res.status(500).json({
        success: false,
        message: "Error iniciando desafío",
      });
    }
  }

  // Guardar resultado del desafío
  static async guardarResultadoDesafio(req, res) {
    try {
      const { aciertos, tiempo_jugado, completado } = req.body;
      const userId = req.session.ninoId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "No hay sesión activa",
        });
      }

      // Guardar estadísticas del desafío
      await UserModel.guardarEstadisticasDesafio(userId, {
        aciertos,
        tiempo_jugado,
        completado,
        fecha: new Date(),
      });

      res.json({
        success: true,
        message: "Resultado guardado correctamente",
      });
    } catch (error) {
      console.error("Error guardando resultado del desafío:", error);
      res.status(500).json({
        success: false,
        message: "Error guardando resultado",
      });
    }
  }

  // Obtener estadísticas del usuario
  static async getStats(req, res) {
    try {
      const userId = req.session.ninoId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "No hay sesión activa",
        });
      }

      const stats = await UserModel.getStats(userId);
      res.json({
        success: true,
        stats: stats,
      });
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      res.status(500).json({
        success: false,
        message: "Error obteniendo estadísticas",
      });
    }
  }

  // Obtener ranking de desafíos
  static async getRankingDesafios(req, res) {
    try {
      const ranking = await UserModel.getRankingDesafios();
      res.json({
        success: true,
        ranking: ranking,
      });
    } catch (error) {
      console.error("Error obteniendo ranking:", error);
      res.status(500).json({
        success: false,
        message: "Error obteniendo ranking",
      });
    }
  }
}

// Utilidad para traducir nombre de modo a ID
function getModoId(nombreModo) {
  const modos = {
    libre: 1,
    guiado: 2,
    desafio: 3,
    inteligente: 4
  };
  return modos[nombreModo.toLowerCase()] || null;
}


module.exports = GameController;

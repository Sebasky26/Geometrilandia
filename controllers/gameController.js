const FiguraModel = require("../models/figuraModel");
const NinoModel = require("../models/ninoModel");
const InteraccionModel = require("../models/interaccionModel");

class GameController {
  static showDashboard(req, res) {
    res.sendFile("dashboard.html", { root: "./views" });
  }

  static showModoLibre(req, res) {
    res.sendFile("modoLibre.html", { root: "./views" });
  }

  static showModoGuiado(req, res) {
    res.sendFile("modoGuiado.html", { root: "./views" });
  }

  static showModoDesafio(req, res) {
    res.sendFile("modoDesafio.html", { root: "./views" });
  }

  static async getFiguras(req, res) {
    try {
      const figuras = await FiguraModel.getAll();
      res.json({ success: true, figuras });
    } catch (error) {
      console.error("Error obteniendo figuras:", error);
      res.status(500).json({ success: false, message: "Error obteniendo figuras" });
    }
  }

  static async processRFID(req, res) {
    try {
      const { codigo_rfid, modo, figura_esperada } = req.body;

      const ninoId = req.session.ninoId;
      if (!ninoId) {
        return res.status(401).json({ success: false, message: "No hay sesión activa" });
      }

      const figura = await FiguraModel.findByRFID(codigo_rfid);
      if (!figura) {
        return res.status(404).json({ success: false, message: "Figura no encontrada" });
      }

      // Calcular tiempo desde la última interacción (en segundos)
      const ahora = Date.now();
      const tiempoFigura = req.session.ultimaInteraccion
        ? Math.round((ahora - req.session.ultimaInteraccion) / 1000)
        : 0;

      req.session.ultimaInteraccion = ahora;

      // Guardar tiempos por figura (solo para promedio si se requiere)
      req.session.tiemposPorFigura = req.session.tiemposPorFigura || [];
      if (tiempoFigura > 0) {
        req.session.tiemposPorFigura.push(tiempoFigura);
      }

      // Acumular tiempo total jugado en sesión
      req.session.tiempo_total = (req.session.tiempo_total || 0) + tiempoFigura;

      // Calcular promedio (si se desea usarlo más adelante)
      const tiempoPromedio = req.session.tiemposPorFigura.length > 0
        ? Math.round(req.session.tiemposPorFigura.reduce((a, b) => a + b, 0) / req.session.tiemposPorFigura.length)
        : 0;

      // Inicializar contadores
      req.session.aciertos = req.session.aciertos || 0;
      req.session.errores = req.session.errores || 0;

      let resultado = "correcto";
      let mensaje = `¡Es un ${figura.nombre}!`;
      let gameStatus = "continuar";

      if ((modo === "guiado" || modo === "desafio") && figura_esperada) {
        if (figura.nombre !== figura_esperada) {
          resultado = "incorrecto";
          mensaje = `No es correcto. Es un ${figura.nombre}`;
          req.session.errores++;

          if (modo === "desafio") {
            req.session.vidas_restantes = (req.session.vidas_restantes || 3) - 1;
            if (req.session.vidas_restantes <= 0) {
              gameStatus = "game_over";
              mensaje = `Juego terminado. Era un ${figura.nombre}`;
            }
          }
        } else {
          req.session.aciertos++;

          if (modo === "desafio") {
            req.session.aciertos_actuales = (req.session.aciertos_actuales || 0) + 1;
            if (req.session.aciertos_actuales >= 5) {
              gameStatus = "victoria";
              mensaje = "¡Felicidades! Has completado el desafío!";
            }
          }
        }
      } else {
        req.session.aciertos++;
      }

      const sesiones_totales = await NinoModel.getSesionesTotales(ninoId);
      const progreso_general = await NinoModel.getProgresoGeneral(ninoId);
      const rendimiento_ultima_sesion = calcularRendimiento(req.session.aciertos, req.session.errores);

      await InteraccionModel.insertarInteraccion({
        nino_id: ninoId,
        figura_id: figura.id,
        modo_id: getModoId(modo),
        resultado,
        aciertos_total: req.session.aciertos,
        errores_total: req.session.errores,
        tiempo_promedio_por_figura: tiempoPromedio,
        sesiones_totales,
        rendimiento_ultima_sesion,
        progreso_general
      });

      const response = {
        success: true,
        figura,
        resultado,
        mensaje,
        gameStatus
      };

      if (modo === "desafio") {
        response.desafioData = {
          vidas_restantes: req.session.vidas_restantes || 3,
          aciertos_actuales: req.session.aciertos_actuales || 0,
          juego_terminado: gameStatus !== "continuar"
        };
      }

      res.json(response);
    } catch (error) {
      console.error("Error procesando RFID:", error);
      res.status(500).json({ success: false, message: "Error procesando lectura RFID" });
    }
  }

  static async getFiguraAleatoria(req, res) {
    try {
      const figura = await FiguraModel.getRandomFigura();
      res.json({ success: true, figura });
    } catch (error) {
      console.error("Error obteniendo figura aleatoria:", error);
      res.status(500).json({ success: false, message: "Error obteniendo figura" });
    }
  }

  static async getStats(req, res) {
    try {
      const userId = req.session.ninoId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "No hay sesión activa" });
      }

      const resumen = await NinoModel.getResumenSesiones(userId);

      // Agregar el tiempo total jugado de la sesión actual, si existe
      if (req.session.tiempo_total) {
        resumen.tiempo_total = (resumen.tiempo_total || 0) + req.session.tiempo_total;
      }

      res.json({ success: true, resumen_sesiones: resumen });
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      res.status(500).json({ success: false, message: "Error obteniendo estadísticas" });
    }
  }
}

// Traduce nombre de modo a ID
function getModoId(nombreModo) {
  const modos = {
    libre: 1,
    guiado: 2,
    desafio: 3,
    inteligente: 4
  };
  return modos[nombreModo.toLowerCase()] || null;
}

// Calcula el porcentaje de aciertos
function calcularRendimiento(aciertos, errores) {
  const total = aciertos + errores;
  return total > 0 ? Math.round((aciertos / total) * 100) : 0;
}

module.exports = GameController;

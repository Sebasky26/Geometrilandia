const NinoModel = require("../models/ninoModel");
const connection = require("../config/db");
const fetch = require("node-fetch");

class InteligenciaController {
  static async obtenerModoInteligente(req, res) {
    const ninoId = req.session.ninoId;

    if (!ninoId) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    try {
      // Obtener datos del niño
      const nino = await NinoModel.findById(ninoId);
      if (!nino) {
        return res.status(404).json({ success: false, message: "Niño no encontrado" });
      }

      // Calcular estadísticas reales del niño
      const [
        aciertos_total,
        errores_total,
        tiempo_promedio_por_figura,
        sesiones_totales,
        rendimiento_ultima_sesion,
        progreso_general
      ] = await Promise.all([
        NinoModel.getAciertosTotales(ninoId),
        NinoModel.getErroresTotales(ninoId),
        NinoModel.getTiempoPromedio(ninoId),
        NinoModel.getSesionesTotales(ninoId),
        NinoModel.getRendimientoUltimaSesion(ninoId),
        NinoModel.getProgresoGeneral(ninoId)
      ]);

      // Consultar el último modo usado
      const [ultimoModo] = await connection.promise().query(`
        SELECT mj.nombre 
        FROM interacciones i
        JOIN modos_juego mj ON i.modo_id = mj.id
        WHERE i.nino_id = ?
        ORDER BY i.timestamp DESC
        LIMIT 1
      `, [ninoId]);

      const modo_usado_ultima_sesion = ultimoModo[0]?.nombre || "Libre";

      // Preparar payload para la IA
      const payload = {
        edad: nino.edad,
        aciertos_total,
        errores_total,
        tiempo_promedio_por_figura: Math.round(tiempo_promedio_por_figura),
        sesiones_totales,
        modo_usado_ultima_sesion,
        rendimiento_ultima_sesion,
        progreso_general
      };

      // Solicitar predicción al modelo IA
      const response = await fetch("http://localhost:5000/predecir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error al conectarse con el modelo IA");
      }

      const resultado = await response.json();
      const modo_sugerido = resultado.modo_sugerido;

      // Verificar que el modo exista
      const [modoRow] = await connection.promise().query(
        `SELECT id FROM modos_juego WHERE nombre = ?`,
        [modo_sugerido]
      );

      if (!modoRow.length) {
        return res.status(404).json({ success: false, message: "Modo sugerido no encontrado" });
      }

      // 🎯 Devolver solo el nombre del modo sugerido
      return res.json({ success: true, modo: modo_sugerido });

    } catch (err) {
      console.error("❌ Error en modo inteligente:", err.message);
      return res.status(500).json({ success: false, message: "Error al predecir el modo" });
    }
  }
}

module.exports = InteligenciaController;

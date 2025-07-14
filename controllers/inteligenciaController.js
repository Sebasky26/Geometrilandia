const NinoModel = require("../models/ninoModel");
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

      // Calcular estadísticas
      const [aciertos_total, errores_total, tiempo_promedio_por_figura, sesiones_totales, rendimiento_ultima_sesion, progreso_general] =
        await Promise.all([
          NinoModel.getAciertosTotales(ninoId),
          NinoModel.getErroresTotales(ninoId),
          NinoModel.getTiempoPromedio(ninoId),
          NinoModel.getSesionesTotales(ninoId),
          NinoModel.getRendimientoUltimaSesion(ninoId),
          NinoModel.getProgresoGeneral(ninoId),
        ]);

      // ⚠️ Ajustar manualmente el último modo usado (puedes cambiar esto)
      const modo_usado_ultima_sesion = "Guiado"; // ⚠️ Temporalmente fijo, luego puedes consultarlo de la BD

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

      // Llamar al modelo Flask
      const response = await fetch("http://localhost:5000/predecir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resultado = await response.json();

      if (!resultado.success) {
        throw new Error(resultado.error || "Error del modelo");
      }

      res.json({ success: true, modo: resultado.modo_sugerido });

    } catch (err) {
      console.error("❌ Error en modo inteligente:", err.message);
      res.status(500).json({ success: false, message: "Error al predecir el modo" });
    }
  }
}

module.exports = InteligenciaController;

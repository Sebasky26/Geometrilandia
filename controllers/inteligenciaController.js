const NinoModel = require("../models/ninoModel");
const fetch = require("node-fetch");

class InteligenciaController {
  static async obtenerModoInteligente(req, res) {
    const ninoId = req.session.ninoId;

    if (!ninoId) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    try {
      const [aciertos, errores, tiempo, sesiones, rendimiento, progreso] =
        await Promise.all([
          NinoModel.getAciertosTotales(ninoId),
          NinoModel.getErroresTotales(ninoId),
          NinoModel.getTiempoPromedio(ninoId),
          NinoModel.getSesionesTotales(ninoId),
          NinoModel.getRendimientoUltimaSesion(ninoId),
          NinoModel.getProgresoGeneral(ninoId),
        ]);

      const payload = {
        aciertos,
        errores,
        tiempo_promedio: Math.round(tiempo),
        sesiones,
        rendimiento,
        progreso,
      };

      const response = await fetch("http://localhost:5000/predecir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resultado = await response.json();
      res.json({ success: true, modo: resultado.modo });

    } catch (err) {
      console.error("Error en modo inteligente:", err);
      res.status(500).json({ success: false, message: "Error al predecir el modo" });
    }
  }
}

module.exports = InteligenciaController;

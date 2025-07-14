// models/interaccionModel.js
const db = require("../config/db");

const InteraccionModel = {
  insertarInteraccion: async (interaccion) => {
    const {
      nino_id,
      figura_id,
      modo_id,
      resultado,
      aciertos_total = 0,
      errores_total = 0,
      tiempo_promedio_por_figura = 0,
      sesiones_totales = 0,
      rendimiento_ultima_sesion = 0,
      progreso_general = 0
    } = interaccion;

    // ❗ Validación básica: no insertar si falta info clave
    if (!nino_id || !modo_id || !resultado) {
      console.warn("⚠️ Interacción omitida por datos faltantes:", interaccion);
      return null;
    }

    const campos = [
      "nino_id",
      "modo_id",
      "resultado",
      "aciertos_total",
      "errores_total",
      "tiempo_promedio_por_figura",
      "sesiones_totales",
      "rendimiento_ultima_sesion",
      "progreso_general"
    ];

    const valores = [
      nino_id,
      modo_id,
      resultado,
      aciertos_total,
      errores_total,
      tiempo_promedio_por_figura,
      sesiones_totales,
      rendimiento_ultima_sesion,
      progreso_general
    ];

    // 👉 Solo agregar figura_id si está definido y no es null
    if (figura_id !== undefined && figura_id !== null) {
      campos.splice(1, 0, "figura_id");      // insertarlo después de nino_id
      valores.splice(1, 0, figura_id);
    }

    const placeholders = campos.map(() => "?").join(", ");
    const sql = `INSERT INTO interacciones (${campos.join(", ")}) VALUES (${placeholders})`;

    try {
      const [results] = await db.promise().query(sql, valores);
      return results;
    } catch (error) {
      console.error("❌ Error al insertar interacción en la BD:", error);
      throw error;
    }
  },

  getResumenPorSesion: async (ninoId) => {
    const sql = `
      SELECT 
        DATE(timestamp) AS fecha,
        COUNT(*) AS total_interacciones,
        SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END) AS aciertos,
        SUM(CASE WHEN resultado = 'incorrecto' THEN 1 ELSE 0 END) AS errores,
        ROUND(AVG(tiempo_promedio_por_figura), 2) AS tiempo_promedio,
        ROUND(AVG(rendimiento_ultima_sesion), 2) AS rendimiento_promedio
      FROM interacciones
      WHERE nino_id = ?
      GROUP BY fecha
      ORDER BY fecha DESC
      LIMIT 5
    `;
    try {
      const [rows] = await db.promise().query(sql, [ninoId]);
      return rows;
    } catch (error) {
      console.error("❌ Error al obtener resumen de sesiones:", error);
      throw error;
    }
  }
};

module.exports = InteraccionModel;

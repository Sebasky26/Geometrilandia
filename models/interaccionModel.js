// models/interaccionModel.js
const db = require("../config/db");

const InteraccionModel = {
  insertarInteraccion: async (interaccion) => {
    const sql = `
      INSERT INTO interacciones (
        nino_id,
        figura_id,
        modo_id,
        resultado,
        aciertos_total,
        errores_total,
        tiempo_promedio_por_figura,
        sesiones_totales,
        rendimiento_ultima_sesion,
        progreso_general
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      interaccion.nino_id,
      interaccion.figura_id,
      interaccion.modo_id,
      interaccion.resultado,
      interaccion.aciertos_total,
      interaccion.errores_total,
      interaccion.tiempo_promedio_por_figura,
      interaccion.sesiones_totales,
      interaccion.rendimiento_ultima_sesion,
      interaccion.progreso_general
    ];

    try {
      const [results] = await db.promise().query(sql, values);
      return results;
    } catch (error) {
      throw error;
    }
  },

  // Opcional: método para estadísticas por sesión
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
      throw error;
    }
  }
};

module.exports = InteraccionModel;

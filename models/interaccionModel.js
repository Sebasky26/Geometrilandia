// models/interaccionModel.js
const db = require("../config/db");

const InteraccionModel = {
  insertarInteraccion: (interaccion, callback) => {
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

    db.query(sql, values, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  }
};

module.exports = InteraccionModel;

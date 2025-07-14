const db = require("../config/db");

class FiguraModel {
  // Obtener todas las figuras
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM figuras ORDER BY nombre";
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // Buscar figura por código RFID
  static findByRFID(codigo_rfid) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM figuras WHERE codigo_rfid = ?";
      db.query(query, [codigo_rfid], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  // Obtener figura aleatoria
  static getRandomFigura() {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM figuras ORDER BY RAND() LIMIT 1";
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  // Registrar interacción (requiere buscar el ID del modo por su nombre)
  static registrarInteraccion(ninoId, figuraId, modoNombre, resultado) {
    return new Promise((resolve, reject) => {
      const getModoIdQuery = "SELECT id FROM modos_juego WHERE nombre = ?";
      db.query(getModoIdQuery, [modoNombre], (err, modoResults) => {
        if (err) return reject(err);
        if (!modoResults.length) return reject(new Error("Modo no encontrado"));

        const modoId = modoResults[0].id;
        const insertQuery = `
          INSERT INTO interacciones (nino_id, figura_id, modo_id, resultado)
          VALUES (?, ?, ?, ?)
        `;

        db.query(insertQuery, [ninoId, figuraId, modoId, resultado], (err, result) => {
          if (err) reject(err);
          else resolve(result.insertId);
        });
      });
    });
  }

  // Resumen por sesiones (fecha)
  static getResumenSesiones(ninoId) {
    return new Promise((resolve, reject) => {
      const query = `
      SELECT 
        DATE(timestamp) AS fecha,
        COUNT(*) AS total_interacciones,
        SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END) AS aciertos,
        SUM(CASE WHEN resultado = 'incorrecto' THEN 1 ELSE 0 END) AS errores,
        ROUND(AVG(TIMESTAMPDIFF(SECOND, 
          LAG(timestamp) OVER (PARTITION BY DATE(timestamp) ORDER BY timestamp),
          timestamp)
        ), 2) AS tiempo_promedio,
        (
          SELECT nombre 
          FROM modos_juego 
          WHERE id = (
            SELECT modo_id 
            FROM interacciones i2 
            WHERE i2.nino_id = i.nino_id 
              AND DATE(i2.timestamp) = DATE(i.timestamp)
            GROUP BY modo_id 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
          )
        ) AS modo_mas_usado
      FROM interacciones i
      WHERE nino_id = ?
      GROUP BY DATE(timestamp)
      ORDER BY fecha DESC
    `;

      db.query(query, [ninoId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

}



module.exports = FiguraModel;

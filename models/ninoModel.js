const db = require("../config/db");

class NinoModel {
  // Crear un nuevo niño
  static create({ nombre, edad, instructor_id }) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO ninos (nombre, edad, instructor_id) 
        VALUES (?, ?, ?)
      `;
      db.query(query, [nombre, edad, instructor_id], (err, result) => {
        if (err) reject(err);
        else resolve(result.insertId);
      });
    });
  }

  // Buscar niño por ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM ninos WHERE id = ?`;
      db.query(query, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  // Obtener todos los niños
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = `SELECT id, nombre, edad FROM ninos ORDER BY nombre`;
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // Obtener resumen general de sesiones para estadísticas
static getResumenSesiones(ninoId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(*) AS total_interacciones,
        SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END) AS total_aciertos,
        SUM(CASE WHEN resultado = 'incorrecto' THEN 1 ELSE 0 END) AS total_errores,
        ROUND(AVG(tiempo_promedio_por_figura), 1) AS tiempo_promedio,
        COUNT(DISTINCT DATE(timestamp)) AS sesiones_totales,
        MAX(timestamp) AS ultima_interaccion
      FROM interacciones
      WHERE nino_id = ?
    `;
    db.query(query, [ninoId], (err, results) => {
      if (err) {
        console.error("❌ Error en getResumenSesiones:", err);
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
}

  // Obtener estadísticas por figura y modo
  static getStats(ninoId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          f.nombre AS figura,
          COUNT(i.id) AS total_intentos,
          SUM(CASE WHEN i.resultado = 'correcto' THEN 1 ELSE 0 END) AS aciertos,
          m.nombre AS modo
        FROM interacciones i
        JOIN figuras f ON i.figura_id = f.id
        JOIN modos_juego m ON i.modo_id = m.id
        WHERE i.nino_id = ?
        GROUP BY f.id, i.modo_id
        ORDER BY f.nombre
      `;
      db.query(query, [ninoId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // === FUNCIONES PARA MODO INTELIGENTE ===

  // Aciertos totales
  static getAciertosTotales(ninoId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) AS total
        FROM interacciones
        WHERE nino_id = ? AND resultado = 'correcto'
      `;
      db.query(query, [ninoId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0].total);
      });
    });
  }

  // Errores totales
  static getErroresTotales(ninoId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) AS total
        FROM interacciones
        WHERE nino_id = ? AND resultado = 'incorrecto'
      `;
      db.query(query, [ninoId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0].total);
      });
    });
  }

  // Tiempo promedio real entre interacciones
  static getTiempoPromedio(ninoId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          AVG(diferencia) AS tiempo_promedio
        FROM (
          SELECT 
            TIMESTAMPDIFF(SECOND, 
              LAG(timestamp) OVER (ORDER BY timestamp), 
              timestamp) AS diferencia
          FROM interacciones
          WHERE nino_id = ?
        ) AS diferencias
        WHERE diferencia IS NOT NULL
      `;
      db.query(query, [ninoId], (err, results) => {
        if (err) return reject(err);
        const tiempo = results[0]?.tiempo_promedio;
        resolve(tiempo ? Math.round(tiempo) : 0);
      });
    });
  }

  // Sesiones totales (por día)
  static getSesionesTotales(ninoId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(DISTINCT DATE(timestamp)) AS sesiones
        FROM interacciones
        WHERE nino_id = ?
      `;
      db.query(query, [ninoId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0].sesiones);
      });
    });
  }

  // Rendimiento en la última sesión
  static getRendimientoUltimaSesion(ninoId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END) AS aciertos,
          COUNT(*) AS total
        FROM interacciones
        WHERE nino_id = ? AND DATE(timestamp) = (
          SELECT MAX(DATE(timestamp)) 
          FROM interacciones WHERE nino_id = ?
        )
      `;
      db.query(query, [ninoId, ninoId], (err, results) => {
        if (err) reject(err);
        const { aciertos, total } = results[0];
        resolve(total > 0 ? Math.round((aciertos / total) * 100) : 0);
      });
    });
  }

  // Progreso general (número de figuras distintas acertadas)
  static getProgresoGeneral(ninoId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(DISTINCT figura_id) AS progreso
        FROM interacciones
        WHERE nino_id = ? AND resultado = 'correcto'
      `;
      db.query(query, [ninoId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0].progreso);
      });
    });
  }
}

module.exports = NinoModel;

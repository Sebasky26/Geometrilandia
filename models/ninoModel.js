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

  // Obtener estadísticas agrupadas por figura y modo
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

  // === NUEVAS FUNCIONES PARA MODO INTELIGENTE ===

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

  // Tiempo promedio entre interacciones
  // Tiempo promedio entre interacciones (temporalmente simplificado)
static getTiempoPromedio(ninoId) {
  return Promise.resolve(0); // ← temporalmente retornamos 0
}


  // Número de sesiones (por día)
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
        else {
          const { aciertos, total } = results[0];
          resolve(total > 0 ? (aciertos / total) * 100 : 0);
        }
      });
    });
  }

  // Progreso (número de figuras diferentes acertadas)
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

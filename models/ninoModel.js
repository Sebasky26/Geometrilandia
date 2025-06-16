const db = require("../config/db")

class NinoModel {
  // Crear un nuevo niño
  static create({ nombre, edad, instructor_id }) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO ninos (nombre, edad, instructor_id) 
        VALUES (?, ?, ?)
      `
      db.query(query, [nombre, edad, instructor_id], (err, result) => {
        if (err) reject(err)
        else resolve(result.insertId)
      })
    })
  }

  // Buscar niño por ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM ninos WHERE id = ?`
      db.query(query, [id], (err, results) => {
        if (err) reject(err)
        else resolve(results[0])
      })
    })
  }

  // Obtener todos los niños (útil para el login con selector)
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = `SELECT id, nombre, edad FROM ninos ORDER BY nombre`
      db.query(query, (err, results) => {
        if (err) reject(err)
        else resolve(results)
      })
    })
  }

  // Obtener estadísticas por niño (opcional futuro)
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
      `
      db.query(query, [ninoId], (err, results) => {
        if (err) reject(err)
        else resolve(results)
      })
    })
  }
}

module.exports = NinoModel

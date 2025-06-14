const db = require("../config/db")

class FiguraModel {
  // Obtener todas las figuras
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM figuras ORDER BY nombre"
      db.query(query, (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }

  // Buscar figura por código RFID
  static findByRFID(codigoRfid) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM figuras WHERE codigo_rfid = ?"
      db.query(query, [codigoRfid], (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results[0] || null)
        }
      })
    })
  }

  // Obtener figura aleatoria
  static getRandom() {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM figuras ORDER BY RAND() LIMIT 1"
      db.query(query, (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results[0] || null)
        }
      })
    })
  }

  // Registrar interacción
  static registrarInteraccion(userId, figuraId, modo, resultado, tiempoRespuesta = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO interacciones (user_id, figura_id, modo, resultado, tiempo_respuesta) 
        VALUES (?, ?, ?, ?, ?)
      `

      db.query(query, [userId, figuraId, modo, resultado, tiempoRespuesta], (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }
}

module.exports = FiguraModel

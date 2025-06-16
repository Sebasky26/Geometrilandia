const db = require("../config/db")

class InstructorModel {
  // Buscar por cédula
  static findByCedula(cedula) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM instructores WHERE cedula = ?`
      db.query(query, [cedula], (err, results) => {
        if (err) reject(err)
        else resolve(results[0])
      })
    })
  }

  // Crear instructor
  static create({ nombre, cedula }) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO instructores (nombre, cedula) VALUES (?, ?)`
      db.query(query, [nombre, cedula], (err, result) => {
        if (err) reject(err)
        else resolve(result.insertId)
      })
    })
  }
}

module.exports = InstructorModel

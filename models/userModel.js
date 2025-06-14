const db = require("../config/db")
const bcrypt = require("bcryptjs")

class UserModel {
  // Crear nuevo usuario
  static async create(userData) {
    const { cedula, nombre_nino, edad, password } = userData

    try {
      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10)

      return new Promise((resolve, reject) => {
        const query = "INSERT INTO users (cedula, nombre_nino, edad, password) VALUES (?, ?, ?, ?)"
        db.query(query, [cedula, nombre_nino, edad, hashedPassword], (err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        })
      })
    } catch (error) {
      throw error
    }
  }

  // Buscar usuario por cédula
  static findByCedula(cedula) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM users WHERE cedula = ?"
      db.query(query, [cedula], (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results[0])
        }
      })
    })
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  // Obtener estadísticas del usuario
  static getStats(userId) {
    return new Promise((resolve, reject) => {
      const query = `
                SELECT 
                    f.nombre as figura,
                    COUNT(i.id) as total_intentos,
                    SUM(CASE WHEN i.resultado = 'correcto' THEN 1 ELSE 0 END) as aciertos,
                    i.modo
                FROM interacciones i
                JOIN figuras f ON i.figura_id = f.id
                WHERE i.user_id = ?
                GROUP BY f.id, i.modo
                ORDER BY f.nombre, i.modo
            `

      db.query(query, [userId], (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }
}

module.exports = UserModel

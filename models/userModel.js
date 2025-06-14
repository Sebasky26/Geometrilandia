const db = require("../config/db")
const bcrypt = require("bcryptjs")

class UserModel {
  // Crear nuevo usuario
  static async create(userData) {
    const { nombre, correo, password } = userData

    try {
      // Encriptar contraseña
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      return new Promise((resolve, reject) => {
        const query = "INSERT INTO users (nombre, correo, password) VALUES (?, ?, ?)"
        db.query(query, [nombre, correo, hashedPassword], (err, results) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              id: results.insertId,
              nombre,
              correo,
            })
          }
        })
      })
    } catch (error) {
      throw error
    }
  }

  // Buscar usuario por correo
  static findByEmail(correo) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM users WHERE correo = ?"
      db.query(query, [correo], (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results[0] || null)
        }
      })
    })
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword)
    } catch (error) {
      throw error
    }
  }

  // Obtener estadísticas del usuario
  static getUserStats(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_interacciones,
          SUM(CASE WHEN resultado = 'acierto' THEN 1 ELSE 0 END) as aciertos,
          SUM(CASE WHEN resultado = 'error' THEN 1 ELSE 0 END) as errores,
          modo,
          f.nombre as figura_nombre
        FROM interacciones i
        JOIN figuras f ON i.figura_id = f.id
        WHERE i.user_id = ?
        GROUP BY modo, f.nombre
        ORDER BY modo, f.nombre
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

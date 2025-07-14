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
}



module.exports = FiguraModel;

const mysql = require("mysql2")
require("dotenv").config()

// Crear conexión a la base de datos
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos: " + err.stack)
    return
  }
  console.log("Conectado a la base de datos como ID " + connection.threadId)
})

// Crear tablas si no existen
const createTables = () => {
  // Tabla users
  const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cedula VARCHAR(20) UNIQUE NOT NULL,
            nombre_nino VARCHAR(100) NOT NULL,
            edad INT NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `

  // Tabla figuras
  const createFigurasTable = `
        CREATE TABLE IF NOT EXISTS figuras (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(50) NOT NULL,
            codigo_rfid VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `

  // Tabla interacciones
  const createInteraccionesTable = `
        CREATE TABLE IF NOT EXISTS interacciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            figura_id INT NOT NULL,
            modo ENUM('libre', 'guiado', 'desafio') NOT NULL,
            resultado ENUM('correcto', 'incorrecto') NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (figura_id) REFERENCES figuras(id)
        )
    `

  connection.query(createUsersTable, (err) => {
    if (err) console.error("Error creando tabla users:", err)
    else console.log("Tabla users creada o ya existe")
  })

  connection.query(createFigurasTable, (err) => {
    if (err) console.error("Error creando tabla figuras:", err)
    else console.log("Tabla figuras creada o ya existe")
  })

  connection.query(createInteraccionesTable, (err) => {
    if (err) console.error("Error creando tabla interacciones:", err)
    else console.log("Tabla interacciones creada o ya existe")
  })

  // Insertar figuras predeterminadas
  const insertFiguras = `
        INSERT IGNORE INTO figuras (nombre, codigo_rfid) VALUES
        ('cubo', 'RFID_CUBO_001'),
        ('esfera', 'RFID_ESFERA_002'),
        ('piramide', 'RFID_PIRAMIDE_003'),
        ('cilindro', 'RFID_CILINDRO_004'),
        ('cono', 'RFID_CONO_005'),
        ('prisma', 'RFID_PRISMA_006')
    `

  connection.query(insertFiguras, (err) => {
    if (err) console.error("Error insertando figuras:", err)
    else console.log("Figuras predeterminadas insertadas")
  })
}

createTables()

module.exports = connection

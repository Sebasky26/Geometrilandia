const mysql = require("mysql2")
require("dotenv").config()

// Conexión a la base de datos
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

// Intentar conexión
connection.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.stack)
    return
  }
  console.log("Conectado a la base de datos como ID " + connection.threadId)
})

// Crear tablas
const createTables = () => {
  // Tabla instructores
  const createInstructoresTable = `
    CREATE TABLE IF NOT EXISTS instructores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      cedula VARCHAR(20) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Tabla niños
  const createNinosTable = `
    CREATE TABLE IF NOT EXISTS ninos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      edad INT NOT NULL CHECK (edad BETWEEN 2 AND 4),
      instructor_id INT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (instructor_id) REFERENCES instructores(id)
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

  // Tabla modos de juego
  const createModosJuegoTable = `
    CREATE TABLE IF NOT EXISTS modos_juego (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Tabla interacciones
  const createInteraccionesTable = `
    CREATE TABLE IF NOT EXISTS interacciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nino_id INT NOT NULL,
      figura_id INT NOT NULL,
      modo_id INT NOT NULL,
      resultado ENUM('correcto', 'incorrecto') NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (nino_id) REFERENCES ninos(id),
      FOREIGN KEY (figura_id) REFERENCES figuras(id),
      FOREIGN KEY (modo_id) REFERENCES modos_juego(id)
    )
  `

  // Crear tablas en orden correcto
  connection.query(createInstructoresTable, handleError("instructores"))
  connection.query(createNinosTable, handleError("ninos"))
  connection.query(createFigurasTable, handleError("figuras"))
  connection.query(createModosJuegoTable, handleError("modos_juego"))
  connection.query(createInteraccionesTable, handleError("interacciones"))

  // Insertar figuras base
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

// Función para imprimir errores
function handleError(tabla) {
  return (err) => {
    if (err) console.error(`Error creando tabla ${tabla}:`, err)
    else console.log(`Tabla ${tabla} creada o ya existe`)
  }
}

// Ejecutar
createTables()

module.exports = connection

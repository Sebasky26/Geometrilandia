const mysql = require("mysql2")
require("dotenv").config()

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
})

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error("Error conectando a MySQL:", err)
    return
  }
  console.log("✅ Conectado a MySQL exitosamente")
})

// Crear las tablas si no existen
const createTables = () => {
  // Tabla de usuarios (tutores)
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      correo VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Tabla de figuras geométricas
  const createFigurasTable = `
    CREATE TABLE IF NOT EXISTS figuras (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      codigo_rfid VARCHAR(20) UNIQUE NOT NULL,
      descripcion TEXT,
      color VARCHAR(20) DEFAULT 'azul'
    )
  `

  // Tabla de interacciones del juego
  const createInteraccionesTable = `
    CREATE TABLE IF NOT EXISTS interacciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      figura_id INT NOT NULL,
      modo VARCHAR(20) NOT NULL,
      resultado ENUM('acierto', 'error') NOT NULL,
      tiempo_respuesta INT DEFAULT 0,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (figura_id) REFERENCES figuras(id) ON DELETE CASCADE
    )
  `

  // Ejecutar creación de tablas
  connection.query(createUsersTable, (err) => {
    if (err) console.error("Error creando tabla users:", err)
    else console.log("✅ Tabla users verificada/creada")
  })

  connection.query(createFigurasTable, (err) => {
    if (err) console.error("Error creando tabla figuras:", err)
    else console.log("✅ Tabla figuras verificada/creada")

    // Insertar figuras predeterminadas
    insertDefaultFiguras()
  })

  connection.query(createInteraccionesTable, (err) => {
    if (err) console.error("Error creando tabla interacciones:", err)
    else console.log("✅ Tabla interacciones verificada/creada")
  })
}

// Insertar figuras geométricas predeterminadas
const insertDefaultFiguras = () => {
  const figuras = [
    { nombre: "Cubo", codigo_rfid: "RFID001", descripcion: "Figura con 6 caras cuadradas", color: "rojo" },
    { nombre: "Esfera", codigo_rfid: "RFID002", descripcion: "Figura redonda perfecta", color: "azul" },
    {
      nombre: "Pirámide",
      codigo_rfid: "RFID003",
      descripcion: "Figura con base cuadrada y 4 triángulos",
      color: "verde",
    },
    { nombre: "Cilindro", codigo_rfid: "RFID004", descripcion: "Figura con bases circulares", color: "amarillo" },
    { nombre: "Cono", codigo_rfid: "RFID005", descripcion: "Figura con base circular y punta", color: "naranja" },
    { nombre: "Prisma", codigo_rfid: "RFID006", descripcion: "Figura con bases triangulares", color: "morado" },
  ]

  figuras.forEach((figura) => {
    const checkQuery = "SELECT id FROM figuras WHERE codigo_rfid = ?"
    connection.query(checkQuery, [figura.codigo_rfid], (err, results) => {
      if (err) {
        console.error("Error verificando figura:", err)
        return
      }

      if (results.length === 0) {
        const insertQuery = "INSERT INTO figuras (nombre, codigo_rfid, descripcion, color) VALUES (?, ?, ?, ?)"
        connection.query(insertQuery, [figura.nombre, figura.codigo_rfid, figura.descripcion, figura.color], (err) => {
          if (err) console.error(`Error insertando figura ${figura.nombre}:`, err)
          else console.log(`✅ Figura ${figura.nombre} insertada`)
        })
      }
    })
  })
}

// Inicializar tablas
createTables()

module.exports = connection

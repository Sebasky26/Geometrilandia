const mysql = require("mysql2");
require("dotenv").config();

// Conexión a la base de datos
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Intentar conexión
connection.connect((err) => {
  if (err) {
    console.error("❌ Error conectando a la base de datos:", err.stack);
    return;
  }
  console.log("✅ Conectado a la base de datos como ID " + connection.threadId);
});

// Crear tablas
const createTables = () => {
  const createInstructoresTable = `
    CREATE TABLE IF NOT EXISTS instructores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      cedula VARCHAR(20) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createNinosTable = `
    CREATE TABLE IF NOT EXISTS ninos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      edad INT NOT NULL CHECK (edad BETWEEN 2 AND 4),
      instructor_id INT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (instructor_id) REFERENCES instructores(id)
    )
  `;

  const createFigurasTable = `
    CREATE TABLE IF NOT EXISTS figuras (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      codigo_rfid VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createModosJuegoTable = `
    CREATE TABLE IF NOT EXISTS modos_juego (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createInteraccionesTable = `
    CREATE TABLE IF NOT EXISTS interacciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nino_id INT NOT NULL,
      figura_id INT NOT NULL,
      modo_id INT NOT NULL,
      resultado ENUM('correcto', 'incorrecto') NOT NULL,
      aciertos_total INT DEFAULT 0,
      errores_total INT DEFAULT 0,
      tiempo_promedio_por_figura FLOAT DEFAULT 0.0,
      sesiones_totales INT DEFAULT 0,
      rendimiento_ultima_sesion FLOAT DEFAULT 0.0,
      progreso_general INT DEFAULT 0,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (nino_id) REFERENCES ninos(id),
      FOREIGN KEY (figura_id) REFERENCES figuras(id),
      FOREIGN KEY (modo_id) REFERENCES modos_juego(id)
    )
  `;

  connection.query(createInstructoresTable, handleError("instructores"));
  connection.query(createNinosTable, handleError("ninos"));
  connection.query(createFigurasTable, handleError("figuras"));
  connection.query(createModosJuegoTable, handleError("modos_juego"));
  connection.query(createInteraccionesTable, handleError("interacciones"));
};

// Función para insertar modos de juego
const insertModosJuego = () => {
  const modos = [
    ['Libre', 'Exploración libre del entorno.'],
    ['Guiado', 'Aprendizaje con ayuda del sistema.'],
    ['Desafío', 'Retos para evaluar el aprendizaje.'],
    ['Inteligente', 'Modo adaptativo según el desempeño.']
  ];

  modos.forEach(([nombre, descripcion]) => {
    const query = `
      INSERT IGNORE INTO modos_juego (nombre, descripcion) 
      VALUES (?, ?)
    `;
    connection.query(query, [nombre, descripcion], (err) => {
      if (err) console.error(`❌ Error insertando modo ${nombre}:`, err);
      else console.log(`✅ Modo ${nombre} insertado o ya existe`);
    });
  });
};

// Función para imprimir errores
function handleError(tabla) {
  return (err) => {
    if (err) console.error(`❌ Error creando tabla ${tabla}:`, err);
    else console.log(`✅ Tabla ${tabla} creada o ya existe`);
  };
}

// Ejecutar
createTables();
insertModosJuego();

// Insertar figuras si no existen
const insertFiguras = () => {
  const mapaRFID = {
    "F6FE0885": "ESTRELLA TURQUESA",
    "B39DD90D": "CUADRADO AZUL",
    "E1B7A07B": "CUADRADO ROJO",
    "55754239": "ESTRELLA AMARILLA",
    "4CA16D3B": "CORAZON VERDE",
    "F74B6E3B": "CUADRADO AMARILLO",
    "BC124D39": "ESTRELLA NARANJA",
    "22614239": "CIRCULO AMARILLO",
    "8CAB6D3B": "CIRCULO TURQUESA",
    "F7934D39": "RECTANGULO AZUL",
    "65EA4139": "RECTANGULO VERDE",
    "BB5F4239": "CORAZON AZUL",
    "E7BD4239": "RECTANGULO TURQUESA",
    "896A4D39": "CORAZON ROJO",
    "AE9E4239": "TRIANGULO VERDE",
    "B0DE6D3B": "TRIANGULO NARANJA",
    "91275D7B": "TRIANGULO ROJO",
    "C6770785": "CIRCULO NARANJA"
  };

  Object.entries(mapaRFID).forEach(([rfid, nombre]) => {
    const query = `
      INSERT IGNORE INTO figuras (nombre, codigo_rfid)
      VALUES (?, ?)
    `;
    connection.query(query, [nombre, rfid], (err) => {
      if (err) console.error(`❌ Error insertando figura ${nombre}:`, err);
      else console.log(`✅ Figura ${nombre} insertada o ya existe`);
    });
  });
};

// Llamar a la función
insertFiguras();


module.exports = connection;

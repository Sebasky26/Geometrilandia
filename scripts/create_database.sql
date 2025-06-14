-- Script para crear la base de datos Geometrilandia
-- Ejecutar este script en phpMyAdmin o MySQL Workbench

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS geometrilandia 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE geometrilandia;

-- Crear tabla de usuarios (tutores)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_correo (correo)
) ENGINE=InnoDB;

-- Crear tabla de figuras geométricas
CREATE TABLE IF NOT EXISTS figuras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    codigo_rfid VARCHAR(20) UNIQUE NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT 'azul',
    INDEX idx_codigo_rfid (codigo_rfid)
) ENGINE=InnoDB;

-- Crear tabla de interacciones del juego
CREATE TABLE IF NOT EXISTS interacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    figura_id INT NOT NULL,
    modo VARCHAR(20) NOT NULL,
    resultado ENUM('acierto', 'error') NOT NULL,
    tiempo_respuesta INT DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (figura_id) REFERENCES figuras(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_figura_id (figura_id),
    INDEX idx_modo (modo),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB;

-- Insertar figuras geométricas predeterminadas
INSERT IGNORE INTO figuras (nombre, codigo_rfid, descripcion, color) VALUES
('Cubo', 'RFID001', 'Figura tridimensional con 6 caras cuadradas iguales. Todas sus aristas tienen la misma longitud.', 'rojo'),
('Esfera', 'RFID002', 'Figura perfectamente redonda en tres dimensiones. Todos los puntos de su superficie están a la misma distancia del centro.', 'azul'),
('Pirámide', 'RFID003', 'Figura con una base cuadrada y cuatro caras triangulares que se encuentran en un punto llamado vértice.', 'verde'),
('Cilindro', 'RFID004', 'Figura con dos bases circulares paralelas conectadas por una superficie curva.', 'amarillo'),
('Cono', 'RFID005', 'Figura con una base circular y una superficie curva que termina en un punto llamado vértice.', 'naranja'),
('Prisma', 'RFID006', 'Figura con dos bases triangulares paralelas conectadas por caras rectangulares.', 'morado');

-- Crear usuario de ejemplo para pruebas (contraseña: 123456)
INSERT IGNORE INTO users (nombre, correo, password) VALUES
('Usuario de Prueba', 'test@geometrilandia.com', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ');

-- Crear algunas interacciones de ejemplo
INSERT IGNORE INTO interacciones (user_id, figura_id, modo, resultado, tiempo_respuesta) VALUES
(1, 1, 'libre', 'acierto', 5000),
(1, 2, 'libre', 'acierto', 3000),
(1, 1, 'guiado', 'acierto', 8000),
(1, 3, 'guiado', 'error', 12000),
(1, 3, 'guiado', 'acierto', 6000),
(1, 1, 'desafio', 'acierto', 4000),
(1, 2, 'desafio', 'acierto', 5000),
(1, 3, 'desafio', 'acierto', 7000);

-- Mostrar resumen de la base de datos creada
SELECT 'Base de datos Geometrilandia creada exitosamente' as mensaje;
SELECT COUNT(*) as total_figuras FROM figuras;
SELECT COUNT(*) as total_usuarios FROM users;
SELECT COUNT(*) as total_interacciones FROM interacciones;

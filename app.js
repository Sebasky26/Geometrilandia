const express = require("express");
const session = require("express-session");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// === Diccionario de UIDs RFID → Nombres de figuras ===
const mapaRFID = {
  "91275D7B": "TRIANGULO NARANJA",
  "07AA2886": "CIRCULO VERDE",
  "E3111D11": "ESTRELLA CELESTE",
  "E1B7A07B": "CUADRADO ROSADO",
  "374BC885": "CIRCULO AZUL",
  "F6A7B8C9": "TRIANGULO MORADO",
  "B39DD90D": "CUADRADO NARANJA"
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "geometrilandia_secreta",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Rutas principales
const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

// Rutas de figura (POST /api/figura)
const { router: figuraRouter, setSocket } = require("./routes/figura");
setSocket(io);
app.use("/api/figura", figuraRouter);

// Página principal
app.get("/", (req, res) => {
  if (req.session.ninoId) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

// WebSocket
io.on("connection", (socket) => {
  console.log("🧩 Cliente WebSocket conectado");
});

// === INTEGRACIÓN SERIAL CON ESP32 (PUERTO COM3) ===
const serialPort = new SerialPort({
  path: "COM3",
  baudRate: 115200,
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

serialPort.on("open", () => {
  console.log("📶 Puerto serial conectado a ESP32 (COM3)");
});

parser.on("data", (line) => {
  const uid = line.trim().toUpperCase();
  const figura = mapaRFID[uid];

  if (figura) {
    console.log("🎯 UID ${uid} → Figura: ${figura}");
    io.emit("nuevaFigura", figura);
  } else {
    console.warn("⚠ UID no reconocido: ${uid}");
  }
});

serialPort.on("error", (err) => {
  console.error("❌ Error en el puerto serial:", err.message);
});

// Página 404 personalizada
app.use((req, res) => {
  res.status(404).send(`
    <html>
      <head>
        <title>Página no encontrada - GeoMetrilandia</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #fce4ec; }
          h1 { color: #d32f2f; font-size: 3em; }
          p { font-size: 1.2em; }
          a { color: #0288d1; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>404 - Página no encontrada</h1>
        <p>Ups... la ruta que buscas no existe en GeoMetrilandia.</p>
        <a href="/">Volver al inicio</a>
      </body>
    </html>
  `);
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor de GeoMetrilandia en http://localhost:${PORT}`);
  console.log("🧒 Listo para recibir perfiles de niños");
  console.log("📡 Escuchando datos del ESP32 por COM3");
});
const express = require("express");
const session = require("express-session");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Configuración de sesión
app.use(
  session({
    secret: process.env.SESSION_SECRET || "geometrilandia_secreta",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // usar true solo con HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  })
);

// Rutas principales
const routes = require("./routes/auth");
app.use("/", routes);

// Redirección por defecto
app.get("/", (req, res) => {
  if (req.session.ninoId) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

// === NUEVA RUTA PARA DATOS DEL ESP32 ===
app.post("/api/figura", (req, res) => {
  const { nombre } = req.body;
  if (nombre) {
    console.log("📡 Figura recibida del ESP32:", nombre);
    io.emit("nuevaFigura", nombre); // enviar a todos los navegadores conectados
    res.send({ status: "ok" });
  } else {
    res.status(400).send({ error: "Nombre de figura faltante" });
  }
});

// WebSocket: conexión de clientes
io.on("connection", (socket) => {
  console.log("🧩 Cliente WebSocket conectado");
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
  console.log(`🧒 Listo para recibir perfiles de niños`);
  console.log(`📡 Escuchando datos del ESP32 vía /api/figura`);
});

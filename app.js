const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const path = require("path")
require("dotenv").config()

// Importar rutas
const authRoutes = require("./routes/auth")
const gameRoutes = require("./routes/game")

const app = express()
const PORT = process.env.PORT || 3000

// Configuración de middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Cambiar a true en producción con HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  }),
)

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")))

// Configurar rutas
app.use("/", authRoutes)
app.use("/", gameRoutes)

// Ruta raíz - redirigir según autenticación
app.get("/", (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect("/dashboard")
  } else {
    res.redirect("/login")
  }
})

// Middleware para manejar errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Página no encontrada",
  })
})

// Middleware para manejar errores del servidor
app.use((err, req, res, next) => {
  console.error("Error del servidor:", err)
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Geometrilandia ejecutándose en http://localhost:${PORT}`)
  console.log(`📚 Sistema educativo para niños de 2-4 años`)
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app

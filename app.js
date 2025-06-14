const express = require("express")
const session = require("express-session")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

// Configurar sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true en producción con HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  }),
)

// Rutas
const authRoutes = require("./routes/auth")
app.use("/", authRoutes)

// Ruta raíz - redirigir a login o dashboard
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/dashboard")
  } else {
    res.redirect("/login")
  }
})

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).send(`
        <html>
            <head>
                <title>Página no encontrada - Geometrilandia</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    h1 { color: #ff6b6b; }
                    a { color: #4ecdc4; text-decoration: none; }
                </style>
            </head>
            <body>
                <h1>404 - Página no encontrada</h1>
                <p>La página que buscas no existe en Geometrilandia.</p>
                <a href="/">Volver al inicio</a>
            </body>
        </html>
    `)
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Geometrilandia ejecutándose en http://localhost:${PORT}`)
  console.log(`📚 Sistema educativo para niños de 2-4 años`)
  console.log(`🔧 Asegúrate de que XAMPP esté ejecutándose con MySQL`)
})

const express = require("express")
const router = express.Router()
const AuthController = require("../controllers/authController")
const GameController = require("../controllers/gameController")
const { requireAuth, redirectIfAuth } = require("../middleware/auth")
const NinoModel = require("../models/ninoModel") 

// Rutas de autenticación
router.get("/register", redirectIfAuth, AuthController.showRegister)
router.post("/register", AuthController.register)
router.get("/login", redirectIfAuth, AuthController.showLogin)
router.post("/login", AuthController.login)
router.post("/logout", AuthController.logout)
router.get("/current-user", AuthController.getCurrentUser)

// Rutas del juego (requieren autenticación)
router.get("/dashboard", requireAuth, GameController.showDashboard)
router.get("/modo-libre", requireAuth, GameController.showModoLibre)
router.get("/modo-guiado", requireAuth, GameController.showModoGuiado)
router.get("/modo-desafio", requireAuth, GameController.showModoDesafio)

// API endpoints
router.get("/api/figuras", requireAuth, GameController.getFiguras)
router.post("/api/rfid", requireAuth, GameController.processRFID)
router.get("/api/figura-aleatoria", requireAuth, GameController.getFiguraAleatoria)
router.get("/api/stats", requireAuth, GameController.getStats)

// API: Obtener lista de niños registrados
router.get("/api/ninos", async (req, res) => {
  try {
    const ninos = await NinoModel.getAll()
    res.json({ success: true, ninos })
  } catch (error) {
    console.error("Error al obtener niños:", error)
    res.status(500).json({ success: false, message: "Error al cargar la lista de niños" })
  }
})

module.exports = router

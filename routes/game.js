const express = require("express")
const router = express.Router()
const GameController = require("../controllers/gameController")
const { requireAuth } = require("../middleware/auth")

// Aplicar middleware de autenticación a todas las rutas
router.use(requireAuth)

// Rutas de las vistas del juego
router.get("/dashboard", GameController.showDashboard)
router.get("/modo-libre", GameController.showModoLibre)
router.get("/modo-guiado", GameController.showModoGuiado)
router.get("/modo-desafio", GameController.showModoDesafio)

// API endpoints
router.get("/api/figuras", GameController.getFiguras)
router.get("/api/estadisticas", GameController.getEstadisticas)

// Endpoints para modo libre
router.post("/api/modo-libre", GameController.procesarModoLibre)

// Endpoints para modo guiado
router.get("/api/modo-guiado/objetivo", GameController.getFiguraObjetivo)
router.post("/api/modo-guiado", GameController.procesarModoGuiado)

// Endpoints para modo desafío
router.post("/api/modo-desafio/iniciar", GameController.iniciarDesafio)
router.post("/api/modo-desafio", GameController.procesarModoDesafio)

module.exports = router

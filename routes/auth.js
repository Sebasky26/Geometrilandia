const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const GameController = require("../controllers/gameController");
const InteligenciaController = require("../controllers/inteligenciaController");
const { requireAuth, redirectIfAuth } = require("../middleware/auth");
const NinoModel = require("../models/ninoModel");

// === Autenticación ===
router.get("/register", redirectIfAuth, AuthController.showRegister);
router.post("/register", AuthController.register);
router.get("/login", redirectIfAuth, AuthController.showLogin);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/current-user", AuthController.getCurrentUser);

// === Juego ===
router.get("/dashboard", requireAuth, GameController.showDashboard);
router.get("/modo-libre", requireAuth, GameController.showModoLibre);
router.get("/modo-guiado", requireAuth, GameController.showModoGuiado);
router.get("/modo-desafio", requireAuth, GameController.showModoDesafio);

// === API del juego ===
router.get("/api/figuras", requireAuth, GameController.getFiguras);
router.post("/api/rfid", requireAuth, GameController.processRFID);
router.get("/api/figura-aleatoria", requireAuth, GameController.getFiguraAleatoria);
router.get("/api/stats", requireAuth, GameController.getStats);

// === Lista de niños ===
router.get("/api/ninos", async (req, res) => {
  try {
    const ninos = await NinoModel.getAll();
    res.json({ success: true, ninos });
  } catch (error) {
    console.error("Error al obtener niños:", error);
    res.status(500).json({ success: false, message: "Error al cargar la lista de niños" });
  }
});

// === Modo inteligente (vía controlador) ===
router.post("/api/modo-inteligente", requireAuth, InteligenciaController.obtenerModoInteligente);

module.exports = router;

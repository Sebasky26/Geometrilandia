const express = require("express")
const router = express.Router()
const AuthController = require("../controllers/authController")
const { redirectIfAuth } = require("../middleware/auth")

// Rutas de autenticación
router.get("/login", redirectIfAuth, AuthController.showLogin)
router.get("/register", redirectIfAuth, AuthController.showRegister)
router.post("/login", AuthController.login)
router.post("/register", AuthController.register)
router.post("/logout", AuthController.logout)
router.get("/check-auth", AuthController.checkAuth)

module.exports = router

const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const GameController = require("../controllers/gameController");
const { requireAuth, redirectIfAuth } = require("../middleware/auth");
const NinoModel = require("../models/ninoModel");
const connection = require("../config/db");

// Rutas de autenticación
router.get("/register", redirectIfAuth, AuthController.showRegister);
router.post("/register", AuthController.register);
router.get("/login", redirectIfAuth, AuthController.showLogin);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/current-user", AuthController.getCurrentUser);

// Rutas del juego
router.get("/dashboard", requireAuth, GameController.showDashboard);
router.get("/modo-libre", requireAuth, GameController.showModoLibre);
router.get("/modo-guiado", requireAuth, GameController.showModoGuiado);
router.get("/modo-desafio", requireAuth, GameController.showModoDesafio);

// API del juego
router.get("/api/figuras", requireAuth, GameController.getFiguras);
router.post("/api/rfid", requireAuth, GameController.processRFID);
router.get("/api/figura-aleatoria", requireAuth, GameController.getFiguraAleatoria);
router.get("/api/stats", requireAuth, GameController.getStats);

// Lista de niños
router.get("/api/ninos", async (req, res) => {
  try {
    const ninos = await NinoModel.getAll();
    res.json({ success: true, ninos });
  } catch (error) {
    console.error("Error al obtener niños:", error);
    res.status(500).json({ success: false, message: "Error al cargar la lista de niños" });
  }
});

// === MODO INTELIGENTE ===
router.post("/api/modo-inteligente", requireAuth, async (req, res) => {
  const ninoId = req.session.ninoId;

  try {
    // === Estadísticas del niño ===
    const [[{ total: aciertos_total }]] = await connection.promise().query(`
      SELECT COUNT(*) AS total FROM interacciones 
      WHERE nino_id = ? AND resultado = 'correcto'
    `, [ninoId]);

    const [[{ total: errores_total }]] = await connection.promise().query(`
      SELECT COUNT(*) AS total FROM interacciones 
      WHERE nino_id = ? AND resultado = 'incorrecto'
    `, [ninoId]);

    const [[{ tiempo_promedio }]] = await connection.promise().query(`
      SELECT AVG(diferencia) AS tiempo_promedio
      FROM (
        SELECT TIMESTAMPDIFF(SECOND, 
          LAG(timestamp) OVER (ORDER BY timestamp), 
          timestamp) AS diferencia
        FROM interacciones
        WHERE nino_id = ?
      ) AS diferencias
      WHERE diferencia IS NOT NULL
    `, [ninoId]);
    const tiempo_promedio_por_figura = Math.round(tiempo_promedio || 0);

    const [[{ sesiones }]] = await connection.promise().query(`
      SELECT COUNT(DISTINCT DATE(timestamp)) AS sesiones 
      FROM interacciones WHERE nino_id = ?
    `, [ninoId]);
    const sesiones_totales = sesiones;

    const [[{ progreso }]] = await connection.promise().query(`
      SELECT COUNT(DISTINCT figura_id) AS progreso 
      FROM interacciones 
      WHERE nino_id = ? AND resultado = 'correcto'
    `, [ninoId]);
    const progreso_general = progreso;

    const [[{ ultima_fecha }]] = await connection.promise().query(`
      SELECT MAX(DATE(timestamp)) AS ultima_fecha 
      FROM interacciones WHERE nino_id = ?
    `, [ninoId]);

    let rendimiento_ultima_sesion = 0;
    let modo_usado_ultima_sesion = "libre";

    if (ultima_fecha) {
      const [[{ aciertos, total, modo_id }]] = await connection.promise().query(`
        SELECT 
          SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END) AS aciertos,
          COUNT(*) AS total,
          MAX(modo_id) AS modo_id
        FROM interacciones
        WHERE nino_id = ? AND DATE(timestamp) = ?
      `, [ninoId, ultima_fecha]);

      rendimiento_ultima_sesion = total > 0 ? Math.round((aciertos / total) * 100) : 0;

      if (modo_id) {
        const [[{ nombre }]] = await connection.promise().query(`
          SELECT nombre FROM modos_juego WHERE id = ?
        `, [modo_id]);
        modo_usado_ultima_sesion = nombre || "libre";
      }
    }

    const [[{ edad }]] = await connection.promise().query(`
      SELECT edad FROM ninos WHERE id = ?
    `, [ninoId]);

    // === Enviar a modelo IA ===
    const datos = {
      edad: edad || 3,
      aciertos_total,
      errores_total,
      tiempo_promedio_por_figura,
      sesiones_totales,
      modo_usado_ultima_sesion,
      rendimiento_ultima_sesion,
      progreso_general,
    };

    const respuesta = await fetch("http://localhost:5000/predecir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json();
    const modo_sugerido = resultado.modo_sugerido;

    // === Guardar interacción (sin figura) ===
    const [[{ id: modo_id }]] = await connection.promise().query(
      `SELECT id FROM modos_juego WHERE nombre = ?`,
      [modo_sugerido]
    );

    // Usar figura dummy para cumplir la integridad referencial
    const [[{ id: figura_id }]] = await connection.promise().query(`
      SELECT id FROM figuras ORDER BY id LIMIT 1
    `);

    await connection.promise().query(`
      INSERT INTO interacciones (
        nino_id,
        figura_id,
        modo_id,
        resultado,
        aciertos_total,
        errores_total,
        tiempo_promedio_por_figura,
        sesiones_totales,
        rendimiento_ultima_sesion,
        progreso_general
      ) VALUES (?, ?, ?, 'correcto', ?, ?, ?, ?, ?, ?)
    `, [
      ninoId,
      figura_id, // ← figura dummy (por ejemplo, la primera figura del catálogo)
      modo_id,
      aciertos_total,
      errores_total,
      tiempo_promedio_por_figura,
      sesiones_totales,
      rendimiento_ultima_sesion,
      progreso_general
    ]);

    res.json({ success: true, modo_sugerido });

  } catch (error) {
    console.error("Error al predecir modo inteligente:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

module.exports = router;

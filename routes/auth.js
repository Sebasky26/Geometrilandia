const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const GameController = require("../controllers/gameController");
const { requireAuth, redirectIfAuth } = require("../middleware/auth");
const NinoModel = require("../models/ninoModel");
const connection = require("../config/db");
const fetch = require("node-fetch");

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

// API endpoints
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

// === MODO INTELIGENTE CON DATOS REALES DESDE SQL ===
router.post("/api/modo-inteligente", requireAuth, async (req, res) => {
  const ninoId = req.session.ninoId;

  try {
    // ACIERTOS TOTALES
    const [aciertosRes] = await connection.promise().query(`
      SELECT COUNT(*) AS total FROM interacciones 
      WHERE nino_id = ? AND resultado = 'correcto'
    `, [ninoId]);
    const aciertos_total = aciertosRes[0].total;

    // ERRORES TOTALES
    const [erroresRes] = await connection.promise().query(`
      SELECT COUNT(*) AS total FROM interacciones 
      WHERE nino_id = ? AND resultado = 'incorrecto'
    `, [ninoId]);
    const errores_total = erroresRes[0].total;

    // TIEMPO PROMEDIO ENTRE INTERACCIONES
    const [tiempoRes] = await connection.promise().query(`
      SELECT 
        AVG(TIMESTAMPDIFF(SECOND, 
          LAG(timestamp) OVER (ORDER BY timestamp), 
          timestamp)) AS tiempo_promedio
      FROM (
        SELECT * FROM interacciones WHERE nino_id = ?
      ) sub
    `, [ninoId]);
    const tiempo_promedio_por_figura = Math.round(tiempoRes[0].tiempo_promedio || 0);

    // SESIONES TOTALES
    const [sesionesRes] = await connection.promise().query(`
      SELECT COUNT(DISTINCT DATE(timestamp)) AS sesiones 
      FROM interacciones WHERE nino_id = ?
    `, [ninoId]);
    const sesiones_totales = sesionesRes[0].sesiones;

    // PROGRESO GENERAL
    const [progresoRes] = await connection.promise().query(`
      SELECT COUNT(DISTINCT figura_id) AS progreso 
      FROM interacciones 
      WHERE nino_id = ? AND resultado = 'correcto'
    `, [ninoId]);
    const progreso_general = progresoRes[0].progreso;

    // RENDIMIENTO EN LA ÚLTIMA SESIÓN
    const [ultimaFechaRes] = await connection.promise().query(`
      SELECT MAX(DATE(timestamp)) AS ultima_fecha 
      FROM interacciones WHERE nino_id = ?
    `, [ninoId]);
    const ultimaFecha = ultimaFechaRes[0].ultima_fecha;

    let rendimiento_ultima_sesion = 0;
    let modo_usado_ultima_sesion = "libre";

    if (ultimaFecha) {
      const [rendimientoRes] = await connection.promise().query(`
        SELECT 
          SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END) AS aciertos,
          COUNT(*) AS total,
          MAX(modo_id) AS modo_id
        FROM interacciones
        WHERE nino_id = ? AND DATE(timestamp) = ?
      `, [ninoId, ultimaFecha]);

      const { aciertos, total, modo_id } = rendimientoRes[0];
      rendimiento_ultima_sesion = total > 0 ? Math.round((aciertos / total) * 100) : 0;

      if (modo_id) {
        const [modoNombreRes] = await connection.promise().query(`
          SELECT nombre FROM modos_juego WHERE id = ?
        `, [modo_id]);
        modo_usado_ultima_sesion = modoNombreRes[0]?.nombre || "libre";
      }
    }

    // EDAD DEL NIÑO
    const [edadRes] = await connection.promise().query(`
      SELECT edad FROM ninos WHERE id = ?
    `, [ninoId]);
    const edad = edadRes[0]?.edad || 3;

    // === PREPARAR DATA PARA IA ===
    const datos = {
      edad,
      aciertos_total,
      errores_total,
      tiempo_promedio_por_figura,
      sesiones_totales,
      modo_usado_ultima_sesion,
      rendimiento_ultima_sesion,
      progreso_general
    };

    // ENVIAR A IA EN FLASK
    const respuesta = await fetch("http://localhost:5000/predecir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json();
    res.json({ success: true, modo_sugerido: resultado.modo });

  } catch (error) {
    console.error("Error al predecir modo inteligente:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

module.exports = router;

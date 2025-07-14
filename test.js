const db = require("./config/db");
const NinoModel = require("./models/ninoModel");
const InteraccionModel = require("./models/interaccionModel");

async function insertarInteraccionPrueba() {
  try {
    // 1. Obtener el ID del niño
    const ninos = await NinoModel.getAll();
    if (ninos.length === 0) throw new Error("No hay niños registrados.");
    const nino = ninos[0]; // Usamos el primero

    // 2. Buscar ID de una figura por RFID
    const rfid = "F6FE0885"; // ESTRELLA TURQUESA
    db.query("SELECT id FROM figuras WHERE codigo_rfid = ?", [rfid], async (err, figuras) => {
      if (err) throw err;
      if (figuras.length === 0) throw new Error("Figura no encontrada.");
      const figura_id = figuras[0].id;

      // 3. Buscar ID de modo "Libre"
      db.query("SELECT id FROM modos_juego WHERE nombre = 'Libre'", async (err, modos) => {
        if (err) throw err;
        if (modos.length === 0) throw new Error("Modo 'Libre' no encontrado.");
        const modo_id = modos[0].id;

        // 4. Calcular estadísticas desde NinoModel
        const [
          aciertos_total,
          errores_total,
          tiempo_promedio_por_figura,
          sesiones_totales,
          rendimiento_ultima_sesion,
          progreso_general
        ] = await Promise.all([
          NinoModel.getAciertosTotales(nino.id),
          NinoModel.getErroresTotales(nino.id),
          NinoModel.getTiempoPromedio(nino.id),
          NinoModel.getSesionesTotales(nino.id),
          NinoModel.getRendimientoUltimaSesion(nino.id),
          NinoModel.getProgresoGeneral(nino.id)
        ]);

        // 5. Insertar la interacción
        const interaccion = {
          nino_id: nino.id,
          figura_id,
          modo_id,
          resultado: "correcto", // o "incorrecto"
          aciertos_total,
          errores_total,
          tiempo_promedio_por_figura,
          sesiones_totales,
          rendimiento_ultima_sesion,
          progreso_general
        };

        InteraccionModel.insertarInteraccion(interaccion, (err, result) => {
          if (err) {
            console.error("❌ Error al insertar interacción:", err);
          } else {
            console.log("✅ Interacción insertada con ID:", result.insertId);
          }
          db.end(); // cerrar conexión
        });
      });
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    db.end();
  }
}

insertarInteraccionPrueba();

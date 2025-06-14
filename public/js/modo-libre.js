// Modo Libre - Exploración sin restricciones

let gameActive = false

// Inicializar modo libre
function initModoLibre() {
  console.log("Inicializando Modo Libre")
  setupRFIDListener()
}

// Iniciar modo libre
function startFreeMode() {
  hideElement("welcomeScreen")
  showElement("gameScreen", "slide-in")
  gameActive = true

  playSound("successSound")
  showFeedback("¡Acerca cualquier figura al lector!", "info")
}

// Configurar listener para RFID
function setupRFIDListener() {
  // Listener para eventos RFID reales (cuando esté conectado el hardware)
  document.addEventListener("rfidDetected", handleRFIDDetection)

  // Para testing - simular RFID cada 5 segundos
  if (window.location.hostname === "localhost") {
    setInterval(() => {
      if (gameActive && Math.random() > 0.7) {
        const simulation = simulateRFID()
        handleRFIDDetection({ detail: { codigo_rfid: simulation.codigo_rfid } })
      }
    }, 5000)
  }
}

// Manejar detección RFID
async function handleRFIDDetection(event) {
  if (!gameActive) return

  const codigo_rfid = event.detail.codigo_rfid
  console.log("RFID detectado:", codigo_rfid)

  try {
    // Mostrar que se está procesando
    updateFiguraDisplay("❓", "¿Qué será?", "#ccc")
    showFeedback("Detectando figura...", "info", 1000)

    // Procesar RFID
    const result = await processRFIDReading(codigo_rfid, "libre")

    if (result.success) {
      // Mostrar la figura detectada
      const figura = result.figura
      updateFiguraDisplay(getFiguraIcon(figura.nombre), figura.nombre.toUpperCase(), getFiguraColor(figura.nombre))

      // Retroalimentación positiva
      showFeedback(`¡Es un ${figura.nombre.toUpperCase()}!`, "success", 3000)
      playSound("successSound")
      vibrate([100, 50, 100])

      // Animación de éxito
      const figuraDisplay = document.getElementById("figuraDisplay")
      if (figuraDisplay) {
        figuraDisplay.classList.add("success")
        setTimeout(() => {
          figuraDisplay.classList.remove("success")
        }, 1000)
      }

      // Mostrar notificación visual
      showVisualNotification(`¡${figura.nombre.toUpperCase()}!`, "success")
    } else {
      showFeedback("Figura no reconocida. Intenta de nuevo.", "error")
      updateFiguraDisplay("❌", "No reconocida", "#ff6b6b")
    }
  } catch (error) {
    console.error("Error procesando RFID:", error)
    showFeedback("Error detectando figura. Intenta de nuevo.", "error")
    updateFiguraDisplay("❌", "Error", "#ff6b6b")
  }
}

// Actualizar display de figura
function updateFiguraDisplay(icon, name, color) {
  const figuraIcon = document.getElementById("figuraIcon")
  const figuraName = document.getElementById("figuraName")
  const figuraDisplay = document.getElementById("figuraDisplay")

  if (figuraIcon) {
    figuraIcon.textContent = icon
    figuraIcon.style.color = color
  }

  if (figuraName) {
    figuraName.textContent = name
    figuraName.style.color = color
  }

  if (figuraDisplay) {
    figuraDisplay.style.borderColor = color
  }
}

// Función para volver (override de game-common.js)
function goBack() {
  gameActive = false
  window.location.href = "/dashboard"
}

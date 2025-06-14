// Modo Guiado - Buscar figura específica

let gameActive = false
let currentTarget = null
let correctAnswers = 0
let totalAttempts = 0

// Inicializar modo guiado
function initModoGuiado() {
  console.log("Inicializando Modo Guiado")
  setupRFIDListener()
}

// Iniciar modo guiado
async function startGuidedMode() {
  hideElement("welcomeScreen")
  showElement("gameScreen", "slide-in")
  gameActive = true

  playSound("successSound")
  await loadNewChallenge()
}

// Cargar nuevo desafío
async function loadNewChallenge() {
  try {
    showLoading(true)

    // Obtener figura aleatoria
    const figura = await getRandomFigura()
    currentTarget = figura

    // Actualizar interfaz
    updateTargetDisplay(figura)
    updateSearchMessage(figura.nombre)
    resetResultDisplay()
    hideElement("nextButton")

    showLoading(false)
    showFeedback(`¡Busca el ${figura.nombre.toUpperCase()}!`, "info")
  } catch (error) {
    console.error("Error cargando desafío:", error)
    showFeedback("Error cargando desafío. Intenta de nuevo.", "error")
    showLoading(false)
  }
}

// Actualizar display del objetivo
function updateTargetDisplay(figura) {
  const targetIcon = document.getElementById("targetIcon")
  const targetName = document.getElementById("targetName")
  const targetDisplay = document.getElementById("targetDisplay")

  if (targetIcon) {
    targetIcon.textContent = getFiguraIcon(figura.nombre)
    targetIcon.style.color = getFiguraColor(figura.nombre)
  }

  if (targetName) {
    targetName.textContent = figura.nombre.toUpperCase()
    targetName.style.color = getFiguraColor(figura.nombre)
  }

  if (targetDisplay) {
    targetDisplay.style.borderColor = getFiguraColor(figura.nombre)
  }
}

// Actualizar mensaje de búsqueda
function updateSearchMessage(figuraNombre) {
  const searchMessage = document.getElementById("searchMessage")
  if (searchMessage) {
    searchMessage.innerHTML = `
            <span class="sound-wave"></span>
            ¡Encuentra el ${figuraNombre.toUpperCase()} y acércalo al lector!
            <span class="sound-wave"></span>
        `
  }
}

// Resetear display de resultado
function resetResultDisplay() {
  const resultIcon = document.getElementById("resultIcon")
  const resultDisplay = document.getElementById("resultDisplay")

  if (resultIcon) {
    resultIcon.textContent = "❓"
    resultIcon.style.color = "#ccc"
  }

  if (resultDisplay) {
    resultDisplay.style.borderColor = "#ddd"
    resultDisplay.classList.remove("success", "error")
  }
}

// Configurar listener para RFID
function setupRFIDListener() {
  document.addEventListener("rfidDetected", handleRFIDDetection)

  // Para testing - simular RFID con teclas
  if (window.location.hostname === "localhost") {
    document.addEventListener("keydown", (e) => {
      if (gameActive && e.key === " ") {
        // Espacio para simular
        const simulation = simulateRFID()
        handleRFIDDetection({ detail: { codigo_rfid: simulation.codigo_rfid } })
      }
    })
  }
}

// Manejar detección RFID
async function handleRFIDDetection(event) {
  if (!gameActive || !currentTarget) return

  const codigo_rfid = event.detail.codigo_rfid
  console.log("RFID detectado en modo guiado:", codigo_rfid)

  try {
    totalAttempts++

    // Mostrar que se está verificando
    updateResultDisplay("🔍", "Verificando...", "#ffa500")
    showFeedback("Verificando figura...", "info", 1000)

    // Procesar RFID
    const result = await processRFIDReading(codigo_rfid, "guiado", currentTarget.nombre)

    if (result.success) {
      const figura = result.figura
      const isCorrect = result.resultado === "correcto"

      // Actualizar display de resultado
      updateResultDisplay(getFiguraIcon(figura.nombre), figura.nombre.toUpperCase(), getFiguraColor(figura.nombre))

      if (isCorrect) {
        correctAnswers++

        // Retroalimentación positiva
        showFeedback("¡CORRECTO! ¡Muy bien!", "success", 3000)
        playSound("successSound")
        vibrate([100, 50, 100, 50, 100])

        // Animación de éxito
        const resultDisplay = document.getElementById("resultDisplay")
        if (resultDisplay) {
          resultDisplay.classList.add("success")
        }

        // Mostrar botón de siguiente
        showElement("nextButton")

        // Notificación visual
        showVisualNotification("¡CORRECTO!", "success")
      } else {
        // Retroalimentación de error
        showFeedback(`No es correcto. Es un ${figura.nombre.toUpperCase()}. ¡Intenta de nuevo!`, "error", 4000)
        playSound("errorSound")
        vibrate([200, 100, 200])

        // Animación de error
        const resultDisplay = document.getElementById("resultDisplay")
        if (resultDisplay) {
          resultDisplay.classList.add("error")
          setTimeout(() => {
            resultDisplay.classList.remove("error")
            resetResultDisplay()
          }, 2000)
        }

        // Notificación visual
        showVisualNotification("¡Intenta de nuevo!", "error")
      }
    } else {
      showFeedback("Figura no reconocida. Intenta de nuevo.", "error")
      updateResultDisplay("❌", "No reconocida", "#ff6b6b")
    }
  } catch (error) {
    console.error("Error procesando RFID:", error)
    showFeedback("Error verificando figura. Intenta de nuevo.", "error")
    updateResultDisplay("❌", "Error", "#ff6b6b")
  }
}

// Actualizar display de resultado
function updateResultDisplay(icon, name, color) {
  const resultIcon = document.getElementById("resultIcon")
  const resultDisplay = document.getElementById("resultDisplay")

  if (resultIcon) {
    resultIcon.textContent = icon
    resultIcon.style.color = color
  }

  if (resultDisplay) {
    resultDisplay.style.borderColor = color
  }
}

// Siguiente desafío
async function nextChallenge() {
  hideElement("nextButton")
  await loadNewChallenge()
}

// Función para volver (override de game-common.js)
function goBack() {
  gameActive = false
  window.location.href = "/dashboard"
}

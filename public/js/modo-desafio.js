// Modo Desafío - Secuencia de figuras

let gameActive = false
let challengeSequence = []
let currentStep = 0
const totalSteps = 5
let correctAnswers = 0

// Inicializar modo desafío
function initModoDesafio() {
  console.log("Inicializando Modo Desafío")
  setupRFIDListener()
}

// Iniciar modo desafío
async function startChallengeMode() {
  hideElement("welcomeScreen")
  showElement("gameScreen", "slide-in")
  gameActive = true

  playSound("successSound")
  await generateChallengeSequence()
  await loadCurrentStep()
}

// Generar secuencia de desafío
async function generateChallengeSequence() {
  try {
    challengeSequence = []

    for (let i = 0; i < totalSteps; i++) {
      const figura = await getRandomFigura()
      challengeSequence.push(figura)
    }

    currentStep = 0
    correctAnswers = 0

    console.log("Secuencia generada:", challengeSequence)
  } catch (error) {
    console.error("Error generando secuencia:", error)
    showFeedback("Error generando desafío. Intenta de nuevo.", "error")
  }
}

// Cargar paso actual
async function loadCurrentStep() {
  if (currentStep >= challengeSequence.length) {
    completeChallenge()
    return
  }

  const currentFigura = challengeSequence[currentStep]

  // Actualizar interfaz
  updateStepInfo()
  updateTargetDisplay(currentFigura)
  updateSearchMessage(currentFigura.nombre)
  resetResultDisplay()
  hideElement("nextButton")
  hideElement("finishButton")

  showFeedback(`Paso ${currentStep + 1}: ¡Busca el ${currentFigura.nombre.toUpperCase()}!`, "info")
}

// Actualizar información del paso
function updateStepInfo() {
  const currentStepElement = document.getElementById("currentStep")
  const totalStepsElement = document.getElementById("totalSteps")
  const progressFill = document.getElementById("progressFill")

  if (currentStepElement) {
    currentStepElement.textContent = currentStep + 1
  }

  if (totalStepsElement) {
    totalStepsElement.textContent = totalSteps
  }

  if (progressFill) {
    const progress = (currentStep / totalSteps) * 100
    progressFill.style.width = `${progress}%`
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
            ¡Encuentra el ${figuraNombre.toUpperCase()}!
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

  // Para testing
  if (window.location.hostname === "localhost") {
    document.addEventListener("keydown", (e) => {
      if (gameActive && e.key === "Enter") {
        const simulation = simulateRFID()
        handleRFIDDetection({ detail: { codigo_rfid: simulation.codigo_rfid } })
      }
    })
  }
}

// Manejar detección RFID
async function handleRFIDDetection(event) {
  if (!gameActive || currentStep >= challengeSequence.length) return

  const codigo_rfid = event.detail.codigo_rfid
  const currentTarget = challengeSequence[currentStep]

  console.log("RFID detectado en modo desafío:", codigo_rfid)

  try {
    // Mostrar que se está verificando
    updateResultDisplay("🔍", "Verificando...", "#ffa500")
    showFeedback("Verificando figura...", "info", 1000)

    // Procesar RFID
    const result = await processRFIDReading(codigo_rfid, "desafio", currentTarget.nombre)

    if (result.success) {
      const figura = result.figura
      const isCorrect = result.resultado === "correcto"

      // Actualizar display de resultado
      updateResultDisplay(getFiguraIcon(figura.nombre), figura.nombre.toUpperCase(), getFiguraColor(figura.nombre))

      if (isCorrect) {
        correctAnswers++

        // Retroalimentación positiva
        showFeedback("¡CORRECTO! ¡Excelente!", "success", 3000)
        playSound("successSound")
        vibrate([100, 50, 100, 50, 100])

        // Animación de éxito
        const resultDisplay = document.getElementById("resultDisplay")
        if (resultDisplay) {
          resultDisplay.classList.add("success")
        }

        // Verificar si es el último paso
        if (currentStep === totalSteps - 1) {
          showElement("finishButton")
        } else {
          showElement("nextButton")
        }

        // Notificación visual
        if (typeof showVisualNotification === "function") {
          showVisualNotification("¡CORRECTO!", "success")
        }
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
        if (typeof showVisualNotification === "function") {
          showVisualNotification("¡Intenta de nuevo!", "error")
        }
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

// Siguiente paso
async function nextStep() {
  currentStep++
  hideElement("nextButton")

  // Actualizar progreso
  updateStepInfo()

  // Cargar siguiente paso
  await loadCurrentStep()
}

// Completar desafío
function completeChallenge() {
  currentStep = totalSteps

  // Actualizar progreso al 100%
  const progressFill = document.getElementById("progressFill")
  if (progressFill) {
    progressFill.style.width = "100%"
  }

  // Mostrar pantalla de completado
  hideElement("gameScreen")
  showElement("completionScreen", "bounce-in")

  // Efectos de celebración
  playSound("completionSound")
  vibrate([100, 50, 100, 50, 100, 50, 200])

  // Mostrar estadísticas
  setTimeout(() => {
    showVisualNotification(`¡${correctAnswers}/${totalSteps} correctas!`, "success")
  }, 1000)
}

// Finalizar desafío
function finishChallenge() {
  completeChallenge()
}

// Reiniciar desafío
async function restartChallenge() {
  hideElement("completionScreen")
  showElement("gameScreen", "slide-in")

  await generateChallengeSequence()
  await loadCurrentStep()
}

// Función para volver (override de game-common.js)
function goBack() {
  gameActive = false
  window.location.href = "/dashboard"
}

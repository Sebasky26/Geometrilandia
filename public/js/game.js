// Geometrilandia - Funciones del juego
// Manejo de los diferentes modos de juego y comunicación con hardware

class GameManager {
  constructor() {
    this.currentMode = null
    this.gameState = {
      figuraObjetivo: null,
      secuenciaDesafio: [],
      indiceDesafio: 0,
      tiempoInicio: null,
    }

    this.initializeEventListeners()
    this.loadGameData()
  }

  // Inicializar event listeners
  initializeEventListeners() {
    // Botones de modo de juego
    const modeButtons = document.querySelectorAll(".game-mode-card")
    modeButtons.forEach((button) => {
      button.addEventListener("click", this.handleModeSelection.bind(this))
    })

    // Botones de acción en juegos
    const actionButtons = document.querySelectorAll(".game-action-btn")
    actionButtons.forEach((button) => {
      button.addEventListener("click", this.handleGameAction.bind(this))
    })

    // Simulador RFID para desarrollo
    const rfidSimulator = document.getElementById("rfidSimulator")
    if (rfidSimulator) {
      rfidSimulator.addEventListener("change", this.simulateRFIDRead.bind(this))
    }

    // Botón de volver al dashboard
    const backButtons = document.querySelectorAll(".back-to-dashboard")
    backButtons.forEach((button) => {
      button.addEventListener("click", () => {
        window.location.href = "/dashboard"
      })
    })
  }

  // Cargar datos iniciales del juego
  async loadGameData() {
    try {
      // Cargar figuras disponibles
      const response = await fetch("/api/figuras")
      const result = await response.json()

      if (result.success) {
        this.figuras = result.figuras
        this.setupRFIDSimulator()
      }
    } catch (error) {
      console.error("Error cargando datos del juego:", error)
    }
  }

  // Configurar simulador RFID para desarrollo
  setupRFIDSimulator() {
    const simulator = document.getElementById("rfidSimulator")
    if (simulator && this.figuras) {
      simulator.innerHTML = '<option value="">Selecciona una figura...</option>'
      this.figuras.forEach((figura) => {
        const option = document.createElement("option")
        option.value = figura.codigo_rfid
        option.textContent = `${figura.nombre} (${figura.codigo_rfid})`
        simulator.appendChild(option)
      })
    }
  }

  // Manejar selección de modo de juego
  handleModeSelection(event) {
    const card = event.currentTarget
    const mode = card.dataset.mode

    if (mode) {
      window.location.href = `/modo-${mode}`
    }
  }

  // Manejar acciones del juego
  async handleGameAction(event) {
    const button = event.currentTarget
    const action = button.dataset.action

    this.setButtonLoading(button, true)

    try {
      switch (action) {
        case "start-guided":
          await this.startGuidedMode()
          break
        case "start-challenge":
          await this.startChallengeMode()
          break
        case "new-objective":
          await this.getNewObjective()
          break
        case "reset-game":
          this.resetGame()
          break
        default:
          console.warn("Acción no reconocida:", action)
      }
    } catch (error) {
      console.error("Error en acción del juego:", error)
      this.showAlert("Error procesando la acción. Intenta nuevamente.", "error")
    } finally {
      this.setButtonLoading(button, false)
    }
  }

  // Iniciar modo libre
  initializeFreeMode() {
    this.currentMode = "libre"
    this.updateGameStatus("Coloca cualquier figura en el lector para conocer más sobre ella", "waiting")
    this.showInstructions(
      "En el modo libre puedes explorar todas las figuras. ¡Coloca una figura y descubre sus características!",
    )
  }

  // Iniciar modo guiado
  async startGuidedMode() {
    this.currentMode = "guiado"

    try {
      const response = await fetch("/api/modo-guiado/objetivo")
      const result = await response.json()

      if (result.success) {
        this.gameState.figuraObjetivo = result.figura
        this.updateGameStatus(result.instruccion, "info")
        this.showFigureTarget(result.figura)
        this.gameState.tiempoInicio = Date.now()
      } else {
        this.showAlert("Error obteniendo figura objetivo", "error")
      }
    } catch (error) {
      console.error("Error iniciando modo guiado:", error)
      this.showAlert("Error de conexión", "error")
    }
  }

  // Obtener nueva figura objetivo
  async getNewObjective() {
    await this.startGuidedMode()
  }

  // Iniciar modo desafío
  async startChallengeMode() {
    this.currentMode = "desafio"

    try {
      const response = await fetch("/api/modo-desafio/iniciar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        this.gameState.secuenciaDesafio = result.secuencia
        this.gameState.indiceDesafio = 0
        this.updateGameStatus(result.instruccion, "info")
        this.showChallengeSequence(result.secuencia, result.progreso)
        this.gameState.tiempoInicio = Date.now()
      } else {
        this.showAlert("Error iniciando desafío", "error")
      }
    } catch (error) {
      console.error("Error iniciando modo desafío:", error)
      this.showAlert("Error de conexión", "error")
    }
  }

  // Simular lectura RFID (para desarrollo)
  async simulateRFIDRead(event) {
    const codigoRfid = event.target.value
    if (codigoRfid) {
      await this.processRFIDRead(codigoRfid)
      // Limpiar selector después de un momento
      setTimeout(() => {
        event.target.value = ""
      }, 1000)
    }
  }

  // Procesar lectura RFID
  async processRFIDRead(codigoRfid) {
    if (!this.currentMode) {
      this.showAlert("Selecciona un modo de juego primero", "warning")
      return
    }

    const tiempoRespuesta = this.gameState.tiempoInicio ? Date.now() - this.gameState.tiempoInicio : 0

    try {
      let endpoint
      const method = "POST"
      const body = { codigoRfid }

      switch (this.currentMode) {
        case "libre":
          endpoint = "/api/modo-libre"
          break
        case "guiado":
          endpoint = "/api/modo-guiado"
          break
        case "desafio":
          endpoint = "/api/modo-desafio"
          break
        default:
          throw new Error("Modo de juego no válido")
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (result.success) {
        this.handleGameResponse(result)
      } else {
        this.showAlert(result.message, "error")
      }
    } catch (error) {
      console.error("Error procesando RFID:", error)
      this.showAlert("Error de conexión", "error")
    }
  }

  // Manejar respuesta del juego
  handleGameResponse(result) {
    switch (this.currentMode) {
      case "libre":
        this.handleFreeMode(result)
        break
      case "guiado":
        this.handleGuidedMode(result)
        break
      case "desafio":
        this.handleChallengeMode(result)
        break
    }
  }

  // Manejar modo libre
  handleFreeMode(result) {
    this.updateGameStatus(result.mensaje, "success")
    this.showFigureInfo(result.figura)
    this.playSuccessSound()
  }

  // Manejar modo guiado
  handleGuidedMode(result) {
    if (result.correcto) {
      this.updateGameStatus(result.mensaje, "success")
      this.playSuccessSound()

      if (result.completado) {
        this.showCompletionMessage("¡Excelente trabajo!")
        setTimeout(() => {
          this.resetGame()
        }, 3000)
      }
    } else {
      this.updateGameStatus(result.mensaje, "error")
      this.playErrorSound()
    }
  }

  // Manejar modo desafío
  handleChallengeMode(result) {
    if (result.correcto) {
      this.updateGameStatus(result.mensaje, "success")
      this.playSuccessSound()

      if (result.completado) {
        this.showCompletionMessage("¡Desafío completado! ¡Eres increíble!")
        this.showCelebration()
        setTimeout(() => {
          this.resetGame()
        }, 5000)
      } else {
        // Actualizar progreso
        this.updateChallengeProgress(result.progreso)
        this.highlightCurrentFigure(result.progreso.actual - 1)
      }
    } else {
      this.updateGameStatus(result.mensaje, "error")
      this.playErrorSound()
    }
  }

  // Actualizar estado del juego
  updateGameStatus(message, type) {
    const statusElement = document.getElementById("gameStatus")
    if (statusElement) {
      statusElement.textContent = message
      statusElement.className = `game-status ${type}`

      // Añadir animación
      statusElement.classList.add("fade-in")
      setTimeout(() => {
        statusElement.classList.remove("fade-in")
      }, 500)
    }
  }

  // Mostrar información de figura
  showFigureInfo(figura) {
    const infoContainer = document.getElementById("figureInfo")
    if (infoContainer) {
      infoContainer.innerHTML = `
        <div class="figure-display">
          <div class="figure-icon" style="color: ${this.getFigureColor(figura.color)}">
            ${this.getFigureIcon(figura.nombre)}
          </div>
          <h3>${figura.nombre}</h3>
          <p>${figura.descripcion}</p>
        </div>
      `
      infoContainer.classList.add("fade-in")
    }
  }

  // Mostrar figura objetivo
  showFigureTarget(figura) {
    const targetContainer = document.getElementById("figureTarget")
    if (targetContainer) {
      targetContainer.innerHTML = `
        <div class="figure-target">
          <h3>Busca esta figura:</h3>
          <div class="figure-display pulse">
            <div class="figure-icon" style="color: ${this.getFigureColor(figura.color)}">
              ${this.getFigureIcon(figura.nombre)}
            </div>
            <h4>${figura.nombre}</h4>
          </div>
        </div>
      `
    }
  }

  // Mostrar secuencia de desafío
  showChallengeSequence(secuencia, progreso) {
    const sequenceContainer = document.getElementById("challengeSequence")
    if (sequenceContainer) {
      const sequenceHTML = secuencia
        .map((figura, index) => {
          let status = "pending"
          if (index < progreso.actual - 1) status = "completed"
          else if (index === progreso.actual - 1) status = "current"

          return `
          <div class="figure-item ${status}">
            <div class="figure-icon" style="color: ${this.getFigureColor(figura.color)}">
              ${this.getFigureIcon(figura.nombre)}
            </div>
            <div class="figure-name">${figura.nombre}</div>
          </div>
        `
        })
        .join("")

      sequenceContainer.innerHTML = `
        <h3>Secuencia del desafío:</h3>
        <div class="figure-sequence">
          ${sequenceHTML}
        </div>
      `
    }

    this.updateChallengeProgress(progreso)
  }

  // Actualizar progreso del desafío
  updateChallengeProgress(progreso) {
    const progressContainer = document.getElementById("challengeProgress")
    if (progressContainer) {
      const steps = []
      for (let i = 1; i <= progreso.total; i++) {
        let status = "pending"
        if (i < progreso.actual) status = "completed"
        else if (i === progreso.actual) status = "current"

        steps.push(`<div class="progress-step ${status}">${i}</div>`)

        if (i < progreso.total) {
          const connectorStatus = i < progreso.actual ? "completed" : ""
          steps.push(`<div class="progress-connector ${connectorStatus}"></div>`)
        }
      }

      progressContainer.innerHTML = `
        <div class="challenge-progress">
          ${steps.join("")}
        </div>
        <p>Progreso: ${progreso.actual} de ${progreso.total}</p>
      `
    }
  }

  // Resaltar figura actual en desafío
  highlightCurrentFigure(index) {
    const figureItems = document.querySelectorAll(".figure-item")
    figureItems.forEach((item, i) => {
      item.classList.remove("current", "completed")
      if (i < index) {
        item.classList.add("completed")
      } else if (i === index) {
        item.classList.add("current")
      }
    })
  }

  // Mostrar instrucciones
  showInstructions(text) {
    const instructionsElement = document.getElementById("gameInstructions")
    if (instructionsElement) {
      instructionsElement.textContent = text
      instructionsElement.classList.add("fade-in")
    }
  }

  // Mostrar mensaje de completación
  showCompletionMessage(message) {
    const completionDiv = document.createElement("div")
    completionDiv.className = "completion-message"
    completionDiv.innerHTML = `
      <div class="completion-content">
        <div class="completion-icon">🎉</div>
        <h2>${message}</h2>
        <p>¡Sigue practicando para ser un experto en geometría!</p>
      </div>
    `

    document.body.appendChild(completionDiv)

    setTimeout(() => {
      completionDiv.remove()
    }, 4000)
  }

  // Mostrar celebración
  showCelebration() {
    // Crear efecto de confeti simple
    const celebration = document.createElement("div")
    celebration.className = "celebration-overlay"
    celebration.innerHTML = `
      <div class="confetti">🎊</div>
      <div class="confetti">🎉</div>
      <div class="confetti">⭐</div>
      <div class="confetti">🌟</div>
    `

    document.body.appendChild(celebration)

    setTimeout(() => {
      celebration.remove()
    }, 3000)
  }

  // Resetear juego
  resetGame() {
    this.currentMode = null
    this.gameState = {
      figuraObjetivo: null,
      secuenciaDesafio: [],
      indiceDesafio: 0,
      tiempoInicio: null,
    }

    // Limpiar elementos de la interfaz
    const elementsToReset = ["gameStatus", "figureInfo", "figureTarget", "challengeSequence", "challengeProgress"]

    elementsToReset.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        element.innerHTML = ""
      }
    })

    // Mostrar estado inicial según la página
    const currentPath = window.location.pathname
    if (currentPath.includes("modo-libre")) {
      this.initializeFreeMode()
    }
  }

  // Obtener icono de figura
  getFigureIcon(nombre) {
    const icons = {
      Cubo: "🟦",
      Esfera: "🔵",
      Pirámide: "🔺",
      Cilindro: "🥫",
      Cono: "🍦",
      Prisma: "📐",
    }
    return icons[nombre] || "📦"
  }

  // Obtener color de figura
  getFigureColor(color) {
    const colors = {
      rojo: "#FF6B6B",
      azul: "#4DABF7",
      verde: "#4ECDC4",
      amarillo: "#FFE66D",
      naranja: "#FF8E53",
      morado: "#9775FA",
    }
    return colors[color] || "#6B73FF"
  }

  // Reproducir sonido de éxito
  playSuccessSound() {
    // Implementar sonido de éxito (opcional)
    console.log("🔊 Sonido de éxito")
  }

  // Reproducir sonido de error
  playErrorSound() {
    // Implementar sonido de error (opcional)
    console.log("🔊 Sonido de error")
  }

  // Establecer estado de carga en botón
  setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.disabled = true
      button.dataset.originalText = button.textContent
      button.textContent = "Procesando..."
    } else {
      button.disabled = false
      button.textContent = button.dataset.originalText || button.textContent
    }
  }

  // Mostrar alerta
  showAlert(message, type = "info") {
    const alertDiv = document.createElement("div")
    alertDiv.className = `alert alert-${type} fade-in`
    alertDiv.textContent = message

    const container = document.querySelector(".game-content") || document.querySelector(".container")
    if (container) {
      container.insertBefore(alertDiv, container.firstChild)
    }

    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove()
      }
    }, 5000)
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.gameManager = new GameManager()

  // Inicializar modo específico según la página
  const currentPath = window.location.pathname
  if (currentPath.includes("modo-libre")) {
    window.gameManager.initializeFreeMode()
  }
})

// Funciones globales para uso en HTML
window.GeometriaGame = {
  // Simular lectura RFID desde HTML
  simulateRFID: (codigo) => {
    if (window.gameManager) {
      window.gameManager.processRFIDRead(codigo)
    }
  },

  // Cambiar modo de juego
  setMode: (mode) => {
    if (window.gameManager) {
      window.gameManager.currentMode = mode
    }
  },
}

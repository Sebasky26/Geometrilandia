// Funciones comunes para todos los modos de juego

// Mapeo de figuras a íconos
const FIGURA_ICONS = {
  cubo: "🔷",
  esfera: "🔵",
  piramide: "🔺",
  cilindro: "🥫",
  cono: "🍦",
  prisma: "📦",
}

// Mapeo de figuras a colores
const FIGURA_COLORS = {
  cubo: "#3498db",
  esfera: "#e74c3c",
  piramide: "#f39c12",
  cilindro: "#2ecc71",
  cono: "#9b59b6",
  prisma: "#1abc9c",
}

// Obtener ícono de figura
function getFiguraIcon(figura) {
  return FIGURA_ICONS[figura] || "❓"
}

// Obtener color de figura
function getFiguraColor(figura) {
  return FIGURA_COLORS[figura] || "#667eea"
}

// Reproducir sonido
function playSound(soundId) {
  try {
    const audio = document.getElementById(soundId)
    if (audio) {
      audio.currentTime = 0
      audio.play().catch((e) => console.log("No se pudo reproducir el sonido:", e))
    }
  } catch (error) {
    console.log("Error reproduciendo sonido:", error)
  }
}

// Mostrar elemento con animación
function showElement(elementId, animationClass = "bounce-in") {
  const element = document.getElementById(elementId)
  if (element) {
    element.classList.remove("hidden")
    element.classList.add("show", animationClass)
  }
}

// Ocultar elemento
function hideElement(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    element.classList.add("hidden")
    element.classList.remove("show")
  }
}

// Mostrar mensaje de retroalimentación
function showFeedback(message, type = "info", duration = 3000) {
  const feedbackElement = document.getElementById("feedbackMessage")
  if (feedbackElement) {
    feedbackElement.textContent = message
    feedbackElement.className = `feedback-message feedback-${type} show`

    setTimeout(() => {
      feedbackElement.classList.add("hidden")
      feedbackElement.classList.remove("show")
    }, duration)
  }
}

// Mostrar loading
function showLoading(show = true) {
  const loadingElement = document.getElementById("loadingIndicator")
  if (loadingElement) {
    if (show) {
      loadingElement.classList.remove("hidden")
    } else {
      loadingElement.classList.add("hidden")
    }
  }
}

// Simular lectura RFID (para desarrollo/testing)
function simulateRFID() {
  const figuras = ["cubo", "esfera", "piramide", "cilindro", "cono", "prisma"]
  const randomFigura = figuras[Math.floor(Math.random() * figuras.length)]
  const codigo_rfid = `RFID_${randomFigura.toUpperCase()}_00${Math.floor(Math.random() * 6) + 1}`

  return {
    codigo_rfid: codigo_rfid,
    figura: randomFigura,
  }
}

// Procesar lectura RFID
async function processRFIDReading(codigo_rfid, modo, figura_esperada = null) {
  try {
    showLoading(true)
    playSound("detectSound")

    const data = {
      codigo_rfid: codigo_rfid,
      modo: modo,
    }

    if (figura_esperada) {
      data.figura_esperada = figura_esperada
    }

    const response = await fetch("/api/rfid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    showLoading(false)

    if (result.success) {
      return result
    } else {
      throw new Error(result.message || "Error procesando RFID")
    }
  } catch (error) {
    showLoading(false)
    console.error("Error procesando RFID:", error)
    throw error
  }
}

// Obtener figura aleatoria
async function getRandomFigura() {
  try {
    const response = await fetch("/api/figura-aleatoria")
    const result = await response.json()

    if (result.success) {
      return result.figura
    } else {
      throw new Error(result.message || "Error obteniendo figura")
    }
  } catch (error) {
    console.error("Error obteniendo figura aleatoria:", error)
    throw error
  }
}

// Volver al dashboard
function goBack() {
  window.location.href = "/dashboard"
}

// Agregar listener para teclas (para testing)
document.addEventListener("keydown", (e) => {
  // Solo en modo desarrollo - simular RFID con teclas específicas
  const teclasPermitidas = ["q", "t", "e", "r", "t", "y"];
  const figuras = ["cubo", "esfera", "piramide", "cilindro", "cono", "prisma"];
  const index = teclasPermitidas.indexOf(e.key.toLowerCase());

  if (e.ctrlKey && index !== -1) {
    const figura = figuras[index];
    const codigo_rfid = `RFID_${figura.toUpperCase()}_00${index + 1}`;

    // Disparar evento personalizado para simular RFID
    const event = new CustomEvent("rfidDetected", {
      detail: { codigo_rfid: codigo_rfid },
    });
    document.dispatchEvent(event);
  }
});


// Función para vibrar (si está disponible)
function vibrate(pattern = [100]) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

// Función para mostrar notificación visual
function showVisualNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `visual-notification ${type}`
  notification.textContent = message
  notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === "success" ? "#00b894" : "#d63031"};
        color: white;
        padding: 2rem;
        border-radius: 20px;
        font-size: 2rem;
        font-weight: bold;
        z-index: 10000;
        animation: fadeInOut 2s ease-in-out;
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    document.body.removeChild(notification)
  }, 2000)
}
function playSound(id) {
  const audio = document.getElementById(id);
  if (audio) audio.play();
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function showFeedback(text, type, timeout = 2000) {
  const el = document.getElementById("feedbackMessage");
  if (!el) return;
  el.textContent = text;
  el.className = `feedback-message feedback-${type}`;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), timeout);
}

function showVisualNotification(msg, type) {
  console.log(`[VISUAL: ${type}] ${msg}`); // o animación extra
}


// Agregar estilos CSS para notificaciones
const style = document.createElement("style")
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    }
`
document.head.appendChild(style)

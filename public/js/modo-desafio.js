const figuras = [
  {
    nombre: "TRIANGULO NARANJA",
    src: "/img/triangulo_naranja.png",
    color: "#fb8c00",
  },
  { nombre: "CIRCULO VERDE", src: "/img/circulo_verde.png", color: "#43a047" },
  {
    nombre: "ESTRELLA CELESTE",
    src: "/img/estrella_celeste.png",
    color: "#4fc3f7",
  },
  {
    nombre: "CUADRADO ROSADO",
    src: "/img/cuadrado_rosado.png",
    color: "#f06292",
  },
  { nombre: "CIRCULO AZUL", src: "/img/circulo_azul.png", color: "#1e88e5" },
  {
    nombre: "TRIANGULO MORADO",
    src: "/img/triangulo_morado.png",
    color: "#8e24aa",
  },
  {
    nombre: "CUADRADO NARANJA",
    src: "/img/cuadrado_naranja.png",
    color: "#ffa726",
  },
];

// Estado del juego
let gameState = {
  vidas: 3,
  aciertos: 0,
  figuraActual: null,
  juegoActivo: true,
  socket: null,
  tiempoInicio: null,
};

// Función para obtener figura aleatoria
function getFiguraAleatoria() {
  const indiceAleatorio = Math.floor(Math.random() * figuras.length);
  return figuras[indiceAleatorio];
}

// Función para mostrar nueva figura
function mostrarNuevaFigura() {
  if (!gameState.juegoActivo) return;

  gameState.figuraActual = getFiguraAleatoria();
  const display = document.getElementById("figuraDisplay");
  display.innerHTML = `
    <img src="${gameState.figuraActual.src}" class="figura-img" alt="${gameState.figuraActual.nombre}" />
  `;

  // Actualizar texto de instrucción
  const instructionText = document.querySelector(".instruction-text");
  instructionText.textContent = `¡Encuentra: ${gameState.figuraActual.nombre}!`;

  console.log(`🎯 Nueva figura a encontrar: ${gameState.figuraActual.nombre}`);
}

// Función para actualizar vidas en la UI
function actualizarVidas() {
  const vidasContainer = document.getElementById("vidasContainer");
  if (!vidasContainer) {
    // Crear contenedor de vidas si no existe
    const topBar = document.querySelector(".top-bar");
    const vidasDiv = document.createElement("div");
    vidasDiv.id = "vidasContainer";
    vidasDiv.className = "vidas";
    vidasDiv.innerHTML = "❤️❤️❤️";
    topBar.appendChild(vidasDiv);
  } else {
    // Actualizar vidas existentes
    vidasContainer.innerHTML = "❤️".repeat(gameState.vidas);
  }
}

// Función para actualizar estrellas
function actualizarEstrellas() {
  const stars = document.querySelectorAll(".star");
  stars.forEach((star, index) => {
    if (index < gameState.aciertos) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

// Función para actualizar barra de progreso
function actualizarProgreso() {
  const progress = document.getElementById("progressBar");
  const percent = (gameState.aciertos / 5) * 100;
  progress.style.width = percent + "%";
}

// Función para procesar respuesta correcta
function respuestaCorrecta() {
  gameState.aciertos++;
  console.log(`✅ ¡Correcto! Aciertos: ${gameState.aciertos}/5`);

  // Mostrar feedback positivo
  mostrarFeedback("¡Correcto! 🎉", "success");

  actualizarEstrellas();
  actualizarProgreso();

  // Verificar si ganó
  if (gameState.aciertos >= 5) {
    setTimeout(() => {
      mostrarPantallaVictoria();
    }, 1500);
  } else {
    // Mostrar siguiente figura después de un delay
    setTimeout(() => {
      mostrarNuevaFigura();
    }, 2000);
  }
}

// Función para procesar respuesta incorrecta
function respuestaIncorrecta(figuraDetectada) {
  gameState.vidas--;
  console.log(`❌ Incorrecto. Vidas restantes: ${gameState.vidas}`);

  // Mostrar feedback negativo
  mostrarFeedback(`Incorrecto 😞<br>Era: ${figuraDetectada}`, "error");

  actualizarVidas();

  // Verificar si perdió
  if (gameState.vidas <= 0) {
    setTimeout(() => {
      mostrarPantallaDerrota();
    }, 1500);
  } else {
    // Mostrar la misma figura después de un delay
    setTimeout(() => {
      const instructionText = document.querySelector(".instruction-text");
      instructionText.textContent = `¡Encuentra: ${gameState.figuraActual.nombre}!`;
    }, 2000);
  }
}

// Función para mostrar feedback temporal
function mostrarFeedback(mensaje, tipo) {
  // Remover feedback anterior si existe
  const feedbackAnterior = document.querySelector(".feedback-temporal");
  if (feedbackAnterior) {
    feedbackAnterior.remove();
  }

  const feedback = document.createElement("div");
  feedback.className = `feedback-temporal ${tipo}`;
  feedback.innerHTML = mensaje;

  const gameArea = document.querySelector(".game-area");
  gameArea.appendChild(feedback);

  // Remover después de 2 segundos
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.remove();
    }
  }, 2000);
}

// Función para mostrar pantalla de victoria
function mostrarPantallaVictoria() {
  gameState.juegoActivo = false;

  // Guardar resultado
  guardarResultadoFinal();

  const gameArea = document.querySelector(".game-area");
  gameArea.innerHTML = `
    <div class="content-box resultado-box victoria">
      <h2 class="resultado-titulo">¡FELICIDADES! 🎉</h2>
      <p class="resultado-texto">¡Has completado el desafío!</p>
      <div class="resultado-stats">
        <div class="stat-item">
          <span class="stat-label">Estrellas obtenidas:</span>
          <span class="stat-value">⭐⭐⭐⭐⭐</span>
        </div>
      </div>
      <div class="resultado-botones">
        <button class="btn-reiniciar" onclick="reiniciarJuego()">🔄 Jugar de nuevo</button>
        <button class="btn-menu" onclick="volverAlMenu()">🏠 Menú principal</button>
      </div>
    </div>
  `;
}

// Función para mostrar pantalla de derrota
function mostrarPantallaDerrota() {
  gameState.juegoActivo = false;

  // Guardar resultado
  guardarResultadoFinal();

  const gameArea = document.querySelector(".game-area");
  gameArea.innerHTML = `
    <div class="content-box resultado-box derrota">
      <h2 class="resultado-titulo">¡Inténtalo de nuevo! 😊</h2>
      <p class="resultado-texto">Te quedaste sin vidas, pero puedes intentarlo otra vez</p>
      <div class="resultado-stats">
        <div class="stat-item">
          <span class="stat-label">Estrellas obtenidas:</span>
          <span class="stat-value">${"⭐".repeat(
            gameState.aciertos
          )}${"☆".repeat(5 - gameState.aciertos)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Progreso:</span>
          <span class="stat-value">${gameState.aciertos}/5</span>
        </div>
      </div>
      <div class="resultado-botones">
        <button class="btn-reiniciar" onclick="reiniciarJuego()">🔄 Intentar de nuevo</button>
        <button class="btn-menu" onclick="volverAlMenu()">🏠 Menú principal</button>
      </div>
    </div>
  `;
}

// Función para reiniciar el juego
function reiniciarJuego() {
  gameState = {
    vidas: 3,
    aciertos: 0,
    figuraActual: null,
    juegoActivo: true,
    socket: gameState.socket,
    tiempoInicio: Date.now(),
  };

  // Restaurar HTML original del área de juego
  const gameArea = document.querySelector(".game-area");
  gameArea.innerHTML = `
    <div class="content-box">
      <p class="instruction-text">¡Encuentra las figuras!</p>
      <div class="figura-display" id="figuraDisplay">
        <!-- Las figuras se insertarán dinámicamente -->
      </div>
    </div>
  `;

  // Reiniciar UI
  actualizarVidas();
  actualizarEstrellas();
  actualizarProgreso();

  // Mostrar primera figura
  mostrarNuevaFigura();

  console.log("🔄 Juego reiniciado");
}

// Función para volver al menú
function volverAlMenu() {
  window.location.href = "/dashboard";
}

// Función para procesar lectura RFID
function procesarLecturaRFID(figuraDetectada) {
  if (!gameState.juegoActivo || !gameState.figuraActual) return;

  console.log(`📡 RFID detectado: ${figuraDetectada}`);
  console.log(`🎯 Figura esperada: ${gameState.figuraActual.nombre}`);

  // Enviar datos al backend para validación
  enviarDatosBackend(figuraDetectada);
}

// Función para enviar datos al backend
async function enviarDatosBackend(figuraDetectada) {
  try {
    const response = await fetch("/api/figura/rfid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codigo_rfid: figuraDetectada, // En tu caso real, esto sería el código RFID
        modo: "desafio",
        figura_esperada: gameState.figuraActual.nombre,
        vidas_restantes: gameState.vidas,
        aciertos_actuales: gameState.aciertos,
      }),
    });

    const data = await response.json();

    if (data.success) {
      if (data.resultado === "correcto") {
        respuestaCorrecta();
      } else {
        respuestaIncorrecta(data.figura.nombre);
      }

      // Manejar estado del juego según respuesta del backend
      if (data.gameStatus === "victoria") {
        setTimeout(() => {
          mostrarPantallaVictoria();
        }, 1500);
      } else if (data.gameStatus === "game_over") {
        setTimeout(() => {
          mostrarPantallaDerrota();
        }, 1500);
      }
    }
  } catch (error) {
    console.error("Error enviando datos al backend:", error);
    // Fallback: procesar localmente
    if (figuraDetectada === gameState.figuraActual.nombre) {
      respuestaCorrecta();
    } else {
      respuestaIncorrecta(figuraDetectada);
    }
  }
}

// Función para guardar resultado final
async function guardarResultadoFinal() {
  try {
    const tiempoTotal = Math.floor(
      (Date.now() - gameState.tiempoInicio) / 1000
    );

    await fetch("/api/desafio/resultado", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aciertos: gameState.aciertos,
        tiempo_jugado: tiempoTotal,
        completado: gameState.aciertos >= 5,
      }),
    });
  } catch (error) {
    console.error("Error guardando resultado:", error);
  }
}

// Función para conectar WebSocket
function conectarWebSocket() {
  if (typeof io !== "undefined") {
    gameState.socket = io();

    gameState.socket.on("connect", () => {
      console.log("🔌 Conectado al servidor WebSocket");
    });

    gameState.socket.on("nuevaFigura", (figuraDetectada) => {
      procesarLecturaRFID(figuraDetectada);
    });

    gameState.socket.on("disconnect", () => {
      console.log("🔌 Desconectado del servidor WebSocket");
    });
  } else {
    console.warn("⚠️ Socket.IO no está disponible");
  }
}

// Inicialización cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎮 Iniciando modo desafío...");

  // Inicializar tiempo
  gameState.tiempoInicio = Date.now();

  // Inicializar UI
  actualizarVidas();
  actualizarEstrellas();
  actualizarProgreso();

  // Mostrar primera figura
  mostrarNuevaFigura();

  // Conectar WebSocket
  conectarWebSocket();

  // Agregar event listener para botón de volver
  const backButton = document.querySelector(".back-button");
  if (backButton) {
    backButton.onclick = volverAlMenu;
  }
});

// Función de prueba para simular lecturas RFID (solo para desarrollo)
function simularLectura() {
  if (!gameState.juegoActivo) return;

  // Simular lectura aleatoria (50% de probabilidad de ser correcta)
  const esCorrecta = Math.random() > 0.5;
  let figuraSimulada;

  if (esCorrecta) {
    figuraSimulada = gameState.figuraActual.nombre;
  } else {
    const figurasIncorrectas = figuras.filter(
      (f) => f.nombre !== gameState.figuraActual.nombre
    );
    figuraSimulada =
      figurasIncorrectas[Math.floor(Math.random() * figurasIncorrectas.length)]
        .nombre;
  }

  console.log(`🧪 Simulando lectura: ${figuraSimulada}`);
  procesarLecturaRFID(figuraSimulada);
}

// Agregar función de prueba al objeto global para depuración
window.simularLectura = simularLectura;
window.gameState = gameState;

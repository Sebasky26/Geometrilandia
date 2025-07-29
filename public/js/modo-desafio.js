const figuras = [
  { nombre: "ESTRELLA TURQUESA", src: "/img/estrella_turquesa.gif", color: "#40e0d0", forma: "estrella", colorTexto: "turquesa", genero: "la" },
  { nombre: "CUADRADO AZUL", src: "/img/cuadrado_azul.gif", color: "#1e88e5", forma: "cuadrado", colorTexto: "azul", genero: "el" },
  { nombre: "CUADRADO ROJO", src: "/img/cuadrado_rojo.gif", color: "#e53935", forma: "cuadrado", colorTexto: "rojo", genero: "el" },
  { nombre: "ESTRELLA AMARILLA", src: "/img/estrella_amarilla.gif", color: "#fdd835", forma: "estrella", colorTexto: "amarilla", genero: "la" },
  { nombre: "CORAZON VERDE", src: "/img/corazon_verde.gif", color: "#43a047", forma: "corazon", colorTexto: "verde", genero: "el" },
  { nombre: "CUADRADO AMARILLO", src: "/img/cuadrado_amarillo.gif", color: "#fbc02d", forma: "cuadrado", colorTexto: "amarillo", genero: "el" },
  { nombre: "ESTRELLA NARANJA", src: "/img/estrella_naranja.gif", color: "#fe970e", forma: "estrella", colorTexto: "naranja", genero: "la" },
  { nombre: "CIRCULO AMARILLO", src: "/img/circulo_amarillo.gif", color: "#fdd835", forma: "circulo", colorTexto: "amarillo", genero: "el" },
  { nombre: "CIRCULO TURQUESA", src: "/img/circulo_turquesa.gif", color: "#40e0d0", forma: "circulo", colorTexto: "turquesa", genero: "el" },
  { nombre: "RECTANGULO AZUL", src: "/img/rectangulo_azul.gif", color: "#1e88e5", forma: "rectangulo", colorTexto: "azul", genero: "el" },
  { nombre: "RECTANGULO VERDE", src: "/img/rectangulo_verde.gif", color: "#43a047", forma: "rectangulo", colorTexto: "verde", genero: "el" },
  { nombre: "CORAZON AZUL", src: "/img/corazon_azul.gif", color: "#1e88e5", forma: "corazon", colorTexto: "azul", genero: "el" },
  { nombre: "RECTANGULO TURQUESA", src: "/img/rectangulo_turquesa.gif", color: "#40e0d0", forma: "rectangulo", colorTexto: "turquesa", genero: "el" },
  { nombre: "CORAZON ROJO", src: "/img/corazon_rojo.gif", color: "#e53935", forma: "corazon", colorTexto: "rojo", genero: "el" },
  { nombre: "TRIANGULO VERDE", src: "/img/triangulo_verde.gif", color: "#43a047", forma: "triangulo", colorTexto: "verde", genero: "el" },
  { nombre: "TRIANGULO NARANJA", src: "/img/triangulo_naranja.gif", color: "#fe970e", forma: "triangulo", colorTexto: "naranja", genero: "el" },
  { nombre: "TRIANGULO ROJO", src: "/img/triangulo_rojo.gif", color: "#e53935", forma: "triangulo", colorTexto: "rojo", genero: "el" },
  { nombre: "CIRCULO NARANJA", src: "/img/circulo_naranja.gif", color: "#fe970e", forma: "circulo", colorTexto: "naranja", genero: "el" }
];

// Variables globales
let tiempoRestante = 15; // Tiempo en segundos
let intervaloTemporizador = null;
let juegoIniciado = false;
var figura_esperada;


let gameState = {
  vidas: 3,
  aciertos: 0,
  figurasMostradas: [],
  figuraObjetivo: null,
  juegoActivo: true,
  socket: null,
  tiempoInicio: null,
  tiempoInicioFigura: null,
  tiemposPorFigura: [],
};

function iniciarTemporizador() {
  clearInterval(intervaloTemporizador);
  tiempoRestante = 15;
  actualizarContadorVisual();

  intervaloTemporizador = setInterval(() => {
    tiempoRestante--;
    actualizarContadorVisual();

    if (tiempoRestante <= 0) {
      clearInterval(intervaloTemporizador);
      manejarTiempoAgotado();
    }
  }, 1000);
}

function actualizarContadorVisual() {
  const contador = document.getElementById("contadorTiempo");
  if (contador) contador.textContent = tiempoRestante;
}

function manejarTiempoAgotado() {
  console.log("⏰ Tiempo agotado");

  const tiempoFigura = (Date.now() - gameState.tiempoInicioFigura) / 1000;
  gameState.tiemposPorFigura.push(tiempoFigura);

  gameState.vidas--;
  mostrarFeedback("¡Se acabó el tiempo! ⏳", "error");
  actualizarVidas();

  if (gameState.vidas <= 0) {
    mostrarPantallaDerrota();
  } else {
    setTimeout(() => {
      mostrarNuevaFigura();
    }, 1500);
  }
}

function getFigurasAleatorias(cantidad) {
  const copia = [...figuras];
  const seleccionadas = [];
  while (seleccionadas.length < cantidad && copia.length > 0) {
    const indice = Math.floor(Math.random() * copia.length);
    seleccionadas.push(copia.splice(indice, 1)[0]);
  }
  return seleccionadas;
}

function hablarConRetardo(texto, callback = null) {
  if (!('speechSynthesis' in window)) {
    if (callback) setTimeout(callback, 2000);
    return;
  }

  const iniciarHabla = (voces) => {
    window.speechSynthesis.cancel(); // Cancelar cualquier voz previa
    const vozNatural = voces.find(v => v.name.includes("es-ES") || v.name.includes("Google español")) || voces[0];
    const msg = new SpeechSynthesisUtterance(texto);
    msg.voice = vozNatural;
    msg.lang = 'es-ES';
    msg.volume = 1.0;
    msg.rate = 0.9;
    msg.pitch = 1.1;

    msg.onstart = () => console.log("🔊 Iniciando narración:", texto);

    if (callback) {
      msg.onend = () => {
        console.log("✅ Narración terminada");
        setTimeout(callback, 300);
      };
    }

    window.speechSynthesis.speak(msg);
  };

  // Esperar a que las voces estén disponibles
  let voces = window.speechSynthesis.getVoices();
  if (voces.length > 0) {
    iniciarHabla(voces);
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      voces = window.speechSynthesis.getVoices();
      iniciarHabla(voces);
    };
  }
}



function mostrarNuevaFigura() {
  if (!gameState.juegoActivo) return;

  const figurasAleatorias = getFigurasAleatorias(3);
  gameState.figurasMostradas = figurasAleatorias;
  const indiceObjetivo = Math.floor(Math.random() * 3);
  const figuraObjetivo = figurasAleatorias[indiceObjetivo];
  gameState.figuraObjetivo = figuraObjetivo;

  const display = document.getElementById("figuraDisplay");
  display.innerHTML = figurasAleatorias
    .map(
      (figura) => `
        <img src="${figura.src}" 
             class="figura-img" 
             alt="${figura.nombre}" 
             data-nombre="${figura.nombre}" />
      `
    )
    .join("");

  const instructionText = document.querySelector(".instruction-text");
  instructionText.textContent = `¡Encuentra: ${figuraObjetivo.nombre}!`;

  // ⚡️ NUEVA NARRACIÓN + iniciar temporizador solo al terminar
  const genero = figuraObjetivo.genero === "la" ? "una" : "un";
  const texto = `Encuentra ${genero} ${figuraObjetivo.forma} de color ${figuraObjetivo.colorTexto}.`;

  console.log(`🎯 Nueva figura objetivo: ${figuraObjetivo.nombre}`);

  gameState.tiempoInicioFigura = Date.now();

  // Narrar y luego iniciar temporizador
  hablarConRetardo(texto, () => {
    iniciarTemporizador(); // Solo cuando termina de hablar
  });
}

function actualizarVidas() {
  const vidasContainer = document.getElementById("vidasContainer");
  if (!vidasContainer) {
    const topBar = document.querySelector(".top-bar");
    const vidasDiv = document.createElement("div");
    vidasDiv.id = "vidasContainer";
    vidasDiv.className = "vidas";
    vidasDiv.innerHTML = "❤️❤️❤️";
    topBar.appendChild(vidasDiv);
  } else {
    vidasContainer.innerHTML = "❤️".repeat(gameState.vidas);
  }
}

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

function actualizarProgreso() {
  const progress = document.getElementById("progressBar");
  const percent = (gameState.aciertos / 5) * 100;
  progress.style.width = percent + "%";
}

function respuestaCorrecta() {
  clearInterval(intervaloTemporizador);

  const tiempoFigura = (Date.now() - gameState.tiempoInicioFigura) / 1000;
  gameState.tiemposPorFigura.push(tiempoFigura);

  console.log("🎉 Respuesta correcta");
  gameState.aciertos++;
  mostrarFeedback("¡Correcto! 🎉", "success");
  actualizarEstrellas();
  actualizarProgreso();

  if (gameState.aciertos >= 5) {
    setTimeout(() => mostrarPantallaVictoria(), 1500);
  } else {
    setTimeout(() => mostrarNuevaFigura(), 2000);
  }
}

function respuestaIncorrecta(nombre) {
  clearInterval(intervaloTemporizador);

  const tiempoFigura = (Date.now() - gameState.tiempoInicioFigura) / 1000;
  gameState.tiemposPorFigura.push(tiempoFigura);

  gameState.vidas--;
  mostrarFeedback(
    `Incorrecto 😞<br>Era: ${gameState.figuraObjetivo.nombre}`,
    "error"
  );
  actualizarVidas();

  if (gameState.vidas <= 0) {
    setTimeout(() => mostrarPantallaDerrota(), 1500);
  } else {
    setTimeout(() => {
      const instructionText = document.querySelector(".instruction-text");
      instructionText.textContent = `¡Encuentra: ${gameState.figuraObjetivo.nombre}!`;
    }, 2000);
  }
}

function mostrarFeedback(mensaje, tipo) {
  const anterior = document.querySelector(".feedback-temporal");
  if (anterior) anterior.remove();

  const feedback = document.createElement("div");
  feedback.className = `feedback-temporal ${tipo}`;
  feedback.innerHTML = mensaje;

  document.querySelector(".game-area").appendChild(feedback);
  setTimeout(() => feedback.remove(), 2000);
}

function mostrarPantallaVictoria() {
  gameState.juegoActivo = false;
  guardarResultadoFinal();
  const gameArea = document.querySelector(".game-area");
  gameArea.innerHTML = `
    <div class="content-box resultado-box victoria">
      <h2 class="resultado-titulo">¡FELICIDADES! 🎉</h2>
      <p class="resultado-texto">¡Has completado el desafío!</p>
      <div class="resultado-stats">
        <div class="stat-item"><span class="stat-label">Estrellas obtenidas:</span><span class="stat-value">⭐⭐⭐⭐⭐</span></div>
      </div>
      <div class="resultado-botones">
        <button class="btn-reiniciar" onclick="reiniciarJuego()">🔄 Jugar de nuevo</button>
        <button class="btn-menu" onclick="volverAlMenu()">🏠 Menú principal</button>
      </div>
    </div>`;
}

function mostrarPantallaDerrota() {
  gameState.juegoActivo = false;
  guardarResultadoFinal();
  const gameArea = document.querySelector(".game-area");
  gameArea.innerHTML = `
    <div class="content-box resultado-box derrota">
      <h2 class="resultado-titulo">¡Inténtalo de nuevo! 😊</h2>
      <p class="resultado-texto">Te quedaste sin vidas, pero puedes intentarlo otra vez</p>
      <div class="resultado-stats">
        <div class="stat-item"><span class="stat-label">Estrellas obtenidas:</span><span class="stat-value">${"⭐".repeat(gameState.aciertos)}${"✰".repeat(5 - gameState.aciertos)}</span></div>
        <div class="stat-item"><span class="stat-label">Progreso:</span><span class="stat-value">${gameState.aciertos}/5</span></div>
      </div>
      <div class="resultado-botones">
        <button class="btn-reiniciar" onclick="reiniciarJuego()">🔄 Intentar de nuevo</button>
        <button class="btn-menu" onclick="volverAlMenu()">🏠 Menú principal</button>
      </div>
    </div>`;
}

function reiniciarJuego() {
  gameState = {
    vidas: 3,
    aciertos: 0,
    figurasMostradas: [],
    figuraObjetivo: null,
    juegoActivo: true,
    socket: gameState.socket,
    tiempoInicio: Date.now(),
    tiempoInicioFigura: null,
    tiemposPorFigura: [],
  };

  document.querySelector(".game-area").innerHTML = `
    <div class="content-box">
      <p class="instruction-text">¡Encuentra las figuras!</p>
      <div class="figura-display" id="figuraDisplay"></div>
    </div>`;

  actualizarVidas();
  actualizarEstrellas();
  actualizarProgreso();
  mostrarNuevaFigura();
  console.log("🔄 Juego reiniciado");
}

function volverAlMenu() {
  window.location.href = "/dashboard";
}

function procesarLecturaRFID(nombre) {
  if (!gameState.juegoActivo || !gameState.figuraObjetivo) return;
  figura_esperada=gameState.figuraObjetivo.nombre;

  console.log(`📡 RFID detectado: ${nombre}`);
  console.log(`🎯 Figura esperada: ${gameState.figuraObjetivo.nombre}`);
  enviarDatosBackend(nombre);
}

async function enviarDatosBackend(nombre) {
  try {
    const response = await fetch("/api/figura/rfid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo_rfid: nombre,
        modo: "desafio",
        figura_esperada: gameState.figuraObjetivo.nombre,
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

      if (data.gameStatus === "victoria") {
        setTimeout(() => mostrarPantallaVictoria(), 1500);
      } else if (data.gameStatus === "game_over") {
        setTimeout(() => mostrarPantallaDerrota(), 1500);
      }
    }
  } catch (error) {
    console.error("Error enviando datos al backend:", error);
    if (nombre === gameState.figuraObjetivo.nombre) {
      respuestaCorrecta();
    } else {
      respuestaIncorrecta(nombre);
    }
  }
}

async function guardarResultadoFinal() {
  try {
    const tiempoPromedio = gameState.tiemposPorFigura.length > 0
      ? gameState.tiemposPorFigura.reduce((a, b) => a + b, 0) / gameState.tiemposPorFigura.length
      : 0;

    await fetch("/api/desafio/resultado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aciertos: gameState.aciertos,
        tiempo_jugado: tiempoPromedio.toFixed(2),
        completado: gameState.aciertos >= 5,
      }),
    });
  } catch (error) {
    console.error("Error guardando resultado:", error);
  }
}

function conectarWebSocket() {
  gameState.socket = io();

  gameState.socket.on("connect", () => {
    console.log("🔌 Conectado al servidor WebSocket");
  });

  gameState.socket.on("nuevaFigura", ({ nombre, codigo }) => {
    console.log(`📡 Nueva figura recibida: ${nombre} (Código: ${codigo})`);
    procesarLecturaRFID(nombre);
    fetch("/api/rfid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo_rfid: codigo,
        modo: "desafio",
        figura_esperada: figura_esperada
      })
    }).catch((err) => {
      console.error("Error al guardar interacción RFID:", err);
    });

  });

  gameState.socket.on("disconnect", () => {
    console.log("🔌 Desconectado del servidor WebSocket");
  });

}

document.addEventListener("DOMContentLoaded", () => {
  console.log("🎮 Iniciando modo desafío...");
  gameState.tiempoInicio = Date.now();
  actualizarVidas();
  actualizarEstrellas();
  actualizarProgreso();
  conectarWebSocket();
  actualizarContadorVisual();

  const backButton = document.querySelector(".back-button");
  if (backButton) backButton.onclick = volverAlMenu;

  const video = document.getElementById("tutorialVideo");

  const iniciarJuego = () => {
    if (juegoIniciado) return; // ✅ previene múltiples inicios
    juegoIniciado = true;
    console.log("✅ Juego iniciado");
    mostrarNuevaFigura();
  };

  if (video) {
    console.log("⏳ Esperando a que termine el tutorial...");
    video.addEventListener("ended", iniciarJuego);

    setTimeout(() => {
      if (!juegoIniciado && gameState.juegoActivo) {
        console.log("⚠️ Continuando tras espera de seguridad...");
        iniciarJuego();
      }
    }, 10000);
  } else {
    iniciarJuego();
  }
});


window.gameState = gameState;

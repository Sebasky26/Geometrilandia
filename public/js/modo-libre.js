const figuras = [
  { nombre: "TRIÁNGULO NARANJA", src: "/img/triangulo_naranja.png", color: "#fb8c00" },
  { nombre: "CÍRCULO VERDE", src: "/img/circulo_verde.png", color: "#43a047" },
  { nombre: "ESTRELLA CELESTE", src: "/img/estrella_celeste.png", color: "#4fc3f7" },
  { nombre: "CUADRADO AMARILLO", src: "/img/cuadrado_amarillo.png", color: "#fdd835" },
  { nombre: "CÍRCULO AZUL", src: "/img/circulo_azul.png", color: "#1e88e5" },
  { nombre: "TRIÁNGULO MORADO", src: "/img/triangulo_morado.png", color: "#8e24aa" },
  { nombre: "ESTRELLA ROJA", src: "/img/estrella_roja.png", color: "#d32f2f" }
];

let gameActive = false;

function initModoLibre() {
  console.log("Inicializando Modo Libre");
  setupRFIDListener();
  gameActive = true;
}

function setupRFIDListener() {
  document.addEventListener("rfidDetected", handleRFIDDetection);
}

async function handleRFIDDetection(event) {
  if (!gameActive) return;

  const codigo_rfid = event.detail.codigo_rfid;
  console.log("RFID detectado:", codigo_rfid);

  try {
    updateFiguraDisplay(null, "Detectando...", "#999");
    showFeedback("Detectando figura...", "info");

    const result = await processRFIDReading(codigo_rfid, "libre");

    if (result.success) {
      const figura = result.figura;
      updateFiguraDisplay(figura.src, figura.nombre, figura.color);

      showFeedback(`¡Es un ${figura.nombre}!`, "success", 3000);
      playSound("successSound");
      vibrate([100, 50, 100]);

      // Limpiar después de 3 segundos
      setTimeout(() => {
        clearFiguraDisplay();
        clearFeedback();
      }, 5000);

    } else {
      showFeedback("Figura no reconocida. Intenta de nuevo.", "error");
      updateFiguraDisplay(null, "No reconocida", "#ff6b6b");

      setTimeout(() => {
        clearFiguraDisplay();
        clearFeedback();
      }, 5000);
    }
  } catch (error) {
    console.error("Error procesando RFID:", error);
    showFeedback("Error detectando figura. Intenta de nuevo.", "error");
    updateFiguraDisplay(null, "Error", "#ff6b6b");

    setTimeout(() => {
      clearFiguraDisplay();
      clearFeedback();
    }, 3000);
  }
}

async function processRFIDReading(codigo_rfid, modo) {
  const nombreExtraido = codigo_rfid
    .replace("RFID_", "")
    .replace(/_\d+$/, "")
    .replace(/_/g, " ")
    .trim();

  const figura = figuras.find(f => f.nombre.toUpperCase() === nombreExtraido);
  return figura ? { success: true, figura } : { success: false };
}

function updateFiguraDisplay(imgSrc, name, color) {
  const figuraIcon = document.getElementById("figuraIcon");
  const figuraDisplay = document.getElementById("figuraDisplay");

  if (figuraIcon) {
    if (imgSrc) {
      figuraIcon.innerHTML = `<img src="${imgSrc}" alt="${name}" style="max-width: 100%; max-height: 100%;">`;
    } else {
      figuraIcon.innerHTML = `<span style="color: ${color}; font-size: 2rem;">${name}</span>`;
    }
  }

  if (figuraDisplay) {
    figuraDisplay.style.borderColor = color;
  }
}

function clearFiguraDisplay() {
  const figuraIcon = document.getElementById("figuraIcon");
  const figuraDisplay = document.getElementById("figuraDisplay");

  if (figuraIcon) {
    figuraIcon.innerHTML = "❓";
    figuraIcon.style.color = "#000";
  }

  if (figuraDisplay) {
    figuraDisplay.style.borderColor = "#ccc";
  }
}

function playSound(id) {
  const audio = document.getElementById(id);
  if (audio) audio.play();
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function showFeedback(text, type, timeout = 5000) {
  const el = document.getElementById("feedbackMessage");
  if (!el) return;
  el.textContent = text;
  el.className = `feedback-message feedback-${type}`;
  el.classList.remove("hidden");
}

function clearFeedback() {
  const el = document.getElementById("feedbackMessage");
  if (!el) return;
  el.textContent = "";
  el.classList.add("hidden");
}

function goBack() {
  gameActive = false;
  window.location.href = "/dashboard";
}

// Simular RFID con teclas (Ctrl + Q, W, E, etc.)
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey) {
    const key = e.key.toLowerCase();
    const mapaTeclas = {
      q: 0,
      ñ: 2,
      z: 5,
    };

    if (key in mapaTeclas) {
      const index = mapaTeclas[key];
      const figura = figuras[index];
      const codigo_rfid = `RFID_${figura.nombre.replace(/\s+/g, "_").toUpperCase()}_${String(index + 1).padStart(3, '0')}`;

      const event = new CustomEvent("rfidDetected", {
        detail: { codigo_rfid }
      });

      document.dispatchEvent(event);
    }
  }
});

// Elementos de la interfaz
const imgElement = document.getElementById("figuraImage");
const nameElement = document.getElementById("figuraName");
const displayElement = document.getElementById("figura-content");
const feedback = document.getElementById("feedbackMessage");
const detectSound = document.getElementById("detectSound");
const successSound = document.getElementById("successSound");

// Estado inicial: imagen incógnita
imgElement.src = "/img/incognita.png";
imgElement.alt = "Figura desconocida";
nameElement.textContent = "";
displayElement.classList.remove("success", "error");
feedback.textContent = "";

// Mostrar figura leída
function mostrarFigura(nombre) {
  const figura = figuras.find(f => f.nombre === nombre);
  if (!figura) {
    mostrarError("Figura no reconocida");
    return;
  }

  detectSound.currentTime = 0;
  detectSound.play();

  imgElement.src = figura.src;
  imgElement.alt = `Figura: ${figura.nombre}`;
  nameElement.textContent = figura.nombre;
  nameElement.style.color = figura.color;

  displayElement.classList.remove("error");
  displayElement.classList.add("success");

  feedback.textContent = `¡Has detectado un ${figura.nombre}!`;
  feedback.className = "feedback-message feedback-success show";

  successSound.currentTime = 0;
  successSound.play();

  setTimeout(() => {
    feedback.classList.remove("show");
  }, 3000);
}

// Mostrar error
function mostrarError(mensaje) {
  imgElement.src = "/img/error.png";
  imgElement.alt = "Error de figura";
  nameElement.textContent = "";
  displayElement.classList.remove("success");
  displayElement.classList.add("error");

  feedback.textContent = mensaje;
  feedback.className = "feedback-message feedback-error show";

  setTimeout(() => {
    feedback.classList.remove("show");
  }, 3000);
}

// WebSocket
const socket = io();

socket.on("nuevaFigura", (nombre) => {
  console.log("🟢 Figura detectada:", nombre);
  mostrarFigura(nombre);
});

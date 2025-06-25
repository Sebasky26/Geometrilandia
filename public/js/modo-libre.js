const figuras = [
  { nombre: "TRIANGULO NARANJA", src: "/img/triangulo_naranja.png", color: "#fb8c00" },
  { nombre: "CIRCULO VERDE", src: "/img/circulo_verde.png", color: "#43a047" },
  { nombre: "ESTRELLA CELESTE", src: "/img/estrella_celeste.png", color: "#4fc3f7" },
  { nombre: "CUADRADO ROSADO", src: "/img/cuadrado_rosado.png", color: "#f06292" },
  { nombre: "CIRCULO AZUL", src: "/img/circulo_azul.png", color: "#1e88e5" },
  { nombre: "TRIANGULO MORADO", src: "/img/triangulo_morado.png", color: "#8e24aa" },
  { nombre: "CUADRADO NARANJA", src: "/img/cuadrado_naranja.png", color: "#ffa726" }
];

// Elementos de la interfaz
const imgElement = document.getElementById("figuraImage");
const nameElement = document.getElementById("figuraName");
const displayElement = document.getElementById("figura-content");
const feedback = document.getElementById("feedbackMessage");
const detectSound = document.getElementById("detectSound");
const successSound = document.getElementById("successSound");

// Mostrar figura leída
function mostrarFigura(nombre) {
  const figura = figuras.find(f => f.nombre === nombre);
  if (!figura) {
    mostrarError("Figura no reconocida");
    return;
  }

  // Reproducir sonido de detección
  detectSound.currentTime = 0;
  detectSound.play();

  // Actualizar contenido visual
  imgElement.src = figura.src;
  imgElement.alt = `Figura: ${figura.nombre}`;
  nameElement.textContent = figura.nombre;
  nameElement.style.color = figura.color;

  // Aplicar estilo de éxito
  displayElement.classList.remove("error");
  displayElement.classList.add("success");

  // Mensaje de retroalimentación
  feedback.textContent = `¡Has detectado un ${figura.nombre}!`;
  feedback.className = "feedback-message feedback-success show";

  // Sonido de éxito
  successSound.currentTime = 0;
  successSound.play();

  // Ocultar feedback luego de 3 segundos
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

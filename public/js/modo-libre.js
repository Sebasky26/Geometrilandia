const figuras = [
  { nombre: "ESTRELLA TURQUESA", src: "/img/estrella_turquesa.png", color: "#40e0d0" },
  { nombre: "CUADRADO AZUL", src: "/img/cuadrado_azul.png", color: "#1e88e5" },
  { nombre: "CUADRADO ROJO", src: "/img/cuadrado_rojo.png", color: "#e53935" },
  { nombre: "ESTRELLA AMARILLA", src: "/img/estrella_amarilla.png", color: "#fdd835" },
  { nombre: "CORAZON VERDE", src: "/img/corazon_verde.png", color: "#43a047" },
  { nombre: "CUADRADO AMARILLO", src: "/img/cuadrado_amarillo.png", color: "#fbc02d" },
  { nombre: "ESTRELLA NARANJA", src: "/img/estrella_naranja.png", color: "#8d6e63" },
  { nombre: "CIRCULO AMARILLO", src: "/img/circulo_amarillo.png", color: "#fdd835" },
  { nombre: "CIRCULO TURQUESA", src: "/img/circulo_turquesa.png", color: "#40e0d0" },
  { nombre: "RECTÁNGULO AZUL", src: "/img/rectangulo_azul.png", color: "#1e88e5" },
  { nombre: "RECTÁNGULO VERDE", src: "/img/rectangulo_verde.png", color: "#43a047" },
  { nombre: "CORAZON AZUL", src: "/img/corazon_azul.png", color: "#1e88e5" },
  { nombre: "RECTÁNGULO TURQUESA", src: "/img/rectangulo_turquesa.png", color: "#40e0d0" },
  { nombre: "CORAZON ROJO", src: "/img/corazon_rojo.png", color: "#e53935" },
  { nombre: "TRIANGULO VERDE", src: "/img/triangulo_verde.png", color: "#43a047" },
  { nombre: "TRIANGULO NARANJA", src: "/img/triangulo_naranja.png", color: "#8d6e63" },
  { nombre: "TRIANGULO ROJO", src: "/img/triangulo_rojo.png", color: "#e53935" },
  { nombre: "CIRCULO NARANJA", src: "/img/circulo_naranja.png", color: "#8d6e63" }
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

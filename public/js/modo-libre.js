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
  { nombre: "RECTÁNGULO AZUL", src: "/img/rectangulo_azul.gif", color: "#1e88e5", forma: "rectángulo", colorTexto: "azul", genero: "el" },
  { nombre: "RECTÁNGULO VERDE", src: "/img/rectangulo_verde.gif", color: "#43a047", forma: "rectángulo", colorTexto: "verde", genero: "el" },
  { nombre: "CORAZON AZUL", src: "/img/corazon_azul.gif", color: "#1e88e5", forma: "corazon", colorTexto: "azul", genero: "el" },
  { nombre: "RECTÁNGULO TURQUESA", src: "/img/rectangulo_turquesa.gif", color: "#40e0d0", forma: "rectángulo", colorTexto: "turquesa", genero: "el" },
  { nombre: "CORAZON ROJO", src: "/img/corazon_rojo.gif", color: "#e53935", forma: "corazon", colorTexto: "rojo", genero: "el" },
  { nombre: "TRIANGULO VERDE", src: "/img/triangulo_verde.gif", color: "#43a047", forma: "triángulo", colorTexto: "verde", genero: "el" },
  { nombre: "TRIANGULO NARANJA", src: "/img/triangulo_naranja.gif", color: "#fe970e", forma: "triángulo", colorTexto: "naranja", genero: "el" },
  { nombre: "TRIANGULO ROJO", src: "/img/triangulo_rojo.gif", color: "#e53935", forma: "triángulo", colorTexto: "rojo", genero: "el" },
  { nombre: "CIRCULO NARANJA", src: "/img/circulo_naranja.gif", color: "#fe970e", forma: "circulo", colorTexto: "naranja", genero: "el" }
];

// Elementos
const imgElement = document.getElementById("figuraImage");
const nameElement = document.getElementById("figuraName");
const displayElement = document.getElementById("figura-content");
const feedback = document.getElementById("feedbackMessage");
const detectSound = document.getElementById("detectSound");
const instruction = document.getElementById("instrucciones");
const successSound = document.getElementById("successSound");

let tiempoInicio = Date.now();

// Función de voz
function hablar(texto) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang = 'es-ES';
    msg.rate = 0.9;
    msg.pitch = 1.1;
    msg.volume = 1.0;
    const voces = window.speechSynthesis.getVoices();
    const voz = voces.find(v => v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("soledad"));
    if (voz) msg.voice = voz;
    window.speechSynthesis.speak(msg);
  }
}

// Mostrar figura detectada
function mostrarFigura(nombre) {
  const figura = figuras.find(f => f.nombre === nombre);
  if (!figura) {
    mostrarError("Figura no reconocida");
    hablar("Figura no reconocida");
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

  feedback.textContent = `¡Excelente! Has detectado ${figura.genero} ${figura.forma} de color ${figura.colorTexto}.`;
  feedback.className = "feedback-message feedback-success show";

  let mensaje = `Has detectado ${figura.genero} ${figura.forma} de color ${figura.colorTexto}`;
  hablar(mensaje);

  successSound.currentTime = 0;
  successSound.play();

  const tiempo_jugado = Math.floor((Date.now() - tiempoInicio) / 1000);
  guardarRegistroFigura(figura, tiempo_jugado);

  setTimeout(() => {
    feedback.classList.remove("show");
    resetFigura();
  }, 3000);
}

// Guardar figura en la base de datos
function guardarRegistroFigura(figura, tiempo_jugado) {
  fetch("/api/libre/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: figura.nombre,
      forma: figura.forma,
      color: figura.colorTexto,
      tiempo_jugado
    }),
  }).catch((err) => {
    console.error("❌ Error al guardar figura en modo libre:", err);
  });
}

// Reset
function resetFigura() {
  imgElement.src = "/img/incognita.png";
  imgElement.alt = "Figura desconocida";
  nameElement.textContent = "";
  nameElement.style.color = "#000";
  displayElement.classList.remove("success", "error");
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

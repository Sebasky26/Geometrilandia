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
  { nombre: "RECTANGULO AZUL", src: "/img/rectangulo_azul.gif", color: "#1e88e5", forma: "rectángulo", colorTexto: "azul", genero: "el" },
  { nombre: "RECTANGULO VERDE", src: "/img/rectangulo_verde.gif", color: "#43a047", forma: "rectángulo", colorTexto: "verde", genero: "el" },
  { nombre: "CORAZON AZUL", src: "/img/corazon_azul.gif", color: "#1e88e5", forma: "corazon", colorTexto: "azul", genero: "el" },
  { nombre: "RECTANGULO TURQUESA", src: "/img/rectangulo_turquesa.gif", color: "#40e0d0", forma: "rectángulo", colorTexto: "turquesa", genero: "el" },
  { nombre: "CORAZON ROJO", src: "/img/corazon_rojo.gif", color: "#e53935", forma: "corazon", colorTexto: "rojo", genero: "el" },
  { nombre: "TRIANGULO VERDE", src: "/img/triangulo_verde.gif", color: "#43a047", forma: "triángulo", colorTexto: "verde", genero: "el" },
  { nombre: "TRIANGULO NARANJA", src: "/img/triangulo_naranja.gif", color: "#fe970e", forma: "triángulo", colorTexto: "naranja", genero: "el" },
  { nombre: "TRIANGULO ROJO", src: "/img/triangulo_rojo.gif", color: "#e53935", forma: "triángulo", colorTexto: "rojo", genero: "el" },
  { nombre: "CIRCULO NARANJA", src: "/img/circulo_naranja.gif", color: "#fe970e", forma: "circulo", colorTexto: "naranja", genero: "el" }
];

// Elementos
const imgElement = document.getElementById("figuraImage");
const nameElement = document.getElementById("figuraName");
const displayElement = document.getElementById("figuraContainer");
const detectSound = document.getElementById("detectSound");
const instruction = document.getElementById("instrucciones");
const successSound = document.getElementById("successSound");

let tiempoInicio = Date.now();
let timeoutReset; // Para manejar el tiempo de ocultar la figura

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
    hablar("Figura no reconocida");
    return;
  }

  if (!displayElement || !imgElement || !nameElement) {
    console.warn("⚠️ Elemento HTML faltante");
    return;
  }

  detectSound.currentTime = 0;
  detectSound.play();

  imgElement.src = figura.src;
  imgElement.alt = `Figura: ${figura.nombre}`;
  nameElement.textContent = figura.nombre;
  nameElement.style.color = figura.color;

  let mensaje = `Has detectado ${figura.genero} ${figura.forma} de color ${figura.colorTexto}`;
  hablar(mensaje);

  successSound.currentTime = 0;
  successSound.play();

  const tiempo_jugado = Math.floor((Date.now() - tiempoInicio) / 1000);

  // Limpiar timeout anterior si aún no termina
  clearTimeout(timeoutReset);

  // Volver a imagen de incógnita luego de 7 segundos
  timeoutReset = setTimeout(() => {
    resetFigura();
  }, 7000);
}

// Reset
function resetFigura() {
  imgElement.src = "/img/incognita.png";
  imgElement.alt = "Figura desconocida";
  nameElement.textContent = "";
  nameElement.style.color = "#000";
  displayElement.classList.remove("success", "error");
  window.speechSynthesis.cancel(); // Detener cualquier voz activa
}

// WebSocket
const socket = io();
socket.on("nuevaFigura", ({ nombre, codigo }) => {
  console.log("Figura recibida:", nombre, codigo);
  mostrarFigura(nombre);

  // Guardar interacción
  console.log("Enviando interacción al backend:", nombre, codigo);
  fetch("/api/rfid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      codigo_rfid: codigo,
      modo: "libre",
      figura_esperada: nombre
    })
  }).catch((err) => {
    console.error("Error al guardar interacción RFID:", err);
  });
});

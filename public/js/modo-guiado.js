const figuras = [
  { nombre: "ESTRELLA TURQUESA", src: "/img/estrella_turquesa.png", color: "#40e0d0", forma: "estrella", colorTexto: "turquesa", genero: "la" },
  { nombre: "CUADRADO AZUL", src: "/img/cuadrado_azul.png", color: "#1e88e5", forma: "cuadrado", colorTexto: "azul", genero: "el" },
  { nombre: "CUADRADO ROJO", src: "/img/cuadrado_rojo.png", color: "#e53935", forma: "cuadrado", colorTexto: "rojo", genero: "el" },
  { nombre: "ESTRELLA AMARILLA", src: "/img/estrella_amarilla.png", color: "#fdd835", forma: "estrella", colorTexto: "amarilla", genero: "la" },
  { nombre: "CORAZON VERDE", src: "/img/corazon_verde.png", color: "#43a047", forma: "corazón", colorTexto: "verde", genero: "el" },
  { nombre: "CUADRADO AMARILLO", src: "/img/cuadrado_amarillo.png", color: "#fbc02d", forma: "cuadrado", colorTexto: "amarillo", genero: "el" },
  { nombre: "ESTRELLA NARANJA", src: "/img/estrella_naranja.png", color: "#fe970e", forma: "estrella", colorTexto: "naranja", genero: "la" },
  { nombre: "CIRCULO AMARILLO", src: "/img/circulo_amarillo.png", color: "#fdd835", forma: "círculo", colorTexto: "amarillo", genero: "el" },
  { nombre: "CIRCULO TURQUESA", src: "/img/circulo_turquesa.png", color: "#40e0d0", forma: "círculo", colorTexto: "turquesa", genero: "el" },
  { nombre: "RECTÁNGULO AZUL", src: "/img/rectangulo_azul.png", color: "#1e88e5", forma: "rectángulo", colorTexto: "azul", genero: "el" },
  { nombre: "RECTÁNGULO VERDE", src: "/img/rectangulo_verde.png", color: "#43a047", forma: "rectángulo", colorTexto: "verde", genero: "el" },
  { nombre: "CORAZON AZUL", src: "/img/corazon_azul.png", color: "#1e88e5", forma: "corazón", colorTexto: "azul", genero: "el" },
  { nombre: "RECTÁNGULO TURQUESA", src: "/img/rectangulo_turquesa.png", color: "#40e0d0", forma: "rectángulo", colorTexto: "turquesa", genero: "el" },
  { nombre: "CORAZON ROJO", src: "/img/corazon_rojo.png", color: "#e53935", forma: "corazón", colorTexto: "rojo", genero: "el" },
  { nombre: "TRIANGULO VERDE", src: "/img/triangulo_verde.png", color: "#43a047", forma: "triángulo", colorTexto: "verde", genero: "el" },
  { nombre: "TRIANGULO NARANJA", src: "/img/triangulo_naranja.png", color: "#fe970e", forma: "triángulo", colorTexto: "naranja", genero: "el" },
  { nombre: "TRIANGULO ROJO", src: "/img/triangulo_rojo.png", color: "#e53935", forma: "triángulo", colorTexto: "rojo", genero: "el" },
  { nombre: "CIRCULO NARANJA", src: "/img/circulo_naranja.png", color: "#fe970e", forma: "círculo", colorTexto: "naranja", genero: "el" }
];

function obtenerDiezAleatorias(array) {
  const mezclado = array.sort(() => Math.random() - 0.5);
  return mezclado.slice(0, 10);
}

let figurasMezcladas = obtenerDiezAleatorias([...figuras]);
let indiceActual = 0;

const img = document.getElementById("figuraImage");
const nombreSpan = document.getElementById("nombreFigura");
const progress = document.getElementById("progressBar");
const stars = document.querySelectorAll(".star");
const mensaje = document.createElement("p");
mensaje.className = "instruction-text";
nombreSpan.parentElement.after(mensaje);

function hablar(texto) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang = 'es-ES';
    msg.rate = 0.85;
    const voces = window.speechSynthesis.getVoices();
    const vozSuave = voces.find(v => v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("soledad"));
    if (vozSuave) msg.voice = vozSuave;
    window.speechSynthesis.speak(msg);
  }
}

function actualizarFigura() {
  const figura = figurasMezcladas[indiceActual];
  img.src = figura.src;
  img.alt = `Figura ${figura.nombre}`;
  nombreSpan.textContent = figura.nombre;
  nombreSpan.style.color = figura.color;

  const textoFrase = `Busca ${figura.genero} ${figura.forma} <span style="color:${figura.color}; font-weight:bold">${figura.colorTexto}</span>`;
  mensaje.innerHTML = textoFrase;
  mensaje.style.color = "#ffffff";

  progress.style.width = `${((indiceActual + 1) / figurasMezcladas.length) * 100}%`;

  hablar(`Busca ${figura.genero} ${figura.forma} ${figura.colorTexto}`);
  actualizarEstrellas();
}

function mostrarMensaje(texto, color, temporal = false) {
  mensaje.textContent = texto;
  mensaje.style.color = color;

  if (temporal) {
    setTimeout(() => {
      const figura = figurasMezcladas[indiceActual];
      const textoFrase = `Busca ${figura.genero} ${figura.forma} <span style="color:${figura.color}; font-weight:bold">${figura.colorTexto}</span>`;
      mensaje.innerHTML = textoFrase;
      mensaje.style.color = "#ffffff";
      hablar(`Busca ${figura.genero} ${figura.forma} ${figura.colorTexto}`);
    }, 2500);
  }
}

function marcarEstrella(index) {
  stars[index]?.classList.add("active");
}

function actualizarEstrellas() {
  const total = figurasMezcladas.length;
  const completado = indiceActual;
  const porcentaje = completado / total;
  const totalEstrellas = stars.length;
  const estrellasActivas = Math.round(porcentaje * totalEstrellas);
  stars.forEach((star, i) => {
    if (i < estrellasActivas) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

function verificarFigura(nombre) {
  const figuraEsperada = figurasMezcladas[indiceActual];
  if (nombre === figuraEsperada.nombre) {
    mostrarMensaje("¡Muy bien!", "#00e676");
    indiceActual++;

    if (indiceActual < figurasMezcladas.length) {
      setTimeout(actualizarFigura, 2500);
    } else {
      img.src = "/img/finalizado.png";
      img.alt = "Juego completado";
      img.style.maxWidth = "280px";
      img.style.width = "80%";
      img.style.marginTop = "20px";
      img.style.borderRadius = "20px";
      img.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
      nombreSpan.style.display = "none";
      mensaje.innerHTML = "<strong>¡Has completado todas las figuras!</strong>";
      mensaje.style.color = "#ffffff";
      progress.style.width = "100%";
      stars.forEach(s => s.classList.add("active"));
      hablar("¡Muy bien! Has completado todas las figuras");
    }
  } else {
    mostrarMensaje("¡Uy! Esa no es. Intenta otra vez", "#ff1744", true);
    hablar("Esa no es. Intenta otra vez");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  actualizarFigura();
  const socket = io();
  socket.on("nuevaFigura", (nombre) => {
    verificarFigura(nombre);
  });

  const botonSimular = document.createElement("button");
  botonSimular.textContent = "Simular juego";
  botonSimular.className = "btn btn-success";
  botonSimular.style.marginTop = "20px";
  botonSimular.onclick = () => {
    if (indiceActual < figurasMezcladas.length) {
      simularJuego();
    }
  };
  document.body.appendChild(botonSimular);
});

function simularJuego() {
  if (indiceActual >= figurasMezcladas.length) return;
  verificarFigura(figurasMezcladas[indiceActual].nombre);
  setTimeout(simularJuego, 3500);
}
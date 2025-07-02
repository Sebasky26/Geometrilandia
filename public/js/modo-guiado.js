const figuras = [
  { nombre: "ESTRELLA TURQUESA", src: "/img/estrella_turquesa.png", color: "#40e0d0" },
  { nombre: "CUADRADO AZUL", src: "/img/cuadrado_azul.png", color: "#1e88e5" },
  { nombre: "CUADRADO ROJO", src: "/img/cuadrado_rojo.png", color: "#e53935" },
  { nombre: "ESTRELLA AMARILLA", src: "/img/estrella_amarilla.png", color: "#fdd835" },
  { nombre: "CORAZON VERDE", src: "/img/corazon_verde.png", color: "#43a047" },
  { nombre: "CUADRADO AMARILLO", src: "/img/cuadrado_amarillo.png", color: "#fbc02d" },
  { nombre: "ESTRELLA NARANJA", src: "/img/estrella_naranja.png", color: "#fe970e" },
  { nombre: "CIRCULO AMARILLO", src: "/img/circulo_amarillo.png", color: "#fdd835" },
  { nombre: "CIRCULO TURQUESA", src: "/img/circulo_turquesa.png", color: "#40e0d0" },
  { nombre: "RECTÁNGULO AZUL", src: "/img/rectangulo_azul.png", color: "#1e88e5" },
  { nombre: "RECTÁNGULO VERDE", src: "/img/rectangulo_verde.png", color: "#43a047" },
  { nombre: "CORAZON AZUL", src: "/img/corazon_azul.png", color: "#1e88e5" },
  { nombre: "RECTÁNGULO TURQUESA", src: "/img/rectangulo_turquesa.png", color: "#40e0d0" },
  { nombre: "CORAZON ROJO", src: "/img/corazon_rojo.png", color: "#e53935" },
  { nombre: "TRIANGULO VERDE", src: "/img/triangulo_verde.png", color: "#43a047" },
  { nombre: "TRIANGULO NARANJA", src: "/img/triangulo_naranja.png", color: "#fe970e" },
  { nombre: "TRIANGULO ROJO", src: "/img/triangulo_rojo.png", color: "#e53935" },
  { nombre: "CIRCULO NARANJA", src: "/img/circulo_naranja.png", color: "#fe970e" }
];

// Barajar las figuras aleatoriamente al iniciar
function barajarFiguras(array) {
  return array.sort(() => Math.random() - 0.5);
}

let figurasMezcladas = barajarFiguras([...figuras]);
let indiceActual = 0;

const img = document.getElementById("figuraImage");
const nombreSpan = document.getElementById("nombreFigura");
const progress = document.getElementById("progressBar");
const stars = document.querySelectorAll(".star");
const mensaje = document.createElement("p");
mensaje.className = "instruction-text";
nombreSpan.parentElement.after(mensaje);

function actualizarFigura() {
  const figura = figurasMezcladas[indiceActual];
  img.src = figura.src;
  img.alt = `Figura ${figura.nombre}`;
  nombreSpan.textContent = figura.nombre;
  nombreSpan.style.color = figura.color;
  progress.style.width = `${((indiceActual + 1) / figurasMezcladas.length) * 100}%`;

  // Restablecer mensaje
  mensaje.textContent = "Encuentra esta figura y acercala al lector";
  mensaje.style.color = "#ffffff";
}

function mostrarMensaje(texto, color, temporal = false) {
  mensaje.textContent = texto;
  mensaje.style.color = color;

  if (temporal) {
    setTimeout(() => {
      mensaje.textContent = "Encuentra esta figura y acercala al lector";
      mensaje.style.color = "#ffffff";
    }, 2000); // Cambia la duración si lo deseas
  }
}

function marcarEstrella(index) {
  stars[index]?.classList.add("active");
}

window.addEventListener("DOMContentLoaded", () => {
  actualizarFigura();

  const socket = io();

  socket.on("nuevaFigura", (nombre) => {
    const figuraEsperada = figurasMezcladas[indiceActual];

    if (nombre === figuraEsperada.nombre) {
      mostrarMensaje("¡Muy bien! ¡Sigue así!", "#00e676"); // verde
      marcarEstrella(indiceActual);
      indiceActual++;

      if (indiceActual < figurasMezcladas.length) {
        setTimeout(actualizarFigura, 1500); // espera antes de pasar a la siguiente
      } else {
        mostrarMensaje("¡Genial! ¡Completaste todas!", "#00e676");
        img.src = "/img/finalizado.png"; // Imagen final opcional
      }

    } else {
      mostrarMensaje("¡Uy! Esa no es. Intenta otra vez", "#ff1744", true); // rojo y temporal
    }
  });
});

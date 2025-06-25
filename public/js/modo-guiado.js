const figuras = [
  { nombre: "TRIANGULO NARANJA", src: "/img/triangulo_naranja.png", color: "#fb8c00" },
  { nombre: "CIRCULO VERDE", src: "/img/circulo_verde.png", color: "#43a047" },
  { nombre: "ESTRELLA CELESTE", src: "/img/estrella_celeste.png", color: "#4fc3f7" },
  { nombre: "CUADRADO ROSADO", src: "/img/cuadrado_rosado.png", color: "#f06292" },
  { nombre: "CIRCULO AZUL", src: "/img/circulo_azul.png", color: "#1e88e5" },
  { nombre: "CUADRADO NARANJA", src: "/img/cuadrado_naranja.png", color: "#ffa726" }
];

let indiceActual = 0;

const img = document.getElementById("figuraImage");
const nombreSpan = document.getElementById("nombreFigura");
const progress = document.getElementById("progressBar");
const stars = document.querySelectorAll(".star");
const mensaje = document.createElement("p");
mensaje.className = "instruction-text";
nombreSpan.parentElement.after(mensaje);

function actualizarFigura() {
  const figura = figuras[indiceActual];
  img.src = figura.src;
  img.alt = `Figura ${figura.nombre}`;
  nombreSpan.textContent = figura.nombre;
  nombreSpan.style.color = figura.color;
  progress.style.width = `${((indiceActual + 1) / figuras.length) * 100}%`;

  // Resetear mensaje
  mensaje.textContent = "Encuentra esta figura y acercala al lector";
  mensaje.style.color = "#ffffff";
}

function mostrarMensaje(texto, color) {
  mensaje.textContent = texto;
  mensaje.style.color = color;
}

function marcarEstrella(index) {
  stars[index]?.classList.add("active");
}

window.addEventListener("DOMContentLoaded", () => {
  actualizarFigura();

  const socket = io();

  socket.on("nuevaFigura", (nombre) => {
    const figuraEsperada = figuras[indiceActual];

    if (nombre === figuraEsperada.nombre) {
      mostrarMensaje("Muy bien! Sigue asi!", "#00e676"); // verde
      marcarEstrella(indiceActual);
      indiceActual++;

      if (indiceActual < figuras.length) {
        setTimeout(actualizarFigura, 1500); // esperar un poco antes de mostrar la siguiente
      } else {
        mostrarMensaje("Genial! Completaste todas!", "#00e676");
        img.src = "/img/finalizado.png"; // imagen opcional para final
      }

    } else {
      mostrarMensaje("Uy! Esa no es. Intenta otra vez", "#ff1744"); // rojo
    }
  });
});
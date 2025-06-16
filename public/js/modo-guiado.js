const figuras = [
  { nombre: "TRIANGULO NARANJA", src: "/img/triangulo_naranja.png", color: "#fb8c00" },
  { nombre: "CIRCULO VERDE", src: "/img/circulo_verde.png", color: "#43a047" },
  { nombre: "ESTRELLA CELESTE", src: "/img/estrella_celeste.png", color: "#4fc3f7" },
  { nombre: "CUADRADO AMARILLO", src: "/img/cuadrado_amarillo.png", color: "#fdd835" },
  { nombre: "CIRCULO AZUL", src: "/img/circulo_azul.png", color: "#1e88e5" },
  { nombre: "TRIANGULO MORADO", src: "/img/triangulo_MORADO.png", color: "#8e24aa" },
  { nombre: "ESTRELLA ROJA", src: "/img/estrella_roja.png", color: "#d32f2f" }
];

const img = document.getElementById("figuraImage");
const nombreSpan = document.getElementById("nombreFigura");
const progress = document.getElementById("progressBar");
const stars = document.querySelectorAll(".star");

function mostrarFigura(nombre) {
  const figura = figuras.find(f => f.nombre === nombre);
  if (!figura) return;

  const index = figuras.indexOf(figura);
  img.src = figura.src;
  img.alt = `Figura ${figura.nombre}`;
  nombreSpan.textContent = figura.nombre;
  nombreSpan.style.color = figura.color;
  progress.style.width = `${((index + 1) / figuras.length) * 100}%`;
  stars[index]?.classList.add("active");
}

window.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  socket.on("nuevaFigura", mostrarFigura);
});

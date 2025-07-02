// FIGURAS
const figuras = [
  { nombre: "ESTRELLA TURQUESA", src: "/img/estrella_turquesa.png", color: "#40e0d0", forma: "estrella", colorTexto: "turquesa", genero: "la" },
  { nombre: "CUADRADO AZUL", src: "/img/cuadrado_azul.png", color: "#1e88e5", forma: "cuadrado", colorTexto: "azul", genero: "el" },
  { nombre: "CUADRADO ROJO", src: "/img/cuadrado_rojo.png", color: "#e53935", forma: "cuadrado", colorTexto: "rojo", genero: "el" },
  { nombre: "ESTRELLA AMARILLA", src: "/img/estrella_amarilla.png", color: "#fdd835", forma: "estrella", colorTexto: "amarilla", genero: "la" },
  { nombre: "CORAZON VERDE", src: "/img/corazon_verde.png", color: "#43a047", forma: "corazon", colorTexto: "verde", genero: "el" },
  { nombre: "CUADRADO AMARILLO", src: "/img/cuadrado_amarillo.png", color: "#fbc02d", forma: "cuadrado", colorTexto: "amarillo", genero: "el" },
  { nombre: "ESTRELLA NARANJA", src: "/img/estrella_naranja.png", color: "#fe970e", forma: "estrella", colorTexto: "naranja", genero: "la" },
  { nombre: "CIRCULO AMARILLO", src: "/img/circulo_amarillo.png", color: "#fdd835", forma: "circulo", colorTexto: "amarillo", genero: "el" },
  { nombre: "CIRCULO TURQUESA", src: "/img/circulo_turquesa.png", color: "#40e0d0", forma: "circulo", colorTexto: "turquesa", genero: "el" },
  { nombre: "RECTÁNGULO AZUL", src: "/img/rectangulo_azul.png", color: "#1e88e5", forma: "rectangulo", colorTexto: "azul", genero: "el" },
  { nombre: "RECTÁNGULO VERDE", src: "/img/rectangulo_verde.png", color: "#43a047", forma: "rectangulo", colorTexto: "verde", genero: "el" },
  { nombre: "CORAZON AZUL", src: "/img/corazon_azul.png", color: "#1e88e5", forma: "corazon", colorTexto: "azul", genero: "el" },
  { nombre: "RECTÁNGULO TURQUESA", src: "/img/rectangulo_turquesa.png", color: "#40e0d0", forma: "rectangulo", colorTexto: "turquesa", genero: "el" },
  { nombre: "CORAZON ROJO", src: "/img/corazon_rojo.png", color: "#e53935", forma: "corazon", colorTexto: "rojo", genero: "el" },
  { nombre: "TRIANGULO VERDE", src: "/img/triangulo_verde.png", color: "#43a047", forma: "triangulo", colorTexto: "verde", genero: "el" },
  { nombre: "TRIANGULO NARANJA", src: "/img/triangulo_naranja.png", color: "#fe970e", forma: "triangulo", colorTexto: "naranja", genero: "el" },
  { nombre: "TRIANGULO ROJO", src: "/img/triangulo_rojo.png", color: "#e53935", forma: "triangulo", colorTexto: "rojo", genero: "el" },
  { nombre: "CIRCULO NARANJA", src: "/img/circulo_naranja.png", color: "#fe970e", forma: "circulo", colorTexto: "naranja", genero: "el" }
];

function obtenerDiezAleatorias(array) {
  const mezclado = array.sort(() => Math.random() - 0.5);
  return mezclado.slice(0, 10);
}

let figurasMezcladas = obtenerDiezAleatorias([...figuras]);
let indiceActual = 0;

const img = document.getElementById("figuraImage");
const progress = document.getElementById("progressBar");
const stars = document.querySelectorAll(".star");
const mensaje = document.createElement("p");
mensaje.className = "instruction-text";
document.querySelector(".content-box").insertBefore(mensaje, document.querySelector(".figura-display"));

function hablar(texto) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    const voces = window.speechSynthesis.getVoices();

    // Intenta seleccionar una voz más agradable (ajustable según navegador y SO)
    const vozNatural = 
      voces.find(v => v.name.includes("Google español")) ||
      voces.find(v => v.name.includes("Microsoft Sabina")) ||
      voces.find(v => v.lang === "es-ES") ||
      voces[0];

    const msg = new SpeechSynthesisUtterance(texto);
    msg.voice = vozNatural;
    msg.lang = 'es-ES';
    msg.volume = 1.0;   // volumen al máximo
    msg.rate = 0.95;    // velocidad ligeramente reducida para claridad
    msg.pitch = 1.1;    // un poco más agudo para sonar más cálido y alegre

    window.speechSynthesis.speak(msg);
  } else {
    console.warn("La síntesis de voz no es compatible con este navegador.");
  }
}


function actualizarFigura() {
  const figura = figurasMezcladas[indiceActual];
  img.src = figura.src;
  img.alt = `Figura ${figura.nombre}`;
  progress.style.width = `${((indiceActual) / figurasMezcladas.length) * 100}%`;

  const esFemenino = figura.genero === "la";
  const esteEsta = esFemenino ? "Esta" : "Este";
  const loLa = esFemenino ? "la" : "lo";

  const texto = `${esteEsta} es ${figura.genero} ${figura.forma} ${figura.colorTexto}. Acerca${loLa} a la caja para que te ${loLa} lea.`;
  mensaje.innerHTML = `${esteEsta} es ${figura.genero} <strong style="color:${figura.color};">${figura.forma} ${figura.colorTexto}</strong>. Acerca${loLa} a la caja para que te ${loLa} lea.`;
  mensaje.style.color = "#ffffff";

  hablar(texto);
  actualizarEstrellas();
}

function mostrarMensaje(texto, color, temporal = false, repetir = true) {
  mensaje.textContent = texto;
  mensaje.style.color = color;
  hablar(texto);

  if (temporal) {
    setTimeout(() => {
      if (indiceActual < figurasMezcladas.length) {
        const figura = figurasMezcladas[indiceActual];
        const esFemenino = figura.genero === "la";
        const esteEsta = esFemenino ? "Esta" : "Este";
        const loLa = esFemenino ? "la" : "lo";

        mensaje.innerHTML = `${esteEsta} es ${figura.genero} <strong style="color:${figura.color};">${figura.forma} ${figura.colorTexto}</strong>. Acérca${loLa} a la caja para que te ${loLa} lea.`;
        mensaje.style.color = "#ffffff";

        if (repetir) {
          const texto = `${esteEsta} es ${figura.genero} ${figura.forma} ${figura.colorTexto}. Acerca${loLa} a la caja para que te ${loLa} lea.`;
          hablar(texto);
        }
      }
    }, 3000);
  }
}


function marcarEstrella() {
  const total = figurasMezcladas.length;
  const completado = indiceActual;
  const progreso = completado / total;
  const totalEstrellas = stars.length;

  stars.forEach((estrella, i) => {
    const umbral = (i + 1) / totalEstrellas;
    estrella.classList.toggle("active", progreso >= umbral);
  });
}

function actualizarEstrellas() {
  marcarEstrella();
}

function verificarFigura(nombre) {
  const figuraEsperada = figurasMezcladas[indiceActual];

  if (nombre === figuraEsperada.nombre) {
    mostrarMensaje("¡Muy bien! Lo hiciste excelente", "#00e676", true);
    indiceActual++;

    if (indiceActual < figurasMezcladas.length) {
      setTimeout(actualizarFigura, 3500);
    } else {
      img.src = "/img/finalizado.png";
      img.alt = "Juego completado";
      img.style.maxWidth = "280px";
      img.style.width = "80%";
      img.style.marginTop = "20px";
      img.style.borderRadius = "20px";
      img.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
      mensaje.textContent = "¡Felicidades! Completaste todas las figuras";
      mensaje.style.color = "#00e676";
      hablar("Felicidades! Completaste todas las figuras");
      progress.style.width = "100%";
      actualizarEstrellas();
    }
  } else {
    mostrarMensaje("Ups, intenta otra vez. Tú puedes hacerlo mejor", "#ff1744", true);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  actualizarFigura();

  // Animación visual a la imagen
  img.style.transition = "transform 0.3s ease, filter 0.3s ease";
  img.style.display = "block";
  img.style.margin = "0 auto";
  img.style.border = "none";
  img.style.background = "none";
  img.style.boxShadow = "none";

  img.addEventListener("mouseenter", () => {
    img.style.transform = "scale(1.05)";
    img.style.filter = "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))";
  });

  img.addEventListener("mouseleave", () => {
    img.style.transform = "scale(1)";
    img.style.filter = "none";
  });


  const socket = io();
  socket.on("nuevaFigura", (nombre) => {
    verificarFigura(nombre);
  });
});

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
  { nombre: "RECTANGULO AZUL", src: "/img/rectangulo_azul.gif", color: "#1e88e5", forma: "rectangulo", colorTexto: "azul", genero: "el" },
  { nombre: "RECTANGULO VERDE", src: "/img/rectangulo_verde.gif", color: "#43a047", forma: "rectangulo", colorTexto: "verde", genero: "el" },
  { nombre: "CORAZON AZUL", src: "/img/corazon_azul.gif", color: "#1e88e5", forma: "corazon", colorTexto: "azul", genero: "el" },
  { nombre: "RECTANGULO TURQUESA", src: "/img/rectangulo_turquesa.gif", color: "#40e0d0", forma: "rectangulo", colorTexto: "turquesa", genero: "el" },
  { nombre: "CORAZON ROJO", src: "/img/corazon_rojo.gif", color: "#e53935", forma: "corazon", colorTexto: "rojo", genero: "el" },
  { nombre: "TRIANGULO VERDE", src: "/img/triangulo_verde.gif", color: "#43a047", forma: "triangulo", colorTexto: "verde", genero: "el" },
  { nombre: "TRIANGULO NARANJA", src: "/img/triangulo_naranja.gif", color: "#fe970e", forma: "triangulo", colorTexto: "naranja", genero: "el" },
  { nombre: "TRIANGULO ROJO", src: "/img/triangulo_rojo.gif", color: "#e53935", forma: "triangulo", colorTexto: "rojo", genero: "el" },
  { nombre: "CIRCULO NARANJA", src: "/img/circulo_naranja.gif", color: "#fe970e", forma: "circulo", colorTexto: "naranja", genero: "el" }
];
var figura_esperada;
function obtenerDiezAleatorias(array) {
  return array.sort(() => Math.random() - 0.5).slice(0, 10);
}

let figurasMezcladas = obtenerDiezAleatorias([...figuras]);
let indiceActual = 0;
let mostrarMensaje = false;
let tiempoInicio = null;

const img = document.getElementById("figuraImage");
const progress = document.getElementById("progressBar");
const stars = document.querySelectorAll(".star");
const mensaje = document.createElement("p");
mensaje.className = "instruction-text";
document.querySelector(".content-box").insertBefore(mensaje, document.querySelector(".figura-display"));

function hablarConRetardo(texto, callback = null) {
  if (!mostrarMensaje) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const voces = window.speechSynthesis.getVoices();
    //const vozNatural = voces.find(v => v.name.includes("es-ES") || v.name.includes("Google español")) || voces[0];
    const msg = new SpeechSynthesisUtterance(texto);
    //msg.voice = vozNatural;
    msg.lang = 'es-ES';
    msg.volume = 1.0;
    msg.rate = 0.9;
    msg.pitch = 1.1;
    if (callback) msg.onend = () => setTimeout(callback, 300);
    window.speechSynthesis.speak(msg);
  } else {
    if (callback) setTimeout(callback, 2000);
  }
}

function actualizarFigura() {
  const figura = figurasMezcladas[indiceActual];
  img.src = figura.src;
  img.alt = `Figura ${figura.nombre}`;
  progress.style.width = `${(indiceActual / figurasMezcladas.length) * 100}%`;
  const esFemenino = figura.genero === "la";
  const esteEsta = esFemenino ? "Esta" : "Este";
  const loLa = esFemenino ? "la" : "lo";
  const texto = `${esteEsta} es ${figura.genero} ${figura.forma} ${figura.colorTexto}. Acerca${loLa} a la caja para que te ${loLa} lea.`;
  mensaje.innerHTML = `${esteEsta} es ${figura.genero} <strong style="color:${figura.color};">${figura.forma} ${figura.colorTexto}</strong>. Acerca${loLa} a la caja para que te ${loLa} lea.`;
  mensaje.style.color = "#ffffff";
  hablarConRetardo(texto);
  actualizarEstrellas();
}

function actualizarEstrellas() {
  const progreso = indiceActual / figurasMezcladas.length;
  const totalEstrellas = stars.length;
  stars.forEach((estrella, i) => {
    const umbral = (i + 1) / totalEstrellas;
    estrella.classList.toggle("active", progreso >= umbral);
  });
}

function verificarFigura(nombreDetectado) {
  if (!mostrarMensaje) return;
  figura_esperada = "";
  const figuraEsperada = figurasMezcladas[indiceActual];
  const figuraMostrada = figuras.find(f => f.nombre === nombreDetectado);
  figura_esperada = figuraEsperada.nombre;

  if (nombreDetectado === figuraEsperada.nombre) {
    const texto = "¡Correcto, lo hiciste muy bien! ¡Sigue así!";
    mensaje.textContent = texto;
    mensaje.style.color = "#00e676";
    hablarConRetardo(texto, () => {
      indiceActual++;
      if (indiceActual < figurasMezcladas.length) actualizarFigura();
      else finalizarJuego();
    });
  } else if (figuraMostrada) {
    const articulo = figuraMostrada.genero === "la" ? "una" : "un";
    const texto = `Lo siento, esta es la figura incorrecta. La figura mostrada es ${articulo} ${figuraMostrada.forma} ${figuraMostrada.colorTexto}.`;
    mensaje.textContent = texto;
    mensaje.style.color = "#ff1744";
    const imagenCorrecta = figurasMezcladas[indiceActual].src;
    const altCorrecto = figurasMezcladas[indiceActual].nombre;
    img.src = figuraMostrada.src;
    img.alt = figuraMostrada.nombre;
    hablarConRetardo(texto, () => {
      img.src = imagenCorrecta;
      img.alt = altCorrecto;
      actualizarFigura();
    });
  } else {
    const texto = "Figura no reconocida.";
    mensaje.textContent = texto;
    mensaje.style.color = "#ff1744";
    hablarConRetardo(texto);
  }
}

function finalizarJuego() {
  img.src = "/img/finalizado.png";
  img.alt = "Juego completado";
  img.style.maxWidth = "280px";
  img.style.width = "80%";
  img.style.marginTop = "20px";
  img.style.borderRadius = "20px";
  img.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
  mensaje.textContent = "¡Felicidades! Completaste todas las figuras";
  mensaje.style.color = "#00e676";
  hablarConRetardo("Felicidades, completaste todas las figuras");
  progress.style.width = "100%";
  actualizarEstrellas();
}

window.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("tutorialVideo");
  const tutorialContainer = document.getElementById("tutorialContainer");
  const figuraContainer = document.getElementById("figuraContainer");

  mostrarMensaje = false;
  mensaje.textContent = "";
  mensaje.style.display = "none";

  const socket = io();

  socket.on("nuevaFigura", ({ nombre, codigo }) => {
    verificarFigura(nombre);

    fetch("/api/rfid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo_rfid: codigo,
        modo: "guiado",
        figura_esperada: figura_esperada
      })
    }).catch((err) => {
      console.error("Error al guardar interacción RFID:", err);
    });
  });


  function iniciarJuego() {
    tutorialContainer.style.display = "none";
    figuraContainer.style.display = "flex";
    mostrarMensaje = true;
    mensaje.style.display = "block";
    tiempoInicio = Date.now();
    actualizarFigura();
  }

  if (video) {
    video.addEventListener("ended", iniciarJuego);
    setTimeout(() => {
      if (!mostrarMensaje) iniciarJuego();
    }, 7000);
  } else {
    iniciarJuego();
  }
});

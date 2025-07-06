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
  return array.sort(() => Math.random() - 0.5).slice(0, 10);
}

let figurasMezcladas = obtenerDiezAleatorias([...figuras]);
let indiceActual = 0;

const img = document.getElementById("figuraImage");
const progress = document.getElementById("progressBar");
const stars = document.querySelectorAll(".star");
const mensaje = document.createElement("p");
mensaje.className = "instruction-text";
document.querySelector(".content-box").insertBefore(mensaje, document.querySelector(".figura-display"));

function hablarConRetardo(texto, callback = null) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const voces = window.speechSynthesis.getVoices();
    const vozNatural =
      voces.find(v => v.name.includes("Google español")) ||
      voces.find(v => v.name.includes("Microsoft Sabina")) ||
      voces.find(v => v.lang === "es-ES") ||
      voces[0];

    const msg = new SpeechSynthesisUtterance(texto);
    msg.voice = vozNatural;
    msg.lang = 'es-ES';
    msg.volume = 1.0;
    msg.rate = 0.95;
    msg.pitch = 1.1;

    if (callback) {
      msg.onend = () => {
        setTimeout(callback, 300); // Pequeña pausa después de hablar
      };
    }

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
  const figuraEsperada = figurasMezcladas[indiceActual];
  const figuraMostrada = figuras.find(f => f.nombre === nombreDetectado);

  if (nombreDetectado === figuraEsperada.nombre) {
    const texto = "¡Correcto, lo hiciste muy bien! ¡Sigue así!";
    mensaje.textContent = texto;
    mensaje.style.color = "#00e676";
    hablarConRetardo(texto, () => {
      indiceActual++;
      if (indiceActual < figurasMezcladas.length) {
        actualizarFigura();
      } else {
        finalizarJuego();
      }
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
      actualizarFigura(); // Refuerza la instrucción original
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

function obtenerNombreIncorrecto(nombreCorrecto) {
  const otras = figuras.filter(f => f.nombre !== nombreCorrecto);
  return otras[Math.floor(Math.random() * otras.length)].nombre;
}

/*
function simularJuego() {
  indiceActual = 0;
  figurasMezcladas = obtenerDiezAleatorias([...figuras]);
  actualizarFigura();

  function intentarFigura() {
    if (indiceActual >= figurasMezcladas.length) return;

    const figuraActual = figurasMezcladas[indiceActual];
    const acierta = Math.random() > 0.4;
    const nombreSimulado = acierta
      ? figuraActual.nombre
      : obtenerNombreIncorrecto(figuraActual.nombre);

    verificarFigura(nombreSimulado);
  }

  const intervalo = setInterval(() => {
    if (indiceActual >= figurasMezcladas.length) {
      clearInterval(intervalo);
    } else if (!window.speechSynthesis.speaking) {
      intentarFigura();
    }
  }, 500);
}
*/

window.addEventListener("DOMContentLoaded", () => {
  actualizarFigura();

  const btnSimular = document.createElement("button");
  btnSimular.textContent = "Simular Juego Automático";
  btnSimular.style = "margin-top:20px; padding:10px 20px; font-size:16px;";
  document.querySelector(".content-box").appendChild(btnSimular);
  btnSimular.addEventListener("click", simularJuego);

  const socket = io();
  socket.on("nuevaFigura", (nombre) => {
    verificarFigura(nombre);
  });
});

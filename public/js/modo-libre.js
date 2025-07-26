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
const mapaRFIDSimulado = {
  "F6FE0885": "ESTRELLA TURQUESA",
  "B39DD90D": "CUADRADO AZUL",
  "E1B7A07B": "CUADRADO ROJO",
  "55754239": "ESTRELLA AMARILLA",
  "4CA16D3B": "CORAZON VERDE",
  "F74B6E3B": "CUADRADO AMARILLO",
  "BC124D39": "ESTRELLA NARANJA",
  "22614239": "CIRCULO AMARILLO",
  "8CAB6D3B": "CIRCULO TURQUESA",
  "F7934D39": "RECTÁNGULO AZUL",
  "65EA4139": "RECTÁNGULO VERDE",
  "BB5F4239": "CORAZON AZUL",
  "E7BD4239": "RECTÁNGULO TURQUESA",
  "896A4D39": "CORAZON ROJO",
  "AE9E4239": "TRIANGULO VERDE",
  "B0DE6D3B": "TRIANGULO NARANJA",
  "91275D7B": "TRIANGULO ROJO",
  "C6770785": "CIRCULO NARANJA"
};

// Elementos
const imgElement = document.getElementById("figuraImage");
const nameElement = document.getElementById("figuraName");
const displayElement = document.getElementById("figuraContainer");
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
    hablar("Figura no reconocida");
    return;
  }
    if (!displayElement || !imgElement || !nameElement ) {
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

}



// Reset
function resetFigura() {
  imgElement.src = "/img/incognita.png";
  imgElement.alt = "Figura desconocida";
  nameElement.textContent = "";
  nameElement.style.color = "#000";
  displayElement.classList.remove("success", "error");
}


// WebSocket
const socket = io();
  socket.on("nuevaFigura", ({ nombre, codigo }) => {
    console.log("🧩 Figura recibida:", nombre, codigo);
    mostrarFigura(nombre);

    // Guardar interacción en el servidor
    console.log("🔄 Enviando interacción al backend:", nombre, codigo);
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

    // 👇 Aquí va el nuevo bloque del simulador con menú
  const selectSimulador = document.getElementById("selectSimulador");
  Object.entries(mapaRFIDSimulado).forEach(([codigo, nombre]) => {
    const option = document.createElement("option");
    option.value = codigo;
    option.textContent = nombre;
    selectSimulador.appendChild(option);
  });
    document.getElementById("btnSimular")?.addEventListener("click", () => {
    const codigo = selectSimulador.value;
    const nombre = mapaRFIDSimulado[codigo];

    if (!codigo || !nombre) {
      alert("Selecciona una figura válida para simular.");
      return;
    }

    console.log(`🧪 Simulando figura: ${nombre} (${codigo})`);
    socket.listeners("nuevaFigura").forEach((listener) =>
      listener({ nombre, codigo })
    );
  });
  


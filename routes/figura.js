// routes/figura.js
const express = require("express");
const router = express.Router();

let ioSocket = null;

router.post("/", (req, res) => {
  const { nombre } = req.body;
  if (nombre) {
    console.log("📡 Figura recibida del ESP32:", nombre);
    if (ioSocket) ioSocket.emit("nuevaFigura", nombre);
    res.status(200).send({ status: "ok" });
  } else {
    res.status(400).send({ error: "Nombre de figura faltante" });
  }
});

// Esta función permite que server.js inyecte el socket
function setSocket(io) {
  ioSocket = io;
}

module.exports = { router, setSocket };

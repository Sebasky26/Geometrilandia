1.- Instalar XAMPP
2.- En el gestor de base de datos que ofrece XAMPP crear una base de datos llamada geometrilandia
3.- Clonar el repositorio en Visual Studio Code
4.- Conectar el cable USB del juego a la laptop
5.- Verificar que el nombre del puerto, por lo general es el COM3
6.- Caso contrario cambiar el nombre del puerto en la siguiente parte del código del archivo app.js
// === INTEGRACIÓN SERIAL CON ESP32 (PUERTO COM3) ===
const serialPort = new SerialPort({
  path: "COM3",
  baudRate: 115200,
});
7.- En la terminal de visual acceder a la carpeta modelo y ejecutar python modelo_api.py
8.- En otra terminal ejecutar el comandondo npm start
9.- Acceder a la ruta http://localhost:3000 
10.- Probar el juego

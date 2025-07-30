# Instalación de librerias
- Conectar el cable de datos a la computadora
- Se debe instalar la libreria "CP2102 drivers for Windows" para que detecte el puerto correcto.
- link: https://www.pololu.com/docs/0j7/all#2
- Una vez descargado, se extrae el archivo .zip
- Se abre el administrador de dispositivos
- Se busca la opción puertos (COM Y LPT) y saldra un warning de instalacion de drivers, entonces se le da clic derecho a actualizar dispositivo, se escoge la opcion "Buscar controladores en este dispositivo" y se busca la carpeta que descargamos previamente, se sigue los pasos y estara instalada correctamente.
# Instalación
- Instalar XAMPP
- En el gestor de base de datos que ofrece XAMPP crear una base de datos llamada geometrilandia
- Clonar el repositorio en Visual Studio Code
- En la terminal de visual acceder a la carpeta modelo y ejecutar python modelo_api.py
- En otra terminal ejecutar el comandondo npm start
- Acceder a la ruta http://localhost:3000 
- Probar el juego

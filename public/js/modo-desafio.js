// Simulación de carga de figuras y avance de progreso

const figuras = [
  ['/img/cuadrado_naranja.png', '/img/triangulo_morado.png'],
  ['/img/circulo_azul.png', '/img/triangulo_verde.png', '/img/estrella_roja.png'],
  ['/img/circulo_naranja.png']
];

let currentIndex = 0;

function renderFiguras() {
  const display = document.getElementById('figuraDisplay');
  display.innerHTML = '';

  figuras[currentIndex].forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'figura-img';
    display.appendChild(img);
  });

  updateProgress();
  updateStars();
}

function updateProgress() {
  const progress = document.getElementById('progressBar');
  const percent = ((currentIndex + 1) / figuras.length) * 100;
  progress.style.width = percent + '%';
}

function updateStars() {
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if (index <= currentIndex) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderFiguras();

  // Puedes agregar lógica de siguiente paso si lo deseas:
  document.body.addEventListener('click', () => {
    if (currentIndex < figuras.length - 1) {
      currentIndex++;
      renderFiguras();
    }
  });
});

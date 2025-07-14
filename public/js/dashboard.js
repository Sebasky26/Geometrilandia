let chartInstance = null;

async function initDashboard() {
  const welcome = document.getElementById("welcomeMessage");

  try {
    const res = await fetch("/current-user");
    const data = await res.json();

    if (data.success) {
      welcome.textContent = `Hola ${data.user.nombre} (Edad ${data.user.edad}) 👋`;
      loadStats();
    } else {
      welcome.textContent = "No se pudo cargar el perfil";
    }
  } catch (err) {
    welcome.textContent = "Error de conexión";
  }
}

function goToMode(modo) {
  if (modo === "inteligente") {
    fetch("/api/modo-inteligente", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.modo_sugerido) {
          const sugerido = json.modo_sugerido.toLowerCase();
          window.location.href = `/modo-${sugerido}`;
        } else {
          alert("No se pudo obtener el modo sugerido.");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("Hubo un problema al contactar con la IA.");
      });
  } else {
    window.location.href = `/modo-${modo}`;
  }
}

function logout() {
  fetch("/logout", {
    method: "POST",
  })
    .then(() => window.location.href = "/login")
    .catch(() => alert("Error al cerrar sesión"));
}

async function loadStats() {
  try {
    const res = await fetch("/api/stats");
    const data = await res.json();
    const container = document.getElementById("statsContainer");
    container.innerHTML = "";

    if (data.success && data.resumen_sesiones.length > 0) {
      const fechas = [];
      const aciertos = [];

      data.resumen_sesiones.forEach((sesion) => {
        const div = document.createElement("div");
        div.classList.add("sesion-card");
        div.innerHTML = `
          <h4>📅 ${sesion.fecha}</h4>
          <p><strong>Modo más usado:</strong> ${sesion.modo_mas_usado || 'N/A'}</p>
          <p><strong>Aciertos:</strong> ${sesion.aciertos}</p>
          <p><strong>Errores:</strong> ${sesion.errores}</p>
          <p><strong>Tiempo promedio por figura:</strong> ${sesion.tiempo_promedio ?? '0'}s</p>
          <p><strong>Intentos totales:</strong> ${sesion.total_interacciones}</p>
        `;
        container.appendChild(div);

        fechas.push(sesion.fecha);
        aciertos.push(sesion.aciertos);
      });

      renderChart(fechas, aciertos);
    } else {
      container.textContent = "No hay sesiones registradas aún.";
    }

  } catch (err) {
    console.error("Error cargando estadísticas:", err);
    document.getElementById("statsContainer").textContent = "Error al cargar estadísticas.";
  }
}

function renderChart(labels, data) {
  const ctx = document.getElementById("graficoAprendizaje").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Aciertos por sesión",
        data: data,
        fill: false,
        borderColor: "rgba(54, 162, 235, 1)",
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Progreso de Aciertos por Sesión"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

function mostrarAyuda() {
  const box = document.getElementById("helpBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

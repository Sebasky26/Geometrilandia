let chartInstance = null;

async function initDashboard() {
  const welcome = document.getElementById("welcomeMessage");

  try {
    const resUser = await fetch("/current-user");
    const userData = await resUser.json();

    if (userData.success) {
      welcome.textContent = `Hola ${userData.user.nombre} (Edad ${userData.user.edad}) 👋`;
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

    if (data.success && data.resumen_sesiones) {
      const resumen = data.resumen_sesiones;

      const div = document.createElement("div");
      div.classList.add("sesion-card");
      div.innerHTML = `
        <h4>📈 Resumen General</h4>
        <p><strong>Total de sesiones:</strong> ${resumen.sesiones_totales}</p>
        <p><strong>Total de interacciones:</strong> ${resumen.total_interacciones}</p>
        <p><strong>Aciertos:</strong> ${resumen.total_aciertos}</p>
        <p><strong>Errores:</strong> ${resumen.total_errores}</p>
        <p><strong>Promedio de tiempo por figura:</strong> ${resumen.tiempo_promedio ?? 0}s</p>
        <p><strong>Última actividad:</strong> ${new Date(resumen.ultima_interaccion).toLocaleDateString()}</p>
      `;
      container.appendChild(div);

      // Para gráfica (dummy temporal si no hay múltiples sesiones)
      renderChart(
        ["Aciertos", "Errores"],
        [resumen.total_aciertos, resumen.total_errores]
      );
    } else {
      container.textContent = "No hay datos aún.";
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
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Rendimiento General",
        data: data,
        backgroundColor: ["#4caf50", "#f44336"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Resumen del Rendimiento General"
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

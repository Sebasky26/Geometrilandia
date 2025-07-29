let chartInstance = null;

// Inicializa el dashboard al cargar la página
async function initDashboard() {
  const welcome = document.getElementById("welcomeMessage");

  try {
    const resUser = await fetch("/current-user");
    const userData = await resUser.json();

    if (userData.success) {
      welcome.textContent = `Hola ${userData.user.nombre} (Edad ${userData.user.edad})`;
      loadStats();
    } else {
      welcome.textContent = "No se pudo cargar el perfil";
    }
  } catch (err) {
    welcome.textContent = "Error de conexión";
  }
}

// Redirige al modo de juego seleccionado
function goToMode(modo) {
  if (modo === "inteligente") {
    fetch("/api/modo-inteligente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

// Cierra sesión del usuario
function logout() {
  fetch("/logout", { method: "POST" })
    .then(() => window.location.href = "/login")
    .catch(() => alert("Error al cerrar sesión"));
}

// Carga y renderiza las estadísticas en el panel
async function loadStats() {
  try {
    const res = await fetch("/api/stats");
    const data = await res.json();
    const container = document.getElementById("statsContainer");
    container.innerHTML = "";

    if (data.success && data.resumen_sesiones) {
      const resumen = data.resumen_sesiones;

      // Tiempo promedio por figura (minutos con un decimal)
      const promedioMin = resumen.tiempo_promedio
        ? (resumen.tiempo_promedio / 60).toFixed(1)
        : "0.0";

      // Tiempo total jugado (minutos y segundos)
      const totalSegundos = resumen.tiempo_total ?? 0;
      const min = Math.floor(totalSegundos / 60);
      const sec = totalSegundos % 60;
      const tiempoTotalFormateado = `${min} min ${sec}s`;

      // Cálculo de precisión como porcentaje
      const totalInt = resumen.total_interacciones || 0;
      const totalAciertos = resumen.total_aciertos || 0;
      const precision = totalInt > 0
        ? ((totalAciertos / totalInt) * 100).toFixed(1)
        : "0.0";

      // Fecha de última actividad (formato local)
      const ultimaActividad = resumen.ultima_interaccion
        ? new Date(resumen.ultima_interaccion).toLocaleDateString()
        : "Sin datos";

      // Renderizar el resumen general
      const div = document.createElement("div");
      div.classList.add("sesion-card");
      div.innerHTML = `
        <h4>📈 Resumen General</h4>
        <p><strong>Total de sesiones:</strong> ${resumen.sesiones_totales}</p>
        <p><strong>Total de interacciones:</strong> ${totalInt}</p>
        <p><strong>Aciertos:</strong> ${totalAciertos}</p>
        <p><strong>Errores:</strong> ${resumen.total_errores}</p>
        <p><strong>Precisión:</strong> ${precision}%</p>
        <p><strong>Tiempo total jugado:</strong> ${tiempoTotalFormateado}</p>
        <p><strong>Última actividad:</strong> ${ultimaActividad}</p>
      `;
      container.appendChild(div);

      // Renderizar gráfico de barras (aciertos vs errores)
      renderChart(["Aciertos", "Errores"], [totalAciertos, resumen.total_errores]);
    } else {
      container.textContent = "No hay datos aún.";
    }
  } catch (err) {
    console.error("Error cargando estadísticas:", err);
    document.getElementById("statsContainer").textContent = "Error al cargar estadísticas.";
  }
}

// Dibuja el gráfico de barras con Chart.js
function renderChart(labels, data) {
  const ctx = document.getElementById("graficoAprendizaje").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Rendimiento General",
        data,
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
          ticks: { precision: 0 }
        }
      }
    }
  });
}

// Muestra/oculta el cuadro de ayuda
function mostrarAyuda() {
  const box = document.getElementById("helpBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

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
          const sugerido = json.modo_sugerido.toLowerCase(); // "libre", "guiado", "desafio"
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

    if (data.success && data.stats.length > 0) {
      const labels = [];
      const correctos = [];
      const totales = [];

      data.stats.forEach(stat => {
        const label = `${stat.figura} (${stat.modo})`;
        labels.push(label);
        correctos.push(stat.aciertos);
        totales.push(stat.total_intentos);

        const div = document.createElement("div");
        div.innerHTML = `
          <strong>${stat.figura}</strong> (${stat.modo}): ${stat.aciertos} aciertos de ${stat.total_intentos} intentos
        `;
        div.style.marginBottom = "8px";
        container.appendChild(div);
      });

      renderChart(labels, correctos, totales);
    } else {
      container.textContent = "No hay estadísticas aún.";
    }
  } catch (err) {
    document.getElementById("statsContainer").textContent = "Error al cargar estadísticas.";
  }
}

function renderChart(labels, aciertos, intentos) {
  const ctx = document.getElementById("graficoAprendizaje").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Aciertos",
          data: aciertos,
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1
        },
        {
          label: "Intentos Totales",
          data: intentos,
          backgroundColor: "rgba(153, 102, 255, 0.7)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          precision: 0
        }
      },
      plugins: {
        title: {
          display: true,
          text: "Progreso por figura y modo"
        }
      }
    }
  });
}

function mostrarAyuda() {
  const box = document.getElementById("helpBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

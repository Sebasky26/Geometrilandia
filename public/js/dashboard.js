async function initDashboard() {
  const welcome = document.getElementById("welcomeMessage")
  const statsContainer = document.getElementById("statsContainer")

  try {
    const res = await fetch("/current-user")
    const data = await res.json()

    if (data.success) {
      welcome.textContent = `Hola ${data.user.nombre} (Edad ${data.user.edad}) 👋`
      loadStats()
    } else {
      welcome.textContent = "No se pudo cargar el perfil"
    }
  } catch (err) {
    welcome.textContent = "Error de conexión"
  }
}

function goToMode(modo) {
  window.location.href = `/modo-${modo}`
}

function logout() {
  fetch("/logout", {
    method: "POST",
  })
    .then(() => window.location.href = "/login")
    .catch(() => alert("Error al cerrar sesión"))
}

async function loadStats() {
  try {
    const res = await fetch("/api/stats")
    const data = await res.json()
    const container = document.getElementById("statsContainer")
    container.innerHTML = ""

    if (data.success && data.stats.length > 0) {
      data.stats.forEach(stat => {
        const div = document.createElement("div")
        div.innerHTML = `
          <strong>${stat.figura}</strong> (${stat.modo}): ${stat.aciertos} aciertos de ${stat.total_intentos} intentos
        `
        div.style.marginBottom = "8px"
        container.appendChild(div)
      })
    } else {
      container.textContent = "No hay estadísticas aún."
    }
  } catch (err) {
    document.getElementById("statsContainer").textContent = "Error al cargar estadísticas."
  }
}

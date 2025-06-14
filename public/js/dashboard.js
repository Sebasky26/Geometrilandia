// Funciones del dashboard

// Inicializar dashboard
async function initDashboard() {
  await loadUserInfo()
  await loadStats()
}

// Cargar información del usuario
async function loadUserInfo() {
  try {
    const response = await fetch("/current-user")
    const result = await response.json()

    if (result.success) {
      const welcomeMessage = document.getElementById("welcomeMessage")
      if (welcomeMessage) {
        welcomeMessage.textContent = `¡Hola! Aquí está el área de juego para ${result.user.nombre_nino} (${result.user.edad} años)`
      }
    } else {
      window.location.href = "/login"
    }
  } catch (error) {
    console.error("Error cargando información del usuario:", error)
    window.location.href = "/login"
  }
}

// Cargar estadísticas
async function loadStats() {
  try {
    const response = await fetch("/api/stats")
    const result = await response.json()

    const statsContainer = document.getElementById("statsContainer")

    if (result.success && result.stats.length > 0) {
      displayStats(result.stats)
    } else {
      statsContainer.innerHTML = `
                <div class="text-center">
                    <p style="color: #666; font-size: 1.1rem;">
                        🎮 ¡Aún no hay estadísticas!<br>
                        Comienza a jugar para ver el progreso de aprendizaje.
                    </p>
                </div>
            `
    }
  } catch (error) {
    console.error("Error cargando estadísticas:", error)
    const statsContainer = document.getElementById("statsContainer")
    statsContainer.innerHTML = `
            <div class="text-center">
                <p style="color: #ff6b6b;">Error cargando estadísticas</p>
            </div>
        `
  }
}

// Mostrar estadísticas
function displayStats(stats) {
  const statsContainer = document.getElementById("statsContainer")

  // Agrupar estadísticas por figura
  const figuraStats = {}
  stats.forEach((stat) => {
    if (!figuraStats[stat.figura]) {
      figuraStats[stat.figura] = {
        libre: { total: 0, aciertos: 0 },
        guiado: { total: 0, aciertos: 0 },
        desafio: { total: 0, aciertos: 0 },
      }
    }

    figuraStats[stat.figura][stat.modo] = {
      total: stat.total_intentos,
      aciertos: stat.aciertos,
    }
  })

  let statsHTML = '<div class="stats-grid">'

  Object.keys(figuraStats).forEach((figura) => {
    const figStats = figuraStats[figura]
    const totalIntentos = figStats.libre.total + figStats.guiado.total + figStats.desafio.total
    const totalAciertos = figStats.libre.aciertos + figStats.guiado.aciertos + figStats.desafio.aciertos
    const porcentaje = totalIntentos > 0 ? Math.round((totalAciertos / totalIntentos) * 100) : 0

    statsHTML += `
            <div class="stat-item">
                <h4>${getFiguraIcon(figura)} ${figura.toUpperCase()}</h4>
                <p><strong>${porcentaje}%</strong> de aciertos</p>
                <p>${totalAciertos}/${totalIntentos} intentos</p>
                <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #666;">
                    Libre: ${figStats.libre.aciertos}/${figStats.libre.total} | 
                    Guiado: ${figStats.guiado.aciertos}/${figStats.guiado.total} | 
                    Desafío: ${figStats.desafio.aciertos}/${figStats.desafio.total}
                </div>
            </div>
        `
  })

  statsHTML += "</div>"
  statsContainer.innerHTML = statsHTML
}

// Obtener ícono de figura
function getFiguraIcon(figura) {
  const iconos = {
    cubo: "🔷",
    esfera: "🔵",
    piramide: "🔺",
    cilindro: "🥫",
    cono: "🍦",
    prisma: "📦",
  }
  return iconos[figura] || "🔷"
}

// Navegar a modo de juego
function goToMode(mode) {
  const urls = {
    libre: "/modo-libre",
    guiado: "/modo-guiado",
    desafio: "/modo-desafio",
  }

  if (urls[mode]) {
    window.location.href = urls[mode]
  }
}

// Función de logout (reutilizada de auth.js)
async function logout() {
  try {
    const response = await fetch("/logout", {
      method: "POST",
    })

    const result = await response.json()

    if (result.success) {
      window.location.href = "/login"
    } else {
      alert("Error al cerrar sesión")
    }
  } catch (error) {
    console.error("Error:", error)
    alert("Error de conexión")
  }
}

// Mostrar/ocultar ayuda
function mostrarAyuda() {
  const box = document.getElementById("helpBox")
  box.style.display = box.style.display === "none" ? "block" : "none"
}

// Mostrar mensajes
function showError(msg) {
  const e = document.getElementById("errorMessage")
  const s = document.getElementById("successMessage")
  e.textContent = msg
  e.style.display = "block"
  s.style.display = "none"
}

function showSuccess(msg) {
  const s = document.getElementById("successMessage")
  const e = document.getElementById("errorMessage")
  s.textContent = msg
  s.style.display = "block"
  e.style.display = "none"
}

// Cargar lista de niños desde el backend
async function cargarNinos() {
  try {
    const res = await fetch("/api/ninos")
    const data = await res.json()
    const select = document.getElementById("lista-ninos")

    if (data.success && Array.isArray(data.ninos)) {
      data.ninos.forEach(nino => {
        const option = document.createElement("option")
        option.value = nino.id
        option.textContent = `${nino.nombre} (Edad ${nino.edad})`
        select.appendChild(option)
      })
    }
  } catch (err) {
    showError("Error al cargar la lista de niños.")
  }
}

// Inicializar formulario de login
function initLoginForm() {
  const form = document.getElementById("loginForm")
  const btn = document.getElementById("loginBtn")

  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    const ninoId = document.getElementById("lista-ninos").value

    if (!ninoId) {
      showError("Selecciona un niño para continuar")
      return
    }

    btn.disabled = true
    btn.textContent = "Cargando..."

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nino_id: ninoId })
      })

      const result = await response.json()
      console.log("Resultado login:", result)
      if (result.success) {
        showSuccess("Bienvenido, redirigiendo...")
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1500)
      } else {
        showError(result.message || "Error al iniciar sesión")
      }
    } catch (err) {
      showError("No se pudo conectar con el servidor.")
    } finally {
      btn.disabled = false
      btn.textContent = "Empezar"
    }
  })
}

// Ejecutar al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  cargarNinos()
  initLoginForm()
})

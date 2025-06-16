// Mostrar mensaje de error
function showError(message) {
  const errorDiv = document.getElementById("errorMessage")
  const successDiv = document.getElementById("successMessage")
  if (errorDiv) {
    errorDiv.textContent = message
    errorDiv.style.display = "block"
  }
  if (successDiv) successDiv.style.display = "none"
}

// Mostrar mensaje de éxito
function showSuccess(message) {
  const errorDiv = document.getElementById("errorMessage")
  const successDiv = document.getElementById("successMessage")
  if (successDiv) {
    successDiv.textContent = message
    successDiv.style.display = "block"
  }
  if (errorDiv) errorDiv.style.display = "none"
}

// Limpiar mensajes
function clearMessages() {
  const errorDiv = document.getElementById("errorMessage")
  const successDiv = document.getElementById("successMessage")
  if (errorDiv) errorDiv.style.display = "none"
  if (successDiv) successDiv.style.display = "none"
}

// Inicializar formulario de login (solo selecciona niño)
function initLoginForm() {
  const form = document.getElementById("loginForm")
  const submitBtn = document.getElementById("loginBtn")

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      clearMessages()

      const ninoId = document.getElementById("lista-ninos").value

      if (!ninoId) {
        showError("Selecciona un niño para continuar")
        return
      }

      submitBtn.disabled = true
      submitBtn.textContent = "Cargando..."

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nino_id: ninoId }),
        })

        const result = await response.json()

        if (result.success) {
          showSuccess("Inicio de sesión exitoso. Redirigiendo...")
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 1500)
        } else {
          showError(result.message || "No se pudo iniciar sesión")
        }
      } catch (err) {
        console.error("Error:", err)
        showError("Error de conexión con el servidor")
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = "Empezar"
      }
    })
  }
}

// Inicializar formulario de registro
function initRegisterForm() {
  const form = document.getElementById("registerForm")
  const submitBtn = document.getElementById("registerBtn")

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      clearMessages()

      const formData = new FormData(form)
      const data = {
        nombre_nino: formData.get("nombre_nino"),
        edad: parseInt(formData.get("edad")),
        nombre_instructor: formData.get("nombre_instructor"),
        cedula_instructor: formData.get("cedula_instructor"),
      }

      // Validaciones básicas
      if (!data.nombre_nino || !data.edad || !data.nombre_instructor || !data.cedula_instructor) {
        showError("Por favor completa todos los campos")
        return
      }

      if (isNaN(data.edad) || data.edad < 2 || data.edad > 4) {
        showError("La edad debe estar entre 2 y 4 años")
        return
      }

      if (!/^\d{10}$/.test(data.cedula_instructor)) {
        showError("La cédula del instructor debe tener 10 dígitos numéricos")
        return
      }

      submitBtn.disabled = true
      submitBtn.textContent = "Registrando..."

      try {
        const response = await fetch("/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (result.success) {
          showSuccess("Registro exitoso. Redirigiendo...")
          setTimeout(() => {
            window.location.href = "/login"
          }, 2000)
        } else {
          showError(result.message || "Error al registrar")
        }
      } catch (err) {
        console.error("Error:", err)
        showError("Error de conexión con el servidor")
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = "Guardar Perfil"
      }
    })
  }
}

// Cerrar sesión
async function logout() {
  try {
    const response = await fetch("/logout", { method: "POST" })
    const result = await response.json()
    if (result.success) {
      window.location.href = "/login"
    } else {
      alert("No se pudo cerrar sesión")
    }
  } catch (err) {
    console.error("Error:", err)
    alert("Error de conexión al cerrar sesión")
  }
}

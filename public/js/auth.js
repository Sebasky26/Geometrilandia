// Funciones de autenticación

// Mostrar mensaje de error
function showError(message) {
  const errorDiv = document.getElementById("errorMessage")
  const successDiv = document.getElementById("successMessage")

  if (errorDiv) {
    errorDiv.textContent = message
    errorDiv.style.display = "block"
  }

  if (successDiv) {
    successDiv.style.display = "none"
  }
}

// Mostrar mensaje de éxito
function showSuccess(message) {
  const errorDiv = document.getElementById("errorMessage")
  const successDiv = document.getElementById("successMessage")

  if (successDiv) {
    successDiv.textContent = message
    successDiv.style.display = "block"
  }

  if (errorDiv) {
    errorDiv.style.display = "none"
  }
}

// Limpiar mensajes
function clearMessages() {
  const errorDiv = document.getElementById("errorMessage")
  const successDiv = document.getElementById("successMessage")

  if (errorDiv) errorDiv.style.display = "none"
  if (successDiv) successDiv.style.display = "none"
}

// Inicializar formulario de login
function initLoginForm() {
  const form = document.getElementById("loginForm")
  const submitBtn = document.getElementById("loginBtn")

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      clearMessages()

      const formData = new FormData(form)
      const data = {
        cedula: formData.get("cedula"),
        password: formData.get("password"),
      }

      // Validaciones básicas
      if (!data.cedula || !data.password) {
        showError("Por favor completa todos los campos")
        return
      }

      // Deshabilitar botón durante el envío
      submitBtn.disabled = true
      submitBtn.textContent = "Iniciando sesión..."

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (result.success) {
          showSuccess("¡Inicio de sesión exitoso! Redirigiendo...")
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 1500)
        } else {
          showError(result.message || "Error al iniciar sesión")
        }
      } catch (error) {
        console.error("Error:", error)
        showError("Error de conexión. Intenta nuevamente.")
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = "Iniciar Sesión"
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
        cedula: formData.get("cedula"),
        nombre_nino: formData.get("nombre_nino"),
        edad: Number.parseInt(formData.get("edad")),
        password: formData.get("password"),
        confirm_password: formData.get("confirm_password"),
      }

      // Validaciones del lado del cliente
      if (!data.cedula || !data.nombre_nino || !data.edad || !data.password || !data.confirm_password) {
        showError("Por favor completa todos los campos")
        return
      }

      if (data.password !== data.confirm_password) {
        showError("Las contraseñas no coinciden")
        return
      }

      if (data.password.length < 6) {
        showError("La contraseña debe tener al menos 6 caracteres")
        return
      }

      if (data.edad < 2 || data.edad > 4) {
        showError("La edad debe estar entre 2 y 4 años")
        return
      }

      // Deshabilitar botón durante el envío
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
          showSuccess("¡Registro exitoso! Redirigiendo al login...")
          setTimeout(() => {
            window.location.href = "/login"
          }, 2000)
        } else {
          showError(result.message || "Error al registrar usuario")
        }
      } catch (error) {
        console.error("Error:", error)
        showError("Error de conexión. Intenta nuevamente.")
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = "Registrarse"
      }
    })
  }
}

// Función para cerrar sesión
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

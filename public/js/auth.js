// Geometrilandia - Funciones de autenticación
// Manejo de login y registro con validaciones

class AuthManager {
  constructor() {
    this.initializeEventListeners()
  }

  // Inicializar event listeners
  initializeEventListeners() {
    // Formulario de login
    const loginForm = document.getElementById("loginForm")
    if (loginForm) {
      loginForm.addEventListener("submit", this.handleLogin.bind(this))
    }

    // Formulario de registro
    const registerForm = document.getElementById("registerForm")
    if (registerForm) {
      registerForm.addEventListener("submit", this.handleRegister.bind(this))
    }

    // Botón de logout
    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", this.handleLogout.bind(this))
    }

    // Validación en tiempo real
    this.setupRealTimeValidation()
  }

  // Configurar validación en tiempo real
  setupRealTimeValidation() {
    const emailInputs = document.querySelectorAll('input[type="email"]')
    const passwordInputs = document.querySelectorAll('input[type="password"]')

    emailInputs.forEach((input) => {
      input.addEventListener("blur", this.validateEmail.bind(this))
    })

    passwordInputs.forEach((input) => {
      input.addEventListener("input", this.validatePassword.bind(this))
    })

    // Validar confirmación de contraseña
    const confirmPasswordInput = document.getElementById("confirmPassword")
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener("input", this.validatePasswordConfirmation.bind(this))
    }
  }

  // Manejar login
  async handleLogin(event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)
    const submitBtn = form.querySelector('button[type="submit"]')

    // Deshabilitar botón durante el proceso
    this.setButtonLoading(submitBtn, true)

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: formData.get("correo"),
          password: formData.get("password"),
        }),
      })

      const result = await response.json()

      if (result.success) {
        this.showAlert("¡Bienvenido a Geometrilandia!", "success")
        // Redirigir al dashboard después de un breve delay
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      } else {
        this.showAlert(result.message, "error")
      }
    } catch (error) {
      console.error("Error en login:", error)
      this.showAlert("Error de conexión. Por favor intenta nuevamente.", "error")
    } finally {
      this.setButtonLoading(submitBtn, false)
    }
  }

  // Manejar registro
  async handleRegister(event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)
    const submitBtn = form.querySelector('button[type="submit"]')

    // Validar formulario antes de enviar
    if (!this.validateRegisterForm(form)) {
      return
    }

    this.setButtonLoading(submitBtn, true)

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.get("nombre"),
          correo: formData.get("correo"),
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword"),
        }),
      })

      const result = await response.json()

      if (result.success) {
        this.showAlert("¡Registro exitoso! Bienvenido a Geometrilandia.", "success")
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      } else {
        this.showAlert(result.message, "error")
      }
    } catch (error) {
      console.error("Error en registro:", error)
      this.showAlert("Error de conexión. Por favor intenta nuevamente.", "error")
    } finally {
      this.setButtonLoading(submitBtn, false)
    }
  }

  // Manejar logout
  async handleLogout(event) {
    event.preventDefault()

    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        this.showAlert("Sesión cerrada correctamente.", "success")
        setTimeout(() => {
          window.location.href = "/login"
        }, 1000)
      }
    } catch (error) {
      console.error("Error en logout:", error)
      // Redirigir de todas formas
      window.location.href = "/login"
    }
  }

  // Validar email
  validateEmail(event) {
    const input = event.target
    const email = input.value.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (email && !emailRegex.test(email)) {
      this.setInputError(input, "Por favor ingresa un correo válido")
      return false
    } else {
      this.clearInputError(input)
      return true
    }
  }

  // Validar contraseña
  validatePassword(event) {
    const input = event.target
    const password = input.value

    if (password.length > 0 && password.length < 6) {
      this.setInputError(input, "La contraseña debe tener al menos 6 caracteres")
      return false
    } else {
      this.clearInputError(input)
      return true
    }
  }

  // Validar confirmación de contraseña
  validatePasswordConfirmation(event) {
    const confirmInput = event.target
    const passwordInput = document.getElementById("password")

    if (passwordInput && confirmInput.value !== passwordInput.value) {
      this.setInputError(confirmInput, "Las contraseñas no coinciden")
      return false
    } else {
      this.clearInputError(confirmInput)
      return true
    }
  }

  // Validar formulario completo de registro
  validateRegisterForm(form) {
    const nombre = form.querySelector("#nombre").value.trim()
    const correo = form.querySelector("#correo").value.trim()
    const password = form.querySelector("#password").value.trim()
    const confirmPassword = form.querySelector("#confirmPassword").value.trim()

    let isValid = true

    // Validar nombre
    if (!nombre) {
      this.setInputError(form.querySelector("#nombre"), "El nombre es requerido")
      isValid = false
    }

    // Validar correo
    if (!correo) {
      this.setInputError(form.querySelector("#correo"), "El correo es requerido")
      isValid = false
    } else if (!this.validateEmail({ target: form.querySelector("#correo") })) {
      isValid = false
    }

    // Validar contraseña
    if (!password) {
      this.setInputError(form.querySelector("#password"), "La contraseña es requerida")
      isValid = false
    } else if (password.length < 6) {
      this.setInputError(form.querySelector("#password"), "La contraseña debe tener al menos 6 caracteres")
      isValid = false
    }

    // Validar confirmación de contraseña
    if (!confirmPassword) {
      this.setInputError(form.querySelector("#confirmPassword"), "Confirma tu contraseña")
      isValid = false
    } else if (password !== confirmPassword) {
      this.setInputError(form.querySelector("#confirmPassword"), "Las contraseñas no coinciden")
      isValid = false
    }

    return isValid
  }

  // Establecer error en input
  setInputError(input, message) {
    this.clearInputError(input)

    input.classList.add("error")
    const errorDiv = document.createElement("div")
    errorDiv.className = "input-error"
    errorDiv.textContent = message
    errorDiv.style.color = "var(--color-error)"
    errorDiv.style.fontSize = "var(--font-size-sm)"
    errorDiv.style.marginTop = "var(--spacing-xs)"

    input.parentNode.appendChild(errorDiv)
  }

  // Limpiar error de input
  clearInputError(input) {
    input.classList.remove("error")
    const existingError = input.parentNode.querySelector(".input-error")
    if (existingError) {
      existingError.remove()
    }
  }

  // Establecer estado de carga en botón
  setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.disabled = true
      button.dataset.originalText = button.textContent
      button.innerHTML = "<span>Procesando...</span>"
    } else {
      button.disabled = false
      button.textContent = button.dataset.originalText || button.textContent
    }
  }

  // Mostrar alerta
  showAlert(message, type = "info") {
    // Remover alertas existentes
    const existingAlerts = document.querySelectorAll(".alert")
    existingAlerts.forEach((alert) => alert.remove())

    const alertDiv = document.createElement("div")
    alertDiv.className = `alert alert-${type} fade-in`
    alertDiv.textContent = message

    // Insertar al inicio del contenido principal
    const mainContent = document.querySelector(".auth-card") || document.querySelector(".container")
    if (mainContent) {
      mainContent.insertBefore(alertDiv, mainContent.firstChild)
    }

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove()
      }
    }, 5000)
  }

  // Verificar estado de autenticación
  async checkAuthStatus() {
    try {
      const response = await fetch("/check-auth")
      const result = await response.json()

      return result.authenticated
    } catch (error) {
      console.error("Error verificando autenticación:", error)
      return false
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new AuthManager()
})

// Funciones globales para uso en HTML
window.GeometriaAuth = {
  // Redirigir a página específica
  redirectTo: (page) => {
    window.location.href = page
  },

  // Validar formulario antes de envío
  validateForm: (formId) => {
    const form = document.getElementById(formId)
    if (!form) return false

    const authManager = new AuthManager()
    return authManager.validateRegisterForm(form)
  },
}

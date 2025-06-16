
    // Ayuda flotante
    function mostrarAyuda() {
      const box = document.getElementById("helpBox")
      box.style.display = box.style.display === "none" ? "block" : "none"
    }

    function showError(message) {
      const e = document.getElementById("errorMessage")
      const s = document.getElementById("successMessage")
      e.textContent = message
      e.style.display = "block"
      s.style.display = "none"
    }

    function showSuccess(message) {
      const e = document.getElementById("errorMessage")
      const s = document.getElementById("successMessage")
      s.textContent = message
      s.style.display = "block"
      e.style.display = "none"
    }

    // Registro con fetch
    document.getElementById("registerForm").addEventListener("submit", async (e) => {
      e.preventDefault()

      const form = e.target
      const data = {
        nombre_nino: form.nombre_nino.value.trim(),
        edad: parseInt(form.edad.value),
        nombre_instructor: form.nombre_instructor.value.trim(),
        cedula_instructor: form.cedula_instructor.value.trim(),
      }

      if (!data.nombre_nino || !data.edad || !data.nombre_instructor || !data.cedula_instructor) {
        showError("Por favor completa todos los campos.")
        return
      }

      if (!/^\d{10}$/.test(data.cedula_instructor)) {
        showError("La cédula del instructor debe tener 10 dígitos.")
        return
      }

      if (data.edad < 2 || data.edad > 4) {
        showError("La edad debe estar entre 2 y 4 años.")
        return
      }

      const btn = document.getElementById("registerBtn")
      btn.disabled = true
      btn.textContent = "Guardando..."

      try {
        const res = await fetch("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        const result = await res.json()

        if (result.success) {
          showSuccess("Perfil creado exitosamente. Redirigiendo...")
          setTimeout(() => {
            window.location.href = "/login"
          }, 2000)
        } else {
          showError(result.message || "No se pudo guardar el perfil.")
        }
      } catch (err) {
        console.error(err)
        showError("Error de conexión con el servidor.")
      } finally {
        btn.disabled = false
        btn.textContent = "Guardar Perfil"
      }
    })

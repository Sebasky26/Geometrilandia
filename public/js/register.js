// Música
const music = document.getElementById('fondoTablero');

function iniciarMusicaFondo() {
  if (!music) return;
  music.volume = 0.09;
  music.play().catch(() => {
    document.addEventListener('click', reproducirTrasInteraccion, { once: true });
  });
}

function reproducirTrasInteraccion() {
  music.play().catch((err) => {
    console.warn("El navegador sigue bloqueando la reproducción:", err);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  iniciarMusicaFondo();

  window.addEventListener('pageshow', (event) => {
    const tipo = performance.getEntriesByType("navigation")[0]?.type;
    if (event.persisted || tipo === "back_forward") {
      iniciarMusicaFondo();
    }
  });
});

window.addEventListener('beforeunload', () => {
  if (music) {
    music.pause();
    music.currentTime = 0;
  }
});

// Ayuda flotante
function mostrarAyuda() {
  const box = document.getElementById("helpBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

// Validación nativa + envío
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  const form = e.target;

  // Limpiar mensajes personalizados previos
  const fields = form.querySelectorAll("input, select");
  fields.forEach(f => f.setCustomValidity(""));

  // Validación personalizada por campo
  const nombreNino = form.nombre_nino;
  const nombreInstructor = form.nombre_instructor;
  const cedula = form.cedula_instructor;
  const edad = form.edad;

  if (!nombreNino.value.trim()) {
    nombreNino.setCustomValidity("Por favor, completa el nombre del niño.");
  } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(nombreNino.value)) {
    nombreNino.setCustomValidity("El nombre del niño solo debe contener letras.");
  }

  if (!nombreInstructor.value.trim()) {
    nombreInstructor.setCustomValidity("Por favor, completa el nombre del instructor.");
  } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(nombreInstructor.value)) {
    nombreInstructor.setCustomValidity("El nombre del instructor solo debe contener letras.");
  }

  if (!cedula.value.trim()) {
    cedula.setCustomValidity("Por favor, completa la cédula.");
  } else if (!/^\d{10}$/.test(cedula.value)) {
    cedula.setCustomValidity("La cédula debe tener 10 dígitos numéricos.");
  }

  if (!edad.value) {
    edad.setCustomValidity("Por favor, selecciona una edad.");
  } else if (parseInt(edad.value) < 2 || parseInt(edad.value) > 4) {
    edad.setCustomValidity("La edad debe estar entre 2 y 4 años.");
  }

  if (!form.checkValidity()) {
    e.preventDefault(); // Evita envío si algún campo es inválido
    form.reportValidity(); // Muestra mensajes nativos del navegador
    return;
  }

  e.preventDefault(); // Validez pasada, ahora enviamos manualmente

  const data = {
    nombre_nino: nombreNino.value.trim(),
    edad: parseInt(edad.value),
    nombre_instructor: nombreInstructor.value.trim(),
    cedula_instructor: cedula.value.trim(),
  };

  const btn = document.getElementById("registerBtn");
  btn.disabled = true;
  btn.textContent = "Guardando...";

  try {
    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.success) {
      const successMsg = document.getElementById("successMessage");
      successMsg.textContent = "Perfil creado exitosamente. Redirigiendo...";
      successMsg.style.display = "block";

      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);


      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
    } else {
      alert(result.message || "No se pudo guardar el perfil.");
    }

  } catch (err) {
    console.error(err);
    alert("Error de conexión con el servidor.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Guardar Perfil";
  }
});

// Limpiar mensajes personalizados al escribir
document.querySelectorAll("#registerForm input, #registerForm select").forEach((campo) => {
  campo.addEventListener("input", () => {
    campo.setCustomValidity("");
  });
});

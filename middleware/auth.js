// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next()
  } else {
    // Si es una petición AJAX, devolver JSON
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(401).json({
        success: false,
        message: "Sesión expirada. Por favor inicia sesión nuevamente.",
        redirect: "/login",
      })
    }
    // Si es una petición normal, redirigir
    return res.redirect("/login")
  }
}

// Middleware para redirigir usuarios autenticados
const redirectIfAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect("/dashboard")
  }
  next()
}

module.exports = {
  requireAuth,
  redirectIfAuth,
}

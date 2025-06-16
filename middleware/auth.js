// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  if (!req.session.ninoId) {
    return res.redirect("/login")
  }
  next()
}

// Middleware para redirigir si ya está autenticado
const redirectIfAuth = (req, res, next) => {
  if (req.session.ninoId) {
    return res.redirect("/dashboard")
  }
  next()
}

module.exports = {
  requireAuth,
  redirectIfAuth,
}

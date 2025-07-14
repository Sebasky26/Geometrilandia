// middleware/auth.js
const requireAuth = (req, res, next) => {
  if (!req.session.ninoId) {
    return res.redirect("/login");
  }
  next();
};

const redirectIfAuth = (req, res, next) => {
  if (req.session.ninoId) {
    return res.redirect("/dashboard");
  }
  next();
};

module.exports = {
  requireAuth,
  redirectIfAuth,
};

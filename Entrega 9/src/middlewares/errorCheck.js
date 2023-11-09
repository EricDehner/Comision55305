export const checkSession = (req, res, next) => {
  if (req.session && req.session.user) {
    req.logger.info('Usuario:', req.session.user);
    next();
  } else {
    req.logger.error('Sesión no encontrada, volviendo a /login');
    res.redirect("/login");
  }
};

export const checkAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    req.logger.info("Usuario verificado, redirigiendo a /profile");
    res.redirect("/products");
  } else {
    req.logger.warn("Usuario no verificado.");
    next();
  }
};
export const checkSession = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

export const checkAuth = (req, res, next) => {
  console.log(req.session.user);

  if (req.session && req.session.user) {
    console.log("Usuario verificado, redirigiendo a /profile");
    res.redirect("/products");
  } else {
    console.log("Usuario no verificado.");
    next();
  }
};
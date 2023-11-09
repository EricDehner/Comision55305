import AuthService from "../services/authService.js";
import CustomError from "../services/errors/customError.js";
import EErrors from "../services/errors/errors-enum.js";
import { generateAuthenticationErrorInfo } from "../services/errors/messages/user.auth.error.js";

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await this.authService.login(email, password);
      req.logger.info("Usuario conectado:", userData);

      if (!userData || !userData.user) {
        req.logger.error("Error de autenticación");
        const customError = new CustomError({ name: "Error de autenticación", message: "Datos incorrectos", code: 401, cause: generateAuthenticationErrorInfo(email) });
        return next(customError);
      }

      req.session.user = {
        id: userData.user._id,
        email: userData.user.email,
        first_name: userData.user.first_name,
        last_name: userData.user.last_name,
        role: userData.user.role,
        cart: userData.user.cart
      };

      res.cookie('CookieToken', userData.token, { httpOnly: true, secure: false });

      //console.log('Role retrieved:', userData.user.role);

      return res.status(200).json({ status: "success", user: userData.user, token: userData.token, redirect: "/products" });
    } catch (error) {
      req.logger.error("Ocurrió un error:", error);
      return next(error);
    }
  }

  async githubCallback(req, res) {
    console.log("Inside AuthController githubCallback");
    try {
      if (req.user) {
        req.session.user = req.user;
        req.session.loggedIn = true;
        req.logger.info("Usuario vinculado");
        return res.redirect("/products");
      } else {
        req.logger.info("Volviendo a /login");
        return res.redirect("/login");
      }
    } catch (error) {
      req.logger.error("Ocurrió un error:", error);
      return res.redirect("/login");
    }
  }

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        req.logger.info("Sesión finalizada");
        return res.redirect("/profile");
      } 
      req.logger.error("Error al finalizar sesión.");
      return res.redirect("/login");
    });
  }
}

export default AuthController;

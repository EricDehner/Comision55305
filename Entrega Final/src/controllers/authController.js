import AuthService from "../services/authService.js";
import CustomError from "../services/errors/customErrorMsg.js";

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await this.authService.login(email, password);
      await this.authService.updateLastConnection(userData.user);

      req.session.user = this.authService.extractUserData(userData.user);
      res.cookie('CookieToken', userData.token, { httpOnly: true, secure: false });

      return res.status(200).json({ status: "success", user: userData.user, token: userData.token, redirect: "/products" });
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      req.logger.error("Ocurrió un error:", error);
      return next(error);
    }
  }

  async githubCallback(req, res) {
    try {
      if (req.user) {
        req.session.user = req.user;
        req.session.loggedIn = true;
        return res.redirect("/products");
      } else {
        return res.redirect("/login");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      return res.redirect("/login");
    }
  }

  logout(req, res) {
    this.authService.destroySession(req, res);
  }

  async restorePassword(req, res) {
    try {
      await this.authService.sendResetPasswordEmail(req.body.email);
      req.logger.info("¡Correo enviado con éxito!")
      res.json("Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico.");
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).send(error.message);
      }
      req.logger.error("Error en la recuperación de contraseña.", error);
      res.status(500).send("Error en la recuperación de contraseña" + error.message);
    }
  }

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      await this.authService.resetPassword(token, password, res);
    } catch (error) {
      console.error("Error al resetear la contraseña:", error);
      res.status(500).send("Error interno del servidor al intentar actualizar la contraseña.");
    }
  }
}

export default AuthController;

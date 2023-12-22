import AuthService from "../services/authService.js";
import CustomError from "../services/errors/customError.js";
import { generateAuthenticationErrorInfo } from "../services/errors/messages/user.auth.error.js";
import sendResetPasswordEmail from "./resetPasswordController.js";
import { userModel } from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";


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

      let fechaHoraUTC = new Date();

      fechaHoraUTC.setUTCHours(fechaHoraUTC.getUTCHours() - 3);

      userData.user.last_connection = fechaHoraUTC;
      await userData.user.save();

      req.session.user = {
        id: userData.user._id,
        email: userData.user.email,
        first_name: userData.user.first_name,
        last_name: userData.user.last_name,
        role: userData.user.role,
        cart: userData.user.cart
      };

      res.cookie('CookieToken', userData.token, { httpOnly: true, secure: false });

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
    req.session.destroy(async (err) => {
      if (err) {
        req.logger.error("Error al finalizar sesión.");
        return res.redirect("/profile");
      }
      req.logger.info("Sesión finalizada");
      return res.redirect("/login");
    });
  }

  async restorePassword(req, res) {
    const { email } = req.body;
    try {
      await sendResetPasswordEmail(email);
      req.logger.info("¡Correo enviado con éxito!")
      res.json("Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico.");
    } catch (error) {
      req.logger.error("Error en la recuperación de contraseña.", error);
      res.status(500).send("Error en la recuperación de contraseña" + error.message);
    }
  }

  async resetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;

    try {
      const user = await userModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
      console.log("El usuario es", user);
      if (!user) {
        return res.status(400).json({ message: "El token de restablecimiento de contraseña es inválido o ha expirado.", tokenExpired: true });
      }

      const isSamePassword = isValidPassword(user, password);
      if (isSamePassword) {
        return res.json({ status: "oldPassword", message: "Tu contraseña debe ser diferente a la contraseña actual." });
      }

      user.password = createHash(password);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.json({ status: "success", message: "Tu contraseña ha sido actualizada con éxito." });
    } catch (error) {
      console.error("Error al resetear la contraseña:", error);
      res.status(500).send("Error interno del servidor al intentar actualizar la contraseña.");
    }
  }
}

export default AuthController;

import UserManager from '../dao/UserManager.js';
import jwt from 'jsonwebtoken';
import CustomError from '../services/errors/customErrorMsg.js';
import sendResetPasswordEmail from "../controllers/resetPasswordController.js";
import { userModel } from '../dao/models/user.model.js';
import { ENV_CONFIG } from '../config/config.js';

class AuthService {
    constructor() {
        this.userManager = new UserManager();
        this.secretKey = ENV_CONFIG.JWT_SECRET;
    }

    async login(email, password) {
        const user = await this.userManager.login(email, password);
        if (!user) {
            throw new CustomError({ name: "Error de autenticación", message: "Datos incorrectos", code: 401, cause: generateAuthenticationErrorInfo(email) });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            this.secretKey,
            { expiresIn: '24h' }
        );
        return { user, token };
    }

    async githubCallback(profile) {
        try {
            if (!profile || !profile._json) {
                throw new Error("Profile information is incomplete.");
            }

            if (!profile._json.email || profile._json.email === 'no-email@example.com') {
                console.warn('Email is null or no-email@example.com. Sending an error.');
                throw new CustomError({
                    name: "Error de autenticación",
                    message: "No se puede acceder porque los datos son privados.",
                    code: 401
                });
            }

            let user = await userModel.findOne({ email: profile._json.email });

            if (!user) {
                user = await userModel.create({
                    first_name: profile._json.name || 'Unknown',
                    last_name: '',
                    email: profile._json.email,
                    age: 100,
                    password: '',
                    role: 'user',
                });
            }

            return user;
        } catch (error) {
            console.error('An error occurred:', error);
            throw error;
        }
    }

    async updateLastConnection(user) {
        let fechaHoraUTC = new Date();
        fechaHoraUTC.setUTCHours(fechaHoraUTC.getUTCHours() - 3);
        user.last_connection = fechaHoraUTC;
        await user.save();
    }

    extractUserData(user) {
        return {
            id: user._id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            cart: user.cart
        };
    }

    destroySession(req, res) {
        req.session.destroy(async (err) => {
            if (err) {
                req.logger.error("Error al finalizar sesión.");
                return res.redirect("/profile");
            }
            req.logger.info("Sesión finalizada");
            return res.redirect("/login");
        });
    }

    async sendResetPasswordEmail(email) {
        await sendResetPasswordEmail(email);
    }

    async resetPassword(token, password, res) {
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            throw new CustomError({ name: "Error en restablecimiento de contraseña", message: "El token de restablecimiento de contraseña es inválido o ha expirado.", code: 400 });
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
    }
}

export default AuthService;

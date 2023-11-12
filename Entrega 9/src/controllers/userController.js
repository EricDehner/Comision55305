import UserService from "../services/userService.js";
import UserResponse from "../dao/dto/user.response.dto.js";
import CustomError from "../services/errors/customError.js";
import { generateUserErrorInfo } from "../services/errors/messages/user.creation.error.js";
import EErrors from "../services/errors/errors-enum.js";
import { createHash } from "../utils.js";

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async register(req, res, next) {
        try {
            const { first_name, last_name, email, age, password, role } = req.body;

            if (!first_name || !last_name || !email || !age || !password) {
                const customError = new CustomError({
                    name: "Error en la creación del usuario.",
                    cause: generateUserErrorInfo({
                        first_name,
                        last_name,
                        age,
                        email,
                        password,
                        role,
                    }),
                    message: "Error tratando de crear el usuario",
                    code: 400,
                });
                return next(customError);
            }

            const response = await this.userService.registerUser({
                first_name,
                last_name,
                email,
                age,
                password,
                role
            });

            return res.status(response.status === "success" ? 200 : 400).json(response);
        } catch (error) {
            req.logger.error("userController line 47", error)
            return next(error);
        }
    }

    async restorePassword(req, res, next) {
        try {
            const { user, pass } = req.query;
            const passwordRestored = await this.userService.restorePassword(user, createHash(pass));
            if (passwordRestored) {
                req.logger.info("Contraseña actualizada con exito.")
                return res.send({ status: "OK", message: "¡La contraseña se ha actualizado correctamente!" });
            } else {
                const customError = new CustomError({
                    name: "Error al actualizar contraseña",
                    message: "No se pudo actualizar la contraseña.",
                    code: EErrors.PASSWORD_RESTORATION_ERROR,
                });
                return next(customError);
            }
        } catch (error) {
            req.logger.error(error);
            return next(error);
        }
    }

    currentUser(req, res, next) {
        if (req.session.user) {
            return res.send({ status: "OK", payload: new UserResponse(req.session.user) });
        } else {
            const customError = new CustomError({
                name: "Error al autorizar",
                message: "No se pudo autorizar al usuario.",
                code: EErrors.AUTHORIZATION_ERROR,
            });
            return next(customError);
        }
    }
}

export default UserController;

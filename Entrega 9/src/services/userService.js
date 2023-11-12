import UserManager from "../dao/UserManager.js";
import { ENV_CONFIG } from "../config/config.js";

class UserService {
    constructor() {
        this.userManager = new UserManager();
    }

    async registerUser({ first_name, last_name, email, age, password, role }) {
        try {
            const role =
                email == ENV_CONFIG.ADMIN_EMAIL &&
                    password === ENV_CONFIG.ADMIN_PASSWORD
                    ? "admin"
                    : "user";
            const user = await this.userManager.addUser({
                first_name,
                last_name,
                email,
                age,
                password,
                role,
            });

            if (user) {
                req.logger.error("Usuario creado con éxito.");
                //return { status: "success", user, redirect: "/login" };
            } else {
                req.logger.error("Usuario ya existente.");
               // return { status: "error", message: "User already exists" };
            }
        } catch (error) {
            req.logger.error("Error registrando usuario:", error);
            return { status: "error", message: "Internal Server Error" };
        }
    }

    async restorePassword(user, hashedPassword) {
        return await this.userManager.restorePassword(user, hashedPassword);
    }
}

export default UserService;

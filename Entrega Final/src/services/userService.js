import UserManager from "../dao/UserManager.js";
import { ENV_CONFIG } from "../config/config.js";

class UserService {
    constructor() {
        this.userManager = new UserManager();
    }

    async registerUser({ first_name, last_name, email, age, password, role }) {
        try {
            const role =
                email == ENV_CONFIG.ADMIN_EMAIL && password === ENV_CONFIG.ADMIN_PASSWORD ? "admin" : email === ENV_CONFIG.PREMIUM_EMAIL && password === ENV_CONFIG.PREMIUM_PASSWORD ? "premium" : "user";

            let fechaHoraUTC = new Date();

            fechaHoraUTC.setUTCHours(fechaHoraUTC.getUTCHours() - 3);

            const last_connection = fechaHoraUTC;

            const user = await this.userManager.addUser({
                first_name,
                last_name,
                email,
                age,
                password,
                role,
                last_connection
            });

            if (user) {
                return { status: "success", user, redirect: "/login" };
            } else {
                return { status: "error", message: "User already exists" };
            }
        } catch (error) {
            throw new Error("internal Server Error")
        }
    }

    async restorePassword(user, hashedPassword) {
        return await this.userManager.restorePassword(user, hashedPassword);
    }
}

export default UserService;

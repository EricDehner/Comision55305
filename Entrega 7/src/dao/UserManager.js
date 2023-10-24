import { userModel } from "./models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";

class UserManager {
    async addUser({ first_name, last_name, email, age, password, role }) {
        try {
            const existingUser = await userModel.findOne({ email });

            if (existingUser) {
                console.log("User already exists");
                return null;
            }

            const hashedPassword = createHash(password);
            const user = await userModel.create({
                first_name,
                last_name,
                email,
                age,
                password: hashedPassword,
                role
            });

            console.log("User added!", user);
            return user;
        } catch (error) {
            console.error("Error adding user:", error);
            throw error;
        }
    }

    async login(user, pass) {
        try {
            const userLogged = await userModel.findOne({ email: user });

            if (userLogged && isValidPassword(userLogged, pass)) {
                const role =
                    userLogged.email === "adminCoder@coder.com" ? "admin" : "usuario";

                return userLogged;
            }
            return null;
        } catch (error) {
            console.error("Error durante el login:", error);
            throw error;
        }
    }

    async getUserByEmail(user) {
        try {
            const userRegisteredBefore =
                (await userModel.findOne([{ email: user }])) || null;
            if (userRegisteredBefore) {
                console.log("Mail registrado anteriormente");
                return user;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    async getUserByID(id) {
        try {
            const userID = (await userModel.findOne([{ _id: id }])) || null;
            if (userID) {
                console.log(userID);
                return user;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    async restorePassword(user, pass) {
        try {
            const userLogged = await userModel.updateOne({ email: user }, { password: pass }) || null;
            if (userLogged) {
                console.log("Contraseña restablecida.");
                return userLogged
            }
            return false

        } catch (error) {
            return false;
        }
    }
}



export default UserManager;
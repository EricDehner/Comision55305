import { userModel } from "./models/user.model.js";

class UserManager {
    async addUser(user) {
        try {

            if (user.email == "adminCoder@coder.com" && user.password == "adminCod3r123") {
                user.role = "admin";
            }

            await userModel.create(user)
            console.log("User added!");

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async login(user, pass) {
        try {
            const userLogged = await userModel.findOne({ $and: [{ email: user }, { password: pass }] }) || null;

            if (userLogged) {
                console.log("User logged!");
                return user;
            }

            return false;
        } catch (error) {
            return false;
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
}



export default UserManager;
import express from "express";
import passport from "passport";
import { passportCall, authorization } from "../utils.js";
import UserController from "../controllers/userController.js";
import AuthController from "../controllers/authController.js";
import errorPersonalized from "../middlewares/errorPersonalized.js"
//import { ENV_CONFIG } from "../config/config.js"
import bodyParser from "body-parser";

//const PRIVATE_KEY = ENV_CONFIG.JWT_SECRET

const router = express.Router();
const userController = new UserController();
const authController = new AuthController();

router.post("/login", (req, res, next) => authController.login(req, res, next));

router.post("/register", userController.register.bind(userController));

router.get("/restore", userController.restorePassword.bind(userController));

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => { });

router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), (req, res) => { console.log("GitHub Callback Route"); authController.githubCallback(req, res); });

router.post("/logout", (req, res) => authController.logout(req, res));

router.get("/current", passportCall("jwt"), authorization("user"), (req, res) => { userController.currentUser(req, res); });

router.use(bodyParser.urlencoded({ extended: true }));

router.post("/restore-password", async (req, res) => authController.restorePassword(req, res));

router.post("/reset-password/:token", async (req, res) => authController.resetPassword(req, res));

router.use(errorPersonalized);

export default router;
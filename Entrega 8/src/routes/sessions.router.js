import express from "express";
import UserManager from "../dao/UserManager.js";
import passport from "passport";
import { createHash, passportCall, authorization } from "../utils.js";
import UserController from "../controllers/userController.js";
import AuthController from "../controllers/authController.js";
import errorPersonalized from "../middlewares/errorPersonalized.js"
import {JWT_SECRET } from "../config/config.js"


const PRIVATE_KEY = JWT_SECRET

const router = express.Router();
const UM = new UserManager();
const userController = new UserController();
const authController = new AuthController();

router.post("/login", (req, res, next) => authController.login(req, res, next));
router.post("/register", userController.register.bind(userController));
router.get("/restore", userController.restorePassword.bind(userController));
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => { });
router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), (req, res) => {
  console.log("GitHub Callback Route");
  authController.githubCallback(req, res);
});
router.post("/logout", (req, res) => authController.logout(req, res));
router.get("/current", passportCall("jwt"), authorization("user"), (req, res) => {
  console.log(req.cookies);
  userController.currentUser(req, res);
});

router.use(errorPersonalized);
export default router;

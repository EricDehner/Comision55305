import express from "express";
import UserManager from "../dao/UserManager.js";
import { createHash, isValidPassword } from "../utils.js";
import passport from "passport";

const router = express.Router();
const UM = new UserManager();

router.post("/login", passport.authenticate("login", { failureRedirect: "/faillogin" }), async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ status: "error", message: "Usuario y Contraseña incorrectos!" });
    }

    req.session.user = { first_name: req.user.first_name, last_name: req.user.last_name, email: req.user.email, age: req.user.age };
    res.redirect("/products");
});

router.post("/register", passport.authenticate("register", { failureRedirect: "/failregister" }), async (req, res) => {
    res.redirect("/login");
});


router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/profile');
        }
        setTimeout(() => {
            res.redirect('/login');
        }, 1500);
    });
});

router.get("/restore", async (req, res) => {
    let { user, pass } = req.query
    pass = createHash(pass)
    const passwordRestored = await UM.restorePassword(user, pass)

    if (passwordRestored) {
        res.send({ status: "OK", message: "Contraseña restablecida" });
    } else {
        res.status(401).send({ status: "Error", message: "No se pudo restablecer al contraseña!" });
    }
})

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => { });

router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
    req.session.user = req.user;
    req.session.loggedIn = true;
    res.redirect("/products");
});

/* router.get("/login", async (req, res) => {
    console.log(`req.query: ${JSON.stringify(req.query)}`);
    let { user, pass } = req.query;

    if (!user || !pass) {
        return res.status(400).send({ status: "error", message: "Complete los campos obligatorios!" })
    }

    const userLogged = await UM.login(user, req);
    console.log(user, pass);

    if (!isValidPassword(userLogged, pass)) {
        return res.status(401).send({ status: "Error", message: "La contraseña es incorrecta!" })
    }

    delete userLogged.password;
    req.session.user = userLogged

    if (userLogged) {
        res.send({ status: "OK", message: `Hola, ${userLogged.first_name}.` });
    } else {
        res.status(401).send({ status: "Error", message: "No se pudo loguear el Usuario!" });
    }
});

router.post("/register", async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body

    if (!first_name || !last_name || !email || !age || !password) {
        return res.status(400).send({ status: "error", message: "Complete los campos obligatorios!" })
    }
    const user = { first_name, last_name, email, age, password: createHash(password) }
    const userRegistered = await UM.addUser(user);


    if (userRegistered) {
        res.send({ status: "OK", message: userRegistered });
    } else {
        res.status(401).send({ status: "Error", message: "No se pudo registrar el Usuario!" });
    }
}); */

export default router;
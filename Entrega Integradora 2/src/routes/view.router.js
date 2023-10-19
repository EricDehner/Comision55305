import express from "express";
import ProductManager from "../dao/ProductManager.js";
import CartManager from "../dao/CartManager.js";

const router = express.Router();
const PM = new ProductManager();
const CM = new CartManager();

const checkSession = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
};

const checkAuth = (req, res, next) => {
    console.log(req.session.user);

    if (req.session && req.session.user) {
        console.log("Usuario verificado, redirigiendo a /profile");
        res.redirect("/products");
    } else {
        console.log("Usuario no verificado.");
        next();
    }
};

router.get("/", checkSession, async (req, res) => {
    const products = await PM.getProducts();
    res.render("home", { products });
});

router.get("/products", checkSession, async (req, res) => {
    const products = await PM.getProducts(req.query);
    const user = req.session.user;

    //console.log(user);
    res.render("products", { products, user });
});

router.get("/products/:pid", checkSession, async (req, res) => {
    const pid = req.params.pid;
    const product = await PM.getProductById(pid);

    res.render("product", { product });
});

router.get("/realtimeproducts", checkSession, (req, res) => {
    res.render("realtimeProducts");
});

router.get("/chat", checkSession, (req, res) => {
    res.render("chat");
});

router.get("/carts", checkSession, async (req, res) => {
    const carts = await CM.getCarts();
    res.render("carts", { carts });
});

router.get("/cart/:cid", checkSession, async (req, res) => {
    const cid = req.params.cid;
    const cart = await CM.getCart(cid);

    if (cart) {
        res.render("cart", { products: cart.products });
    } else {
        res.status(400).send({ status: "error", message: "Error! No se encuentra el ID de Carrito!" });
    }
});
router.get("/login", checkAuth, (req, res) => {
    res.render("login");
});

router.get("/register", checkAuth, (req, res) => {
    res.render("register");
});

router.get("/profile", checkSession, (req, res) => {
    const userData = req.user;
    //console.log(userData);
    res.render("profile", { user: userData });
});
router.get("/restore", checkSession, (req, res) => {
    const userData = req.session.user;
    res.render("restore", { user: userData });
});

router.get("/faillogin", async (req, res) => {
    res.send({ status: "error", message: "Login inválido!" });
});

router.get("/failregister", async (req, res) => {
    res.send({ status: "error", message: "Error! No se pudo registar el Usuario!" });
});

export default router;
import express from "express";
import ProductManager from "../dao/ProductManager.js";
import CartManager from "../dao/CartManager.js";

/* const checkSession = (req, res, next) => {
    console.log(req.session);
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
};

const checkAlreadyLoggedIn = (req, res, next) => {

    console.log(req.session);
    if (req.session && req.session.user) {
        console.log("Usuario ya autenticado, redirigiendo a /profile");
        res.redirect("/profile");
    } else {
        console.log("Usuario no autenticado, procediendo...");
        next();
    }
}; */

const router = express.Router();
const PM = new ProductManager();
const CM = new CartManager();


router.get("/", /* checkSession, */ async (req, res) => {
    const products = await PM.getProducts();
    res.render("home", { products });
});

router.get("/products", /* checkSession, */ async (req, res) => {
    const products = await PM.getProducts(req.query);
    res.render("products", { products });
});

router.get("/products/:pid", /* checkSession, */ async (req, res) => {
    const pid = req.params.pid;
    const product = await PM.getProductById(pid);

    res.render("product", { product });
});

router.get("/realtimeproducts",/*  checkSession, */ (req, res) => {
    res.render("realtimeProducts");
});

router.get("/chat",/*  checkSession, */ (req, res) => {
    res.render("chat");
});

router.get("/carts",/*  checkSession, */ async (req, res) => {
    const carts = await CM.getCarts();
    res.render("carts", { carts });
});

router.get("/cart/:cid",/*  checkSession, */ async (req, res) => {
    const cid = req.params.cid;
    const cart = await CM.getCart(cid);

    if (cart) {
        res.render("cart", { products: cart.products });
    } else {
        res.status(400).send({ status: "error", message: "Error! No se encuentra el ID de Carrito!" });
    }
});
router.get("/login", /* checkAlreadyLoggedIn, */ (req, res) => {
    res.render("login");
});

router.get("/register", /* checkAlreadyLoggedIn, */ (req, res) => {
    res.render("register");
});

router.get("/profile", /* checkSession, */ (req, res) => {
    const userData = req.session.user;

    res.render("profile", { user: userData });
});

export default router;
import express from "express";
import ProductManager from "../dao/ProductManager.js";
import CartManager from "../dao/cartManager.js";
import cartController from "../controllers/cartController.js";
import { checkSession, checkAuth } from "../middlewares/errorCheck.js"
import { userModel } from "../dao/models/user.model.js"

const router = express.Router();
const PM = new ProductManager();
const CM = new CartManager();

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
    const user = req.session.user;

    res.render("product", { product, user });
});

router.get("/realtimeproducts", checkSession, (req, res) => {
    const user = req.session.user;
    if (user.role === "user") {
        return res.redirect('/products');
    }
    res.render("realtimeProducts");
});

router.get("/chat", checkSession, (req, res) => {
    const user = req.session.user;
    console.log(user);
    res.render("chat", { user });
});

router.get("/carts", checkSession, async (req, res) => {
    const carts = await CM.getCarts();
    res.render("carts", { carts });
});

router.get("/cart/:cid", checkSession, async (req, res) => {
    const cid = req.params.cid;
    const cart = await CM.getCart(cid);
    const user = req.session.user;

    if (cart) {
        res.render("cart", { products: cart.products, user });
    } else {
        res.status(400).send({ status: "error", message: "Error! No se encuentra el ID de Carrito!" });
    }
});

router.post("/carts/:cid/purchase", checkSession, async (req, res) => {
    const cid = req.params.cid;
    cartController.createPurchaseTicket(req, res, cid);
});

router.get("/login", checkAuth, (req, res) => {
    res.render("login");
});

router.get("/register", checkAuth, (req, res) => {
    res.render("register");
});

router.get("/profile", checkSession, (req, res) => {
    const userData = req.session.user;
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

router.get("/pw-forget", async (req, res) => {
    console.log("hola");
    res.render("pw-forget");
});

router.get('/pw-reset/:token', async (req, res) => {
    const { token } = req.params;
    const user = await userModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.redirect('/pw-forget');
    }
    res.render('pw-reset', { token });
});

export default router;
import { Router } from "express";
import cartControllers from "../controllers/cartController.js";
import { passportCall } from "../utils.js";

const cartsRouter = Router();

cartsRouter.post("/", cartControllers.createCart.bind(cartControllers));

cartsRouter.get("/:cid", cartControllers.getCart.bind(cartControllers));

cartsRouter.put("/:cid/products/:pid/prodQuantity", cartControllers.changeProductsQuantity.bind(cartControllers));

cartsRouter.get("/:cid/products/:pid/quantity", cartControllers.getProductQuantityInCart.bind(cartControllers));

cartsRouter.post("/:cid/products/:pid", passportCall('jwt'), cartControllers.addProductToCart.bind(cartControllers));

cartsRouter.post("/:cid/products/:pid/add-with-quantity", passportCall('jwt'), cartControllers.addProductToCartWithQuantity.bind(cartControllers));

cartsRouter.put("/:cid/products/:pid", cartControllers.updateQuantityProductFromCart.bind(cartControllers));

cartsRouter.put("/:cid", cartControllers.updateCart.bind(cartControllers));

cartsRouter.delete("/:cid/products/:pid", cartControllers.deleteProductFromCart.bind(cartControllers));

cartsRouter.delete("/:cid", cartControllers.deleteProductsFromCart.bind(cartControllers));

cartsRouter.post("/:cid/purchase", (req, res, next) => { next(); }, passportCall("jwt"), cartControllers.createPurchaseTicket.bind(cartControllers));

cartsRouter.get("/:cid/total-products", cartControllers.getTotalProductsInCart.bind(cartControllers));

export default cartsRouter;

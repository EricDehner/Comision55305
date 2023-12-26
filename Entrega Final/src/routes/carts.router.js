import { Router } from "express";
import cartControllers from "../controllers/cartController.js";
import { passportCall, authorization } from "../utils.js";

const cartsRouter = Router();

cartsRouter.post("/", cartControllers.createCart.bind(cartControllers));

cartsRouter.get("/:cid", passportCall("jwt"), authorization(["admin", "premium", "user"]), cartControllers.getCart.bind(cartControllers));

cartsRouter.put("/:cid/products/:pid/prodQuantity", passportCall("jwt"), authorization(["admin", "premium", "user"]), cartControllers.changeProductsQuantity.bind(cartControllers));

cartsRouter.get("/:cid/products/:pid/quantity", passportCall("jwt"), authorization(["admin", "premium", "user"]), cartControllers.getProductQuantityInCart.bind(cartControllers));

cartsRouter.post("/:cid/products/:pid", passportCall('jwt'), authorization(["premium", "user"]), cartControllers.addProductToCart.bind(cartControllers));

cartsRouter.post("/:cid/products/:pid/add-with-quantity", passportCall("jwt"), authorization(["admin", "premium", "user"]), cartControllers.addProductToCartWithQuantity.bind(cartControllers));

cartsRouter.put("/:cid/products/:pid", passportCall("jwt"), authorization(["admin", "premium", "user"]), cartControllers.updateQuantityProductFromCart.bind(cartControllers));

cartsRouter.put("/:cid", passportCall("jwt"), authorization(["admin", "premium", "user"]), cartControllers.updateCart.bind(cartControllers));

cartsRouter.delete("/:cid/products/:pid", passportCall("jwt"), authorization(["admin", "premium", "user"]), cartControllers.deleteProductFromCart.bind(cartControllers));

cartsRouter.delete("/:cid", passportCall("jwt"), authorization(["premium", "user"]), cartControllers.deleteProductsFromCart.bind(cartControllers));

cartsRouter.post("/:cid/purchase", (req, res, next) => { next(); }, passportCall("jwt"), authorization(["premium", "user"]), cartControllers.createPurchaseTicket.bind(cartControllers));

cartsRouter.get("/:cid/total-products", passportCall("jwt"), authorization(["premium", "user"]), cartControllers.getTotalProductsInCart.bind(cartControllers));

export default cartsRouter;

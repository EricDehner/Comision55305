import { Router } from "express";
import productController from "../controllers/productController.js";
import errorPersonalized from "../middlewares/errorPersonalized.js"
import { passportCall, authorization } from "../utils.js";

const productsRouter = Router();

productsRouter.get("/", passportCall("jwt"), authorization(["admin", "premium", "user"]), productController.getProducts.bind(productController));

productsRouter.get("/:pid", passportCall("jwt"), authorization(["admin", "premium", "user"]), productController.getProductById.bind(productController));

productsRouter.post("/", passportCall("jwt"), authorization(["admin", "premium"]), productController.addProduct.bind(productController));

productsRouter.put('/:pid', passportCall("jwt"), authorization(["admin"]), productController.updateProduct.bind(productController));

productsRouter.delete('/:pid', passportCall("jwt"), authorization(["admin", "premium"]), productController.deleteProduct.bind(productController));

productsRouter.use(errorPersonalized);
export default productsRouter;
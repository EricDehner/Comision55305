import { Router } from "express";
import ProductManager from "../dao/ProductManager.js";
import ProductService from "../services/productService.js";
import productController from "../controllers/productController.js";
import errorPersonalized from "../middlewares/errorPersonalized.js"

const productsRouter = Router();
const PM = new ProductManager();
const productService = new ProductService();

productsRouter.get("/", productController.getProducts.bind(productController));
productsRouter.get("/:pid", productController.getProductById.bind(productController));
productsRouter.post("/", productController.addProduct.bind(productController));
productsRouter.put('/:pid', productController.updateProduct.bind(productController));
productsRouter.delete('/:pid', productController.deleteProduct.bind(productController));

productsRouter.use(errorPersonalized);
export default productsRouter;

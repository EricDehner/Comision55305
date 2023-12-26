import ProductService from "../services/productService.js";
import { socketServer } from "../app.js";
import mongoose from "mongoose";
import CustomError from "../services/errors/customErrorMsg.js";
import { generateProductErrorInfo } from "../services/errors/messages/productError.js";
import { transporter } from "./emailController.js";
import { ENV_CONFIG } from "../config/config.js";

class ProductController {
    constructor() {
        this.productService = new ProductService();
    }

    async getProducts(req, res) {
        try {
            const products = await this.productService.getProducts(req.query);
            req.logger.info("Productos conseguidos");
            res.send(products);
        } catch (error) {
            const productError = new CustomError({
                name: "Error en productos",
                message: "Error al traer productos.",
                code: 500,
                cause: error.message,
            });
            req.logger.error(productError);
            res.status(productError.code).send({ status: "error", message: "Error fetching products." });
        }
    }

    async getProductById(req, res, next) {
        try {
            const pid = req.params.pid;
            if (!mongoose.Types.ObjectId.isValid(pid)) {
                throw new CustomError({
                    name: "Invalid ID Error",
                    message: "El ID del producto proporcionado no es válido",
                    code: 400,
                    cause: generateProductErrorInfo(pid),
                });
            }

            const product = await this.productService.getProductById(pid);

            if (!product) {
                throw new CustomError({
                    name: "Producto no encontrado",
                    message: generateProductErrorInfo(pid),
                    code: 404,
                });
            }
            req.logger.info("ID del producto:", pid);
            res.status(200).json({ status: "success", data: product });
        } catch (error) {
            req.logger.error(error);
            return next(error);
        }
    }

    async addProduct(req, res) {
        const { title, description, code, price, status = true, stock, category, thumbnails } = req.body;
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category', 'thumbnails'];
        const owner = req.user._id;
        console.log(owner)
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).send({ status: 'error', message: `Error! No se cargó el campo ${field.charAt(0).toUpperCase() + field.slice(1)}!` });
            }
        }

        try {
            const wasAdded = await this.productService.addProduct({ title, description, code, price, status, stock, category, thumbnails, owner });

            if (wasAdded && wasAdded._id) {
                req.logger.info("Producto añadido correctamente:", wasAdded);
                res.send({ status: "ok", message: "El Producto se agregó correctamente!" });
                socketServer.emit("product_created", { _id: wasAdded._id, title, description, code, price, status, stock, category, thumbnails, owner });
                return;
            } else {
                req.logger.error("Error al añadir producto, wasAdded:", wasAdded);
                res.status(500).send({ status: "error", message: "Error! No se pudo agregar el Producto!" });
                return;
            }
        } catch (error) {
            req.logger.error("Error en addProduct:", error, "Stack:", error.stack);
            res
                .status(500).send({ status: "error", message: "Internal server error." });
            return;
        }
    }

    async updateProduct(req, res) {
        try {
            const { title, description, code, price, status, stock, category, thumbnails } = req.body;
            const pid = req.params.pid;

            console.log(req.body);
            console.log(pid);

            const wasUpdated = await this.productService.updateProduct(pid, { title, description, code, price, status, stock, category, thumbnails });

            if (wasUpdated) {
                req.logger.info("Producto actualizado.");
                res.send({ status: "ok", message: "El Producto se actualizó correctamente!" });
                socketServer.emit("product_updated");
            } else {
                req.logger.error("no se pudo actualizar el producto");
                res.status(404).send({ status: "error", message: "Error! No se pudo actualizar el Producto!" });
            }
        } catch (error) {
            req.logger.error(error);
            res.status(500).send({ status: "error", message: "Internal server error." });
        }
    }

    async deleteProduct(req, res) {
        try {
            const pid = req.params.pid;

            if (!mongoose.Types.ObjectId.isValid(pid)) {
                req.logger.error("ID del producto no válido");
                res.status(400).send({ status: "error", message: "ID del producto no válido" });
                return;
            }

            const product = await this.productService.getProductById(pid);

            if (product.owner) {
                const user = await userModel.findById(product.owner);
                console.log("usuario encontrado")
                if (user) {
                    const mailOptions = {
                        from: "Proyecto E-Commerce " + ENV_CONFIG.EMAIL_USER,
                        to: user.email,
                        subject: "Su producto ha sido eliminado",
                        html: `<p>Hola, ${user.first_name}. Te informamos que tu producto "${product.title}" ha sido eliminado de nuestra plataforma. <br> ¡Gracias por utilizar nuestros servicios! <br> Saludos. </p>`,
                    };
                    console.log(`enviando mail a ${user.email}`)
                    
                    await transporter.sendMail(mailOptions);
                    console.log(`mail enviado a ${user.email}`)
                }
            }

            console.log("user", req.user)
            console.log("product owner", product.owner);

            if (!product) {
                req.logger.error("Producto no encontrado");
                res.status(404).send({ status: "error", message: "Producto no encontrado" });
                return;
            }

            if (!req.user || (req.user.role !== "admin" && (!product.owner || req.user._id.toString() !== product.owner.toString()))) {
                req.logger.error("Operación no permitida: el usuario no tiene derechos para eliminar este producto o el producto no tiene propietario definido.");
                res.status(403).send({ status: "error", message: "No tiene permiso para eliminar este producto o producto no tiene propietario." });
                return;
            }

            const wasDeleted = await this.productService.deleteProduct(pid);

            if (wasDeleted) {
                req.logger.info("Producto eliminado correctamente.");
                res.send({ status: "ok", message: "El Producto se eliminó correctamente!" });
                socketServer.emit("product_deleted", { _id: pid });
            } else {
                req.logger.error("No se pudo eliminar el producto");
                res.status(500).send({ status: "error", message: "Error! No se pudo eliminar el Producto!" });
            }
        } catch (error) {
            req.logger.error(error);
            res.status(500).send({ status: "error", message: "Internal server error." });
        }
    }
}
export default new ProductController();

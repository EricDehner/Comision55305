import CartService from "../services/cartService.js";
import ProductManager from "../dao/ProductManager.js"
import { cartModel } from "../dao/models/cart.model.js";
import ticketController from "./ticketController.js";
import { v4 as uuidv4 } from "uuid"
import { productModel as ProductModel } from "../dao/models/product.model.js";


class CartController {
    constructor() {
        this.cartService = new CartService();
    }

    async createCart(req, res) {
        try {
            const newCart = await this.cartService.createCart();
            req.logger.info("Carrito creado:", newCart);
            //console.log(newCart.id.toString());
            res.status(201).send(newCart);
        } catch (error) {
            req.logger.error("Error creando el carrito:", error);
        }
    }

    async getCart(req, res) {
        try {
            const cart = await this.cartService.getCart(req.params.cid);
            req.logger.info("Carrito:", cart);
            res.send({ products: cart.products });
        } catch (error) {
            req.logger.error("Error consiguiendo carrito:", error);
        }
    }

    async addProductToCart(req, res) {
        try {
            const { cid, pid } = req.params;
            const result = await this.cartService.addProductToCart(cid, pid);
            req.logger.info(`Producto ${pid} agregado a su carrito.`);
            res.send(result);
        } catch (error) {
            req.logger.error("Error agregando producto al carrito:", error);
        }
    }

    async updateQuantityProductFromCart(req, res) {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;
            const result = await this.cartService.updateQuantityProductFromCart(
                cid,
                pid,
                quantity
            );
            req.logger.info(`Producto ${pid} modificado a su carrito.`);
            res.send(result);
        } catch (error) {
            req.logger.error("Error agregando producto al carrito:", error);
        }
    }

    async updateCart(req, res) {
        try {
            const cid = req.params.cid;
            const products = req.body.products;
            await this.cartService.updateCart(cid, products);
            req.logger.info(`Producto agregado a su carrito.`);
        } catch (error) {
            req.logger.error("Error agregando producto al carrito:", error);
        }
    }

    async deleteProductFromCart(req, res) {
        try {
            const { cid, pid } = req.params;
            const result = await this.cartService.deleteProductFromCart(cid, pid);
            req.logger.info(`Producto ${pid} eliminado de su carrito.`);
            res.send(result);
        } catch (error) {
            req.logger.error(`Error eliminando producto del carrito:`, error);
        }
    }

    async deleteProductsFromCart(req, res) {
        try {
            const cid = req.params.cid;
            const result = await this.cartService.deleteProductsFromCart(cid);
            req.logger.info(`Productos eliminados de su carrito.`);
            res.send(result);
        } catch (error) {
            req.logger.error(`Error eliminando los productos del carrito:`, error);
        }
    }


    async createPurchaseTicket(req, res) {
        try {
            if (!req.user || !req.user.id) {
                console.error("req.user no está definido");
                return res.status(400).json({ error: "Usuario no definido" });
            }

            const cart = await this.cartService.getCart(req.params.cid)

            if (!cart) {
                return res.status(404).json({ error: "Carrito no encontrado" });
            }

            const productDetails = await Promise.all(cart.products.map(async (item) => {
                const product = await ProductModel.findById(item.product);
                return {
                    product: {
                        _id: product._id,
                        title: product.title,
                        description: product.description,
                        price: product.price,
                        thumbnails: product.thumbnails
                    },
                    quantity: item.quantity,
                };
            }));

            //console.log("Productos en el carrito:", cart.products);

            const productManager = new ProductManager();
            const failedProducts = [];
            const successfulProducts = [];

            for (const item of cart.products) {
                const product = await productManager.getProductById(item.product);

                if (!product) {
                    console.error(`Producto ${item.product} no encontrado`);
                    failedProducts.push(item);
                    continue;
                }

                if (product.stock < item.quantity) {
                    console.error(
                        `Stock insuficiente para el producto ${JSON.stringify(item.product)}`
                    );
                    failedProducts.push(item);
                } else {
                    successfulProducts.push(item);
                    const newStock = product.stock - item.quantity;
                    await productManager.updateProduct(item.product, { stock: newStock });
                }
            }

            await cartModel.updateOne(
                { _id: req.params.cid },
                { products: failedProducts }
            );

            if (successfulProducts.length === 0) {
                return res.status(400).json({ error: "No se pudo comprar ningun producto", failedProducts });
            }

            const totalAmount = successfulProducts.reduce((total, product) => {
                return total + product.product.price * product.quantity;
            }, 0);

            const ticketData = {
                code: uuidv4(),
                purchase_datetime: new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
                amount: totalAmount,
                purchaser: req.user.email,
                products: productDetails,
            };

            console.log(ticketData);
    
            const ticketCreated = await ticketController.createTicket({
                body: ticketData,
            });
            res.json({ status: "success", message: "Compra realizada con éxito", ticket: ticketCreated, failedProducts: failedProducts.length > 0 ? failedProducts : undefined });
            req.logger.info(`Compra realizada con éxito.`);
        } catch (error) {
            req.logger.error("Error específico al crear el ticket de compra:", error);
            res.status(500).json({ error: "Error al crear el ticket de compra" });
        }
    }

    async getPurchase(req, res) {
        try {
            const cid = req.params.cid;
            const purchase = await this.cartService.getCart(cid);

            if (purchase) {
                res.json({ status: "success", data: purchase });
            } else {
                res.status(404).json({ status: "error", message: "Compra no encontrada" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "error", message: "Error interno del servidor" });
        }
    }

}

export default new CartController();

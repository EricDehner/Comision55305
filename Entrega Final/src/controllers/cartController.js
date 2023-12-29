import CartService from "../services/cartService.js";
import ProductManager from "../dao/ProductManager.js"
import { cartModel } from "../dao/models/cart.model.js";
import ticketController from "./ticketController.js";
import { v4 as uuidv4 } from "uuid"
import { productModel as ProductModel } from "../dao/models/product.model.js";
import { transporter } from "./emailController.js";
import { ENV_CONFIG } from "../config/config.js";

class CartController {
    constructor() {
        this.cartService = new CartService();
    }

    async createCart(req, res) {
        try {
            const newCart = await this.cartService.createCart();
            req.logger.info("Carrito creado:", newCart);
            res.status(201).send(newCart);
        } catch (error) {
            req.logger.error("Error creando el carrito:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getCart(req, res) {

        console.log();
        try {
            const cart = await this.cartService.getCart(req.params.cid);
            if (cart && (req.session.user.cart === req.params.cid || req.session.role === 'admin')) {
                req.logger.info("Carrito:", cart);
                res.send({ products: cart.products });
            } else {
                req.logger.error("Acceso no autorizado al carrito");
                res.status(403).json({ error: "Acceso no autorizado al carrito" });
            }
        } catch (error) {
            req.logger.error("Error consiguiendo carrito:", error);
            res.status(403).json({ error: "Error al obtener el carrito" });
        }
    }

    async addProductToCart(req, res) {
        try {
            const { cid, pid } = req.params;
            const result = await this.cartService.addProductToCart(cid, pid);
            if (result && (req.session.user.cart === req.params.cid)) {
                if (result.status !== "ok") {
                    if (result.status === "299") {
                        res.status(299).json(result);
                    } else {
                        res.status(400).json(result);
                    }
                } else {
                    req.logger.info(`Producto ${pid} agregado a su carrito.`);
                    res.status(200).json(result);
                }
            } else {
                req.logger.error("Acceso no autorizado al carrito");
                res.status(403).json({ error: "Acceso no autorizado al carrito" });
            }

        } catch (error) {
            req.logger.error("Error agregando producto al carrito:", error);
            res.status(500).json({ error: "Error al agregar el producto al carrito" });
        }
    }

    async addProductToCartWithQuantity(req, res) {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.query;

            const cart = await this.cartService.getCart(cid);


            if (cart && cart.products || req.session.user.cart === req.params.cid) {
                const result = await this.cartService.addProductToCartWithQuantity(cid, pid, quantity);

                if (result.status !== "ok") {
                    if (result.status === "299") {
                        res.status(299).json(result);
                    } else {
                        res.status(400).json(result);
                    }
                } else {
                    req.logger.info(`Producto ${pid} agregado a su carrito.`);
                    res.status(200).json(result);
                }
            } else {
                req.logger.error(`Error al agregar producto al carrito ${cid} con cantidad: Carrito no encontrado o no tiene productos`);
                res.status(404).json({ status: "error", message: "Carrito no encontrado o no tiene productos" });
            }
        } catch (error) {
            req.logger.error(`Error al agregar producto al carrito ${cid} con cantidad:`, error);
            res.status(500).json({ status: "error", message: "Error interno del servidor" });
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
            if (req.session.user.cart === req.params.cid) {
                const { cid, pid } = req.params;
                const result = await this.cartService.deleteProductFromCart(cid, pid);
                req.logger.info(`Producto ${pid} eliminado de su carrito.`);
                res.send(result);
            } else {
                req.logger.error("Acceso no autorizado al carrito");
                res.status(403).json({ error: "Acceso no autorizado al carrito" });
            }
        } catch (error) {
            req.logger.error(`Error eliminando producto del carrito:`, error);
        }
    }

    async deleteProductsFromCart(req, res) {
        try {
            if (req.session.user.cart === req.params.cid) {
                const cid = req.params.cid;
                const result = await this.cartService.deleteProductsFromCart(cid);
                req.logger.info(`Productos eliminados de su carrito.`);
                res.send(result);
            } else {
                req.logger.error("Acceso no autorizado al carrito");
                res.status(403).json({ error: "Acceso no autorizado al carrito" });
            }
        } catch (error) {
            req.logger.error(`Error eliminando los productos del carrito:`, error);
        }
    }

    async sendPurchaseConfirmationEmail(clientEmail, ticketData) {
        try {
            const productsHtml = ticketData.products.map((product) => {
                const { title, description, price, thumbnails } = product.product;
                return `
                    <div style="display: flex; margin: 1rem 0;">
                        <div class="productCard_img">
                            <img style="width: 160px;" src="${thumbnails[0]}" alt="${title}">
                        </div>
                        <div style=" width: 100%;">
                            <div style="display: flex; width: 100%; margin-top: 0.4rem; align-items: center; justify-content: space-between;">
                                <h3 style="font-family: 'Roboto', sans-serif; font-size: 17px; text-align: left; margin-left: 2rem;">${title}</h3>
                                <p style="font-family: 'Roboto', sans-serif; font-size: 17px; text-align: left; margin-left: 4rem;">Cantidad: ${product.quantity}</p>
                            </div>
                            <p style="font-family: 'Roboto', sans-serif; font-size: 17px; text-align: left; margin: .5rem 0 1.5rem 2.5rem;">${description}</p>
                            <p style="font-family: 'Roboto', sans-serif; font-size: 16px; text-align: left; margin-left: 2rem;">Precio: $${price}</p>
                        </div>
                    </div>
                `;
            }).join('');

            const emailContent = `
            <div style="margin: auto;">
                <p style="font-family: 'Roboto', sans-serif; font-size: 24px; text-align: center; padding: 1.4rem 0 0.7rem;">¡Gracias por tu compra!</p>
                <p style="font-family: 'Roboto', sans-serif; font-size: 19px; text-align: left; margin: 0 0 0.6rem 1rem;">Aquí está el resumen de tu compra:</p>
                <div style="width: 100%;">
                ${productsHtml}
                </div>
                <p style="font-family: 'Roboto', sans-serif; font-size: 19px; text-align: left; margin: 0 0 0.6rem 1rem;">Total: $${ticketData.amount}</p>
                <p style="font-family: 'Roboto', sans-serif; font-size: 19px; text-align: center; margin: 2rem 0 0;">ID del ticket: ${ticketData.code}</p>
            </div>
            `;

            const mailOptions = {
                from: "Proyecto E-Commerce " + ENV_CONFIG.EMAIL_USER,
                to: clientEmail,
                subject: "Confirmación de compra",
                html: emailContent,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Correo electrónico de confirmación de compra enviado a ${clientEmail}`);
        } catch (error) {
            console.error("Error al enviar el correo electrónico de confirmación de compra:", error);
        }
    }

    async createPurchaseTicket(req, res) {
        try {
            if (req.session.user.cart === req.params.cid) {

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

                const ticketCreated = await ticketController.createTicket({
                    body: ticketData,
                });

                await this.sendPurchaseConfirmationEmail(req.user.email, ticketData);

                res.json({ status: "success", message: "Compra realizada con éxito", ticket: ticketCreated, failedProducts: failedProducts.length > 0 ? failedProducts : undefined });
                req.logger.info(`Compra realizada con éxito.`);
            } else {
                req.logger.error("Acceso no autorizado al carrito");
                res.status(403).json({ error: "Acceso no autorizado al carrito" });
            }
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

    async getTotalProductsInCart(req, res) {
        try {
            const cart = await this.cartService.getCart(req.params.cid);
            if (!cart) {
                return res.status(404).json({ error: "Carrito no encontrado" });
            }

            const totalProducts = cart.products.reduce((total, product) => {
                return total + product.quantity;
            }, 0);

            res.json({ totalProducts });
        } catch (error) {
            req.logger.error("Error al obtener el total de productos en el carrito:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getProductQuantityInCart(req, res) {
        try {
            const { cid, pid } = req.params;
            const cart = await this.cartService.getCart(cid);

            if (!cart) {
                return res.status(404).json({ error: "Carrito no encontrado" });
            }

            const productInCart = cart.products.find(item => item.product._id.toString() === pid);

            if (!productInCart) {
                return res.status(298).json({ quantity: 0 });
            }
            const quantity = productInCart.quantity;
            res.json({ quantity });
        } catch (error) {
            req.logger.error("Error al obtener la cantidad del producto en el carrito:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async changeProductsQuantity(req, res) {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;

            const result = await this.cartService.updateProductQuantityFromCart(
                cid,
                pid,
                quantity
            );

            if (result.status === "ok") {
                res.status(200).json({ message: "Cantidad del producto actualizada exitosamente" });
            } else {
                res.status(400).json({ error: "No se pudo actualizar la cantidad del producto en el carrito" });
            }
        } catch (error) {
            req.logger.error("Error al cambiar la cantidad del producto en el carrito:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}

export default new CartController();

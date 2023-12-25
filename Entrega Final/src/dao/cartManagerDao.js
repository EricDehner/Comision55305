import { cartModel } from "./models/cart.model.js";
import { productModel } from "./models/product.model.js";
import mongoose from "mongoose";

class CartManager {
    async newCart() {
        let cart = await cartModel.create({ products: [] });
        console.log("Cart created!");
        return {
            status: "ok",
            message: "El Carrito se creó correctamente!",
            id: cart._id,
        };
    }

    async getCart(id) {
        if (this.validateId(id)) {
            return (await cartModel.findOne({ _id: id }).lean()) || null;
        } else {
            console.log("Not found!");
            return null;
        }
    }

    async getCarts() {
        return await cartModel.find().lean();
    }

    async addProductToCart(cid, pid) {
        try {
            console.log(`Adding product ${pid} to cart ${cid}`);
            if (mongoose.Types.ObjectId.isValid(cid) && mongoose.Types.ObjectId.isValid(pid)) {
                const cart = await cartModel.findOne({ _id: cid, "products.product": pid });
                const product = await productModel.findById(pid);

                if (cart) {
                    const productInCart = cart.products.find(item => item.product.equals(pid));

                    if (productInCart && productInCart.quantity + 1 > product.stock) {
                        return { status: "299", message: "No se puede agregar más cantidad, el stock máximo ha sido alcanzado." };

                    }
                }

                if (product.stock <= 0) {
                    console.log("No hay más productos disponibles en stock.");
                    return {
                        status: "error",
                        message: "No hay más productos disponibles en stock.",
                    };
                }

                const updateResult = await cartModel.updateOne(
                    { _id: cid, "products.product": pid },
                    { $inc: { "products.$.quantity": 1 } }
                );

                if (updateResult.matchedCount === 0) {
                    const pushResult = await cartModel.updateOne(
                        { _id: cid },
                        { $push: { products: { product: pid, quantity: 1 } } }
                    );
                }

                return {
                    status: "ok",
                    message: "El producto se agregó correctamente!",
                };
            } else {
                return {
                    status: "error",
                    message: "ID inválido!",
                };
            }
        } catch (error) {
            console.error(error);
            return {
                status: "error",
                message: "Ocurrió un error al agregar el producto al carrito!",
            };
        }
    }

    async addProductToCartWithQuantity(cid, pid, quantity) {
        try {
            console.log(`Adding product ${pid} to cart ${cid}`);
            if (mongoose.Types.ObjectId.isValid(cid) && mongoose.Types.ObjectId.isValid(pid)) {
                const cart = await cartModel.findOne({ _id: cid, "products.product": pid });
                const product = await productModel.findById(pid);

                if (cart) {
                    const productInCart = cart.products.find(item => item.product.equals(pid));

                    if (productInCart && productInCart.quantity + parseInt(quantity, 10) > product.stock) {
                        return { status: "299", message: "No se puede agregar más cantidad, el stock máximo ha sido alcanzado." };
                    }
                }

                if (product.stock <= 0) {
                    console.log("No hay más productos disponibles en stock.");
                    return { status: "error", message: "No hay más productos disponibles en stock." };
                }

                const updateResult = await cartModel.updateOne(
                    { _id: cid, "products.product": pid },
                    { $inc: { "products.$.quantity": parseInt(quantity, 10) } }
                );

                if (updateResult.matchedCount === 0) {
                    const pushResult = await cartModel.updateOne(
                        { _id: cid },
                        { $push: { products: { product: pid, quantity: parseInt(quantity, 10) } } }
                    );
                }

                return { status: "ok", message: `Producto ${pid} agregado al carrito con cantidad ${quantity}` };
            } else {
                return { status: "error", message: "ID inválido!" };
            }
        } catch (error) {
            console.error(error);
            return { status: "error", message: "Ocurrió un error al agregar el producto al carrito con cantidad!" };
        }
    }

    async updateProducts(cid, products) {
        try {
            await cartModel.updateOne({ _id: cid }, { products: products }, { new: true, upsert: true });
            console.log("Product updated!");

            return true;
        } catch (error) {
            console.log("Not found!");

            return false;
        }
    }

    async updateQuantityProductFromCart(cid, pid, quantity) {
        try {
            if (this.validateId(cid)) {
                const cart = await this.getCart(cid);
                if (!cart) {
                    console.log("Cart not found!");
                    return false;
                }

                console.log('PID:', pid);
                console.log('Cart products:', cart.products.map(item => item.product._id ? item.product._id.toString() : item.product.toString()));

                const product = cart.products.find((item) =>
                    (item.product._id ? item.product._id.toString() : item.product.toString()) === pid.toString()
                );

                if (product) {
                    product.quantity = quantity;

                    await cartModel.updateOne({ _id: cid }, { products: cart.products });
                    console.log("Product updated!");

                    return true;
                } else {
                    console.log("Product not found in cart");
                    return false;
                }
            } else {
                console.log("Invalid cart ID!");
                return false;
            }
        } catch (error) {
            console.error("Error while updating product:", error);
            return false;
        }
    }

    async deleteProductFromCart(cid, pid) {
        try {
            if (mongoose.Types.ObjectId.isValid(cid)) {
                const updateResult = await cartModel.updateOne(
                    { _id: cid },
                    { $pull: { products: { product: pid } } }
                );

                if (updateResult.matchedCount > 0) {
                    console.log("Product deleted!");
                    return true;
                }
            } else {
                console.log("Invalid cart ID!");
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async deleteProductsFromCart(cid) {
        try {
            if (this.validateId(cid)) {
                const cart = await this.getCart(cid);

                await cartModel.updateOne({ _id: cid }, { products: [] });
                console.log("Products deleted!");

                return true;
            } else {
                console.log("Not found!");

                return false;
            }
        } catch (error) {
            return false;
        }
    }

    validateId(id) {
        return mongoose.Types.ObjectId.isValid(id);
    }

    async updateProductQuantity(cid, pid, quantity) {
        try {
            if (this.validateId(cid)) {
                const cart = await this.getCart(cid);
                if (!cart) {
                    console.log("Cart not found!");
                    return false;
                }

                const product = cart.products.find(
                    (item) =>
                        (item.product._id ? item.product._id.toString() : item.product.toString()) === pid.toString()
                );

                if (product) {
                    product.quantity = quantity;

                    await cartModel.updateOne({ _id: cid }, { products: cart.products });
                    console.log("Product quantity updated!");

                    return true;
                } else {
                    console.log("Product not found in cart");
                    return false;
                }
            } else {
                console.log("Invalid cart ID!");
                return false;
            }
        } catch (error) {
            console.error("Error while updating product quantity:", error);
            return false;
        }
    }
}

export default CartManager;
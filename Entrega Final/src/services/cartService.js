import CartManager from "../dao/cartManagerDao.js";
import { cartModel } from "../dao/models/cart.model.js";

class CartService {
    constructor() {
        this.cartManager = new CartManager();
    }

    async createCart() {
        return await this.cartManager.newCart();
    }

    async getCart(id) {
        return await this.cartManager.getCart(id);
    }

    async addProductToCart(cid, pid) {
        const result = await this.cartManager.addProductToCart(cid, pid);

        if (result.status === "ok" || result.status === "299") {
            return result;
        } else {
            return { status: "error", message: result.message };
        }
    }

    async addProductToCartWithQuantity(cid, pid, quantity) {
        try {
            const result = await this.cartManager.addProductToCartWithQuantity(cid, pid, quantity);
            if (result.status === "ok" || result.status === "299") {
                return result;
            } else {
                return { status: "error", message: result.message };
            }
        } catch (error) {
            console.error("Error al agregar producto al carrito con cantidad:", error);
            throw error;
        }
    }

    async updateQuantityProductFromCart(cartId, productId, quantity) {
        const result = await this.cartManager.updateQuantityProductFromCart(
            cartId,
            productId,
            quantity
        );
        if (result) {
            return {
                status: "ok",
                message: "El producto se actualizó correctamente",
            };
        } else {
            throw new Error("Error: No se pudo actualizar el producto del carrito");
        }
    }

    async deleteProductFromCart(cartId, productId) {
        const result = await this.cartManager.deleteProductFromCart(
            cartId,
            productId
        );
        if (result) {
            return { status: "ok", message: "El producto se eliminó correctamente" };
        } else {
            throw new Error("Error: No se pudo eliminar el producto del carrito");
        }
    }

    async deleteCart(cartId) {
        const result = await this.cartManager.deleteProductFromCart(cid, pid);
        if (result) {
            res.send({
                status: "ok",
                message: "El producto se eliminó correctamente",
            });
        } else {
            res.status(400).send({
                status: "error",
                message: "Error: No se pudo eliminar el producto del carrito",
            });
        }
        return await this.cartManager.deleteProductFromCart(cid, pid);
    }

    async updateCart(cartId, products) {
        const result = await this.cartManager.updateProducts(cartId, products);
        if (result) {
            return { status: "ok", message: "El carrito se actualizó correctamente" };
        } else {
            throw new Error("Error: No se pudo actualizar el carrito");
        }
    }

    async deleteProductsFromCart(cartId) {
        const result = await this.cartManager.deleteProductsFromCart(cartId);
        if (result) {
            return { status: "ok", message: "El carrito se vació correctamente!" };
        } else {
            throw new Error('Error! No se pudo vaciar el Carrito!');
        }
    }

    async getProductQuantityInCart(cartId, productId) {
        try {
            const cart = await this.cartManager.getCart(cartId);

            if (!cart) {
                return null;
            }

            const productInCart = cart.products.find(item => item.product.toString() === productId);

            return productInCart ? productInCart.quantity : 0;
        } catch (error) {
            console.error("Error al obtener la cantidad del producto en el carrito:", error);
            throw error;
        }
    }

    async updateProductQuantityFromCart(cartId, productId, quantity) {
        const result = await this.cartManager.updateProductQuantity(cartId, productId, quantity);

        if (result) {
            return {
                status: "ok",
                message: "La cantidad del producto se actualizó correctamente",
            };
        } else {
            throw new Error("Error: No se pudo actualizar la cantidad del producto en el carrito");
        }
    }
}

export default CartService;

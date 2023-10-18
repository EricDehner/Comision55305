import fs from "fs";

class ProductManager {
    constructor() {
        this.path = "Products.json";
        this.products = [];
        this.lastProductId = 0;
        this.loadProducts();
    }

    loadProducts() {
        try {
            const fileData = fs.readFileSync(this.path, 'utf-8');
            this.products = JSON.parse(fileData);
            this.lastProductId = this.products.length > 0 ? this.products[this.products.length - 1].id : 0;
        } catch (error) {
            console.log("Error loading products:", error);
            this.products = [];
            this.lastProductId = 0;
        }
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        const product = this.products.find(product => product.id === id);
        if (product) {
            return product;
        } else {
            console.log("Not Found");
        }
    }

    async saveProducts() {
        try {
            await fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
            console.log("Products saved successfully.");
        } catch (error) {
            console.log("Error saving products:", error);
        }
    }

    async updateProduct(id, updatedFields) {
        const productIndex = this.products.findIndex(product => product.id === id);

        if (productIndex !== -1) {
            const newCode = updatedFields.code;

            if (newCode !== this.products[productIndex].code && await this.validateCode(newCode)) {
                console.log("The new product code is already in use.");
                return false;
            }

            const updatedProduct = { ...this.products[productIndex], ...updatedFields };
            this.products[productIndex] = updatedProduct;
            await this.saveProducts();
            return true;
        } else {
            console.log("Product not found.");
            return false;
        }
    }

    async deleteProduct(id) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            this.products.splice(productIndex, 1);
            await this.saveProducts();
            console.log("Product deleted!");
            return true;
        } else {
            console.log("Product not found.");
            return false;
        }
    }

    async addProduct(product) {
        try {
            if (await this.validateCode(product.code)) {
                console.log("The product code already exists.");
                return false;
            } else {
                const producto = { id: await this.generateId(), title: product.title, description: product.description, code: product.code, price: product.price, status: product.status, stock: product.stock, category: product.category, thumbnails: product.thumbnails };
                this.products = await this.getProducts();
                this.products.push(producto);
                console.log("Product added!");
                await this.saveProducts();
                return true;
            }
        } catch (error) {
            console.error("Error adding product:", error);
            return false;
        }
    }

    async generateId() {
        try {
            let max = 0;
            let products = await this.getProducts();

            products.forEach(item => {
                if (item.id > max) {
                    max = item.id;
                }
            });

            return max + 1;
        } catch (error) {
            console.error("Error generating ID:", error);
            throw error;
        }
    }

    async validateCode(code) {
        try {
            const products = await this.getProducts();
            return products.some(item => item.code === code);
        } catch (error) {
            console.error("Error validating code:", error);
            throw error;
        }
    }
}

export default ProductManager;
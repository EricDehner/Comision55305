import fs from "fs"

export default class ProductManager {
    constructor(path) {
        this.path = path;
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

    async saveProducts() {
        try {
            await fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
            console.log("Products saved successfully.");
        } catch (error) {
            console.log("Error saving products:", error);
        }
    }

    async addProduct({ title, description, price, thumbnail, code, stock }) {
        if (!title || !description || !price || !thumbnail || !code || !stock) {
            console.log("All fields are required.");
            return;
        }

        const codeProduct = this.products.find(product => product.code === code);
        if (codeProduct) {
            console.log("The product code already exists.");
            return;
        }

        this.lastProductId++;

        const newProduct = {
            id: this.lastProductId,
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        };

        this.products.push(newProduct);
        await this.saveProducts();
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

    async updateProduct(id, updatedFields) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            const updatedProduct = { ...this.products[productIndex], ...updatedFields };
            this.products[productIndex] = updatedProduct;
            await this.saveProducts();
        } else {
            console.log("Product not found.");
        }
    }

    async deleteProduct(id) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            this.products.splice(productIndex, 1);
            await this.saveProducts();
        } else {
            console.log("Product not found.");
        }
    }
}
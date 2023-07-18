const fs = require('fs');

class ProductManager {
    constructor(filePath) {
        this.filePath = filePath;
        this.products = [];
        this.lastProductId = 0;
        this.loadProducts();
    }

    loadProducts() {
        try {
            const fileData = fs.readFileSync(this.filePath, 'utf-8');
            this.products = JSON.parse(fileData);
            this.lastProductId = this.products.length > 0 ? this.products[this.products.length - 1].id : 0;
        } catch (error) {
            console.log("Error loading products:", error);
            this.products = [];
            this.lastProductId = 0;
        }
    }

    saveProducts() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.products, null, 2));
            console.log("Products saved successfully.");
        } catch (error) {
            console.log("Error saving products:", error);
        }
    }

    addProduct({ title, description, price, thumbnail, code, stock }) {
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
        this.saveProducts();
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

    updateProduct(id, updatedFields) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            const updatedProduct = { ...this.products[productIndex], ...updatedFields };
            this.products[productIndex] = updatedProduct;
            this.saveProducts();
        } else {
            console.log("Product not found.");
        }
    }

    deleteProduct(id) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            this.products.splice(productIndex, 1);
            this.saveProducts();
        } else {
            console.log("Product not found.");
        }
    }
}

const productManager = new ProductManager('products.json');

productManager.addProduct({
    title: "Lapiz",
    description: "Lapiz para dibujo",
    price: 200,
    thumbnail: "lapiz.png",
    code: "111111",
    stock: 30
});

productManager.addProduct({
    title: "Goma de borrar",
    description: "Goma blanca",
    price: 50,
    thumbnail: "gomaDeBorrar.jpg",
    code: "111112",
    stock: 20
});

console.log(productManager.getProducts());

console.log(productManager.getProductById(2));
console.log(productManager.getProductById(3));

productManager.updateProduct(2, { price: 250, stock: 40 });
console.log(productManager.getProductById(2));

productManager.deleteProduct(1);
console.log(productManager.getProducts());

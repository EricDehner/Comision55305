class ProductManager {
    constructor() {
        this.products = [];
        this.lastProductId = 0;
    }

    addProduct(title, description, price, thumbnail, code, stock) {

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
}

const productManager = new ProductManager();

productManager.addProduct("Lapiz", "Lapiz para dibujo", 200, "lapiz.jpg", "111111", 30);
productManager.addProduct("Goma de borrar", "Goma blanca", 50, "gomaDeBorrar.jpg", "111112", 20);


//Ver productos del array
console.log(productManager.getProducts());

//Ver producto con el id seleccionado
console.log(productManager.getProductById(2));
console.log(productManager.getProductById(3));

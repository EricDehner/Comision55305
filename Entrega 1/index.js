class ProductManager {
    constructor() {
        this.products = [];
        this.lastProductId = 0;
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

productManager.addProduct(
    {
        title: "Lapiz",
        description: "Lapiz para dibujo",
        price: 200,
        thumbnail: "lapiz.png",
        code: "111111",
        stock: 30
    })
productManager.addProduct(
    {
        title: "Goma de borrar",
        description: "Goma blanca",
        price: 50,
        thumbnail: "gomaDeBorrar.jpg",
        code: "111112",
        stock: 20
    })


//Ver productos del array
console.log(productManager.getProducts());

//Ver producto con el id seleccionado
console.log(productManager.getProductById(2));
console.log(productManager.getProductById(3));

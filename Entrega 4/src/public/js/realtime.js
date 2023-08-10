const socketClient = io();

//Muestra los productos disponibles
socketClient.on("envioDeProductos", (obj) => {
    updateProductList(obj);
});

//Funcion usada para mostrar los productos disponibles
function updateProductList(products) {
    let div = document.getElementById("list-products");
    let productos = " ";

    products.forEach((product) => {
        productos += `<article class="container">
                     <div class="card">
                     <div class="imgBx">
                     <img src="${product.thumbnail}" width="150"/>
                     </div>
                     <div class="contentBx">
                     <h2>${product.title}</h2>
                     <div class="size">
                     <h3>${product.description}</h3>
                     </div>
                     <div class="color">
                     <h3>$${product.price}</h3>
                     </div>
                     <a href="#">Comprar ahora</a>
                     </div>
                     </div>
                     </article>`;

    });
    div.innerHTML = productos;
}

//Formulario para agregar y quitar productos de la lista
let form = document.getElementById("formProduct");
form.addEventListener("submit", (evt) => {
    evt.preventDefault();

    let title = form.elements.title.value;
    let description = form.elements.description.value;
    let stock = form.elements.stock.value;
    let thumbnail = form.elements.thumbnail.value;
    let category = form.elements.category.value;
    let price = form.elements.price.value;
    let code = form.elements.code.value;

    socketClient.emit("addProduct", {
        title,
        description,
        stock,
        thumbnail,
        category,
        price,
        code,
    });

    form.reset();

});

//Elimina producto por su ID
document.getElementById("delete-btn").addEventListener("click", function () {
    const deleteidinput = document.getElementById("id-prod");
    const deleteid = parseInt(deleteidinput.value);
    socketClient.emit("deleteProduct", deleteid);
    deleteidinput.value = "";
});
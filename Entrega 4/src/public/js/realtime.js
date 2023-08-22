const socket = io();
const content = document.getElementById("content");
const menu = document.getElementById("menu");
const IDviews = document.getElementById("id")
const button = document.querySelector(".realTime_header-btn");
let menuActive = false;
let idActive = false;

socket.on("realTimeProducts", (data) => {
    let salida = ``;
    data.forEach(item => {
        salida += `<div class="card">
            <p id="id" class="ID_card none">${item.id}</p>
            <div class="card_img">
            <img class="card_img-img" src=${item.thumbnails} alt=${item.description} />
            </div>
        <div class="card_content">
            <h2 class="card_content-title">${item.title}</h2>
            <h3 class="card_content-description">${item.description}</h3>
            <p class="card_content-price">$${item.price}</p>
            <a class="card_content-btn" href="#">Comprar</a>
            </div>
            </div>`;
    });
    content.innerHTML = salida;
});

function showID() {
    const IDviews = document.getElementsByClassName("ID_card")
    if (!idActive) {
        for (let i = 0; i < IDviews.length; i++) {
            IDviews[i].classList.remove("none");
        }

        console.log("muestra id");
        document.querySelector(".realTime_content-btn.blue").textContent = "OCULTAR ID's";
        idActive = true;
    } else {
        for (let i = 0; i < IDviews.length; i++) {
            IDviews[i].classList.add("none");
        }
        console.log("oculta id");
        document.querySelector(".realTime_content-btn.blue").textContent = "MOSTRAR ID's";
        idActive = false;
    }
}

function editMenu() {
    if (!menuActive) {
        menu.innerHTML = `
        <div class="realTime_content-add">
        <h2 class="realTime_content-add--title">Agregar Producto</h2>
        <div class="realTime_content-add--input">
        <input type="text" class="realTime_content-add--input---item" id="title" placeholder="Titulo" required>
        <input type="text" class="realTime_content-add--input---item" id="description" placeholder="Descripción"
        required>
        <input type="number" class="realTime_content-add--input---item" id="code" placeholder="Codigo" required>
        <input type="number" class="realTime_content-add--input---item" id="price" placeholder="Precio"
        required>
        <input type="text" class="realTime_content-add--input---item" id="status" placeholder="Status">
        <input type="number" class="realTime_content-add--input---item" id="stock" placeholder="Stock" required>
        <input type="text" class="realTime_content-add--input---item" id="category" placeholder="Categoría"
        required>
        <input type="text" class="realTime_content-add--input---item" id="thumbnails" placeholder="Imagen"
        required>
        </div>
        <button class="realTime_content-btn green" type="submit" onclick="addProduct()">AGREGAR</button>
    </div>
    <div class="realTime_content-stick"></div>
    <div class="realTime_content-delete">
    <h2 class="realTime_content-delete--title">Eliminar Producto</h2>
    <div class="realTime_content-delete--input">
    <input type="number" class="realTime_content-delete--input---item" id="idProduct"
    placeholder="ID del producto">
    </div>
    <button class="realTime_content-btn red" onclick="deleteProduct()">ELIMINAR</button>
    </div>
    <div class="realTime_content-stick-x"></div>
    <div class="realTime_content-showID">
    <h3 class="realTime_content-showID--title">Mostrar ID de productos</h3>
    <button class="realTime_content-btn blue" onclick="showID()">MOSTRAR ID´S</button>
    </div>`
        button.classList.add("realTime_header-btn--active");
        menu.classList.remove("none");
        menuActive = true;
    } else {
        menu.innerHTML = "";
        button.classList.remove("realTime_header-btn--active");
        menu.classList.add("none");
        menuActive = false;
    }
}

function addProduct() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const code = document.getElementById("code").value;
    const price = document.getElementById("price").value;
    const status = document.getElementById("status").value;
    const stock = document.getElementById("stock").value;
    const category = document.getElementById("category").value;
    const thumbnails = document.getElementById("thumbnails").value;
    const product = { title: title, description: description, code: code, price: price, status: status, stock: stock, category: category, thumbnails: thumbnails };

    socket.emit("nuevoProducto", product);
}

function deleteProduct() {
    const idProduct = document.getElementById("idProduct").value;
    socket.emit("eliminarProducto", idProduct);
}


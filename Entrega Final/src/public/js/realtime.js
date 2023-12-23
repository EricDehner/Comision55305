const socket = io();
const content = document.getElementById("content");
const menu = document.getElementById("menu");
const IDviews = document.getElementById("id")
const button = document.querySelector(".realTime_header-btn");
let menuActive = false;
let idActive = false;


socket.on("infodelete", (data) => {
    Toastify({
        text: data,
        duration: 1500,
        position: "right",
        offset: {
            x: 0,
            y: 55,
        },
        className: "toastify-error"
    }).showToast();
})
socket.on("productoAgregado", (data) => {
    Toastify({
        text: data.message,
        duration: 1500,
        position: "right",
        offset: {
            x: 0,
            y: 55,
        },
    }).showToast();
})



socket.on("realTimeProducts", (data) => {
    let salida = ``;
    data.forEach(item => {
        salida += `<div class="card">
        <button data-tooltip="Eliminar producto" class="card_x" type="button" onclick="deleteProduct('${item._id}')"><span class="material-symbols-outlined-x">close</span></button>
                        <p id="id" class="ID_card none">${item._id}</p>
                        <div class="card_img">
                            <img class="card_img-img" src=${item.thumbnails} alt=${item.description} />
                        </div>
                        <div class="card_content">
                            <h2 class="card_content-title">${item.title}</h2>
                            <h3 class="card_content-description">${item.description}</h3>
                            <p class="card_content-price">$${item.price}</p>
                            <p class="card_content-owner">${item.owner}</p>
                        </div>
                    </div>`;
    });
    content.innerHTML = salida;
});

function showID() {
    const IDviews = document.getElementsByClassName("ID_card");
    const buttonText = document.querySelector(".realTime_header-btn--id");

    for (let i = 0; i < IDviews.length; i++) {
        if (idActive) {
            IDviews[i].classList.add("none");
        } else {
            IDviews[i].classList.remove("none");
        }
    }

    const iconSpan = document.createElement("span");
    iconSpan.className = "material-symbols-outlined-prod";

    if (idActive) {
        iconSpan.textContent = "visibility";
        buttonText.setAttribute("data-tooltip", "Mostrar ID productos");
    } else {
        iconSpan.textContent = "visibility_off";
        buttonText.setAttribute("data-tooltip", "Ocultar ID productos");
    }

    buttonText.innerHTML = '';
    buttonText.appendChild(iconSpan);
    idActive = !idActive;
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
    `
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
    const product = {
        title: title, description: description, code: code, price: price, status: status,
        stock: stock, category: category, thumbnails: thumbnails, token: localStorage.getItem("userID")
    };

    socket.emit("nuevoProducto", product);
}

function deleteProduct(idProduct) {
    const product = { idProduct: idProduct, token: localStorage.getItem("userID") }
    socket.emit("eliminarProducto", product);

}


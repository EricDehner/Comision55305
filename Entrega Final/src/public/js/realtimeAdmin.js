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
        salida += `
        <div class="card-realtime">
        <button data-tooltip="Eliminar producto" class="card_x" type="button" onclick="deleteProduct(event, '${item._id}')">
            <span class="material-symbols-outlined-x">close</span>
        </button>
        <p id="id" class="ID_card none">${item.owner}</p>
        <div class="card_img">
            <img class="card_img-img" src="${item.thumbnails}" alt="${item.description}" />
        </div>
        <div class="card_content">
            <h2 class="card_content-title">
                <input class="card_content-input card_content-title" type="text" id="titleInput_${item._id}" value="${item.title}" />
            </h2>
            <h3 class="card_content-description">
                <input class="card_content-input card_content-description" type="text" id="descriptionInput_${item._id}" value="${item.description}" />
            </h3>
            <div class="card_content-container lowSpace ">
                <p class="card_content-price">
                    $
                    <input class="card_content-input card_content-price" type="number" id="priceInput_${item._id}" value="${item.price}" />
                </p>
                <p class="card_content-stock">
                    <input class="card_content-input card_content-stock" type="number" id="stockInput_${item._id}" value="${item.stock}" />
                    U
                </p>
            </div>
            <div class="card_content-container">
                <p class="card_content-id">${item._id}</p>
                <button data-tooltip="Guardar cambios" type="button" class="card_content-save" onclick="saveChanges('${item._id}','${item.title}','${item.description}','${item.price}','${item.stock}')">
                    <span class="material-symbols-outlined">save</span>
                </button>
            </div>
        </div>
    </div>
        `;
    });
    content.innerHTML = salida;
});

function saveChanges(pid, originalTitle, originalDescription, originalPrice, originalStock) {
    const saveButton = document.querySelector('.card_content-save');
    saveButton.disabled = true;

    const title = document.getElementById(`titleInput_${pid}`).value;
    const description = document.getElementById(`descriptionInput_${pid}`).value;
    const price = parseFloat(document.getElementById(`priceInput_${pid}`).value);
    const stock = parseInt(document.getElementById(`stockInput_${pid}`).value, 10);

    if (title !== originalTitle || description !== originalDescription || price !== parseFloat(originalPrice) || stock !== parseFloat(originalStock)) {
        const data = {
            title,
            description,
            price,
            stock
        };

        fetch(`/api/products/${pid}`, {
            method: 'PUT',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                authorization: "Bearer " + localStorage.getItem("userID")
            },
            body: JSON.stringify(data),
        })

            .then(response => response.json())
            .then(result => {
                Toastify({
                    text: "Producto actualizado",
                    duration: 1500,
                    position: "right",
                    offset: {
                        x: 0,
                        y: 55,
                    },
                }).showToast();
                saveButton.disabled = false;
            })
            .catch(error => {
                console.error("Error en la actuualización del producto,", error)
                Toastify({
                    text: "Error en la actualización del producto",
                    duration: 1500,
                    position: "right",
                    offset: {
                        x: 0,
                        y: 55,
                    },
                    className: "toastify-error"
                }).showToast();
                saveButton.disabled = false;
            });
    } else {
        Toastify({
            text: "No realizó modificación",
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            },
            className: "toastify-error"
        }).showToast();
        saveButton.disabled = false;
        return;
    }
}

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
        buttonText.setAttribute("data-tooltip", "Mostrar ID dueño");
    } else {
        iconSpan.textContent = "visibility_off";
        buttonText.setAttribute("data-tooltip", "Ocultar ID dueño");
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
        <button class="realTime_content-btn green" type="submit" onclick="addProduct(event)">AGREGAR</button>
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

function addProduct(event) {
    const addButton = event.currentTarget;
    addButton.disabled = true;

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const code = document.getElementById("code").value;
    const price = document.getElementById("price").value;
    const status = document.getElementById("status").value;
    const stock = document.getElementById("stock").value;
    const category = document.getElementById("category").value;
    const thumbnails = document.getElementById("thumbnails").value;

    /*     if (title === "" || description === "" || code === "" || price === "" || stock === "" || category === "" || thumbnails === "") {
            Toastify({
                text: "¡Complete todos los campos!",
                duration: 1500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                className: "toastify-error"
            }).showToast();
            addButton.disabled = false; 
            return;
        } */

    const product = {
        title: title, description: description, code: code, price: price, status: status,
        stock: stock, category: category, thumbnails: thumbnails, token: localStorage.getItem("userID")
    };

    /*     socket.emit("nuevoProducto", product);
     */
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("code").value = "";
    document.getElementById("price").value = "";
    document.getElementById("status").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("category").value = "";
    document.getElementById("thumbnails").value = "";

    addButton.disabled = false;

    //menuContainer.classList.add("none")
    menu.classList.add("none")
    button.classList.remove("realTime_header-btn--active")
    menu.innerHTML = "";
    menuActive = true;
}

function deleteProduct(event, idProduct) {
    const deleteButton = event.currentTarget;
    deleteButton.disabled = true;
    const product = { idProduct: idProduct, token: localStorage.getItem("userID") }
    socket.emit("eliminarProducto", product);
    deleteButton.disabled = false;

}


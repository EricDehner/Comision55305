document.addEventListener('DOMContentLoaded', async function () {
    const url = window.location.href;
    const partesURL = url.split("/");
    const pid = partesURL[partesURL.length - 1];

    await getProductQuantityInCart(pid);
});


const obtenerIdCarrito = () => {
    return JSON.parse(localStorage.getItem("cartID")) || [];
}

async function actualizarTotalProducts() {
    try {
        let cart = localStorage.getItem("cartID");

        if (!cart) {
            return;
        }

        const totalProducts = await getTotalProductsInCart(cart);

        const button = document.getElementById('cartQty');
        if (button) {
            button.textContent = totalProducts.toString();
        }
    } catch (error) {
        console.error(error);
    }
}

function incrementarCantidad() {
    const quantitySpan = document.getElementById('quantity');
    const currentQuantity = parseInt(quantitySpan.innerText, 10);
    const maxQuantity = parseInt(quantitySpan.getAttribute('data-max'), 10);

    if (currentQuantity < maxQuantity) {
        quantitySpan.innerText = currentQuantity + 1;
    }
}

function decrementarCantidad() {
    const quantitySpan = document.getElementById('quantity');
    const currentQuantity = parseInt(quantitySpan.innerText, 10);

    if (currentQuantity > 1) {
        quantitySpan.innerText = currentQuantity - 1;
    }
}

const agregarProductoAlCarritoQty = async (pid, cantidad) => {
    try {
        let cart = localStorage.getItem("cartID");

        if (!cart) {
            document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }

        const response = await fetch("/api/carts/" + cart + "/products/" + pid + "/add-with-quantity?quantity=" + cantidad, {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                authorization: "Bearer " + localStorage.getItem("userID")
            }
        });

        cantidadGlobal = parseInt(cantidad, 10);


        updateDOM(parseInt(cantidad, 10));

        if (response.status === 200) {
            Toastify({
                text: "Se agregó al Carrito!",
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                duration: 1500
            }).showToast();

            await actualizarTotalProducts();
        } else if (response.status === 299) {
            Toastify({
                text: "Producto fuera de stock!",
                duration: 1500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                className: "toastify-error"
            }).showToast();
        } else {
            Toastify({
                text: "Error en agregar el Producto al Carrito!",
                duration: 1500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                className: "toastify-error"
            }).showToast();
        }
    } catch (error) {
        Toastify({
            text: "Error en agregar el Producto al Carrito! " + error,
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            },
            className: "toastify-error"
        }).showToast();
    }
}

async function getProductQuantityInCart(pid) {
    try {
        const cid = localStorage.getItem("cartID");

        if (!cid) {
            return 0;
        }

        const response = await fetch(`/api/carts/${cid}/products/${pid}/quantity`, {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": "Bearer " + localStorage.getItem("userID")
            }
        });
        if (!response.ok) {
            return 0;
        }
        const responseData = await response.json();
        const quantity = responseData.quantity;
        updateDOM(quantity);
        return quantity;

    } catch (error) {
        console.error(error);
        return 0;
    }
}

function updateDOM(quantity) {
    const quantitySpan = document.getElementById('quantity');
    const remainingQuantity = quantity;
    const stockElement = document.querySelector('.product_content-header--stock');
        const currentStock = parseInt(stockElement.innerText.split(' ')[1], 10);
        const updatedStock = isNaN(remainingQuantity) ? currentStock : currentStock - quantity;
        stockElement.innerText = `Stock: ${updatedStock} Unidades`;
        if (updatedStock === 0) {
            stockElement.innerText = `Stock: 0 Unidades`;
            const addButton = document.querySelector('.product_content-btn');
            addButton.classList.add('disabled');
            addButton.onclick = null;
            quantitySpan.innerText = "0";
            quantitySpan.classList.add('disabled');
            const buttonR = document.querySelector('#remove');
            buttonR.classList.add('disabled');
            buttonR.onclick = null;
            const buttonA = document.querySelector('#add');
            buttonA.classList.add('disabled');
            buttonA.onclick = null;
        }
        quantitySpan.innerText = "1";
        quantitySpan.setAttribute('data-max', updatedStock.toString());
}
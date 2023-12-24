const cartItems = document.querySelectorAll('.cart_content');
if (cartItems.length > 0) {
    price();
}

function clearCart() {
    const cid = localStorage.getItem("cartID");
    if (cid) {
        fetch(`/api/carts/${cid}`, {
            method: "DELETE",
        })
            .then((response) => {
                if (response.ok) {
                    Toastify({
                        text: "El carrito se vació correctamente.",
                        duration: 1500,
                        position: "right",
                        offset: {
                            x: 0,
                            y: 55,
                        }
                    }).showToast();
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    Toastify({
                        text: "Error al vaciar el carrito.",
                        duration: 1500,
                        position: "right",
                        offset: {
                            x: 0,
                            y: 55,
                        },
                        className: "toastify-error"
                    }).showToast();
                }
            })
            .catch((error) => {
                console.error(`Error al vaciar el carrito:, ${error}`);
            });
    } else {
        console.error("No se pudo encontrar el carrito en el almacenamiento local.");
    }
}

function deleteProduct(productId) {
    const cid = localStorage.getItem("cartID");

    if (cid) {
        fetch(`/api/carts/${cid}/products/${productId}`, {
            method: "DELETE",
        })
            .then((response) => {
                if (response.ok) {
                    Toastify({
                        text: `Producto eliminado.`,
                        duration: 1500,
                        position: "right",
                        offset: {
                            x: 0,
                            y: 55,
                        }
                    }).showToast();
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    Toastify({
                        text: `Error al eliminar el producto.`,
                        duration: 1500,
                        position: "right",
                        offset: {
                            x: 0,
                            y: 55,
                        },
                        className: "toastify-error"
                    }).showToast();
                }
            })
            .catch((error) => {
                console.error(`Error al eliminar el producto con ID ${productId}:, ${error}`);
            });
    } else {
        console.error("No se pudo encontrar el carrito en el almacenamiento local.");
    }
}

async function buyCart() {
    try {
        const cartId = await localStorage.getItem("cartID")
        const url = `/api/carts/${cartId}/purchase`;

        const response = await fetch(url, {
            method: "POST",
            body: "",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Origin: "",
                authorization: "Bearer " + localStorage.getItem("userID"),
            },
        });
        if (!response.ok) {
            console.error("Error en la respuesta", response.statusText);
            const text = await response.text();
            console.error(text);
            return;
        }

        const responseData = await response.json();

        Toastify({
            text: "La compra se efectuó correctamente.",
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            }
        }).showToast();

        setTimeout(() => {
            openCheckout(responseData)
        }, 500);
    }
    catch (error) {
        console.error("Error en compra", error);
    }
}

function openCheckout(responseData) {
    const modal = document.getElementById('myModal');
    const ticketCode = responseData.ticket.code;
    const products = responseData.ticket.products;
    const totalAmount = responseData.ticket.amount;
    const fetchPromises = [];
    let productsHtml = "";

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productId = product.product;

        const fetchPromise = fetch(`/api/products/${productId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error al obtener detalles del producto con ID ${productId}`);
                }
                return response.json();
            })
            .then((productDetails) => {

                const {
                    description,
                    price,
                    thumbnails,
                    title,
                } = productDetails.data;

                productsHtml += `
                    <div class="productCard">
                        <div class="productCard_img">
                            <img class="productCard_img-img" src="${thumbnails[0]}" alt="${title}">
                        </div>
                        <div class="productCard_content">
                            <div class="productCard_content-header">
                                <h3 class="productCard_content-header--title">${title}</h3>
                                <p class="productCard_content-header--quantity">Cantidad: ${product.quantity}</p>
                            </div>
                            <p class="productCard_content-description">${description}</p>
                            <p class="productCard_content-price">Precio: $${price}</p>
                        </div>
                    </div>
                `;
            })
            .catch((error) => {
                console.error(error);
            });

        fetchPromises.push(fetchPromise);
    }

    Promise.all(fetchPromises)
        .then(() => {
            const contenidoModal = `
                <div class="checkout_modal">
                    <div class="checkout">
                        <span onclick="closeModal()" class="material-symbols-outlined-x checkout_x"> close </span>
                        <h3 class="checkout_title">¡Gracias por su compra!</h3>
                        <p class="checkout_description">Resumen:</p>
                        <div class="products-container">
                        ${productsHtml}
                        </div>
                        <p class="checkout_amount">Monto total: $${totalAmount}</p>
                        <p class="checkout_ticket">Le enviaremos su factura a su email. Su ticket de compra es: <b>${ticketCode}</b></p>
                        <hr>
                        <div class="checkoutFooter">
                            <p class="checkout_footer-text">¡Esperamos que vuelva a elegirnos!</p>
                            <a href="/products" class="cartFooter_btn--checkout">Seguir comprando</a>
                        </div>
                    </div>
                </div>
            `;

            modal.innerHTML = contenidoModal;
            modal.style.display = 'block';

            modal.addEventListener('click', function (event) {
                if (event.target === modal) {
                    closeModal();
                }
            });
            document.querySelector('.main').style.overflow = 'hidden';
        });
}

function closeModal() {
    window.location.reload();
}

function price() {
    let totalPorProductoArray = [];

    cartItems.forEach(function (cartItem) {
        const priceElement = cartItem.querySelector('.cart_content-price');
        const qtyElement = cartItem.querySelector('.quantity');

        const price = parseFloat(priceElement.innerText.replace('$', ''));
        const quantity = parseInt(qtyElement.innerText);
        const totalPrice = price * quantity;

        totalPorProductoArray.push(totalPrice);
    });

    const totalGeneral = totalPorProductoArray.reduce(function (acc, curr) {
        return acc + curr;
    }, 0);

    const cartFooterPriceElement = document.querySelector('.cartFooter_price');
    cartFooterPriceElement.innerText = 'Monto total: $' + totalGeneral;
}

async function incrementarCantidad(btn, pid) {
    const quantitySpan = btn.parentElement.querySelector('.quantity');
    const currentQuantity = parseInt(quantitySpan.innerText, 10);
    const maxQuantity = parseInt(quantitySpan.getAttribute('data-max'), 10);

    if (currentQuantity < maxQuantity) {
        quantitySpan.innerText = currentQuantity + 1;
    }
    await updateProductQuantity(pid, maxQuantity)
    price();
    await actualizarTotalProducts("+1")
    btnsDOM()
}

async function decrementarCantidad(btn, pid) {
    const quantitySpan = btn.parentElement.querySelector('.quantity');

    if (quantitySpan === 0) {
        const buttonR = document.querySelector('#quantityRemove');
        buttonR.classList.add('disabled');
        buttonR.onclick = null;
    }
    const currentQuantity = parseInt(quantitySpan.innerText, 10);
    const maxQuantity = parseInt(quantitySpan.getAttribute('data-max'), 10);
    if (currentQuantity > 1) {
        quantitySpan.innerText = currentQuantity - 1;
    }
    await updateProductQuantity(pid, maxQuantity)
    price();
    await actualizarTotalProducts("-1")
    btnsDOM()

}

async function updateProductQuantity(pid, maxQuantity) {
    const cid = localStorage.getItem("cartID");
    const quantitySpan = document.getElementById(`qty_${pid}`);
    if (cid && quantitySpan) {
        const newQuantity = parseInt(quantitySpan.innerText);
        if (!isNaN(newQuantity) && newQuantity > 0) {
            fetch(`/api/carts/${cid}/products/${pid}/prodQuantity`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ quantity: newQuantity }),
            })
                .then((response) => {
                    if (response.ok && newQuantity >= maxQuantity) {
                        Toastify({
                            text: `Stock insuficiente.`,
                            duration: 1500,
                            position: "right",
                            offset: {
                                x: 0,
                                y: 55,
                            }
                        }).showToast();
                    } else if (response.ok) {
                        Toastify({
                            text: `Cantidad del producto actualizada.`,
                            duration: 1500,
                            position: "right",
                            offset: {
                                x: 0,
                                y: 55,
                            }
                        }).showToast();
                    } else {
                        Toastify({
                            text: `Error al actualizar producto.`,
                            duration: 1500,
                            position: "right",
                            offset: {
                                x: 0,
                                y: 55,
                            },
                            className: "toastify-error"
                        }).showToast();
                    }
                })
                .catch((error) => {
                    console.error(`Error al actualizar el producto ${pid}, ${error}`);
                });
        } else {
            console.error("Error, la cantidad no es valida.");
        }
    } else {
        console.error("Error, no se encontró su carrito.");
    }
}

async function actualizarTotalProducts(actualizacion) {
    try {
        let cart = localStorage.getItem("cartID");

        if (!cart) {
            return;
        }
        const totalProducts = await getTotalProductsInCart(cart);
        correction = parseInt(actualizacion, 10)
        qtyTotal = totalProducts + correction
        const button = document.getElementById('cartQty');
        if (button) {
            button.textContent = qtyTotal.toString();
        }
    } catch (error) {
        console.error(error);
    }
}
async function getTotalProductsInCart(cartId) {
    try {
        const response = await fetch(`/api/carts/${cartId}/total-products`);
        if (!response.ok) {
            throw new Error(`Error al obtener el total de productos en el carrito: ${response.statusText}`);
        }

        const data = await response.json();
        const totalProducts = data.totalProducts;

        return totalProducts;
    } catch (error) {
        console.error(error);
    }
}

async function fetchCartData() {
    try {
        const cid = localStorage.getItem('cartID');

        if (!cid) {
            console.error('No se encontró el ID del carrito en el localStorage.');
            return null;
        }

        const response = await fetch(`/api/carts/${cid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error al obtener datos del carrito. Código de estado:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error en la solicitud fetch:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    btnsDOM();
});

async function btnsDOM() {
    const cartData = await fetchCartData();

    if (cartData) {
        const productIds = cartData.products.map(product => product.product._id);

        productIds.forEach(pid => {

            const quantitySpan = document.querySelector(`#qty_${pid}`);

            const buttonR = document.querySelector(`#quantityRemove_${pid}`);

            if (quantitySpan && quantitySpan.innerText === "1") {
                buttonR.classList.add('disabled');
                buttonR.onclick = null;
            } else {
                buttonR.classList.remove('disabled');
                buttonR.onclick = () => decrementarCantidad(buttonR, pid);
            }
        });

    } else {
        console.log('No se pudieron obtener los datos del carrito.');
    }
}


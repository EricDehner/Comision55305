const cartItems = document.querySelectorAll('.cart_content');

if (cartItems.length > 0) {
    price();
}

function clearCart() {
    const cid = localStorage.getItem("cartID");
    const buyButton = document.querySelector('.cartHeader_btn');
    buyButton.disabled = true;

    if (cid) {
        fetch(`/api/carts/${cid}`, {
            method: "DELETE",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                authorization: "Bearer " + localStorage.getItem("userID")
            },
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
                        buyButton.disabled = false;

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
                    buyButton.disabled = false;

                }
            })
            .catch((error) => {
                console.error(`Error al vaciar el carrito:, ${error}`);
                buyButton.disabled = false;

            });
    } else {
        console.error("No se pudo encontrar el carrito en el almacenamiento local.");
        buyButton.disabled = false;

    }
}

function deleteProduct(productId) {
    const cid = localStorage.getItem("cartID");
    const buyButton = document.querySelector('.cart_content-btn');
    buyButton.disabled = true;


    if (cid) {
        fetch(`/api/carts/${cid}/products/${productId}`, {
            method: "DELETE",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                authorization: "Bearer " + localStorage.getItem("userID")
            },
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
                    buyButton.disabled = false;

                }
            })
            .catch((error) => {
                console.error(`Error al eliminar el producto con ID ${productId}:, ${error}`);
                buyButton.disabled = false;

            });
    } else {
        console.error("No se pudo encontrar el carrito en el almacenamiento local.");
        buyButton.disabled = false;

    }
}

async function buyCart() {
    try {
        const cartId = await localStorage.getItem("cartID")
        const url = `/api/carts/${cartId}/purchase`;
        const buyButton = document.querySelector('.cartFooter_btn');
        buyButton.disabled = true;

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
            buyButton.disabled = false;
        }, 500);
    }
    catch (error) {
        console.error("Error en compra", error);
        buyButton.disabled = false;
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

        const fetchPromise = fetch(`/api/products/${productId}`,{
            method:"GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                authorization: "Bearer " + localStorage.getItem("userID")
            },
        })
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
    udateCart()
    await updateCartQuantity()
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
    udateCart()
    await updateCartQuantity()
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
                    "Content-type": "application/json; charset=UTF-8",
                    authorization: "Bearer " + localStorage.getItem("userID")
                },
                body: JSON.stringify({ quantity: newQuantity }),
            })
                .then((response) => {
                    if (response.ok && newQuantity >= maxQuantity) {
                        return
                    } else if (response.ok && newQuantity === 1) {
                        return
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

async function updateCartQuantity() {
    const cartData = await fetchCartData();
    if (cartData && cartData.products) {
        let totalQuantity = 0;

        cartData.products.forEach(item => {
            const product = item.product;
            if (product && product.stock !== undefined) {
                const quantitySpan = document.querySelector(`#qty_${product._id}`);
                if (quantitySpan) {
                    totalQuantity += parseInt(quantitySpan.innerText, 10) || 0;
                }
            }
        });

        const button = document.getElementById('cartQty');
        if (button) {
            button.innerText = totalQuantity.toString();
        } else {
            console.error('No se encontró el elemento con ID "cartQty".');
        }
    } else {
        console.log('No se pudieron obtener los datos del carrito o los productos son nulos.');
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
                "Content-type": "application/json; charset=UTF-8",
                authorization: "Bearer " + localStorage.getItem("userID")
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
    udateCart()
});

async function udateCart() {
    const cartData = await fetchCartData();
    if (cartData && cartData.products) {
        const maxStockValues = cartData.products.map(item => {
            const product = item.product;
            if (product && product.stock !== undefined) {
                return { pid: product._id, stock: product.stock };
            }
            return { pid: null, stock: 0 };
        });
        btnsDOM(maxStockValues);
    } else {
        console.log('No se pudieron obtener los datos del carrito o los productos son nulos.');
    }
}

async function btnsDOM(maxStockValues) {
    maxStockValues.forEach(({ pid, stock }) => {
        const quantitySpan = document.querySelector(`#qty_${pid}`);
        const buttonR = document.querySelector(`#quantityRemove_${pid}`);
        const buttonA = document.querySelector(`#quantityAdd_${pid}`);
        if (quantitySpan && buttonR && buttonA) {
            if (quantitySpan.innerText === "1") {
                buttonR.classList.add('disabled');
                buttonR.onclick = null;
            } else if (quantitySpan.innerText >= stock) {
                buttonA.classList.add('disabled');
                buttonA.onclick = null;
            } else {
                buttonR.classList.remove('disabled');
                buttonR.onclick = () => decrementarCantidad(buttonR, pid);
                buttonA.classList.remove('disabled');
                buttonA.onclick = () => incrementarCantidad(buttonA, pid);
            }
        } else {
            console.error(`No se encontraron elementos para el producto con ID ${pid}`);
        }
    });
}
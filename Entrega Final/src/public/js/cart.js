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
                        }
                    }).showToast();
                }
            })
            .catch((error) => {
                Toastify({
                    text: "Error al vaciar el carrito:", error,
                    duration: 1500,
                    position: "right",
                    offset: {
                        x: 0,
                        y: 55,
                    }
                }).showToast();
            });
    } else {
        Toastify({
            text: "No se pudo encontrar el carrito en el almacenamiento local.",
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            }
        }).showToast();
    }
}

function deleteProduct(productId) {
    console.log(productId);
    const cid = localStorage.getItem("cartID");

    if (cid) {
        fetch(`/api/carts/${cid}/products/${productId}`, {
            method: "DELETE",
        })
            .then((response) => {
                if (response.ok) {
                    Toastify({
                        text: `El producto con ID ${productId} se eliminó correctamente.`,
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
                        text: `Error al eliminar el producto con ID ${productId}.`,
                        duration: 1500,
                        position: "right",
                        offset: {
                            x: 0,
                            y: 55,
                        }
                    }).showToast();
                }
            })
            .catch((error) => {
                Toastify({
                    text: `Error al eliminar el producto con ID ${productId}:`, error,
                    duration: 1500,
                    position: "right",
                    offset: {
                        x: 0,
                        y: 55,
                    }

                }).showToast();
            });
    } else {
        Toastify({
            text: "No se pudo encontrar el carrito en el almacenamiento local.",
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            }
        }).showToast();
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
        console.log("Error en compra", error);
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
        const qtyElement = cartItem.querySelector('.cart_content-qty');

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
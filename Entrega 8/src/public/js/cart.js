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
        console.log("response:", response);
        if (!response.ok) {
            console.error("Error en la respuesta", response.statusText);
            const text = await response.text();
            console.error(text);
            return;
        }

        /*         Toastify({
                    text: "La compra se efectuó correctamente.",
                    duration: 1500,
                    position: "right",
                    offset: {
                        x: 0,
                        y: 55,
                    }
                }).showToast(); */

        /*     setTimeout(() => {
                window.location.href = "/products";
            }, 1500); */
    }
    catch (error) {
        console.log("Error en compra", error);
    }
}
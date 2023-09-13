

function clearCart() {
    const cart = JSON.parse(localStorage.getItem("cart"));
    if (cart && cart.id) {
        const cid = cart.id;
        fetch(`/api/carts/${cid}`, {
            method: "DELETE",
        })
            .then((response) => {
                if (response.ok) {
/*                     console.log("El carrito se vació correctamente.");
 */                    Toastify({

                    text: "El carrito se vació correctamente.",

                    duration: 1500

                }).showToast();
                    setTimeout(() => {
                        window.location.reload();

                    }, 1500);
                } else {
/*                     console.error("Error al vaciar el carrito.");
 */                    Toastify({

                    text: "Error al vaciar el carrito.",

                    duration: 1500

                }).showToast();
                }
            })
            .catch((error) => {
/*                 console.error("Error al vaciar el carrito:", error);
 */                Toastify({

                text: "Error al vaciar el carrito:", error,

                duration: 1500

            }).showToast();
            });
    } else {
/*         console.error("No se pudo encontrar el carrito en el almacenamiento local.");
 */        Toastify({

        text: "No se pudo encontrar el carrito en el almacenamiento local.",

        duration: 1500

    }).showToast();
    }
}

function deleteProduct(productId) {
    console.log(productId);
    const cart = JSON.parse(localStorage.getItem("cart"));

    if (cart && cart.id) {
        const cid = cart.id;

        fetch(`/api/carts/${cid}/products/${productId}`, {
            method: "DELETE",
        })
            .then((response) => {
                if (response.ok) {
                    Toastify({

                        text: `El producto con ID ${productId} se eliminó correctamente.`,

                        duration: 1500

                    }).showToast();
/*                 console.log(`El producto con ID ${productId} se eliminó correctamente.`);
 */                setTimeout(() => {
                        window.location.reload();

                    }, 1500);
                } else {
                    Toastify({

                        text: `Error al eliminar el producto con ID ${productId}.`,

                        duration: 1500

                    }).showToast();
/*                 console.error(`Error al eliminar el producto con ID ${productId}.`);
 */            }
            })
            .catch((error) => {
                Toastify({

                    text: `Error al eliminar el producto con ID ${productId}:`, error,

                    duration: 1500

                }).showToast();
/*             console.error(`Error al eliminar el producto con ID ${productId}:`, error);
 */        });
    } else {
        Toastify({

            text: "No se pudo encontrar el carrito en el almacenamiento local.",

            duration: 1500

        }).showToast();
/*         console.error("No se pudo encontrar el carrito en el almacenamiento local.");
 */    }
}

function buyCart() {
    localStorage.removeItem("cart");

    Toastify({
        text: "La compra se efectuó correctamente.",
        duration: 1500
    }).showToast();

    setTimeout(() => {
        window.location.href = "/products";
    }, 1500);
}
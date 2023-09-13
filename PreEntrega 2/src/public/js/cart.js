const createCart = async () => {
    try {
        if (!localStorage.getItem("cart")) {
            const response = await fetch("/api/carts/", {
                method: "POST",
                headers: { "Content-type": "application/json; charset=UTF-8" }
            });

            const data = await response.json();
            localStorage.setItem("cart", JSON.stringify(data));
        }
    } catch (error) {
        console.log("Error en Crear el Carrito! " + error);
    }
}

createCart();

function clearCart() {
    const cart = JSON.parse(localStorage.getItem("cart"));
    if (cart && cart.id) {
        const cid = cart.id;
        fetch(`/api/carts/${cid}`, {
            method: "DELETE",
        })
            .then((response) => {
                if (response.ok) {
                    console.log("El carrito se vació correctamente.");
                } else {
                    console.error("Error al vaciar el carrito.");
                }
            })
            .catch((error) => {
                console.error("Error al vaciar el carrito:", error);
            });
    } else {
        console.error("No se pudo encontrar el carrito en el almacenamiento local.");
    }
}

function eliminarProducto(productId) {
    console.log(productId);
    const cart = JSON.parse(localStorage.getItem("cart"));
    
    if (cart && cart.id) {
        const cid = cart.id;
        
        fetch(`/api/carts/${cid}/products/${productId}`, {
            method: "DELETE",
        })
        .then((response) => {
            if (response.ok) {
                // El producto se eliminó correctamente, puedes realizar acciones adicionales si es necesario.
                console.log(`El producto con ID ${productId} se eliminó correctamente.`);
            } else {
                console.error(`Error al eliminar el producto con ID ${productId}.`);
            }
        })
        .catch((error) => {
            console.error(`Error al eliminar el producto con ID ${productId}:`, error);
        });
    } else {
        console.error("No se pudo encontrar el carrito en el almacenamiento local.");
    }
}

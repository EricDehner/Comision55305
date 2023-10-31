const obtenerIdCarrito = () => {
    return JSON.parse(localStorage.getItem("cartID")) || [];
}

const agregarProductoAlCarrito = async (pid) => {
    try {
        let cart = localStorage.getItem("cartID");

        if (!cart) {
            document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }

        const response = await fetch("/api/carts/" + cart + "/products/" + pid, {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                authorization: "Bearer " + localStorage.getItem("userID")
            }
        });

        if (response.ok) {
            // El fetch se realizó con éxito
            Toastify({
                text: "Se agregó al Carrito!",
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                duration: 1500
            }).showToast();
            console.log("Se agregó al Carrito!");
        } else {
            // El fetch no fue exitoso
            console.log("Error en agregar el Producto al Carrito!");
            Toastify({
                text: "Error en agregar el Producto al Carrito!",
                duration: 1500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                }
            }).showToast();
        }
    } catch (error) {
        console.log("Error en agregar el Producto al Carrito! " + error);
        Toastify({
            text: "Error en agregar el Producto al Carrito! " + error,
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            }
        }).showToast();
    }
}

const obtenerIdCarrito = () => {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

const agregarProductoAlCarrito = async (pid) => {
    try {
        let cart = localStorage.getItem("cart")

        if(!cart){  
            document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }

        await fetch("/api/carts/" + cart + "/products/" + pid, {
            method: "POST",
            headers: { "Content-type": "application/json; charset=UTF-8" }
        })
            .then(response => response.json())
            .then(data => {
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
            });
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
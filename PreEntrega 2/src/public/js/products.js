const limitSelect = document.getElementById("limit");
const sortSelect = document.getElementById("sort");
console.log("holja");
const storedLimit = localStorage.getItem("limitValue");
const storedSort = localStorage.getItem("sortValue");

if (storedLimit) {
    limitSelect.value = storedLimit;
}
if (storedSort) {
    sortSelect.value = storedSort;
}

limitSelect.addEventListener("change", function () {
    const limitValue = limitSelect.value;

    localStorage.setItem("limitValue", limitValue);

    window.location.href = `?limit=${limitValue}`;
});


sortSelect.addEventListener("change", function () {
    const sortValue = sortSelect.value;

    localStorage.setItem("sortValue", sortValue);

    window.location.href = `?sort=${sortValue}`;
});

const crearCarrito = async () => {
    try {
        if (localStorage.getItem("carrito")) {
            return await JSON.parse(localStorage.getItem("carrito"));
        } else {
            const response = await fetch("/api/carts/", {
                method: "POST",
                headers: { "Content-type": "application/json; charset=UTF-8" }
            });
            const data = await response.json();
            localStorage.setItem("carrito", JSON.stringify(data));

            return data;
        }
    } catch (error) {
        console.log("Error en Crear el Carrito! " + error);
    }
}

const obtenerIdCarrito = async () => {
    try {
        let cart = await crearCarrito();

        return cart.id;
    } catch (error) {
        console.log("Error en obtener el Id del Carrito! " + error);
    }
}

const agregarProductoAlCarrito = async (pid) => {
    try {
        let cid = await obtenerIdCarrito();

        await fetch("/api/carts/" + cid + "/products/" + pid, {
            method: "POST",
            headers: { "Content-type": "application/json; charset=UTF-8" }
        })
            .then(response => response.json())
            .then(data => {
                console.log("Se agregó al Carrito!");
            });
    } catch (error) {
        console.log("Error en agregar el Producto al Carrito! " + error);
    }
}

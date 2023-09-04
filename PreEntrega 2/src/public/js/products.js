const limitSelect = document.getElementById("limit");
const sortSelect = document.getElementById("sort");
const storedLimit = localStorage.getItem("limitValue");
const storedSort = localStorage.getItem("sortValue");

function getQueryParams() {
    const queryParams = new URLSearchParams(window.location.search);
    console.log(queryParams);
    console.log(queryParams.get(`limit`));
    console.log(queryParams.get(`sort`));
    console.log(queryParams.get(`page`));
    return {
        limit: queryParams.get('limit') || storedLimit || '',
        sort: queryParams.get('sort') || storedSort || '',
        page: queryParams.get("page") ||'1'
    };
}

const queryParams = getQueryParams();

if (queryParams.limit) {
    limitSelect.value = queryParams.limit;
}
if (queryParams.sort) {
    sortSelect.value = queryParams.sort;
}

limitSelect.addEventListener("change", function () {
    const limitValue = limitSelect.value;

    localStorage.setItem("limitValue", limitValue);

    const currentPage = queryParams.page;

    const newUrl = `?limit=${limitValue}&sort=${queryParams.sort}&page=${currentPage}`;

    window.location.href = newUrl;
});

sortSelect.addEventListener("change", function () {
    const sortValue = sortSelect.value;

    localStorage.setItem("sortValue", sortValue);
    const currentPage = queryParams.page;

    const newUrl = `?limit=${queryParams.limit}&sort=${sortValue}&page=${currentPage}`;

    window.location.href = newUrl;
});
console.log(localStorage.getItem("sortValue"));

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


const limitSelect = document.getElementById("limit");
const sortSelect = document.getElementById("sort");
const storedLimit = localStorage.getItem("limitValue");
const storedSort = localStorage.getItem("sortValue");

function getQueryParams() {
    const queryParams = new URLSearchParams(window.location.search);
    return {
        limit: queryParams.get('limit') || '',
        sort: queryParams.get('sort') || '',
        page: queryParams.get("page") || '1'
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

        if (response.ok || response.status === 299) {
            if (response.status === 299) {
                Toastify({
                    text: "Producto sin stock!",
                    duration: 1500,
                    position: "right",
                    offset: {
                        x: 0,
                        y: 55,
                    },
                    className: "toastify-error"
                }).showToast();
            } else {
                Toastify({
                    text: "Se agregó al Carrito!",
                    position: "right",
                    offset: {
                        x: 0,
                        y: 55,
                    },
                    duration: 1500
                }).showToast();

                await actualizarTotalProducts();
            }
        } else {
            Toastify({
                text: "Error en agregar el Producto al Carrito!",
                duration: 1500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                className: "toastify-error"
            }).showToast();
        }
    } catch (error) {
        Toastify({
            text: "Error en agregar el Producto al Carrito! " + error,
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            },
            className: "toastify-error"
        }).showToast();
    }
}

async function actualizarTotalProducts() {
    try {
        let cart = localStorage.getItem("cartID");

        if (!cart) {
            return;
        }

        const totalProducts = await getTotalProductsInCart(cart);

        const button = document.getElementById('cartQty');
        if (button) {
            button.textContent = totalProducts.toString();
        }
    } catch (error) {
        console.error(error);
    }
}
async function getTotalProductsInCart(cartId) {
    try {
        const response = await fetch(`/api/carts/${cartId}/total-products`, {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                authorization: "Bearer " + localStorage.getItem("userID")
            },
        });
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

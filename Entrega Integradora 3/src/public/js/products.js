
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

const createCart = async () => {
    try {
/*         localStorage.setItem("cart", session.);
 */    } catch (error) {
        //        console.log("Error en Crear el Carrito! " + error);

        Toastify({
            text: "Error en Crear el Carrito! " + error,
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            }
        }).showToast();
    }
}

createCart(); 
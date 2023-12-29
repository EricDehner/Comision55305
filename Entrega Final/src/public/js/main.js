fetchProducts();

function dropdown() {
    const content = document.getElementById("dropdown-content");
    const icon = document.querySelector(".rotate-icon");

    icon.classList.toggle("open");
    setTimeout(() => {
        content.classList.toggle("navBar_content-item--dropdown");
        content.classList.toggle("navBar_content-item--dropdown---active");
    }, 180);
}

document.addEventListener('DOMContentLoaded', async function () {
    const cartId = localStorage.getItem('cartID');

    if (cartId) {
        const button = document.getElementById('cartQty');

        if (button) {
            const totalProducts = await getTotalProductsInCart(cartId);
            button.textContent = totalProducts.toString();
        }
    }
});

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

async function fetchProducts() {
    const dropdownContent = document.getElementById("dropdown-content");
    try {
        if(dropdownContent){

            const response = await fetch("/api/products/", {
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    authorization: "Bearer " + localStorage.getItem("userID")
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (Array.isArray(data.payload)) {
                    const uniqueCategories = new Set();
                    
                    data.payload.forEach(item => {
                        uniqueCategories.add(item.category);
                    });
                    
                    const uniqueCategoriesArray = Array.from(uniqueCategories);
                    
                    
                    const allProductsLink = document.createElement("a");
                    allProductsLink.classList.add("navBar_content-dropdown--item");
                    allProductsLink.href = "/products";
                    allProductsLink.textContent = "Todos los productos";
                    
                    dropdownContent.appendChild(allProductsLink);
                    
                    uniqueCategoriesArray.forEach(category => {
                        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
                    const link = document.createElement("a");
                    link.classList.add("navBar_content-dropdown--item");
                    link.href = `/products?query=${encodeURIComponent(category)}`;
                    link.textContent = formattedCategory;
                    dropdownContent.appendChild(link);
                });

            } else {
                console.error("Error: data.payload no es un array");
            }
        } else {
            console.error("Error al obtener productos. Código de estado:", response.status);
        }
    }
    } catch (error) {
        console.error("Error:", error.message);
    }
}



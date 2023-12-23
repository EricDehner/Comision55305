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
        const response = await fetch(`/api/carts/${cartId}/total-products`);
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


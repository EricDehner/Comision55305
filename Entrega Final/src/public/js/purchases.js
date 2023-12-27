document.addEventListener("DOMContentLoaded", function () {
    fetchData();
});

function fetchData() {
    const filterButton = document.querySelector('.purchase_filter');
    filterButton.disabled = true;

    fetch("/api/purchases/purchase", {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "authorization": "Bearer " + localStorage.getItem("userID")
        }
    })
        .then(response => response.json())
        .then(data => {
            createPurchaseCard(data);
            filterButton.disabled = false;
        })
        .catch(error => {
            console.log('Error en la solicitud:', error);
            filterButton.disabled = false;
        });
}

function extractDateAndTime(dateTimeString) {
    const match = dateTimeString.match(/^(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}):\d{2}$/);

    if (!match) {
        return { fecha: '', hora: '' };
    }

    const [, fecha, hora] = match;
    return { fecha, hora };
}

function createPurchaseCard(purchases) {
    const container = document.getElementById("purchase_container");
    container.innerHTML = ""
    purchases.forEach(purchase => {
        const card = document.createElement("div");
        const { fecha, hora } = extractDateAndTime(purchase.purchase_datetime);
        card.id = purchase.code
        card.classList.add("purchase_card");
        card.setAttribute("data-id", purchase._id);
        card.onclick = function () { openModal(purchase._id, purchase.products, purchase.code, fecha, hora); };

        card.innerHTML = `
        <p class="purchase_card-purchaser">${purchase.purchaser}</p>
        <div class="purchase_card-footer">
            <p class="purchase_card-amount">$${purchase.amount}</p>
            <div class="purchase_card-date">
                <p class="purchase_card-date--item">${fecha}</p>
                <p class="purchase_card-date--item time">${hora}</p>
            </div>
        </div>
        `;
        container.appendChild(card);
    });
}

async function openModal(id, products, code, fecha, hora) {
    const card = document.querySelector(`.purchase_card[data-id="${id}"]`);
    const purchaser = card.querySelector(".purchase_card-purchaser").innerText;
    const date = fecha
    const time = hora
    const amount = card.querySelector(".purchase_card-amount").innerText;
    const modalContentContainer = document.querySelector(".modal-content-container");
    modalContentContainer.innerHTML = `
        <p class="purchase_card-purchaser--modal">${purchaser}</p>
        <div class="purchase_date">
            <p class="purchase_date-item">${date}</p>
            <p class="purchase_date-item">${time}</p>
        </div>
        <div class="product-cards-container"></div>
        <div class="purchase_card-footer-modal">
            <p class="purchase_card-amount">${amount}</p>
            <p class="purchase_card-code">${code}</p>
        </div>
    `;

    const productCardsContainer = modalContentContainer.querySelector(".product-cards-container");

    const fetchPromises = products.map(async (product) => {
        const productId = product.product;

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    authorization: "Bearer " + localStorage.getItem("userID"),
                },
            });

            if (response.ok) {
                const productDetails = await response.json();
                const { title, description, price, thumbnails } = productDetails.data;

                const productCard = document.createElement("div");
                productCard.classList.add("productCard");
                productCard.innerHTML = `
                    <div class="productCard_img">
                        <img class="productCard_img-img" src="${thumbnails[0]}" alt="${title}">
                    </div>
                    <div class="productCard_content-modal">
                        <div class="productCard_content-header">
                            <h3 class="productCard_content-header--title">${title}</h3>
                            <p class="productCard_content-header--quantity">Cantidad: ${product.quantity}</p>
                        </div>
                        <p class="productCard_content-description">${description}</p>
                    </div>
                `;

                productCardsContainer.appendChild(productCard);
            } else {
                console.error(`Error al obtener detalles del producto con ID ${productId}`);
            }
        } catch (error) {
            console.error(`Error en la solicitud de producto con ID ${productId}:`, error);
        }
    });

    await Promise.all(fetchPromises);

    const modal = document.querySelector(".purchaseModal");
    modal.style.display = 'block';

    document.body.style.overflow = 'hidden';

    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.querySelector(".purchaseModal");
    const modalContentContainer = document.querySelector(".modal-content-container");
    modal.style.display = 'none';
    modalContentContainer.innerHTML = "";
    document.body.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
}

function searchCode() {
    const filterContainerNone = document.querySelector(".purchase_filter-container-none");
    const filterContainer = document.querySelector(".purchase_filter-container");

    if (filterContainerNone) {
        filterContainerNone.classList.remove("purchase_filter-container-none");
        filterContainerNone.classList.add("purchase_filter-container");
    } else {
        filterContainer.classList.add("purchase_filter-container-none");
        filterContainer.classList.remove("purchase_filter-container");
        document.getElementById("codeInput").value = "";
        fetchData();
    }
}

function searchButtonClicked() {
    const code = document.getElementById("codeInput").value;
    const container = document.getElementById("purchase_container");
    const cards = container.querySelectorAll(".purchase_card");
    const searchButton = document.querySelector('.purchase_btn');
    searchButton.disabled = true;

    let hasMatches = false;
    if (code !== "") {
        cards.forEach(card => {
            const cardCode = card.id;

            if (cardCode === code) {
                card.style.display = 'block';
                hasMatches = true;
            } else {
                card.style.display = 'none';
            }
        });

        if (!hasMatches) {
            container.innerHTML = `<p class="purchase_noMatches">No hay coincidencias, por favor vuelva a intentarlo</p>`;
            searchButton.disabled = false;
        }
    } else {
        Toastify({
            text: "Por favor ingrese el codigo a que desea",
            duration: 2500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            },
            className: "toastify-error"
        }).showToast();
        searchButton.disabled = false;

    }
}

document.addEventListener("DOMContentLoaded", function () {
    fetchData();
});

function fetchData() {
    fetch("/api/purchases/purchase", {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "authorization": "Bearer " + localStorage.getItem("userID")
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            createPurchaseCard(data);
        })
        .catch(error => {
            console.log('Error en la solicitud:', error);
        });
}
function createPurchaseCard(purchases) {
    const container = document.getElementById("purchase_container");

    purchases.forEach(purchase => {
        const card = document.createElement("div");
        card.classList.add("purchase-card");

        card.innerHTML = `
        <p>ID: ${purchase._id}</p>
        <p>Fecha y Hora: ${purchase.purchase_datetime}</p>
        <p>Código: ${purchase.code}</p>
        <p>Monto: ${purchase.amount}</p>
        <p>Comprador: ${purchase.purchaser}</p>
      `;

        container.appendChild(card);
    });
}



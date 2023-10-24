const socket = io();
const messages = document.getElementById("messages");

socket.on("messages", (data) => {
    const form = document.querySelector(".form");
    const messageContainer = document.querySelector(".messages_container");
    const body = document.querySelector(".body")

    setTimeout(() => {
        body.classList.remove("body");
        body.classList.add("body-active");
        form.classList.remove("form");
        form.classList.add("form-active");
    }, 1000);

    setTimeout(() => {
        messageContainer.classList.remove("messages_container");
        messageContainer.classList.add("messages_container-active");

        let salida = ``;
        data.forEach(item => {
            salida += `<div class="message_card">
        <h3 class="message_card-name">${item.user} </h3>
        <a href="mailto:${item.email} " class="message_card-email">${item.email}</a>
        <p class="message_card-message">${item.message}</p>
        </div>`;
        });
        messages.innerHTML = salida;
    }, 1500);
});



function sendMessage() {
    event.preventDefault();
    const user = document.getElementById("user").textContent;
    const email = document.getElementById("email").textContent;

console.log(user, email);

    const message = document.getElementById("message");
    if (message.value === "") {
        Toastify({
            text: "Por favor complete el campo antes de enviar el mensaje.",
            className: "toastify-error",
            duration: 3000
        }).showToast();

    } else {
        socket.emit("newMessage", { user: user, email: email, message: message.value });
        message.value = "";
    }
    console.log(user, email);
}
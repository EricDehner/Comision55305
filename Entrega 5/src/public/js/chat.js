const socket = io();
const messages = document.getElementById("messages");

socket.on("messages", (data) => {
    const formContainer = document.querySelector(".form_container");

    setTimeout(() => {

        formContainer.classList.remove("form_container");
        formContainer.classList.add("form_container-active");

    }, 1000);
    setTimeout(() => {

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
    const user = document.getElementById("user");
    const email = document.getElementById("email");
    const message = document.getElementById("message");
    const validatorEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (user.value === "" || email.value === "" || message.value === "") {
        Toastify({
            text: "Por favor complete todos los campos antes de enviar el mensaje.",
            className: "toastify-error",
            duration: 3000
        }).showToast();
    } else if (!validatorEmail.test(email.value))
        Toastify({
            text: "Por favor ingrese un correo electrónico válido.",
            className: "toastify-error",
            duration: 3000
        }).showToast();
    else {
        socket.emit("newMessage", { user: user.value, email: email.value, message: message.value });
        user.value = "";
        email.value = "";
        message.value = "";
    }
}
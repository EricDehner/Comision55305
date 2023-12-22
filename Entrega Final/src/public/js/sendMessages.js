const socket = io();

function sendMessage() {
    event.preventDefault();
    const user = document.getElementById("user").textContent;
    const email = document.getElementById("email").textContent;


    const message = document.getElementById("message");
    if (message.value === "") {
        Toastify({
            text: "Por favor complete el campo antes de enviar el mensaje.",
            className: "toastify-error",
            duration: 3000
        }).showToast();

    } else {
        let fechaHoraArgentina = new Date();
        fechaHoraArgentina.setUTCHours(fechaHoraArgentina.getUTCHours() - 3);

        socket.emit("newMessage", {
            user: user,
            email: email,
            message: message.value,
            date: fechaHoraArgentina
        });
        message.value = "";

        Toastify({
            text: "¡Mensaje enviado con éxito!",
            duration: 3000,
            position: 'right',
            offset: {
                x: 0,
                y: 55,
            },
            backgroundColor: "green"
        }).showToast();
    }
}
const socket = io();
const messages = document.getElementById("messages");
let globalData;
let showAllMessages = true;

socket.on("messages", (data) => {
    globalData = data;
    showMessages(data);
});

function formatDateTime(dateTimeString, timeZone = 'UTC') {
    const options = { hour: 'numeric', minute: 'numeric', timeZone };

    const formattedTime = new Date(dateTimeString).toLocaleTimeString('es-AR', options);

    const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone };
    const formattedDate = new Date(dateTimeString).toLocaleDateString('es-AR', dateOptions);

    return { date: formattedDate, time: formattedTime };
}

function showMessages(data) {
    let salida = ``;
    data.forEach(item => {
        const { date, time } = formatDateTime(item.date);
        let statusContent = '';
        if (item.status === 'pending') {
            statusContent = '<span class="material-symbols-outlined-status pending">schedule</span>';
        } else if (item.status === 'solved') {
            statusContent = '<span class="material-symbols-outlined-status solved">check_circle</span>';
        }

        salida += `
        <div class="message_card">
            <h3 class="message_card-name">${item.user} </h3>
            <div class="message_date">
                <p class="message_date-item">${time}</p>
                <p class="message_date-item">${date}</p>
            </div>
            <div data-tooltip="Estado" class="message_status">
                <label class="message_status-icon" for="message_status_select_${item._id}">${statusContent}</label>
                <select  class="message_status-select" id="message_status_select_${item._id}" data-id="${item._id}">
                    <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>
                        Pendiente
                    </option>
                    <option value="solved" ${item.status === 'solved' ? 'selected' : ''}>
                        Resuelta
                    </option>
                </select>
            </div>
            <a href="mailto:${item.email}" class="message_card-email">${item.email}</a>
            <p class="message_card-message">${item.message}</p>
        </div>`;
    });
    messages.innerHTML = salida;

    const selectElements = document.querySelectorAll('.message_status-select');
    selectElements.forEach(select => {
        select.addEventListener('change', (event) => {
            const messageId = event.target.getAttribute('data-id');
            const newStatus = event.target.value;
            updateMessageStatus(messageId, newStatus);
        });
    });
}

async function updateMessageStatus(messageId, newStatus) {
    try {
        const response = await fetch(`/api/messages/${messageId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            console.error('Error al actualizar el estado del mensaje:', response.statusText);
            Toastify({
                text: "No se pudo actualizar el estado",
                duration: 2500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                className: "toastify-error"
            }).showToast();
        } else {
            Toastify({
                text: "Estado actualizado",
                duration: 2500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                className: "green"
            }).showToast();

            const updatedMessageIndex = globalData.findIndex(item => item._id === messageId);
            if (updatedMessageIndex !== -1) {
                globalData[updatedMessageIndex].status = newStatus;
            }

            if (showAllMessages) {
                showMessages(globalData);
            } else {
                showPendingMessages();
            }
        }
    } catch (error) {
        console.error("Error al realizar la solicitud de actualización");
    }
}
function showPendingMessages() {
    if (!globalData) {
        console.error('Error: no hay datos disponibles.');

        Toastify({
            text: "No hay mensajes almacenados",
            duration: 2500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            },
        }).showToast();
        return;
    }

    const pendingMessages = globalData.filter(item => item.status === 'pending');
    showMessages(pendingMessages);
}

function toggleMessages() {
    if (!globalData) {
        console.error('Error: no hay datos disponibles.');
        return;
    }

    const toggleButton = document.getElementById('toggleButton');

    if (showAllMessages) {
        showPendingMessages();
        toggleButton.innerHTML = '<span class="material-symbols-outlined-message">filter_alt_off</span>';
        toggleButton.setAttribute('data-tooltip', 'Mostrar Todos');
    } else {
        showMessages(globalData);
        toggleButton.innerHTML = '<span class="material-symbols-outlined-message">filter_alt</span>';
        toggleButton.setAttribute('data-tooltip', 'Filtrar Pendientes');
    }

    showAllMessages = !showAllMessages;
}

async function OldSolvedMessages() {
    try {
        const response = await fetch('/api/messages/removeOldSolved', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const responseData = await response.json();

            if (responseData.success) {
                Toastify({
                    text: responseData.message,
                    duration: 2500,
                    position: "right",
                    offset: {
                        x: 0,
                        y: 55,
                    },
                    className: "green"
                }).showToast();

                if (showAllMessages) {
                    showMessages(globalData);
                } else {
                    showPendingMessages();
                }
            } else {
                console.error('Error al eliminar mensajes resueltos:', responseData.message);
                Toastify({
                    text: `Error: ${responseData.message}`,
                    duration: 2500,
                    position: "right",
                    offset: {
                        x: 0,
                        y: 55,
                    },
                    className: "toastify-error"
                }).showToast();
            }
        } else {
            console.error('Error al eliminar mensajes resueltos:', response.statusText);
            Toastify({
                text: "No se pudo eliminar mensajes resueltos.",
                duration: 2500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                className: "toastify-error"
            }).showToast();
        }
    } catch (error) {
        console.error('Error al realizar la solicitud de eliminación:', error);
        Toastify({
            text: "Error al eliminar mensajes resueltos.",
            duration: 2500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            },
            className: "toastify-error"
        }).showToast();
    }
}
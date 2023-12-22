fondoCards()
function fondoCards() {
    const userCards = document.querySelectorAll(".userCard");

    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
        }
        return hash;
    }

    function actualizarFondo(userCard) {
        const userId = userCard.querySelector(".userCard_header-btn").id;
        const ultimosSeisCaracteres = userId.slice(-6);
        const colorUnico = Math.abs(hashCode(ultimosSeisCaracteres)).toString(16).substring(0, 6);

        userCard.querySelector(".userCard_header").style.backgroundColor = `#${colorUnico}a3`;
    }

    userCards.forEach(actualizarFondo);
}


async function eliminarUsuariosInactivos() {
    try {
        const response = await fetch('api/users/inactive', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar usuarios inactivos: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.message === "0 usuarios eliminados.") {
            Toastify({
                text: "¡Los usuarios se encuentran actualizados!",
                duration: 3000,
                position: 'right',
                offset: {
                    x: 0,
                    y: 55,
                },
                backgroundColor: "green"
            }).showToast();

        } else {

            Toastify({
                text: data.message,
                duration: 3000,
                position: 'right',
                offset: {
                    x: 0,
                    y: 55,
                },
                backgroundColor: "green"
            }).showToast();

            setTimeout(() => {
                window.location.reload();
            }, 4500);
        }

    } catch (error) {
        console.error('Error al eliminar usuarios inactivos:', error.message);

        Toastify({
            text: "Error al eliminar usuarios inactivos",
            duration: 3000,
            position: 'right',
            offset: {
                x: 0,
                y: 55,
            },
            backgroundColor: "red"
        }).showToast();
    }
}

async function eliminarUsuario(userId) {
    try {
        const response = await fetch(`/api/users/deleteUser/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId }),
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar usuario: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            Toastify({
                text: "Usuario eliminado correctamente",
                duration: 3000,
                position: 'right',
                offset: {
                    x: 0,
                    y: 55,
                },
                backgroundColor: "green"
            }).showToast();

            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            Toastify({
                text: "Error al eliminar usuario",
                duration: 3000,
                position: 'right',
                offset: {
                    x: 0,
                    y: 55,
                },
                backgroundColor: "red"
            }).showToast();
        }
    } catch (error) {
        Toastify({
            text: "Error al eliminar usuario",
            duration: 3000,
            position: 'right',
            offset: {
                x: 0,
                y: 55,
            },
            backgroundColor: "red"
        }).showToast();
    }
}


document.addEventListener("DOMContentLoaded", function () {
    const selects = document.querySelectorAll(".userCard_content-select");

    selects.forEach((select) => {
        select.addEventListener("change", async function () {
            const userId = this.getAttribute("data-id");
            const nuevoRol = this.value;

            try {
                const response = await fetch(`/api/users/${userId}/role`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ role: nuevoRol }),
                });

                if (!response.ok) {
                    throw new Error(`Error al cambiar el rol del usuario: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();

                if (data.success) {
                    Toastify({
                        text: "Rol de usuario actualizado correctamente",
                        duration: 3000,
                        position: 'right',
                        offset: {
                            x: 0,
                            y: 55,
                        },
                        backgroundColor: "green"
                    }).showToast();
                } else {
                    alert('Error al cambiar el rol del usuario');
                }
            } catch (error) {
                console.error('Error al cambiar el rol del usuario:', error.message);

                Toastify({
                    text: "Error al cambiar el rol del usuario",
                    duration: 3000,
                    position: 'right',
                    offset: {
                        x: 0,
                        y: 55,
                    },
                    backgroundColor: "red"
                }).showToast();
            }
        });
    });
});


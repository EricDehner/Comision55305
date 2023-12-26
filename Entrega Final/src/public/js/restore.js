const restorePw = async () => {
    let email = document.getElementById("userEmail").textContent;
    let password = document.getElementById("restorePassword1").value;

    console.log(email, password);

    const response = await fetch(`/api/sessions/restore?user=${email}&pass=${password}`,{
        method:"GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            authorization: "Bearer " + localStorage.getItem("userID")
        },
    });
    const data = await response.json();
    console.log(data);

    if (password === "") {
        Toastify({
            text: "¡Por favor, ingrese una contraseña correcta!",
            position: "right",
            offset: {
                x: 0,
                y: 55,
            },
            duration: 1500
        }).showToast();
    } else {
        if (data.status === "OK") {
            Toastify({
                text: "¡Contraseña guardada!",
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                duration: 1500
            }).showToast();
            setTimeout(() => {
                location.href = "/profile";
            }, 1500);
        }
        else {
            Toastify({
                text: "¡No se pudo actualizar la contraseña!",
                duration: 1500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                }
            }).showToast();
        }
    }
}

const passwordInput = document.getElementById('restorePassword1');
const togglePassword = document.getElementById('togglePassword');
const visibilityIcon = document.getElementById('restoreVisibilityIcon');

togglePassword.addEventListener('click', function () {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        visibilityIcon.textContent = 'visibility_off';
    } else {
        passwordInput.type = 'password';
        visibilityIcon.textContent = 'visibility';
    }
}); 
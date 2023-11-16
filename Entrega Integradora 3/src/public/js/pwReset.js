const pwResetSend = async () => {
    const currentUrl = window.location.href;
    const tokenIndex = currentUrl.indexOf('pw-reset/') + 'pw-reset/'.length;
    const passwordInput1 = document.getElementById("password1");
    const passwordInput2 = document.getElementById("password2");
    
    let token = currentUrl.substring(tokenIndex);
    let password1 = passwordInput1.value;
    let password2 = passwordInput2.value;

    passwordInput1.style.border = '1px solid #ccc';
    passwordInput2.style.border = '1px solid #ccc';
    try {
        if (password1 === "" || password2 === "") {
            Toastify({
                text: "¡Por favor complete todos los campos!",
                duration: 1500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                className: "toastify-error"
            }).showToast();

            if (password1 === "") {
                passwordInput1.style.border = '2px solid #ff0000b0';
            }
            if (password2 === "") {
                passwordInput2.style.border = '2px solid #ff0000b0';
            }
        }

        if (password1 === password2) {

            const response = await fetch(`/api/sessions/reset-password/${token}`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({ password: password1 }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            console.log("data contiene: ", data);

            if (data.status === "success") {
                Toastify({
                    text: "¡Contraseña nueva establecida!",
                    duration: 1500,
                    position: "right",
                    offset: {
                        x: 0,
                        y: 55,
                    },
                }).showToast();
                console.log("Restablecimiento de contraseña exitoso");
            }
        }else{
            Toastify({
                text: "¡Las contraseñas no coinciden!",
                duration: 1500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                className: "toastify-error"

            }).showToast();
        }

    } catch (error) {
        Toastify({
            text: "¡No se pudo establecer la nueva contraseña!",
            className: "toastify-error",
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            }
        }).showToast();
        console.log("Hubo un problema con la operación, usuario o contraseña incorrectos", error);
    }
}

const passwordInput1 = document.getElementById('password1');
const passwordInput2 = document.getElementById('password2');
const togglePassword1 = document.getElementById('togglePassword1');
const togglePassword2 = document.getElementById('togglePassword2');
const visibilityIcon1 = document.getElementById('visibilityIcon1');
const visibilityIcon2 = document.getElementById('visibilityIcon2');

togglePassword1.addEventListener('click', function () {
    togglePassword(passwordInput1, visibilityIcon1);
});

togglePassword2.addEventListener('click', function () {
    togglePassword(passwordInput2, visibilityIcon2);
});

function togglePassword(inputField, visibilityIcon) {
    if (inputField.type === 'password') {
        inputField.type = 'text';
        visibilityIcon.textContent = 'visibility_off';
    } else {
        inputField.type = 'password';
        visibilityIcon.textContent = 'visibility';
    }
}

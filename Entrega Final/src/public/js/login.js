const loginUser = async () => {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginButton = document.querySelector('.formAcc_content-btns--btn');
    loginButton.disabled = true;

    let email = emailInput.value;
    let password = passwordInput.value;

    emailInput.style.border = '1px solid #ccc';
    passwordInput.style.border = '1px solid #ccc';

    try {
        if (email !== "" && password !== "") {
            const response = await fetch("/api/sessions/login/", {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    authorization: "Bearer " + localStorage.getItem("userID")
                },
                body: JSON.stringify({ email: email, password: password }),
            });

            if (!response.ok) {
                loginButton.disabled = false;
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            console.log("data contiene: ", data);
            localStorage.setItem("userID", data.token)
            if (data.status === "success") {
                localStorage.setItem("cartID", data.user.cart)
                loginButton.disabled = false;
                window.location.href = "/products";
            }
        } else {
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

            if (email === "") {
                emailInput.style.border = '2px solid #ff0000b0';
            }
            if (password === "") {
                passwordInput.style.border = '2px solid #ff0000b0';
            }
            loginButton.disabled = false;
        }
    } catch (error) {
        console.log("Hubo un problema con la operación, usuario o contraseña incorrectos", error);
        Toastify({
            text: "No se pudo loguear el Usuario!",
            className: "toastify-error",
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            }
        }).showToast();
        loginButton.disabled = false;
    }
}

const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const visibilityIcon = document.getElementById('visibilityIcon');

togglePassword.addEventListener('click', function () {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        visibilityIcon.textContent = 'visibility_off';
    } else {
        passwordInput.type = 'password';
        visibilityIcon.textContent = 'visibility';
    }
});
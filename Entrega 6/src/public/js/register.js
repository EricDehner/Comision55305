const registerUser = async () => {
    let first_name = document.getElementById("first_name").value;
    let last_name = document.getElementById("last_name").value;
    let email = document.getElementById("email").value;
    let age = document.getElementById("age").value;
    let password = document.getElementById("password").value;

    if (first_name !== "" && last_name !== "" && email !== "" && age !== "" && password !== "") {
        if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(email)) {
            const user = { first_name, last_name, email, age, password };

            const response = await fetch("/api/sessions/register", {
                method: "POST",
                headers: { "Content-type": "application/json; charset=UTF-8" },
                body: JSON.stringify(user),
            });
            const data = await response.json();

            Toastify({
                text: "¡Usuario registrado!",
                duration: 1500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                }
            }).showToast();
            setTimeout(() => {
                location.href = "/login";
            }, 1500);
        } else {
            Toastify({
                text: "¡Por favor ingrese una dirección de correo electrónico válida!",
                duration: 1500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                }
            }).showToast();
        }
    } else {
        Toastify({
            text: "¡Por favor complete todos los campos!",
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            }
        }).showToast();
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
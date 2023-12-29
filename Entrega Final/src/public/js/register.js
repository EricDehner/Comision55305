const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const registerUser = async () => {
    const first_nameInput = document.getElementById("first_name");
    const last_nameInput = document.getElementById("last_name");
    const emailInput = document.getElementById("email");
    const ageInput = document.getElementById("age");
    const passwordInput = document.getElementById("password");
    const registerButton = document.querySelector('#btn-register');
    registerButton.disabled = true;


    let first_name = first_nameInput.value;
    let last_name = last_nameInput.value;
    let email = emailInput.value;
    let age = ageInput.value;
    let password = passwordInput.value;

    first_name = capitalizeFirstLetter(first_name);
    last_name = capitalizeFirstLetter(last_name);

    first_nameInput.style.border = '1px solid #ccc';
    last_nameInput.style.border = '1px solid #ccc';
    emailInput.style.border = '1px solid #ccc';
    ageInput.style.border = '1px solid #ccc';
    passwordInput.style.border = '1px solid #ccc';

    const user = { first_name, last_name, email, age, password };

    try {
        if (first_name !== "" && last_name !== "" && email !== "" && age !== "" && password !== "") {
            if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(email)) {
                const user = { first_name, last_name, email, age, password };

                const response = await fetch("/api/sessions/register", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        authorization: "Bearer " + localStorage.getItem("userID")
                    },
                    body: JSON.stringify(user),
                });

                if (!response.ok) {
                    console.error("Error al registrar el usuario:", await response.text());
                    emailInput.style.border = '2px solid #ff0000b0';
                    Toastify({
                        text: "¡Usuario ya registrado!",
                        duration: 1500,
                        position: "right",
                        offset: {
                            x: 0,
                            y: 55,
                        }
                    }).showToast();
                    registerButton.disabled = false;
                } else {
                    const data = await response.json();
                    if (data.status === "success") {
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
                            registerButton.disabled = false;
                        }, 1500);
                    }
                }

            } else {
                Toastify({
                    text: "¡Por favor ingrese una dirección de correo electrónico válida!",
                    duration: 1500,
                    position: "right",
                    offset: {
                        x: 0,
                        y: 55,
                    },
                    className: "red-toastify"
                }).showToast();
                registerButton.disabled = false;
            }
        } else {
            Toastify({
                text: "¡Por favor complete todos los campos!",
                duration: 1500,
                className: "toastify-error",
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                }
            }).showToast();

            if (first_name === "") {
                first_nameInput.style.border = '2px solid #ff0000b0';
            }
            if (last_name === "") {
                last_nameInput.style.border = '2px solid #ff0000b0';
            }
            if (email === "") {
                emailInput.style.border = '2px solid #ff0000b0';
            }
            if (age === "") {
                ageInput.style.border = '2px solid #ff0000b0';
            }
            if (password === "") {
                passwordInput.style.border = '2px solid #ff0000b0';
            }
            registerButton.disabled = false;
        }
    } catch (error) {
        console.error("Hubo un error al registrar el usuario:", error);
        registerButton.disabled = false;
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
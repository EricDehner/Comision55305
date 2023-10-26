const loginUser = async () => {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/sessions/login/", {
            method: "POST",
            headers: { "Content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify({ email: email, password: password }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.status === "success") {
            localStorage.setItem("cart", data.user.cart)
            window.location.href = "/products";

        }
    } catch (error) {
        Toastify({
            text: "No se pudo loguear el Usuario!",
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            }
        }).showToast();

        console.log("Hubo un problema con la operación, usuario o contraseña incorrectos", error);
    }
};


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
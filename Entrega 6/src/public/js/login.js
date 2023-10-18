const loginUser = async () => {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    const response = await fetch(`/api/sessions/login?user=${email}&pass=${password}`);
    const data = await response.json();
    console.log(data);
    
    if (data.status === "OK") {
        location.href = "/products";
    }
    else{
        Toastify({
            text: "No se pudo loguear el Usuario!",
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
const pwRestore = async () => {
    const emailInputPw = document.getElementById("emailPW");

    let email = emailInputPw.value;

    emailInputPw.style.border = '1px solid #ccc';

    try {
        console.log(email);
        if (email === "") {
            Toastify({
                text: "¡Por favor complete con su email!",
                duration: 1500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                },
                className: "toastify-error"
            }).showToast();
            emailInput.style.border = '2px solid #ff0000b0';
        } else {
            const response = await fetch("/api/sessions/restore-password", {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({ email: email }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            console.log("data contiene: ", data);

            if (data.status === "success") {
                console.log("Restablecimiento de contraseña exitoso");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
            }
        }

    } catch (error) {
        Toastify({
            text: "¡No se pudo restablecer la contraseña!",
            className: "toastify-error",
            duration: 1500,
            position: "right",
            offset: {
                x: 0,
                y: 55,
            }
        }).showToast();

        console.log("Hubo un problema con la operación:", error);
    }
}

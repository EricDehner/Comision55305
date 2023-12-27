const pwRestore = async () => {
    const emailInputPw = document.getElementById("emailPW");
    const pwForgotButton = document.querySelector('.formAcc_content-btns--btn');
    pwForgotButton.disabled = true;

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
            emailInputPw.style.border = '2px solid #ff0000b0';
            pwForgotButton.disabled = false;

        } else {
            const response = await fetch("/api/sessions/restore-password", {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    authorization: "Bearer " + localStorage.getItem("userID")
                },
                body: JSON.stringify({ email: email }),
            });

            if (!response.ok) {
                pwForgotButton.disabled = false;
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success") {
                console.log("Restablecimiento de contraseña exitosamente");
            }
            Toastify({
                text: "¡Email enviado con éxito!",
                duration: 1500,
                position: "right",
                offset: {
                    x: 0,
                    y: 55,
                }
            }).showToast();
            setTimeout(() => {
                window.location.href = "/login";
                pwForgotButton.disabled = false;
            }, 1500);
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
        pwForgotButton.disabled = false;
        console.log("Hubo un problema con la operación:", error);
    }
}

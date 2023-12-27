function logout() {
    const logoutButton = document.querySelector('.profile_btn-btn');
    logoutButton.disabled = true;
    Toastify({
        text: "¡Sesión finalizada!",
        position: "right",
        offset: {
            x: 0,
            y: 55,
        },
        duration: 1500
    }).showToast();
    logoutButton.disabled = false;
}
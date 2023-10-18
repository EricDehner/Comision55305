function dropdown() {
    const content = document.getElementById("dropdown-content");
    const icon = document.querySelector(".rotate-icon");

    icon.classList.toggle("open");
    setTimeout(() => {
        content.classList.toggle("navBar_content-item--dropdown");
        content.classList.toggle("navBar_content-item--dropdown---active");
    }, 180);
}
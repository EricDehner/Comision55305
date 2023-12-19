const url = window.location.href;

const match = url.match(/\/upload\/([^\/]+)$/);
const userId = match ? match[1] : null;

function bePremium() {
    const uploadFormDiv = document.querySelector('.upload_form');
    const newDiv = document.createElement('div');

    newDiv.style.position = 'relative';
    newDiv.style.width = '450px';
    newDiv.style.height = 'max-content';
    newDiv.style.backgroundColor = '#dde0e1';
    newDiv.style.borderRadius = '14px';
    newDiv.style.boxShadow = '5px 3px 8px rgba(0, 0, 0, 0.361)';
    newDiv.style.overflow = 'hidden';

    newDiv.innerHTML = `
    <form id="uploadPremiumForm" action="/api/users/${userId}/premium-documents" method="post"
        enctype="multipart/form-data">
        <h2 class="upload_title">¡Conviértase en Premium! <span class="material-symbols-outlined-premium">
                workspace_premium
            </span></h2>
        <p class="upload_description">Por favor, para ser un usuario premium, cargue los siguientes archivos.</p>
        <div class="upload_file">
            <label class="upload_file-title" for="identificationDocument">Identificación:</label>
            <input class="upload_file-file" type="file" name="identificationDocument" id="identificationDocument"
                accept="image/*,.pdf" required>
        </div>
        <div class="upload_file">
            <label class="upload_file-title" for="domicileProofDocument">Comprobante de domicilio:</label>
            <input class="upload_file-file" type="file" name="domicileProofDocument" id="domicileProofDocument"
                accept="image/*,.pdf" required>
        </div>
        <div class="upload_file upload_file-last">
            <label class="upload_file-title" for="accountStatementDocument">Comprobante de estado de cuenta:</label>
            <input class="upload_file-file" type="file" name="accountStatementDocument"
                id="accountStatementDocument" accept="image/*,.pdf" required>
        </div>

        <div class="upload_footer">
            <button class="upload_footer-btn" id="uploadMessage" type="button"
                onclick="validateAndSubmitPremiumForm()">Cargar<span
                    class="material-symbols-outlined-upload">upload</span></button>
        </div>
    </form>

`;

    uploadFormDiv.innerHTML = newDiv.innerHTML;
}

function validateAndSubmitForm() {
    const fileInputs = document.querySelectorAll('.upload_file-file');
    const atLeastOneFileSelected = Array.from(fileInputs).some(input => input.files.length > 0);

    if (atLeastOneFileSelected) {
        const form = document.getElementById('upload_form');
        submitForm(form, 'uploadMessageCommon');
    } else {
        Toastify({
            text: 'Por favor, seleccione al menos un archivo para cargar.',
            duration: 3000,
            position: 'right',
            offset: {
                x: 0,
                y: 55,
            },
            backgroundColor: "red"
        }).showToast();
    }
}

function submitForm() {
    const form = document.getElementById('uploadForm');
    const formData = new FormData(form);


    fetch(form.action, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            Toastify({
                text: data.message,
                duration: 3000,
                position: 'right',
                offset: {
                    x: 0,
                    y: 55,
                },
                backgroundColor: "green"
            }).showToast();
            const uploadMessageBtn = document.getElementById('uploadMessageCommon');
            if (uploadMessageBtn) {
                uploadMessageBtn.style.display = 'none';
            }
        })
        .catch(error => {
            console.error("Error durante la carga del archivo:", error);
            Toastify({
                text: 'Error al cargar el archivo',
                duration: 3000,
                position: 'right',
                offset: {
                    x: 0,
                    y: 55,
                },
                backgroundColor: "red"
            }).showToast();
        });
}


function validateAndSubmitPremiumForm() {
    const fileInputs = document.querySelectorAll('.upload_file-file');
    const allFieldsCompleted = Array.from(fileInputs).every(input => input.files.length > 0);

    if (allFieldsCompleted) {
        return submitFormPremium('uploadPremiumForm', 'uploadMessage');
    } else {
        Toastify({
            text: 'Por favor, complete todos los campos.',
            duration: 3000,
            position: 'right',
            offset: {
                x: 0,
                y: 55,
            },
            backgroundColor: "red"
        }).showToast();
        return false;
    }
}

function submitFormPremium(formId, btnId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const uploadMessageBtn = document.getElementById(btnId);

    fetch(form.action, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            Toastify({
                text: data.message,
                duration: 3000,
                position: 'right',
                offset: {
                    x: 0,
                    y: 55,
                },
                backgroundColor: "green"
            }).showToast();

            const premiumButtonHtml = `
            <form class="premiumForm" action="/api/users/premium/${userId}" method="post">
                <div class="cont-div">
                    <button class="btn-uploads upload_footer-btn--premium" type="submit">¡Convertirse en Premium!<span class="material-symbols-outlined-premium">
                            workspace_premium
                        </span></button>
                </div>
            </form>
        `;
            uploadMessageBtn.insertAdjacentHTML('afterend', premiumButtonHtml);


            uploadMessageBtn.style.display = 'none';
        })
        .catch(error => {
            console.error("Error durante la carga del archivo:", error);
            Toastify({
                text: 'Error al cargar el archivo',
                duration: 3000,
                position: 'right',
                offset: {
                    x: 0,
                    y: 55,
                },
                backgroundColor: "red"
            }).showToast();
        });
    return true;
}

const API =
    "https://script.google.com/macros/s/AKfycbxo1msbWuO_y1wZ3148SUuTW31UDOJQXGVEFfjKnH6Bq8gAqFCM43sWoqO4WprHtyvl_w/exec";

const titleEl = document.getElementById("title");
const versionEl = document.getElementById("version");
const statusCard = document.getElementById("status-card");
const continueBtn = document.getElementById("continue-btn");

let scanner = null;
let isScanning = false;

/**
 * Inicializa la aplicación
 */
async function initialize() {

    try {

        const response = await fetch(
            API + "?action=appInfo"
        );

        const info = await response.json();

        titleEl.textContent = info.title;
        versionEl.textContent =
            "Versión " + info.version;

        showReadyState();

        await startScanner();

    }
    catch (error) {

        showError(error);

    }

}

/**
 * Estado listo
 */
function showReadyState() {

    statusCard.innerHTML = `
        <h2>Sistema listo</h2>
        <p>Esperando código QR...</p>
    `;

}

/**
 * Inicia el lector
 */
async function startScanner() {

    scanner = new Html5Qrcode("qr-reader");

    const cameras =
        await Html5Qrcode.getCameras();

    if (!cameras.length) {

        throw new Error(
            "No se encontraron cámaras."
        );

    }

    const rearCamera =
        cameras.find(camera =>
            /back|rear|environment/i.test(camera.label)
        );

    const cameraId =
        rearCamera
            ? rearCamera.id
            : cameras[0].id;

    await scanner.start(

        cameraId,

        {

            fps: 20,

            qrbox: {

                width: 320,

                height: 320

            },

            aspectRatio: 1,

            rememberLastUsedCamera: true,

            disableFlip: false

        },

        onQrDetected,

        () => {}

    );

    isScanning = true;

}

/**
 * Se detectó un QR
 */
async function onQrDetected(decodedText) {

    if (!isScanning)
        return;

    isScanning = false;

    continueBtn.disabled = true;

    await scanner.pause();

    try {

        const response = await fetch(

            API
            + "?action=processQr&uuid="
            + encodeURIComponent(decodedText)

        );

        const result =
            await response.json();

        if (result.success) {

            statusCard.innerHTML = `

                <h2>${result.participant.name}</h2>

                <p><strong>Folio:</strong>
                ${result.participant.folio}</p>

                <p><strong>Área:</strong>
                ${result.participant.area}</p>

                <p><strong>Estado:</strong>
                ${result.participant.status}</p>

            `;

        }
        else {

            statusCard.innerHTML = `

                <h2>QR inválido</h2>

                <p>${result.message}</p>

            `;

        }

        continueBtn.disabled = false;

    }
    catch (error) {

        showError(error);

    }

}

/**
 * Reanuda el escáner
 */
async function resumeScanner() {

    try {

        continueBtn.disabled = true;

        showReadyState();

        await scanner.resume();

        isScanning = true;

    }
    catch (error) {

        showError(error);

    }

}

/**
 * Mostrar errores
 */
function showError(error) {

    console.error(error);

    statusCard.innerHTML = `

        <h2>Error</h2>

        <p>${error.message || error}</p>

    `;

    continueBtn.disabled = false;

}

continueBtn.addEventListener(
    "click",
    resumeScanner
);

document.addEventListener(
    "DOMContentLoaded",
    initialize
);

// DOM Elements
const dataInput = document.getElementById('qr-data-input');
const sizeInput = document.getElementById('qr-size-input');
const generateButton = document.getElementById('generate-btn');
const downloadButton = document.getElementById('download-btn');
const qrcodeContainer = document.getElementById('qrcode');

let qrCodeInstance = null;
const defaultContent = 'https://grifts.co.uk';

// --- Core Generation Function ---

function generateQRCode() {
    const data = dataInput.value.trim() || defaultContent;
    const size = parseInt(sizeInput.value);

    // Input validation
    if (!data || size < 100 || size > 512) {
        showAlert('Please enter valid data and size (100-512px).', 'error');
        return;
    }

    // Clear previous QR code
    qrcodeContainer.innerHTML = '';
    
    // Disable download button until a valid code is generated
    downloadButton.disabled = true;
    
    // Create new QR Code instance (using the QRCode.js library)
    qrCodeInstance = new QRCode(qrcodeContainer, {
        text: data,
        width: size,
        height: size,
        colorDark: "#ffffff", // White foreground (text-primary)
        colorLight: "#0a0a0a", // Dark background (bg-dark)
        correctLevel: QRCode.CorrectLevel.H
    });

    // We must wait a moment for the canvas/image to be rendered
    setTimeout(() => {
        downloadButton.disabled = false;
        showAlert('QR Code generated!', 'success');
    }, 100); 
}

// --- Download Logic ---

function downloadQRCode() {
    if (!qrCodeInstance) return;

    // QRCode.js renders the code as a Canvas element
    const canvas = qrcodeContainer.querySelector('canvas');
    if (!canvas) {
        showAlert('QR Code not ready for download.', 'error');
        return;
    }

    // Convert the Canvas image to a Data URL (PNG format)
    const dataURL = canvas.toDataURL('image/png');
    
    // Use the shared downloadFile function from common.js
    const filename = `grifts-qrcode-${dataInput.value.slice(0, 15).replace(/[^a-z0-9]/gi, '')}.png`;
    downloadFile(dataURL, filename, 'image/png');
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Set initial placeholder text
    dataInput.value = defaultContent; 
    
    // Initial generation on load
    generateQRCode();

    // Event listeners
    generateButton.addEventListener('click', generateQRCode);
    
    // Debounce the input for real-time generation (optional, but good UX)
    dataInput.addEventListener('input', debounce(generateQRCode, 500));
    sizeInput.addEventListener('input', debounce(generateQRCode, 500));

    // Download listener
    downloadButton.addEventListener('click', downloadQRCode);
});

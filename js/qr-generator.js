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
    // 1. Validation and Data
    const data = dataInput.value.trim() || defaultContent;
    const size = parseInt(sizeInput.value);

    if (!data || size < 100 || size > 512) {
        // This is the showAlert from common.js
        showAlert('Please enter valid data and size (100-512px).', 'error');
        downloadButton.disabled = true;
        return;
    }

    // 2. Cleanup 
    // Clear previous QR code instance and DOM content cleanly
    if (qrCodeInstance) {
        qrCodeInstance = null;
    }
    // Remove all children (canvas/table) from the container
    qrcodeContainer.innerHTML = ''; 

    // 3. Setup
    downloadButton.disabled = true;
    
    // 4. Create new QR Code instance
    // Uses the safe string ID "qrcode"
    qrCodeInstance = new QRCode("qrcode", { 
        text: data,
        width: size,
        height: size,
        colorDark: "#000000", // Black code lines
        colorLight: "#ffffff", // White background for the code area
        correctLevel: QRCode.CorrectLevel.H
    });

    // 5. User Feedback
    // Wait for the canvas/image to be rendered
    setTimeout(() => {
        // Check if a canvas or table (the code output) was successfully added
        const outputElement = qrcodeContainer.querySelector('canvas, table');
        
        if (outputElement) {
            downloadButton.disabled = false;
            showAlert('QR Code generated!', 'success');
        } else {
             // If this alert shows, the QRCode.js library itself is failing to render.
             showAlert('QR Code generation failed. Check browser console.', 'error');
        }
    }, 100); 
}

// --- Download Logic (remains correct) ---

function downloadQRCode() {
    if (downloadButton.disabled) {
        showAlert('No QR Code available to download.', 'error');
        return;
    }

    // QRCode.js renders the code as a Canvas element
    const canvas = qrcodeContainer.querySelector('canvas');
    if (!canvas) {
        showAlert('QR Code not ready for download (Canvas not found).', 'error');
        return;
    }

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
    
    // TEMPORARILY REMOVED: These lines are the suspected cause of the script crash.
    // dataInput.addEventListener('input', debounce(generateQRCode, 500));
    // sizeInput.addEventListener('input', debounce(generateQRCode, 500));

    // Download listener
    downloadButton.addEventListener('click', downloadQRCode);
});

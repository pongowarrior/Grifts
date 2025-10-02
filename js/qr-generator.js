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
    // FIX: Passing the string ID "qrcode" instead of the DOM element for robustness
    qrCodeInstance = new QRCode("qrcode", { 
        text: data,
        width: size,
        height: size,
        // Using provided dark theme colors
        colorDark: "#ffffff", 
        colorLight: "#0a0a0a",
        correctLevel: QRCode.CorrectLevel.H
    });

    // Wait for the canvas/image to be rendered
    setTimeout(() => {
        downloadButton.disabled = false;
        showAlert('QR Code generated!', 'success');
    }, 100); 
}

// --- Download Logic ---

function downloadQRCode() {
    if (!qrCodeInstance) return;

    // QRCode.js renders the code as a Canvas element
    // NOTE: When using the string ID method, the element is usually the first child of the target div
    const canvas = qrcodeContainer.querySelector('canvas');
    if (!canvas) {
        // Fallback for when it might render as a table (rare with default settings)
        showAlert('QR Code not ready for download (Canvas not found).', 'error');
        return;
    }

    // Convert the Canvas image to a Data URL (PNG format)
    const dataURL = canvas.toDataURL('image/png');
    
    // Use the shared downloadFile function from common.js
    const filename = `grifts-qrcode-${dataInput.value.slice(0, 15).replace(/[^a-z0-9]/gi, '')}.png`;
    
    // NOTE: downloadFile in common.js expects the content string (which the dataURL is)
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
    
    // Debounce the input for real-time generation 
    dataInput.addEventListener('input', debounce(generateQRCode, 500));
    sizeInput.addEventListener('input', debounce(generateQRCode, 500));

    // Download listener
    downloadButton.addEventListener('click', downloadQRCode);
});

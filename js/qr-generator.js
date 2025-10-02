// DOM Elements (Initial references - MUST be updated inside functions)
const dataInput = document.getElementById('qr-data-input');
const sizeInput = document.getElementById('qr-size-input');
const generateButton = document.getElementById('generate-btn');
const downloadButton = document.getElementById('download-btn');
const qrcodeContainer = document.getElementById('qrcode'); // This variable becomes stale!

let qrCodeInstance = null;
const defaultContent = 'https://grifts.co.uk';

// --- Core Generation Function ---

function generateQRCode() {
    // 1. Validation and Data
    const data = dataInput.value.trim() || defaultContent;
    const size = parseInt(sizeInput.value);

    if (!data || size < 100 || size > 512) {
        showAlert('Please enter valid data and size (100-512px).', 'error');
        downloadButton.disabled = true;
        return;
    }

    // *** CRITICAL FIX: Refresh the DOM reference before cleanup ***
    // This ensures we are always manipulating the current element in the page.
    const currentQrcodeContainer = document.getElementById('qrcode');

    // 2. Cleanup 
    if (qrCodeInstance) {
        qrCodeInstance = null;
    }
    // Remove all children (canvas/table) from the container using the fresh reference
    currentQrcodeContainer.innerHTML = ''; 

    // 3. Setup
    downloadButton.disabled = true;
    
    // 4. Create new QR Code instance
    // We use the string ID "qrcode" here for robustness
    qrCodeInstance = new QRCode("qrcode", { 
        text: data,
        width: size,
        height: size,
        colorDark: "#000000", // Black code lines (to contrast with white background)
        colorLight: "#ffffff", // White background for the code area
        correctLevel: QRCode.CorrectLevel.H
    });

    // 5. User Feedback
    // Wait for the canvas/image to be rendered
    setTimeout(() => {
        // Use the fresh reference to query for the newly added output element
        const outputElement = currentQrcodeContainer.querySelector('canvas, table');
        
        if (outputElement) {
            downloadButton.disabled = false;
            showAlert('QR Code generated!', 'success');
        } else {
             // If this alert shows, the QRCode.js library itself is failing.
             showAlert('QR Code generation failed. Check browser console.', 'error');
        }
    }, 100); 
}

// --- Download Logic ---

function downloadQRCode() {
    if (downloadButton.disabled) {
        showAlert('No QR Code available to download.', 'error');
        return;
    }

    // *** CRITICAL FIX: Refresh the DOM reference before searching for canvas ***
    const currentQrcodeContainer = document.getElementById('qrcode');

    // QRCode.js renders the code as a Canvas element (or a table in fallback)
    const canvas = currentQrcodeContainer.querySelector('canvas');
    
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
    
    // NOTE: The debounce lines are omitted here to prevent the suspected script crash.
    // If you need real-time input, try adding them back ONLY after confirming
    // the core functionality works.
    // dataInput.addEventListener('input', debounce(generateQRCode, 500));
    // sizeInput.addEventListener('input', debounce(generateQRCode, 500));

    // Download listener
    downloadButton.addEventListener('click', downloadQRCode);
});
